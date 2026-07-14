'use client';

import React, { useEffect, useRef } from 'react';

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Perspective Wave Grid variables
    let time = 0;
    const cols = 26;
    const rows = 18;
    const spacingX = 65;
    const spacingY = 45;
    const fov = 400; // Camera distance
    const tilt = 1.1; // Radian tilt angle

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.72; // Position perspective floor near bottom

      const gridPoints: { x: number; y: number }[][] = [];

      // 1. Calculate 3D points and project to 2D
      for (let r = 0; r < rows; r++) {
        gridPoints[r] = [];
        for (let c = 0; c < cols; c++) {
          // Centered 3D coordinates
          const x3d = (c - cols / 2) * spacingX;
          const y3d = (r - rows / 2) * spacingY;
          
          // Organic 3D waving height (ripples flowing from the back)
          const dist = Math.sqrt(x3d * x3d + y3d * y3d);
          const z3d = Math.sin(dist * 0.007 - time * 1.5) * 28 + Math.cos(x3d * 0.003 + time) * 15;

          // 3D Tilt rotation around X-axis
          const rotatedY = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
          const rotatedZ = y3d * Math.sin(tilt) + z3d * Math.cos(tilt) + 380; // depth offset

          // Perspective screen projection
          const scale = fov / Math.max(1, rotatedZ);
          const screenX = centerX + x3d * scale;
          const screenY = centerY + rotatedY * scale;

          gridPoints[r][c] = { x: screenX, y: screenY };
        }
      }

      // 2. Draw perspective floor lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pt = gridPoints[r][c];

          // Fade lines as they get closer to the edge or camera depth
          const opacity = Math.max(0, Math.min(0.09, (rows - r) / (rows * 6)));

          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.5;

          // Draw horizontal line to next column
          if (c < cols - 1) {
            const nextPt = gridPoints[r][c + 1];
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(nextPt.x, nextPt.y);
            ctx.stroke();
          }

          // Draw vertical line to next row
          if (r < rows - 1) {
            const nextPt = gridPoints[r + 1][c];
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(nextPt.x, nextPt.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw drifting ambient nebula orbs behind the grid
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.35, 10,
        width * 0.5, height * 0.35, Math.max(200, width * 0.45)
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      gradient.addColorStop(0.5, 'rgba(30, 27, 75, 0.15)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.015; // Animation speed
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-20 bg-[#04060a]"
    />
  );
}
