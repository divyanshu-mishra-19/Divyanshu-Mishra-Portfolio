#!/usr/bin/env node

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../portfolio.db');

function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

async function promptHidden(rl, query) {
  // Query for sensitive input
  return new Promise((resolve) => {
    output.write(query);
    const wasRaw = input.isRaw;
    if (input.isTTY) {
      input.setRawMode(true);
    }
    input.resume();

    let password = '';
    const onData = (chunk) => {
      const str = chunk.toString();
      for (const char of str) {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          if (input.isTTY) input.setRawMode(wasRaw || false);
          input.removeListener('data', onData);
          output.write('\n');
          resolve(password);
          return;
        } else if (char === '\u0003') {
          // Ctrl+C
          if (input.isTTY) input.setRawMode(wasRaw || false);
          process.exit(1);
        } else if (char === '\u007f' || char === '\b') {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            output.write('\b \b');
          }
        } else {
          password += char;
          output.write('*');
        }
      }
    };

    input.on('data', onData);
  });
}

async function main() {
  console.log('\n=============================================================');
  console.log('🔐 Portfolio Admin Credential Reset Utility');
  console.log('=============================================================\n');

  const db = new DatabaseSync(DB_PATH);
  const rl = readline.createInterface({ input, output });
  try {
    const existingAdmin = db.prepare('SELECT id, username, email FROM admins LIMIT 1').get();
    let username = '';
    let email = '';

    if (existingAdmin) {
      username = existingAdmin.username;
      email = existingAdmin.email;
      console.log(`Target admin account: "${username}" <${email}> (ID: ${existingAdmin.id})\n`);
    } else {
      const inputUsername = await rl.question('Enter initial admin username [admin]: ');
      username = inputUsername.trim() || 'admin';
      const inputEmail = await rl.question('Enter initial admin email [divyanshu.nit.28@gmail.com]: ');
      email = inputEmail.trim() || 'divyanshu.nit.28@gmail.com';
    }

    let password = '';
    let confirm = '';

    while (true) {
      password = await promptHidden(rl, `Enter new password for "${username}" (minimum 12 characters): `);
      if (password.length < 12) {
        console.error('❌ Password must be at least 12 characters long. Please try again.\n');
        continue;
      }

      confirm = await promptHidden(rl, 'Confirm new admin password: ');
      if (password !== confirm) {
        console.error('❌ Passwords do not match. Please try again.\n');
        continue;
      }
      break;
    }

    const { hash, salt } = hashPassword(password);
    const now = new Date().toISOString();

    if (existingAdmin) {
      db.prepare(`
        UPDATE admins
        SET password_hash = ?, salt = ?, updated_at = ?
        WHERE id = ?
      `).run(hash, salt, now, existingAdmin.id);
      console.log(`\n✅ Password successfully updated for admin "${username}" (ID: ${existingAdmin.id}).`);
    } else {
      db.prepare(`
        INSERT INTO admins (id, username, email, password_hash, salt, full_name, avatar, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run('admin_root', username, email, hash, salt, 'Divyanshu Mishra', '/images/avatar.png', now, now);
      console.log(`\n✅ Created initial admin account for "${username}".`);
    }

    // Invalidate all existing sessions upon password reset
    const deletedSessions = db.prepare('DELETE FROM sessions').run();
    console.log(`🔒 Invalidated ${deletedSessions?.changes ?? 0} active session(s).`);

    // Log to audit log
    try {
      db.prepare(`
        INSERT INTO audit_logs (id, action, entity_type, entity_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'log_' + Date.now() + '_reset',
        'ADMIN_PASSWORD_RESET',
        'ADMIN',
        username,
        'Admin credentials reset via CLI utility',
        now
      );
    } catch {}

    console.log('🎉 Admin credential setup complete. You may now log in to /admin.\n');
  } catch (err) {
    console.error('❌ Error updating admin credentials:', err);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
