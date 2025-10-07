import React, { useEffect, useRef } from 'react';

interface GradientBlindsProps {
  gradientColors: string[];
  isHovered?: boolean;
}

const GradientBlinds: React.FC<GradientBlindsProps> = ({ gradientColors, isHovered = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Create static gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (gradientColors.length - 1), color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add shine effect only when hovered
      if (isHovered) {
        ctx.globalCompositeOperation = 'overlay';
        const shineGradient = ctx.createRadialGradient(
          width * 0.5, height * 0.5, 0,
          width * 0.5, height * 0.5, Math.max(width, height) * 0.5
        );
        shineGradient.addColorStop(0, 'rgba(66, 241, 89, 0.4)');
        shineGradient.addColorStop(0.5, 'rgba(94, 71, 183, 0.2)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = shineGradient;
        ctx.fillRect(0, 0, width, height);

        // Animate the shine slightly
        time += 16;
        if (time > 1000) time = 0; // Reset after 1 second
      }

      if (isHovered) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gradientColors, isHovered]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};

export default GradientBlinds;
