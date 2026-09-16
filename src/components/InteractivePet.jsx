import React, { useState, useEffect, useRef } from 'react';
import { SoundFX } from '../services/soundEngine';

export default function InteractivePet({ isEnabled = true, onToggleEnabled }) {
  // Cat State: 'idle' | 'walking' | 'jumping' | 'playing' | 'laser' | 'eating' | 'sleeping' | 'happy'
  const [mood, setMood] = useState('idle');
  const [speech, setSpeech] = useState('Meow! Ready to work? 🐾');
  const [showSpeech, setShowSpeech] = useState(true);
  const [hearts, setHearts] = useState([]);
  const [posX, setPosX] = useState(25); // percentage from right edge (0 to 75%)
  const [facingLeft, setFacingLeft] = useState(true);
  const [laserPos, setLaserPos] = useState({ x: 50, y: 40 });
  const [isJumping, setIsJumping] = useState(false);

  const walkTimerRef = useRef(null);
  const moodTimeoutRef = useRef(null);

  // Playful speech pool
  const speeches = {
    idle: [
      'Meow! Ready to conquer tasks? 🐾',
      'Purr... steady productivity! ✨',
      'Click me to pet or watch me jump! 😸',
      'Stretch break time? 🐱',
      'Walking by your side! 🐾',
      'Task master in action! 🏆'
    ],
    walking: [
      'Patrolling the workspace... 🐾',
      'Pacing around while you focus! 🐈',
      'Step step step... explore time! ✨',
      'Checking your task progress! 📋'
    ],
    jumping: [
      'Boing! High leap! 🦘✨',
      'Wheee! Look at that jump! 🐾',
      'Parkour cat! 😼'
    ],
    happy: [
      '*purrrrrr* ❤️ That feels amazing!',
      'Meow! Best human ever! ✨',
      'Head scratches = 100% happiness! 🐾'
    ],
    playing: [
      'Catch the yarn! 🧶',
      'Pounce!! Got it! 😼',
      'Rolling and chasing! 🧶'
    ],
    laser: [
      'RED DOT DETECTED! 🔴',
      'Must catch the elusive laser! 🐾',
      'Too fast! Pouncing now! 🔴'
    ],
    eating: [
      '*nom nom nom* Delicious fish! 🐟',
      'Treats for the hard work! ⭐',
      'Energized and purring! 🐟'
    ],
    sleeping: [
      'Zzz... catnapping... 💤',
      'Purr... dreaming of done tasks... 🌙',
      'Cozy little snooze... 💤'
    ]
  };

  // Idle speech timer
  useEffect(() => {
    if (!isEnabled) return;
    const interval = setInterval(() => {
      if (mood === 'idle' && Math.random() > 0.45) {
        const pool = speeches.idle;
        const randomMsg = pool[Math.floor(Math.random() * pool.length)];
        setSpeech(randomMsg);
        setShowSpeech(true);
        setTimeout(() => setShowSpeech(false), 4500);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isEnabled, mood]);

  // Walking Physics Loop
  useEffect(() => {
    if (mood !== 'walking' || !isEnabled) return;

    walkTimerRef.current = setInterval(() => {
      setPosX(prev => {
        let next = facingLeft ? prev + 1.2 : prev - 1.2;
        if (next > 72) {
          setFacingLeft(false);
          next = 72;
        } else if (next < 5) {
          setFacingLeft(true);
          next = 5;
        }
        return next;
      });
    }, 60);

    return () => {
      if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    };
  }, [mood, facingLeft, isEnabled]);

  // Laser Pointer Physics Motion
  useEffect(() => {
    if (mood !== 'laser') return;
    const interval = setInterval(() => {
      const newX = Math.floor(Math.random() * 70) + 15;
      const newY = Math.floor(Math.random() * 50) + 20;
      setLaserPos({ x: newX, y: newY });
      setFacingLeft(newX > posX);
    }, 900);
    return () => clearInterval(interval);
  }, [mood, posX]);

  if (!isEnabled) {
    return (
      <button
        type="button"
        className="pet-summon-btn"
        onClick={() => onToggleEnabled && onToggleEnabled(true)}
        title="Summon Playful Line-Art Cat"
        aria-label="Summon Companion"
      >
        <span className="pet-summon-icon">🐱</span>
        <span className="pet-summon-text">Summon Pet</span>
      </button>
    );
  }

  const triggerMood = (newMood, customSpeech, duration = 6000) => {
    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
    setMood(newMood);

    const pool = speeches[newMood] || speeches.idle;
    const msg = customSpeech || pool[Math.floor(Math.random() * pool.length)];
    setSpeech(msg);
    setShowSpeech(true);

    if (newMood === 'jumping') {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 900);
      try {
        SoundFX.playReminderChime(true);
      } catch {}
    }

    if (newMood !== 'sleeping' && newMood !== 'walking') {
      moodTimeoutRef.current = setTimeout(() => {
        setMood('idle');
        setShowSpeech(false);
      }, duration);
    }
  };

  const handlePetCat = () => {
    // Spawn floating heart
    const newHeart = { id: Date.now() + Math.random(), x: Math.random() * 30 - 15 };
    setHearts(prev => [...prev.slice(-4), newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1400);

    triggerMood('happy', null, 3500);
  };

  const handlePerformJump = () => {
    triggerMood('jumping', 'Boing! Leap in the air! ✨', 1500);
  };

  const handleToggleWalking = () => {
    if (mood === 'walking') {
      setMood('idle');
      setSpeech('Taking a relaxing break! 🐾');
    } else {
      triggerMood('walking', 'Patrolling your workspace! 🐾', 12000);
    }
  };

  return (
    <div
      className="pet-lineart-stage"
      style={{
        right: `${posX}px`,
        transform: facingLeft ? 'scaleX(1)' : 'scaleX(-1)'
      }}
      aria-label="Playful Line-Art Cat Companion"
    >
      {/* Speech Bubble */}
      {showSpeech && (
        <div
          className="pet-speech-bubble animate-pop-in"
          style={{ transform: facingLeft ? 'scaleX(1)' : 'scaleX(-1)' }}
        >
          <span>{speech}</span>
          <div className="pet-speech-arrow" />
        </div>
      )}

      {/* Floating Hearts from petting */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="pet-floating-heart"
          style={{ transform: `translateX(${h.x}px)` }}
        >
          ❤️
        </span>
      ))}

      {/* Interactive Laser Dot */}
      {mood === 'laser' && (
        <div
          className="pet-laser-dot"
          style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
        />
      )}

      {/* Rolling Yarn Ball */}
      {mood === 'playing' && (
        <div className="pet-yarn-ball animate-yarn-bounce">
          🧶
        </div>
      )}

      {/* Fish Treat */}
      {mood === 'eating' && (
        <div className="pet-fish-treat animate-treat-float">
          🐟
        </div>
      )}

      {/* Sleep Zzz Bubbles */}
      {mood === 'sleeping' && (
        <div className="pet-sleep-bubbles">
          <span className="sleep-z z1">z</span>
          <span className="sleep-z z2">Z</span>
          <span className="sleep-z z3">Z</span>
        </div>
      )}

      {/* Modern Expressive Line-Art Cat Character */}
      <div
        className={`pet-lineart-cat ${mood} ${isJumping ? 'jumping-action' : ''}`}
        onClick={handlePetCat}
        title="Click to pet &amp; cuddle! Use the control bar to make it walk, jump &amp; play."
        role="button"
        tabIndex={0}
      >
        <svg
          className="cat-lineart-svg"
          viewBox="0 0 160 120"
          width="110"
          height="84"
        >
          <defs>
            {/* Subtle aesthetic body tint */}
            <linearGradient id="lineCatGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-light, #a5b4fc)" stopOpacity="0.25" />
              <stop offset="50%" stopColor="var(--accent, #6366f1)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--secondary, #06b6d4)" stopOpacity="0.2" />
            </linearGradient>
            <filter id="catGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="var(--accent, #6366f1)" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Sinuous Animated Tail */}
          <path
            className="cat-art-tail"
            d="M 40 75 C 20 70, 10 40, 26 28 C 32 24, 34 36, 26 48 C 22 56, 32 68, 42 72"
            fill="none"
            stroke="var(--accent, #6366f1)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Back Paws / Legs (Animated in walk/jump) */}
          <g className="cat-legs-back">
            <path
              className="cat-leg-bl"
              d="M 46 80 Q 42 98 40 108"
              fill="none"
              stroke="var(--accent, #6366f1)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              className="cat-leg-br"
              d="M 58 82 Q 56 96 56 108"
              fill="none"
              stroke="var(--text-primary, #ffffff)"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>

          {/* Sleek Cat Torso & Spine Line */}
          <path
            className="cat-art-body"
            d="M 40 76 C 45 52, 75 48, 105 56 C 115 60, 118 78, 110 86 C 98 94, 52 94, 40 76 Z"
            fill="url(#lineCatGlow)"
            stroke="var(--accent, #6366f1)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#catGlowFilter)"
          />

          {/* Front Paws / Legs (Animated stepping & pounce) */}
          <g className="cat-legs-front">
            <path
              className="cat-leg-fl"
              d="M 96 82 Q 98 98 100 108"
              fill="none"
              stroke="var(--accent, #6366f1)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              className="cat-leg-fr"
              d="M 108 80 Q 112 96 114 108"
              fill="none"
              stroke="var(--text-primary, #ffffff)"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>

          {/* Elegant Head & Ears Outline */}
          <g className="cat-art-head">
            {/* Head Contour */}
            <circle
              cx="115"
              cy="48"
              r="22"
              fill="url(#lineCatGlow)"
              stroke="var(--accent, #6366f1)"
              strokeWidth="3"
            />

            {/* Left Ear */}
            <path
              className="cat-art-ear-left"
              d="M 102 34 L 102 12 L 116 28 Z"
              fill="rgba(244, 63, 94, 0.18)"
              stroke="var(--accent, #6366f1)"
              strokeWidth="2.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Right Ear */}
            <path
              className="cat-art-ear-right"
              d="M 120 28 L 134 14 L 130 36 Z"
              fill="rgba(244, 63, 94, 0.18)"
              stroke="var(--accent, #6366f1)"
              strokeWidth="2.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Expressive Eyes */}
            {mood === 'sleeping' || mood === 'happy' ? (
              <g stroke="var(--accent-hover, #818cf8)" strokeWidth="2.4" strokeLinecap="round" fill="none">
                <path d="M 108 48 Q 112 43 116 48" />
                <path d="M 122 48 Q 126 43 130 48" />
              </g>
            ) : (
              <g className="cat-art-eyes">
                <ellipse cx="112" cy="46" rx="3.5" ry="4.5" fill="var(--text-primary, #ffffff)" />
                <ellipse cx="126" cy="46" rx="3.5" ry="4.5" fill="var(--text-primary, #ffffff)" />
                <circle cx="112" cy="46" r="2.2" fill="var(--accent-dark, #3730a3)" />
                <circle cx="126" cy="46" r="2.2" fill="var(--accent-dark, #3730a3)" />
                <circle cx="111" cy="44.5" r="1.1" fill="#ffffff" />
                <circle cx="125" cy="44.5" r="1.1" fill="#ffffff" />
              </g>
            )}

            {/* Nose & Cute Whisker Muzzle */}
            <polygon
              points="120,53 117,50 123,50"
              fill="#f43f5e"
            />
            <path
              d="M 117 54 Q 120 57 123 54"
              fill="none"
              stroke="var(--text-primary, #ffffff)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* Whisker Lines */}
            <g stroke="var(--text-secondary, #94a3b8)" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
              <line x1="98" y1="50" x2="84" y2="48" />
              <line x1="98" y1="54" x2="82" y2="56" />
              <line x1="130" y1="50" x2="144" y2="48" />
              <line x1="130" y1="54" x2="146" y2="56" />
            </g>
          </g>
        </svg>
      </div>

      {/* Floating Action Control Bar */}
      <div
        className="pet-actions-bar"
        style={{ transform: facingLeft ? 'scaleX(1)' : 'scaleX(-1)' }}
      >
        <button
          type="button"
          className={`pet-action-btn ${mood === 'walking' ? 'active' : ''}`}
          onClick={handleToggleWalking}
          title={mood === 'walking' ? 'Pause Walking ⏸️' : 'Walk & Patrol 🐾'}
        >
          🐾
        </button>
        <button
          type="button"
          className="pet-action-btn"
          onClick={handlePerformJump}
          title="Jump / Leap 🦘"
        >
          🦘
        </button>
        <button
          type="button"
          className="pet-action-btn"
          onClick={() => triggerMood('playing')}
          title="Play with Yarn Ball 🧶"
        >
          🧶
        </button>
        <button
          type="button"
          className="pet-action-btn"
          onClick={() => triggerMood('laser')}
          title="Chase Laser Pointer 🔴"
        >
          🔴
        </button>
        <button
          type="button"
          className="pet-action-btn"
          onClick={() => triggerMood('eating')}
          title="Fish Snack 🐟"
        >
          🐟
        </button>
        <button
          type="button"
          className={`pet-action-btn ${mood === 'sleeping' ? 'active' : ''}`}
          onClick={() => triggerMood(mood === 'sleeping' ? 'idle' : 'sleeping')}
          title={mood === 'sleeping' ? 'Wake Up ☀️' : 'Catnap 💤'}
        >
          {mood === 'sleeping' ? '☀️' : '💤'}
        </button>
        <button
          type="button"
          className="pet-action-btn close-btn"
          onClick={() => onToggleEnabled && onToggleEnabled(false)}
          title="Hide Companion"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
