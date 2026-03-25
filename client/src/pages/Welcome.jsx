import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002
    }));

    let frame;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 166, 35, ${s.alpha * 0.4})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden bg-[#0a0a0a]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top section */}
      <div className="relative z-10 flex flex-col items-center pt-20 px-8">
        {/* Logo */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F5A623] to-[#C47D0E] flex items-center justify-center shadow-[0_0_40px_rgba(245,166,35,0.4)]">
            <span className="text-4xl">🚶</span>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-[#F5A623] opacity-30 animate-ping" />
        </div>

        {/* App name */}
        <h1
          className="text-6xl font-black mb-3 text-[#F5A623]"
          style={{ textShadow: '0 0 30px rgba(245,166,35,0.6), 0 0 60px rgba(245,166,35,0.2)' }}
        >
          בדרך
        </h1>

        <p className="text-gray-400 text-lg text-center leading-relaxed font-light tracking-wide">
          האומנות של להיות
          <br />
          <span className="text-white font-medium">אנושי בתנועה</span>
        </p>
      </div>

      {/* Middle - Philosophy pills */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-8 py-10">
        {[
          { icon: '🎒', text: 'שים את התרמיל הנפשי' },
          { icon: '⏱️', text: '7 דקות ביום — לא פחות, לא יותר' },
          { icon: '✨', text: '95% זה הדרך, לא הפסגה' }
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 w-full max-w-xs"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-white/80 text-sm font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 w-full px-8 pb-12 flex flex-col gap-3">
        <button
          onClick={() => navigate('/auth')}
          className="btn-primary shadow-[0_4px_30px_rgba(245,166,35,0.4)]"
        >
          מתחילים לנוע
        </button>
        <p className="text-center text-gray-600 text-xs">
          בואו נבנה יחד הרגל שיישאר
        </p>
      </div>
    </div>
  );
}
