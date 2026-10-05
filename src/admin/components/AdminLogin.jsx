import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle, Key, Shield, Sun, Moon } from 'lucide-react';
import { adminApi } from '../adminApi.js';

export function AdminLogin({ adminTheme = 'dark', onToggleTheme, onLoginSuccess, onReturnToPortfolio }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLight = adminTheme === 'light';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await adminApi.login(username.trim(), password);
      if (res?.token) {
        onLoginSuccess(res.admin);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300 admin-portal admin-login-wrapper ${
        isLight
          ? 'bg-slate-100 text-slate-900 selection:bg-amber-500 selection:text-slate-950'
          : 'bg-[#0b0f17] text-slate-100 selection:bg-amber-500/80 selection:text-slate-950'
      }`}
    >
      {/* Decorative ambient glowing orbs */}
      {isLight ? (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-400/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-sky-400/15 rounded-full blur-[130px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      {/* Grid Pattern */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,rgba(245,158,11,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,158,11,0.04)_1px,transparent_1px)]'
        } bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]`}
      />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Navigation & Status Header */}
        <div className="mb-5 flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={onReturnToPortfolio}
            className={`inline-flex items-center gap-2 text-xs font-mono transition-colors group cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-amber-600' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-amber-500" />
            <span>~/return-to-live-site</span>
          </button>

          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-amber-600'
                    : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-amber-400'
                }`}
                title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
                aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              >
                {isLight ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light</span>
                  </>
                )}
              </button>
            )}

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium shadow-xs ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SQLite Protected
            </span>
          </div>
        </div>

        {/* Login Security Gateway Card */}
        <div
          className={`admin-login-card rounded-3xl p-7 sm:p-8 backdrop-blur-2xl relative overflow-hidden transition-all duration-300 ${
            isLight
              ? 'bg-white/95 border border-slate-200/90 shadow-2xl shadow-slate-300/40'
              : 'bg-[#121824]/90 border border-amber-500/20 shadow-2xl shadow-black/80'
          }`}
        >
          {/* Top IDE Window Header Bar */}
          <div
            className={`flex items-center justify-between pb-5 mb-5 border-b ${
              isLight ? 'border-slate-200' : 'border-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div
              className={`text-[11px] font-mono flex items-center gap-1.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>SECURE GATEWAY v2.4</span>
            </div>
          </div>

          {/* Icon & Title */}
          <div className="text-center mb-6">
            <div
              className={`w-14 h-14 mx-auto mb-3.5 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                isLight
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-600 shadow-amber-500/10'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-amber-500/10'
              }`}
            >
              <Lock className="w-7 h-7" />
            </div>
            <h1
              className={`text-xl sm:text-2xl font-bold tracking-tight font-sans ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Admin CMS Authentication
            </h1>
            <p
              className={`text-xs mt-1.5 max-w-sm mx-auto leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Verify administrative credentials to manage portfolio database records in real-time.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className={`mb-5 p-3 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                isLight
                  ? 'bg-rose-50 border border-rose-300 text-rose-800'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}
            >
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 font-mono uppercase tracking-wider ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Username or Email
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    isLight ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all font-sans focus:outline-none focus:ring-2 ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-amber-500/25 focus:border-amber-500'
                      : 'bg-[#080d18] border border-amber-500/25 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500/50'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`block text-xs font-semibold font-mono uppercase tracking-wider ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    isLight ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all font-sans focus:outline-none focus:ring-2 ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-amber-500/25 focus:border-amber-500'
                      : 'bg-[#080d18] border border-amber-500/25 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Open Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Features Telemetry Grid */}
          <div
            className={`mt-6 pt-5 border-t grid grid-cols-2 gap-2 text-[10px] font-mono text-center ${
              isLight ? 'border-slate-200 text-slate-600' : 'border-white/5 text-slate-400'
            }`}
          >
            <div
              className={`p-2 rounded-lg flex items-center justify-center gap-1.5 ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>scrypt-SHA512</span>
            </div>
            <div
              className={`p-2 rounded-lg flex items-center justify-center gap-1.5 ${
                isLight ? 'bg-slate-50 border border-slate-200' : 'bg-black/30 border border-white/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>30m Inactivity Lock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
