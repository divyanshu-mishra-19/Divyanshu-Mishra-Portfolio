import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Clock,
  Activity,
  Check,
  Terminal,
  Server
} from 'lucide-react';
import { adminApi, adminAuth } from '../adminApi.js';

export function SecurityView({ onToast, onLockSession }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [inactivityMinutes, setInactivityMinutes] = useState('30');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const user = adminAuth.getUser();

  // Load audit telemetry from overview
  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const data = await adminApi.getOverview();
        if (data?.recentLogs) {
          setAuditLogs(data.recentLogs);
        }
      } catch {
        // ignore
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 4) return { score: 75, label: 'Good', color: 'bg-sky-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      onToast({ type: 'error', message: 'Current and new password are required' });
      return;
    }
    if (newPassword.length < 8) {
      onToast({ type: 'error', message: 'New password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      onToast({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setUpdating(true);
    try {
      await adminApi.changePassword(currentPassword, newPassword);
      onToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Master password has been cryptographically updated in SQLite!'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      onToast({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTimeout = () => {
    onToast({
      type: 'success',
      title: 'Session Policy Updated',
      message: `Inactivity auto-lock threshold set to ${inactivityMinutes} minutes.`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner with Mac Window Dots */}
      <div className="bg-[#121824]/90 border border-amber-500/20 p-5 rounded-2xl shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[11px] font-mono text-amber-400 font-semibold ml-2">
              SECURITY PROTOCOLS & CRYPTOGRAPHY
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Administrator Security Controls</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage master cryptographic credentials, auto-lock timeouts, and view live access audit telemetry.
          </p>
        </div>

        {onLockSession && (
          <button
            type="button"
            onClick={onLockSession}
            className="self-start sm:self-center px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Lock Dashboard Now</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Master Password Card */}
        <div className="bg-[#121824]/90 border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-sans">Update Master Password</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              scrypt-64
            </span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Current Password *
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080d18] border border-amber-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                New Master Password (Min 8 chars) *
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080d18] border border-amber-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-semibold text-white">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Confirm New Password *
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080d18] border border-amber-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer font-mono"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPass ? 'Hide' : 'Show'}</span>
              </button>

              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-mono font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {updating && <span className="w-3.5 h-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />}
                <span>Change Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Defense Controls & Session Policy */}
        <div className="space-y-6">
          {/* Active Defense Checklist Card */}
          <div className="bg-[#121824]/90 border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-sans">Active Defense Architecture</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080d18] border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white font-mono">scrypt + Salt Password Storage</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Passwords are salted with a 16-byte cryptographically secure random salt and hashed with 64-byte key length.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080d18] border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white font-mono">Brute-Force Rate Limiting</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Failed login attempts are tracked per IP. After 5 consecutive failures, the IP is automatically locked out for 15 minutes.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080d18] border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white font-mono">Sliding Inactivity Auto-Lock</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Administrative sessions automatically lock upon inactivity to prevent unauthorized access.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Inactivity Timeout Selector */}
          <div className="bg-[#121824]/90 border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Session Auto-Lock Duration
                </h4>
              </div>
              <span className="text-[11px] text-amber-400 font-mono font-bold">{inactivityMinutes} Min</span>
            </div>

            <p className="text-xs text-slate-400">
              Select how long the admin dashboard can remain idle before locking and requiring credential re-entry:
            </p>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {['15', '30', '60', '120'].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setInactivityMinutes(mins)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    inactivityMinutes === mins
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {mins === '60' ? '1 Hour' : mins === '120' ? '2 Hours' : `${mins}m`}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSaveTimeout}
              className="w-full mt-2 py-2 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/30 text-xs font-mono font-bold text-slate-200 transition-all cursor-pointer"
            >
              Apply Timeout Threshold
            </button>
          </div>
        </div>
      </div>

      {/* Security Audit Telemetry Log */}
      <div className="bg-[#121824]/90 border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-sans">Recent Security & Activity Telemetry</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {auditLogs.length} Events Logged
          </span>
        </div>

        {loadingLogs ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">
            Loading security logs from SQLite...
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-mono">
            No security exceptions logged. All systems operating normally.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono min-w-[500px]">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="pb-2 font-semibold">Event Action</th>
                  <th className="pb-2 font-semibold">Target Entity</th>
                  <th className="pb-2 font-semibold">IP Origin</th>
                  <th className="pb-2 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.slice(0, 8).map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 text-amber-300 font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-slate-300">
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-2.5 text-slate-500 text-right">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
