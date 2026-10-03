import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Highly visible particles & connections
    const particleCount = 135;
    const particles = [];
    const CONNECTION_DIST = 160;
    const MOUSE_REPEL_DIST = 140;

    const colors = [
      'rgba(56, 189, 248, 0.85)',   // Radiant sky blue
      'rgba(168, 85, 247, 0.85)',   // Vibrant purple
      'rgba(245, 158, 11, 0.85)',   // Glowing amber
      'rgba(16, 185, 129, 0.85)',   // Emerald
      'rgba(244, 63, 94, 0.8)',     // Rose pink
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.6 + 1.4, // Noticeably larger (1.4px - 4.0px)
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        baseVx: (Math.random() - 0.5) * 0.6,
        baseVy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.4 + 0.6, // High visibility (0.6 - 1.0)
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        alphaSpeed: Math.random() * 0.008 + 0.004,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw connection lines with high contrast and visibility
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.38; // Increased from 0.12 to 0.38
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Draw interactive mouse connection beams
      if (mx > 0 && my > 0) {
        for (let i = 0; i < particles.length; i++) {
          const dx = particles[i].x - mx;
          const dy = particles[i].y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_REPEL_DIST) {
            const opacity = (1 - dist / MOUSE_REPEL_DIST) * 0.65;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw glowing particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate alpha pulse
        p.alpha += p.alphaSpeed * p.alphaDir;
        if (p.alpha > 0.95) {
          p.alpha = 0.95;
          p.alphaDir = -1;
        } else if (p.alpha < 0.45) {
          p.alpha = 0.45;
          p.alphaDir = 1;
        }

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_REPEL_DIST) {
          const force = (1 - dist / MOUSE_REPEL_DIST) * 2.8;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
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

        // Draw glowing particle disk
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.92 }}
    />
  );
}
