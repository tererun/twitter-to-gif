"use client";

import { useEffect, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  gravity: number;
};

const COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
];

export function Confetti({ duration = 3000 }: { duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const newParticles: Particle[] = [];
    const particleCount = 100;

    // Left bottom cracker - shoots up and right at ~45 degrees
    for (let i = 0; i < particleCount; i++) {
      const angle = (-45 + Math.random() * 20 - 10) * (Math.PI / 180); // -55 to -35 degrees (up-right)
      const speed = 6 + Math.random() * 8;
      newParticles.push({
        id: i,
        x: -2,
        y: 75 + Math.random() * 10,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.12 + Math.random() * 0.08,
      });
    }

    // Right bottom cracker - shoots up and left at ~45 degrees
    for (let i = 0; i < particleCount; i++) {
      const angle = (180 + 45 + Math.random() * 20 - 10) * (Math.PI / 180); // 215 to 235 degrees (up-left)
      const speed = 6 + Math.random() * 8;
      newParticles.push({
        id: particleCount + i,
        x: 102,
        y: 75 + Math.random() * 10,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.12 + Math.random() * 0.08,
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!isVisible || particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.speedX * 0.3,
          y: p.y + p.speedY * 0.3,
          rotation: p.rotation + p.rotationSpeed,
          speedX: p.speedX * 0.98,
          speedY: p.speedY + p.gravity,
        }))
      );
    }, 16);

    return () => clearInterval(interval);
  }, [isVisible, particles.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}
