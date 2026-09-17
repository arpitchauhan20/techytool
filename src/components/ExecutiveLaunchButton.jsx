import React, { useState, useRef } from 'react';
import { SoundFX } from '../services/soundEngine';

export default function ExecutiveLaunchButton({
  text = 'Launch',
  onClick,
  title = 'Launch Dashboard',
  soundEnabled = true,
  className = '',
}) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e) => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      const rippleId = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id: rippleId, x: rippleX, y: rippleY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 500);
    }

    if (soundEnabled && SoundFX.playLaunchChord) {
      SoundFX.playLaunchChord(soundEnabled);
    }

    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      if (onClick) onClick();
    }, 130);
  };

  return (
    <button
      ref={btnRef}
      type="button"
      className={`cyber-launch-btn ${isHovered ? 'is-hovered' : ''} ${isLaunching ? 'is-launching' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={title}
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
      }}
    >
      {/* Dynamic Animated Orbital Laser Border */}
      <span className="cyber-border-beam" aria-hidden="true" />

      {/* Internal Glass Core */}
      <span className="cyber-glass-core">
        {/* Mouse Position Spotlight */}
        <span className="cyber-spotlight" aria-hidden="true" />

        {/* Ambient Specular Shimmer */}
        <span className="cyber-shimmer" aria-hidden="true" />

        {/* Click Ripple */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="cyber-ripple"
            style={{ left: `${r.x}px`, top: `${r.y}px` }}
            aria-hidden="true"
          />
        ))}

        {/* Small, Clean Button Content: [✦ Launch →] */}
        <span className="cyber-content">
          <span className="cyber-spark-dot" aria-hidden="true">
            <span className="spark-ping" />
            <span className="spark-solid" />
          </span>
          <span className="cyber-label">{text}</span>
          <span className="cyber-arrow" aria-hidden="true">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
}
