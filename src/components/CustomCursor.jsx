import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // If user is on a touch-only device (phone/tablet), disable custom cursor
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let raf;
    let hasMoved = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      if (!hasMoved) {
        hasMoved = true;
        ringX = mouseX;
        ringY = mouseY;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      } else {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;

      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('.cursor-pointer') ||
        target.closest('.clickable')
      ) {
        ring.classList.add('hovered');
        dot.style.transform = 'translate(-50%, -50%) scale(1.4)';
      } else {
        ring.classList.remove('hovered');
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    const onMouseLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const onMouseEnter = () => {
      if (hasMoved) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      if (hasMoved) {
        ringX = lerp(ringX, mouseX, 0.16);
        ringY = lerp(ringY, mouseY, 0.16);
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
      }
      raf = requestAnimationFrame(animate);
    };

    // Use capture: true so mouse events are caught even if elements call stopPropagation
    window.addEventListener('mousemove', onMouseMove, { capture: true, passive: true });
    window.addEventListener('mouseover', onMouseOver, { capture: true, passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove, { capture: true });
      window.removeEventListener('mouseover', onMouseOver, { capture: true });
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{ zIndex: 99999999, pointerEvents: 'none' }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{ zIndex: 99999998, pointerEvents: 'none' }}
      />
    </>,
    document.body
  );
}
