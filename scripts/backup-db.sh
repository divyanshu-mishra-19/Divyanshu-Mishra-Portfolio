#!/usr/bin/env bash
# =============================================================================
# Automated SQLite Database Backup Script (VACUUM INTO)
# =============================================================================
#
# CRON SCHEDULE EXAMPLE (Runs daily at 03:00 UTC):
# 0 3 * * * cd /path/to/portfolio && ./scripts/backup-db.sh >> /var/log/portfolio-backup.log 2>&1
#
# NOTE: Never copy the live .db file alone while writes may be occurring.
# VACUUM INTO safely creates a consistent, defragmented snapshot.
# =============================================================================

set -euo pipefail

DB_PATH="${DB_PATH:-./portfolio.db}"
BACKUP_DIR="${BACKUP_DIR:-./backup}"
KEEP_COUNT="${KEEP_COUNT:-14}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
BACKUP_FILE="${BACKUP_DIR}/portfolio-${TIMESTAMP}.db"

mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_PATH}" ]; then
  echo "[ERROR] Database file not found at ${DB_PATH}" >&2
  exit 1
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting database backup for ${DB_PATH}..."

node -e '
const { DatabaseSync } = require("node:sqlite");
const dbPath = process.argv[1];
const target = process.argv[2];
const db = new DatabaseSync(dbPath);
const escaped = target.replace(/\x27/g, "\x27\x27");
db.exec(`VACUUM INTO \x27${escaped}\x27`);
db.close();

const backupDb = new DatabaseSync(target);
const row = backupDb.prepare("PRAGMA integrity_check;").get();
backupDb.close();

if (!row || Object.values(row)[0] !== "ok") {
  console.error("[ERROR] PRAGMA integrity_check failed:", row);
  process.exit(1);
}
console.log("[OK] Backup integrity verified.");
' "${DB_PATH}" "${BACKUP_FILE}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup written to ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

TOTAL_BACKUPS=$(ls -1 "${BACKUP_DIR}"/portfolio-*.db 2>/dev/null | wc -l || echo 0)
if [ "${TOTAL_BACKUPS}" -gt "${KEEP_COUNT}" ]; then
  PRUNE_COUNT=$((TOTAL_BACKUPS - KEEP_COUNT))
  echo "[INFO] Pruning ${PRUNE_COUNT} old backup(s) (keeping latest ${KEEP_COUNT})..."
  ls -1t "${BACKUP_DIR}"/portfolio-*.db | tail -n "+$((KEEP_COUNT + 1))" | while read -r old_backup; do
    echo "  Removing: ${old_backup}"
    rm -f "${old_backup}"
  done
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup process completed successfully."
