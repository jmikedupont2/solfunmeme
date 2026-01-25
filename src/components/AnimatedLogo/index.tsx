"use client";
import { useEffect, useRef, useState } from "react";

const AnimatedLogo = ({ size = 200 }: { size?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setMousePos({
        x: (e.clientX - centerX) / 10,
        y: (e.clientY - centerY) / 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const tentacles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const baseX = Math.cos(angle) * 60;
    const baseY = Math.sin(angle) * 60;
    const endX = Math.cos(angle) * (120 + mousePos.x * Math.cos(angle));
    const endY = Math.sin(angle) * (120 + mousePos.y * Math.sin(angle));
    return { baseX, baseY, endX, endY };
  });

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-100"
    >
      <rect x="0" y="0" width="400" height="400" fill="transparent" />

      <defs>
        <radialGradient id="rainbowIris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="20%" stopColor="#00FF41" />
          <stop offset="40%" stopColor="#00FFFF" />
          <stop offset="60%" stopColor="#DC143C" />
          <stop offset="80%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#00FF41" />
        </radialGradient>

        <g id="ray">
          <line x1="0" y1="0" x2="0" y2="-75" stroke="#00FFFF" strokeWidth="3" opacity="0.8" />
          <line x1="0" y1="0" x2="0" y2="-85" stroke="#FFD700" strokeWidth="1" opacity="0.9" />
        </g>

        <ellipse id="petalBase" rx="100" ry="200" fill="#DC143C" />
        <ellipse id="petalInner" rx="85" ry="175" fill="#FF1744" />
      </defs>

      {/* Animated tentacles */}
      <g transform="translate(200,200)">
        {tentacles.map((t, i) => (
          <path
            key={i}
            d={`M${t.baseX},${t.baseY} Q${t.endX * 0.6},${t.endY * 0.6} ${t.endX},${t.endY}`}
            fill="none"
            stroke="#F5F5DC"
            strokeWidth="15"
            strokeLinecap="round"
            opacity="0.5"
            className="transition-all duration-300"
          />
        ))}
      </g>

      {/* Red petals */}
      <g transform="translate(200,200)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <use key={angle} href="#petalBase" transform={`rotate(${angle})`} />
        ))}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
          <use key={angle} href="#petalInner" transform={`rotate(${angle})`} />
        ))}
      </g>

      {/* Eye that follows cursor */}
      <g transform="translate(200,200)">
        <circle r="95" fill="#DC143C" />
        <circle r="80" fill="url(#rainbowIris)" />
        <circle
          cx={mousePos.x * 0.3}
          cy={mousePos.y * 0.3}
          r="35"
          fill="#230052"
          className="transition-all duration-100"
        />
        <circle
          cx={mousePos.x * 0.3 + 12}
          cy={mousePos.y * 0.3 - 12}
          r="12"
          fill="#F5F5DC"
          opacity="0.9"
          className="transition-all duration-100"
        />

        {/* Starburst rays */}
        {Array.from({ length: 24 }, (_, i) => (
          <use key={i} href="#ray" transform={`rotate(${i * 15})`} />
        ))}
      </g>

      {/* Smaller golden symbol above */}
      <g transform="translate(200,100)">
        <circle cx="0" cy="0" r="6" fill="#FFD700" />
        <circle cx="0" cy="30" r="6" fill="#FFD700" />
        <circle cx="25" cy="15" r="6" fill="#FFD700" />
        <circle cx="-25" cy="15" r="6" fill="#FFD700" />
        <line x1="0" y1="0" x2="0" y2="30" stroke="#FFD700" strokeWidth="3" />
        <line x1="0" y1="0" x2="25" y2="15" stroke="#FFD700" strokeWidth="3" />
        <line x1="0" y1="0" x2="-25" y2="15" stroke="#FFD700" strokeWidth="3" />
        <line x1="25" y1="15" x2="0" y2="30" stroke="#FFD700" strokeWidth="3" />
        <line x1="-25" y1="15" x2="0" y2="30" stroke="#FFD700" strokeWidth="3" />
        <line x1="25" y1="15" x2="-25" y2="15" stroke="#FFD700" strokeWidth="3" />
      </g>
    </svg>
  );
};

export default AnimatedLogo;
