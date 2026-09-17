import React, { useState, useRef } from 'react';
import { SoundFX } from '../services/soundEngine';

export default function ExecutiveLaunchButton({
  label = 'Open Dashboard',
  sublabel = 'Enter Workspace',
  icon,
  onClick,
  title = 'Open Dashboard',
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
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
      }, 600);
    }

    if (soundEnabled && SoundFX.playLaunchChord) {
      SoundFX.playLaunchChord(soundEnabled);
    } else if (soundEnabled && SoundFX.unlockAudio) {
      SoundFX.unlockAudio();
    }

    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      if (onClick) onClick();
    }, 140);
  };

  return (
    <button
      ref={btnRef}
      type="button"
      className={`executive-launch-btn ${isHovered ? 'is-hovered' : ''} ${isLaunching ? 'is-launching' : ''} ${className}`}
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
      {/* Interactive Cursor Spotlight */}
      <span className="launch-btn-spotlight" aria-hidden="true" />

      {/* Diagonal Shimmer Sheen */}
      <span className="launch-btn-shimmer" aria-hidden="true" />

      {/* Ripple Bursts */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="launch-btn-ripple"
          style={{ left: `${r.x}px`, top: `${r.y}px` }}
          aria-hidden="true"
        />
      ))}

      {/* Main Content Layout */}
      <span className="launch-btn-content">
        {/* Left Indicator Pill with Radar Pulse */}
        <span className="launch-badge-pill">
          <span className="launch-radar-beacon" aria-hidden="true">
            <span className="radar-core" />
            <span className="radar-wave" />
          </span>
          {icon && <span className="launch-badge-icon">{icon}</span>}
        </span>

        {/* Center Typography */}
        <span className="launch-text-wrap">
          <span className="launch-main-title">{label}</span>
          {sublabel && <span className="launch-sub-title">{sublabel}</span>}
        </span>

        {/* Right Arrow Action Capsule */}
        <span className="launch-action-capsule">
          <span className="launch-capsule-label">Launch</span>
          <span className="launch-arrow-wrap">
            <svg
              className="launch-arrow-svg"
              width="14"
              height="14"
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
