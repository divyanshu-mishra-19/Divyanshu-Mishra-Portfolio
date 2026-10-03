import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  Terminal,
  Clock,
  ShieldCheck,
  Wifi,
  X,
  Trash2
} from 'lucide-react';

const INITIAL_LOGS = [
  { time: '10:04:12', level: 'SYSTEM', msg: 'System initialized. Node v20.18.0 • Linux Edge 6.6.21.' },
  { time: '10:04:15', level: 'VISION', msg: 'YOLOv8 model loaded into memory: 3.2M params (FP16 edge mode).' },
  { time: '10:04:18', level: 'ANPR', msg: 'EasyOCR engine warm-up complete. Detection confidence threshold: 0.82.' },
  { time: '10:04:22', level: 'AGENT', msg: 'n8n workflow orchestrator linked: 4 multi-agent reasoning graphs active.' },
  { time: '10:04:25', level: 'SYNC', msg: 'Spotify Web API WebSocket connected: real-time playback streaming enabled.' },
  { time: '10:04:30', level: 'METRICS', msg: 'Telemetry heartbeat OK. CPU load: 14% • RAM: 4.1GB • Latency: 12ms.' },
];

const STREAMING_POOL = [
  { level: 'VISION', msg: 'Inference batch complete: Frame 1042 processed in 18.4ms (54.3 FPS).' },
  { level: 'ANPR', msg: 'License plate localized: NL-07-C-4491 (Confidence: 0.94). Plate crop dispatched.' },
  { level: 'AGENT', msg: 'Saksham Agent graph triggered: Query parsed -> Vector search -> Slack alert sent.' },
  { level: 'CACHE', msg: 'Redis cache hit on telemetry metric key "anpr:detection:nl07". TTL: 3600s.' },
  { level: 'METRICS', msg: 'Edge device health check passed. Memory pressure: nominal (38%).' },
  { level: 'SYSTEM', msg: 'Garbage collection cycle finished in 2.1ms. Heap delta: -14.2MB.' },
  { level: 'VISION', msg: 'Tracker update: TrackID #82 (Motorcycle, Speed: 42 km/h, Helmet: TRUE).' },
  { level: 'SECURITY', msg: 'JWT session verified. Rate limiter: 142/500 requests utilized.' },
];

