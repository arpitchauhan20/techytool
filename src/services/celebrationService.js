import confetti from 'canvas-confetti';

/**
 * Spawns dynamic floating iridescent water bubbles that float upwards from the bottom
 */
export function triggerWaterBubbles({ count = 35, duration = 3800 } = {}) {
  if (typeof document === 'undefined') return;

  const container = document.createElement('div');
  container.className = 'water-bubbles-celebration-container';
  container.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 99998;
    overflow: hidden;
  `;
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    const size = Math.floor(Math.random() * 46) + 18; // 18px to 64px
    const left = Math.random() * 94 + 3; // 3% to 97%
    const delay = Math.random() * 1400; // 0 to 1.4s delay
    const floatDuration = Math.random() * 1600 + 2200; // 2.2s to 3.8s

    bubble.className = 'water-bubble-item';
    bubble.style.cssText = `
      position: absolute;
      bottom: -70px;
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.95) 0%, rgba(207, 231, 242, 0.55) 30%, rgba(201, 194, 232, 0.35) 60%, rgba(246, 221, 228, 0.5) 85%, rgba(255, 255, 255, 0.9) 100%);
      box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.7), 0 0 16px rgba(207, 231, 242, 0.5), inset -3px -3px 8px rgba(124, 102, 220, 0.3);
      border: 1.2px solid rgba(255, 255, 255, 0.75);
      animation: floatUpwardsBubble ${floatDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms forwards;
      opacity: 0.9;
    `;

    // Inner specular highlight reflection dot
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position: absolute;
      top: 15%;
      left: 20%;
      width: 25%;
      height: 20%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      transform: rotate(-35deg);
    `;
    bubble.appendChild(highlight);
    container.appendChild(bubble);
  }

  setTimeout(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, duration + 2000);
}

/**
 * Trigger elegant celebratory confetti blasts accompanied by shimmering floating water bubbles
 */
export function triggerDualCornerCelebration({ duration = 3200 } = {}) {
  try {
    // 1. Launch floating water bubbles
    triggerWaterBubbles({ count: 32, duration });

    const end = Date.now() + duration;
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#ffffff', '#ffd700'];

    // 2. Initial High-Altitude Dual Blast from Bottom Corners
    confetti({
      particleCount: 75,
      angle: 65, // Steeper upward launch
      spread: 60,
      origin: { x: 0, y: 1 },
      colors,
      startVelocity: 95, // High launch velocity for maximum height
      gravity: 0.82, // Floatier trajectory reaching top of screen
      ticks: 400,
      zIndex: 99999
    });

    confetti({
      particleCount: 75,
      angle: 115, // Steeper upward launch
      spread: 60,
      origin: { x: 1, y: 1 },
      colors,
      startVelocity: 95, // High launch velocity for maximum height
      gravity: 0.82, // Floatier trajectory reaching top of screen
      ticks: 400,
      zIndex: 99999
    });

    // 3. Controlled High-Arch Wave Streams from both corners
    const interval = setInterval(() => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 35 * (timeLeft / duration);

      // Bottom-Left Corner Cannon
      confetti({
        particleCount: Math.floor(particleCount),
        angle: 62 + Math.random() * 12,
        spread: 55,
        origin: { x: 0, y: 0.98 },
        colors,
        startVelocity: 85 + Math.random() * 12,
        gravity: 0.84,
        ticks: 350,
        zIndex: 99999
      });

      // Bottom-Right Corner Cannon
      confetti({
        particleCount: Math.floor(particleCount),
        angle: 118 - Math.random() * 12,
        spread: 55,
        origin: { x: 1, y: 0.98 },
        colors,
        startVelocity: 85 + Math.random() * 12,
        gravity: 0.84,
        ticks: 350,
        zIndex: 99999
      });
    }, 240);
  } catch (err) {
    console.warn('Celebration trigger note:', err);
  }
}
