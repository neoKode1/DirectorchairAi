"use client";

import { useRef, useEffect, useCallback } from "react";

export function WarpCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    function draw() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      timeRef.current += 1;

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;

      const gridSize = 48;
      const segmentSize = 12;
      const radius = 600;
      const t = timeRef.current;

      // Vertical lines
      for (let x = -gridSize; x <= w + gridSize; x += gridSize) {
        let started = false;
        for (let y = -gridSize; y <= h + gridSize; y += segmentSize) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let warpX = x;
          let warpY = y;

          if (dist < radius) {
            const force = Math.max(0, (radius - dist) / radius);
            const easeForce = force * force * force;
            const ripple = Math.sin(dist * 0.03 - t * 0.1) * 12 * force;
            const dxR = dist === 0 ? 0 : dx / dist;
            const dyR = dist === 0 ? 0 : dy / dist;
            warpX -= dxR * (easeForce * 180 - ripple);
            warpY -= dyR * (easeForce * 180 - ripple);
          }

          if (!started) { ctx.moveTo(warpX, warpY); started = true; }
          else { ctx.lineTo(warpX, warpY); }
        }
      }

      // Horizontal lines
      for (let y = -gridSize; y <= h + gridSize; y += gridSize) {
        let started = false;
        for (let x = -gridSize; x <= w + gridSize; x += segmentSize) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let warpX = x;
          let warpY = y;

          if (dist < radius) {
            const force = Math.max(0, (radius - dist) / radius);
            const easeForce = force * force * force;
            const ripple = Math.sin(dist * 0.03 - t * 0.1) * 12 * force;
            const dxR = dist === 0 ? 0 : dx / dist;
            const dyR = dist === 0 ? 0 : dy / dist;
            warpX -= dxR * (easeForce * 180 - ripple);
            warpY -= dyR * (easeForce * 180 - ripple);
          }

          if (!started) { ctx.moveTo(warpX, warpY); started = true; }
          else { ctx.lineTo(warpX, warpY); }
        }
      }

      ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [resize]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
}

