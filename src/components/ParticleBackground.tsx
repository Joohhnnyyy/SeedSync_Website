import React, { useRef, useEffect } from "react";

const PARTICLE_COUNT = 120;
const PARTICLE_COLOR = "#000";
const LINE_COLOR = "rgba(0,0,0,0.2)";
const LINE_DISTANCE = 120;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize particles
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => {
      // Ensure a minimum speed for each particle
      let angle = randomBetween(0, 2 * Math.PI);
      let speed = randomBetween(0.1, 0.3); // Slower initial speed
      return {
        x: randomBetween(0, window.innerWidth),
        y: randomBetween(0, window.innerHeight),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: randomBetween(1, 4),
        opacity: randomBetween(0.5, 1),
      };
    });

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Handle touch move for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.current.x = e.touches[0].clientX;
        mouse.current.y = e.touches[0].clientY;
      }
    };
    window.addEventListener("touchmove", handleTouchMove);

    // Smooth parallax offset using linear interpolation (lerp)
    let smoothOffsetX = 0;
    let smoothOffsetY = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Parallax offset based on mouse/touch position
      const parallaxStrength = 5;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const targetOffsetX = ((mouse.current.x - centerX) / centerX) * parallaxStrength;
      const targetOffsetY = ((mouse.current.y - centerY) / centerY) * parallaxStrength;
      // Smoothly interpolate offset
      smoothOffsetX = lerp(smoothOffsetX, targetOffsetX, 0.08);
      smoothOffsetY = lerp(smoothOffsetY, targetOffsetY, 0.08);

      // Draw lines between close particles
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1 = particles.current[i];
          const p2 = particles.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(p1.x + smoothOffsetX, p1.y + smoothOffsetY);
            ctx.lineTo(p2.x + smoothOffsetX, p2.y + smoothOffsetY);
            ctx.strokeStyle = LINE_COLOR;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (let p of particles.current) {
        // Increase velocity damping for slower movement
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        // Scatter from mouse
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.vx += dx / dist * 0.2;
          p.vy += dy / dist * 0.2;
        }
        // Draw particle with smooth parallax offset
        ctx.beginPath();
        ctx.arc(p.x + smoothOffsetX, p.y + smoothOffsetY, p.size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(0,0,0,${p.opacity})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default ParticleBackground; 