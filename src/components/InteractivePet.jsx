import React, { useState, useEffect, useRef } from 'react';
import { SoundFX } from '../services/soundEngine';

export default function InteractivePet({ isEnabled = true, onToggleEnabled }) {
  const [mood, setMood] = useState('idle'); // 'idle' | 'playing' | 'laser' | 'eating' | 'sleeping' | 'happy'
  const [speech, setSpeech] = useState('Meow! 🐾');
  const [showSpeech, setShowSpeech] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [laserPos, setLaserPos] = useState({ x: 40, y: 30 });
  const [patsCount, setPatsCount] = useState(0);
  const timeoutRef = useRef(null);

  // Playful speech pool
  const speeches = {
    idle: [
      'Meow! Ready to get things done? 🐾',
      'Purr... what task is next? ✨',
      'I am watching your progress! 😸',
      'Click me for head pats! ❤️',
      'Productivity champion! 🏆',
      'Stretch break time? 🐱'
    ],
    happy: [
      '*purrrrrr* ❤️ Love you!',
      'Meow! That feels so good! ✨',
      'Head scratches are the best! 🐾',
      'Best human ever! 😻'
    ],
    playing: [
      'Catch the yarn! 🧶',
      'Pounce!! Got it! 😼',
      'Too fast for me! 🧶'
    ],
    laser: [
      'The red dot! MUST CATCH IT! 🔴',
      'Swish swish! Almost got it! 🐾',
      'Where did it go?! 🔴'
    ],
    eating: [
      '*nom nom nom* Delicious fish! 🐟',
      'Yummy treat! Thanks friend! ⭐',
      'Energized for more tasks! 🐟'
    ],
    sleeping: [
      'Zzz... catnapping... 💤',
      'Purr... dreaming of completed tasks... 🌙',
      'Soft kitty, warm kitty... 💤'
    ]
  };

  // Random speech timer during idle
  useEffect(() => {
    if (!isEnabled) return;
    const interval = setInterval(() => {
      if (mood === 'idle' && Math.random() > 0.4) {
        const pool = speeches.idle;
        const randomMsg = pool[Math.floor(Math.random() * pool.length)];
        setSpeech(randomMsg);
        setShowSpeech(true);
        setTimeout(() => setShowSpeech(false), 4500);
      }
    }, 14000);
    return () => clearInterval(interval);
  }, [isEnabled, mood]);

  // Handle laser animation motion
  useEffect(() => {
    if (mood !== 'laser') return;
    const interval = setInterval(() => {
      setLaserPos({
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 60) + 10
      });
    }, 700);
    return () => clearInterval(interval);
  }, [mood]);

  if (!isEnabled) {
    return (
      <button
        type="button"
        className="pet-summon-btn"
        onClick={() => onToggleEnabled && onToggleEnabled(true)}
        title="Summon Playful Cat Companion"
        aria-label="Summon Playful Cat Companion"
      >
        <span className="pet-summon-icon">🐱</span>
        <span className="pet-summon-text">Summon Pet</span>
      </button>
    );
  }

  const triggerMood = (newMood, customSpeech, duration = 6000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMood(newMood);
    setIsMenuOpen(false);

    const pool = speeches[newMood] || speeches.idle;
    const msg = customSpeech || pool[Math.floor(Math.random() * pool.length)];
    setSpeech(msg);
    setShowSpeech(true);

    if (newMood !== 'sleeping') {
      timeoutRef.current = setTimeout(() => {
        setMood('idle');
        setShowSpeech(false);
      }, duration);
    }
  };

  const handlePetCat = () => {
    setPatsCount(prev => prev + 1);

    // Spawn floating heart
    const newHeart = { id: Date.now() + Math.random(), x: Math.random() * 40 - 20 };
    setHearts(prev => [...prev.slice(-4), newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1400);

    triggerMood('happy', null, 3500);
  };

  return (
    <div className="pet-floating-dock" aria-label="Playful Cat Companion">
      {/* Speech Bubble */}
      {showSpeech && (
        <div className="pet-speech-bubble animate-pop-in">
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

      {/* Yarn Ball */}
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

      {/* Cat Avatar Container */}
      <div
        className={`pet-cat-body ${mood}`}
        onClick={handlePetCat}
        title="Click to pet! Right click / hover menu for playful actions"
        role="button"
        tabIndex={0}
      >
        <svg
          className="cat-svg"
          viewBox="0 0 120 120"
          width="74"
          height="74"
        >
          <defs>
            <radialGradient id="catBodyGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <radialGradient id="catBellyGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef3c7" />
            </radialGradient>
          </defs>

          {/* Wagging Tail */}
          <path
            className="cat-tail"
            d="M 25 85 C 10 75, 5 45, 20 40 C 25 45, 22 65, 32 80 Z"
            fill="url(#catBodyGrad)"
          />

          {/* Cat Main Body */}
          <ellipse
            cx="60"
            cy="82"
            rx="32"
            ry="24"
            fill="url(#catBodyGrad)"
          />

          {/* Fluffy Belly */}
          <ellipse
            cx="60"
            cy="84"
            rx="18"
            ry="15"
            fill="url(#catBellyGrad)"
          />

          {/* Left Ear */}
          <polygon
            className="cat-ear-left"
            points="38,30 25,58 52,50"
            fill="#f59e0b"
          />
          <polygon
            points="38,36 30,54 48,49"
            fill="#fda4af"
          />

          {/* Right Ear */}
          <polygon
            className="cat-ear-right"
            points="82,30 68,50 95,58"
            fill="#f59e0b"
          />
          <polygon
            points="82,36 72,49 90,54"
            fill="#fda4af"
          />

          {/* Head */}
          <circle
            cx="60"
            cy="56"
            r="26"
            fill="url(#catBodyGrad)"
          />

          {/* Cheeks Blush */}
          <ellipse cx="44" cy="62" rx="5" ry="3" fill="rgba(244, 63, 94, 0.4)" />
          <ellipse cx="76" cy="62" rx="5" ry="3" fill="rgba(244, 63, 94, 0.4)" />

          {/* Eyes (Awake vs Sleeping / Happy) */}
          {mood === 'sleeping' || mood === 'happy' ? (
            <g className="cat-happy-eyes" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 45 54 Q 50 48 55 54" />
              <path d="M 65 54 Q 70 48 75 54" />
            </g>
          ) : (
            <g className="cat-eyes">
              <ellipse cx="50" cy="52" rx="5" ry="6" fill="#1e293b" />
              <ellipse cx="70" cy="52" rx="5" ry="6" fill="#1e293b" />
              {/* Eye sparkle reflections */}
              <circle cx="48.5" cy="50" r="2" fill="#ffffff" />
              <circle cx="68.5" cy="50" r="2" fill="#ffffff" />
              <circle cx="51.5" cy="53.5" r="1" fill="#ffffff" />
              <circle cx="71.5" cy="53.5" r="1" fill="#ffffff" />
            </g>
          )}

          {/* Cute Nose */}
          <polygon
            points="60,60 56,57 64,57"
            fill="#f43f5e"
          />

          {/* Mouth */}
          <path
            d="M 56 61 Q 60 65 64 61"
            stroke="#78350f"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Whiskers */}
          <g stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
            <line x1="38" y1="58" x2="22" y2="56" />
            <line x1="38" y1="62" x2="20" y2="64" />
            <line x1="82" y1="58" x2="98" y2="56" />
            <line x1="82" y1="62" x2="100" y2="64" />
          </g>

          {/* Paws */}
          <ellipse cx="48" cy="98" rx="8" ry="6" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
          <ellipse cx="72" cy="98" rx="8" ry="6" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
        </svg>
      </div>

      {/* Quick Playful Action Menu Bar */}
      <div className="pet-actions-bar">
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
          title="Chase Laser Dot 🔴"
        >
          🔴
        </button>
        <button
          type="button"
          className="pet-action-btn"
          onClick={() => triggerMood('eating')}
          title="Feed Fish Treat 🐟"
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
          title="Hide Pet"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
