"use client";
import { useEffect, useRef, useState } from "react";

const AnimatedLogo = ({ size = 80 }: { size?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [distance, setDistance] = useState(0);
  const [maxReached, setMaxReached] = useState<number[]>(Array(8).fill(80));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      setMousePos({
        x: dx / 10,
        y: dy / 10,
      });
      const newDist = Math.min(dist / 2, 200);
      setDistance(newDist);
      
      // Remember max growth per tentacle
      setMaxReached(prev => prev.map((max, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const targetX = Math.cos(angle) * (80 + newDist) + (dx / 10) * 2;
        const targetY = Math.sin(angle) * (80 + newDist) + (dy / 10) * 2;
        const tentacleLength = Math.sqrt(targetX * targetX + targetY * targetY);
        return Math.max(max, tentacleLength);
      }));
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const tentacles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const baseX = Math.cos(angle) * 60;
    const baseY = Math.sin(angle) * 60;
    const growthFactor = 80 + distance;
    const endX = Math.cos(angle) * growthFactor + mousePos.x * 2;
    const endY = Math.sin(angle) * growthFactor + mousePos.y * 2;
    
    // Generate spline points
    const points = [];
    const segments = 5;
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const x = baseX + (endX - baseX) * t + Math.sin(t * Math.PI * 2) * 10;
      const y = baseY + (endY - baseY) * t + Math.cos(t * Math.PI * 2) * 10;
      points.push({ x, y });
    }
    
    return { baseX, baseY, endX, endY, points };
  });

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="-100 -100 600 600"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-100"
      style={{ overflow: "visible" }}
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

      {/* Animated tentacles with splines */}
      <g transform="translate(200,200)">
        {tentacles.map((t, i) => {
          const pathData = t.points.reduce((acc, p, idx) => {
            if (idx === 0) return `M${p.x},${p.y}`;
            const prev = t.points[idx - 1];
            const cpx = (prev.x + p.x) / 2;
            const cpy = (prev.y + p.y) / 2;
            return `${acc} Q${prev.x},${prev.y} ${cpx},${cpy}`;
          }, '') + ` L${t.points[t.points.length - 1].x},${t.points[t.points.length - 1].y}`;
          
          return (
            <path
              key={i}
              d={pathData}
              fill="none"
              stroke="#F5F5DC"
              strokeWidth="12"
              strokeLinecap="round"
              opacity="0.6"
              className="transition-all duration-200 ease-out"
            />
          );
        })}
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
      <g transform="translate(200,90)">
        <circle cx="0" cy="0" r="5" fill="#FFD700" />
        <circle cx="0" cy="25" r="5" fill="#FFD700" />
        <circle cx="20" cy="12.5" r="5" fill="#FFD700" />
        <circle cx="-20" cy="12.5" r="5" fill="#FFD700" />
        <line x1="0" y1="0" x2="0" y2="25" stroke="#FFD700" strokeWidth="2.5" />
        <line x1="0" y1="0" x2="20" y2="12.5" stroke="#FFD700" strokeWidth="2.5" />
        <line x1="0" y1="0" x2="-20" y2="12.5" stroke="#FFD700" strokeWidth="2.5" />
        <line x1="20" y1="12.5" x2="0" y2="25" stroke="#FFD700" strokeWidth="2.5" />
        <line x1="-20" y1="12.5" x2="0" y2="25" stroke="#FFD700" strokeWidth="2.5" />
        <line x1="20" y1="12.5" x2="-20" y2="12.5" stroke="#FFD700" strokeWidth="2.5" />
      </g>
    </svg>
  );
};

export default AnimatedLogo;