export default function SystemMonitor({ isOpen: controlledIsOpen, setIsOpen: setControlledIsOpen }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setModalOpen = setControlledIsOpen || setInternalIsOpen;

  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'logs'
  const [logFilter, setLogFilter] = useState('ALL');
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [cpuLoad, setCpuLoad] = useState(14);
  const [ramUsage, setRamUsage] = useState(4.1);
  const [latency, setLatency] = useState(12);
  const [uptimeSeconds, setUptimeSeconds] = useState(86420);
  const canvasRef = useRef(null);
  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (isModalOpen && activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isModalOpen, activeTab]);

  // Live telemetry oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(8, Math.min(32, prev + delta));
      });

      setRamUsage((prev) => {
        const delta = (Math.random() * 0.2 - 0.1);
        return parseFloat(Math.max(3.8, Math.min(4.6, prev + delta)).toFixed(2));
      });

      setLatency((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(9, Math.min(24, prev + delta));
      });

      setUptimeSeconds((prev) => prev + 2);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Streaming real-time log messages
  useEffect(() => {
    const logInterval = setInterval(() => {
      const randomLog = STREAMING_POOL[Math.floor(Math.random() * STREAMING_POOL.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setLogs((prev) => [...prev.slice(-25), { time: timeStr, level: randomLog.level, msg: randomLog.msg }]);
    }, 3600);

    return () => clearInterval(logInterval);
  }, []);

  // Waveform canvas rendering
  useEffect(() => {
    if (!isModalOpen || activeTab !== 'telemetry') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      // Background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(width, mid);
      ctx.stroke();

      // Primary sine wave
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 6;

      for (let x = 0; x < width; x++) {
        const freq1 = 0.022;
        const freq2 = 0.055;
        const y =
          mid +
          Math.sin(x * freq1 + step * 0.06) * 14 +
          Math.sin(x * freq2 - step * 0.04) * 7;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary sine wave (blue)
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 4;

      for (let x = 0; x < width; x++) {
        const freq = 0.035;
        const y = mid + Math.cos(x * freq + step * 0.045) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      step++;
      animationFrameId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isModalOpen, activeTab]);

  const formatUptime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const services = [
    { name: 'ANPR Pipeline (EasyOCR)', status: 'HEALTHY', latency: `${latency}ms`, icon: Activity, color: '#10b981' },
    { name: 'YOLOv8 Edge Vision', status: 'INFERENCE_ACTIVE', latency: '18ms', icon: Cpu, color: '#38bdf8' },
    { name: 'n8n Agent Workflow', status: 'HEALTHY', latency: '42ms', icon: Zap, color: '#a855f7' },
    { name: 'Redis Cache Layer', status: 'HEALTHY', latency: '1.2ms', icon: Server, color: '#f59e0b' },
  ];

  const filteredLogs = logFilter === 'ALL' ? logs : logs.filter((l) => l.level === logFilter);

  return (
    <>
      {/* 
        MONITOR ICON PILL TRIGGER
        Calm, elegant, steady status dot (no flashing ping or beep)
      */}
      <motion.button
        onClick={() => setModalOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-xl backdrop-blur-xl cursor-pointer select-none transition-all"
        style={{
          background: 'var(--theme-card, rgba(15, 23, 42, 0.85))',
          borderColor: 'var(--theme-border, rgba(16, 185, 129, 0.35))',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
        }}
        title="Edge System Telemetry • Click to inspect"
        aria-label="View System Monitor"
        type="button"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <Activity className="w-3 h-3" />
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-100">
          <span>{latency}ms</span>
          {/* Calm, steady green dot - no flashing or ping */}
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] text-emerald-400 hidden sm:inline font-semibold">
            LIVE
          </span>
        </div>
      </motion.button>

      {/* 
        CLEAN, PROFESSIONAL SYSTEM MONITOR MODAL
      */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative w-full max-w-4xl max-h-[88vh] rounded-3xl border shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden z-10 my-auto glass-card"
              style={{
                background: 'var(--theme-card-solid, #0f172a)',
                borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.12))',
              }}
            >
              {/* Modal Header */}
              <div
                className="p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3"
                style={{ borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.08))' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight font-sans">
                        Edge Telemetry &amp; Microservices
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                        99.98% Healthy
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      YOLOv8 ANPR &amp; Multi-Agent Cluster • ap-south-1
                    </p>
                  </div>
                </div>

                {/* Tab Switcher & Close */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
                    <button
                      onClick={() => setActiveTab('telemetry')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'telemetry'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      type="button"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Telemetry</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('logs')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'logs'
                          ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      type="button"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Cluster Logs</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Tab 1 - Telemetry & Health */}
              {activeTab === 'telemetry' && (
                <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar max-h-[calc(88vh-140px)]">
                  {/* Metric Meters Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl border bg-slate-900/50" style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.08))' }}>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        <span>CPU Load</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">{cpuLoad}%</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${cpuLoad}%` }} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border bg-slate-900/50" style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.08))' }}>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                        <Server className="w-3.5 h-3.5 text-sky-400" />
                        <span>RAM Heap</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-sky-400">{ramUsage} GB</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-sky-400 h-full transition-all duration-500" style={{ width: `${(ramUsage / 8) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border bg-slate-900/50" style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.08))' }}>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                        <Wifi className="w-3.5 h-3.5 text-amber-400" />
                        <span>P99 Latency</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">{latency} ms</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-2">SLA: &lt;45ms nominal</div>
                    </div>

                    <div className="p-3.5 rounded-2xl border bg-slate-900/50" style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.08))' }}>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Uptime</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-mono text-purple-400 truncate">{formatUptime(uptimeSeconds)}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-2">Zero downtime</div>
                    </div>
                  </div>

                  {/* Oscilloscope Waveform Canvas */}
                  <div className="rounded-2xl border p-4 bg-slate-900/50" style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.08))' }}>
                    <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        1200Hz Edge Waveform Stream (FP16 Pipeline)
                      </span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                        54.3 FPS
                      </span>
                    </div>
                    <canvas ref={canvasRef} width={820} height={90} className="w-full h-20 rounded-xl bg-slate-950/90 border border-white/5" />
                  </div>

                  {/* Microservices Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2.5">
                      Edge Microservices Cluster
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {services.map((svc) => {
                        const Icon = svc.icon;
                        return (
                          <div
                            key={svc.name}
                            className="p-3 rounded-xl border bg-slate-900/50 flex items-center justify-between"
                            style={{ borderColor: 'var(--theme-border, rgba(255,255,255,0.08))' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${svc.color}15`, color: svc.color }}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-200">{svc.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">Response: {svc.latency}</div>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              {svc.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Body: Tab 2 - Clean Developer Cluster Logs Terminal */}
              {activeTab === 'logs' && (
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar max-h-[calc(88vh-140px)]">
                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px] mr-1">Filter:</span>
                      {['ALL', 'VISION', 'ANPR', 'AGENT', 'METRICS'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setLogFilter(filter)}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer text-[10px] font-bold ${
                            logFilter === filter
                              ? 'bg-cyan-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                          type="button"
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setLogs(INITIAL_LOGS)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded transition-colors cursor-pointer"
                      title="Reset logs stream"
                      type="button"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  </div>

                  {/* Monospace Log Viewer */}
                  <div className="rounded-2xl border overflow-hidden bg-slate-950/95 border-white/10 p-4 font-mono text-xs max-h-80 overflow-y-auto custom-scrollbar space-y-2">
                    {filteredLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 leading-relaxed text-slate-300">
                        <span className="text-slate-500 text-[11px] shrink-0 font-mono">{log.time}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold shrink-0 ${
                            log.level === 'VISION'
                              ? 'border-sky-500/30 text-sky-400 bg-sky-500/10'
                              : log.level === 'ANPR'
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : log.level === 'AGENT'
                              ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                              : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="text-slate-300 text-xs font-sans">{log.msg}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div
                className="p-3 px-5 border-t flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-900/40"
                style={{ borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.08))' }}
              >
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  TLS 1.3 Active • Zero-Trust Cluster
                </span>
                <span>Node ID: edge-cluster-ap-south-1</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
