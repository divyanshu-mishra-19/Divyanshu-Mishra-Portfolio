import React, { useEffect, useRef } from 'react';

export default function ThemeBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (theme !== 'matrix' && theme !== 'neural') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ============================================
    // 1. MATRIX DIGITAL CODE RAIN
    // ============================================
    if (theme === 'matrix') {
      const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
      const fontSize = 14;
      const columns = Math.floor(width / fontSize);
      const drops = Array(columns).fill(1);

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(1, 10, 4, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#22c55e';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Bright tip of the stream
          if (Math.random() > 0.9) {
            ctx.fillStyle = '#86efac';
          } else {
            ctx.fillStyle = '#22c55e';
          }

          ctx.fillText(char, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationId = requestAnimationFrame(drawMatrix);
      };

      drawMatrix();
    }

    // ============================================
    // 2. NEURAL SYNAPTIC NETWORK
    // ============================================
    if (theme === 'neural') {
      const nodeCount = Math.min(60, Math.floor((width * height) / 25000));
      const nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.5,
      }));

      const drawNeural = () => {
        ctx.fillStyle = 'rgba(3, 20, 12, 0.2)';
        ctx.fillRect(0, 0, width, height);

        // Connect nodes
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.fill();

          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            const dist = Math.hypot(node.x - other.x, node.y - other.y);
            if (dist < 130) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(16, 185, 129, ${0.35 * (1 - dist / 130)})`;
              ctx.lineWidth = 1;
              ctx.shadowBlur = 0;
              ctx.stroke();
            }
          }
        }

        animationId = requestAnimationFrame(drawNeural);
      };

      drawNeural();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [theme]);

  if (theme !== 'matrix' && theme !== 'neural') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-700"
    />
  );
}
