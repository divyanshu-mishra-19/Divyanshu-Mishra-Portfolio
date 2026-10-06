import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    // Respect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isRunning = true;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Adaptive particle count for silky 60/120 FPS
    const isMobile = width < 768;
    const particleCount = isMobile ? 36 : 72;
    const CONNECTION_DIST = isMobile ? 120 : 155;
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
    const MOUSE_REPEL_DIST = 130;
    const MOUSE_REPEL_DIST_SQ = MOUSE_REPEL_DIST * MOUSE_REPEL_DIST;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    let mouseMoveTimeout;
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      }, 3000);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const colors = [
      'rgba(56, 189, 248,',   // Sky blue
      'rgba(168, 85, 247,',   // Purple
      'rgba(245, 158, 11,',   // Amber
      'rgba(16, 185, 129,',   // Emerald
      'rgba(244, 63, 94,',    // Rose pink
    ];

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 1.2,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        baseVx: (Math.random() - 0.5) * 0.55,
        baseVy: (Math.random() - 0.5) * 0.55,
        alpha: Math.random() * 0.35 + 0.6,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        alphaSpeed: Math.random() * 0.007 + 0.003,
      });
    }

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hasMouse = mx > 0 && my > 0;

      // 1. Batch connection lines into a single stroke call
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
      ctx.lineWidth = 0.8;

      for (let i = 0; i < particleCount; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < particleCount; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < CONNECTION_DIST_SQ) {
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
          }
        }
      }
      ctx.stroke();

      // 2. Interactive mouse connection beams (batched)
      if (hasMouse) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1.1;

        for (let i = 0; i < particleCount; i++) {
          const p = particles[i];
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;

          if (distSq < MOUSE_REPEL_DIST_SQ) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
          }
        }
        ctx.stroke();
      }

      // 3. Render particles with glowing halo (without costly shadowBlur)
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Animate alpha pulse
        p.alpha += p.alphaSpeed * p.alphaDir;
        if (p.alpha > 0.92) {
          p.alpha = 0.92;
          p.alphaDir = -1;
        } else if (p.alpha < 0.45) {
          p.alpha = 0.45;
          p.alphaDir = 1;
        }

        // Mouse repulsion
        if (hasMouse) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;

          if (distSq < MOUSE_REPEL_DIST_SQ && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / MOUSE_REPEL_DIST) * 2.5;
            p.vx += (dx / dist) * force * 0.3;
            p.vy += (dy / dist) * force * 0.3;
          } else {
            p.vx += (p.baseVx - p.vx) * 0.04;
            p.vy += (p.baseVy - p.vy) * 0.04;
          }
        } else {
          p.vx += (p.baseVx - p.vx) * 0.04;
          p.vy += (p.baseVy - p.vy) * 0.04;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around viewport edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Soft glow halo
        ctx.beginPath();
        ctx.fillStyle = `${p.colorPrefix} ${p.alpha * 0.28})`;
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Crisp luminous core
        ctx.beginPath();
        ctx.fillStyle = `${p.colorPrefix} ${p.alpha})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Pause animation when tab is inactive to preserve 100% CPU/GPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(mouseMoveTimeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.92, willChange: 'transform' }}
    />
  );
}
