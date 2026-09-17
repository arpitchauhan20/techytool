import React, { useMemo } from 'react';
import { SoundFX } from '../services/soundEngine';

export default function ExecutiveLaunchButton({
  text = '• LAUNCH • LAUNCH ',
  onClick,
  title = 'Launch Dashboard',
  soundEnabled = true,
  className = '',
}) {
  const chars = useMemo(() => text.split(''), [text]);
  const angleStep = useMemo(() => 360 / (chars.length || 1), [chars]);

  const handleClick = (e) => {
    if (soundEnabled && SoundFX.playLaunchChord) {
      SoundFX.playLaunchChord(soundEnabled);
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button"
      className={`rotating-orbit-btn ${className}`}
      onClick={handleClick}
      title={title}
      aria-label={title}
    >
      {/* Spinning Circular Text Ring */}
      <p className="rotating-orbit-btn__text" aria-hidden="true">
        {chars.map((char, index) => (
          <span
            key={index}
            style={{
              transform: `rotate(${angleStep * index}deg)`,
            }}
          >
            {char}
          </span>
        ))}
      </p>

      {/* Center Circle with Diagonal Shoot-Through Arrow */}
      <div className="rotating-orbit-btn__circle">
        {/* Primary Arrow Icon */}
        <svg
          viewBox="0 0 14 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="rotating-orbit-btn__icon"
          width="13"
          height="14"
        >
          <path
            d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
            fill="currentColor"
          />
        </svg>

        {/* Secondary Shoot-Through Arrow Icon */}
        <svg
          viewBox="0 0 14 15"
          fill="none"
          width="13"
          height="14"
          xmlns="http://www.w3.org/2000/svg"
          className="rotating-orbit-btn__icon rotating-orbit-btn__icon--copy"
        >
          <path
            d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
            fill="currentColor"
          />
        </svg>
      </div>
    </button>
  );
}
