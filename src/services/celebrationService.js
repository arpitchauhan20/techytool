import confetti from 'canvas-confetti';

/**
 * Real-Physics Iridescent Water Bubble Cannon Engine
 * Launches shimmering, buoyant water bubbles with true fluid dynamics from the bottom corners
 */
export function triggerCornerWaterBubbles({ duration = 3600 } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.className = 'physics-bubbles-canvas-overlay';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 99998;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  const bubbles = [];
  const popDroplets = [];
  const startTime = Date.now();
  let animId = null;

  // Bubble color themes (iridescent pastel highlights)
  const bubbleTints = [
    { r: 255, g: 192, b: 203 }, // Rose
    { r: 186, g: 168, b: 255 }, // Lavender
    { r: 147, g: 220, b: 255 }, // Sky Cyan
    { r: 167, g: 243, b: 208 }, // Mint
    { r: 254, g: 215, b: 170 }, // Peach
    { r: 245, g: 208, b: 254 }  // Violet Pink
  ];

  function createBubble(origin) {
    const isLeft = origin === 'left';
    const startX = isLeft ? Math.random() * 50 : width - Math.random() * 50;
    const startY = height + 10;

    // Physics launch angles (directed diagonally upward toward the center screen)
    const angleDeg = isLeft ? 54 + Math.random() * 22 : 104 + Math.random() * 22;
    const angleRad = (angleDeg * Math.PI) / 180;
    const speed = 20 + Math.random() * 10; // Initial explosive thrust

    const radius = Math.floor(Math.random() * 22) + 14; // 14px to 36px
    const tint = bubbleTints[Math.floor(Math.random() * bubbleTints.length)];

    return {
      x: startX,
      y: startY,
      vx: Math.cos(angleRad) * speed,
      vy: -Math.sin(angleRad) * speed,
      radius,
      baseRadius: radius,
      tint,
      age: 0,
      maxAge: Math.floor(Math.random() * 120) + 240, // 4 to 6 seconds total
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.035 + Math.random() * 0.035,
      wobbleAmount: 1.2 + Math.random() * 1.5,
      terminalFallSpeed: 0.75 + Math.random() * 0.85, // Slow gentle descent like floating soap bubbles
      gravity: 0.045 + Math.random() * 0.03,
      alpha: 0.92
    };
  }

  function spawnPopEffect(x, y, tint, radius) {
    const dropletCount = 6;
    for (let i = 0; i < dropletCount; i++) {
      const angle = (Math.PI * 2 * i) / dropletCount + Math.random() * 0.3;
      const speed = 2 + Math.random() * 3.5;
      popDroplets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2 + 1,
        tint,
        alpha: 0.85,
        life: 0,
        maxLife: 22
      });
    }
  }

  // Initial energetic blast
  for (let i = 0; i < 20; i++) {
    bubbles.push(createBubble('left'));
    bubbles.push(createBubble('right'));
  }

  // Continuous stream during celebration window
  const spawnInterval = setInterval(() => {
    if (Date.now() - startTime > duration) {
      clearInterval(spawnInterval);
      return;
    }
    for (let i = 0; i < 3; i++) {
      bubbles.push(createBubble('left'));
      bubbles.push(createBubble('right'));
    }
  }, 180);

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 1. Render Pop Droplets
    for (let i = popDroplets.length - 1; i >= 0; i--) {
      const d = popDroplets[i];
      d.x += d.vx;
      d.y += d.vy + 0.12; // gentle gravity on droplets
      d.life++;
      d.alpha = Math.max(0, 0.85 * (1 - d.life / d.maxLife));

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.tint.r}, ${d.tint.g}, ${d.tint.b}, ${d.alpha})`;
      ctx.fill();

      if (d.life >= d.maxLife) {
        popDroplets.splice(i, 1);
      }
    }

    // 2. Render & Update Physics Bubbles (Launch -> Stay on screen -> Cascade down like party popper)
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.age++;

      // Physics integration
      if (b.vy < 0) {
        // Launch deceleration (rises smoothly and stays on screen)
        b.vx *= 0.965; // Horizontal drag
        b.vy *= 0.962; // Vertical launch drag

        // Prevent exiting top of viewport
        if (b.y < height * 0.08) {
          b.vy = Math.min(b.vy + 0.35, 0.2);
        }
      } else {
        // Apex & Party Popper Gentle Descent phase (drifts down gracefully)
        b.vx *= 0.985;
        b.vy += b.gravity;
        b.vy = Math.min(b.vy, b.terminalFallSpeed);
      }

      // Natural fluid sway & hover
      const sway = Math.sin(b.age * b.wobbleSpeed + b.wobblePhase) * b.wobbleAmount;
      b.x += b.vx + sway;
      b.y += b.vy;

      // Keep within horizontal bounds
      if (b.x < 15) b.vx = Math.abs(b.vx) * 0.5 + 0.2;
      if (b.x > width - 15) b.vx = -Math.abs(b.vx) * 0.5 - 0.2;

      // Draw Iridescent Bubble
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

      // Bubble Body Radial Gradient (Iridescent glow)
      const grad = ctx.createRadialGradient(
        b.x - b.radius * 0.35,
        b.y - b.radius * 0.35,
        b.radius * 0.1,
        b.x,
        b.y,
        b.radius
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.92 * b.alpha})`);
      grad.addColorStop(0.3, `rgba(${b.tint.r}, ${b.tint.g}, ${b.tint.b}, ${0.38 * b.alpha})`);
      grad.addColorStop(0.7, `rgba(200, 230, 255, ${0.22 * b.alpha})`);
      grad.addColorStop(0.92, `rgba(${b.tint.r}, ${b.tint.g}, ${b.tint.b}, ${0.58 * b.alpha})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${0.88 * b.alpha})`);

      ctx.fillStyle = grad;
      ctx.fill();

      // Outer delicate iridescent boundary stroke
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.78 * b.alpha})`;
      ctx.stroke();

      // Specular Highlight (Top-Left reflective shine dot)
      ctx.beginPath();
      ctx.ellipse(
        b.x - b.radius * 0.38,
        b.y - b.radius * 0.38,
        b.radius * 0.28,
        b.radius * 0.16,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * b.alpha})`;
      ctx.fill();

      // Secondary subtle lower crescent reflection
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.82, Math.PI * 0.3, Math.PI * 0.7);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * b.alpha})`;
      ctx.stroke();

      ctx.restore();

      // Check Pop condition (pops when landing near bottom of screen or at max lifetime)
      if (b.y > height - 25 || b.age >= b.maxAge) {
        spawnPopEffect(b.x, b.y, b.tint, b.radius);
        bubbles.splice(i, 1);
      }
    }

    // Cleanup when done
    if (bubbles.length === 0 && popDroplets.length === 0 && Date.now() - startTime > duration + 1000) {
      window.removeEventListener('resize', handleResize);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      return;
    }

    animId = requestAnimationFrame(animate);
  }

  animId = requestAnimationFrame(animate);
}

/**
 * Trigger synchronized dual-corner celebration: high-altitude confetti sparkles + real-physics bubble cannons
 */
export function triggerDualCornerCelebration({ duration = 3400 } = {}) {
  try {
    // 1. Launch real-physics water bubble cannons from both bottom corners
    triggerCornerWaterBubbles({ duration });

    const end = Date.now() + duration;
    const colors = [
      '#6366f1',
      '#a855f7',
      '#ec4899',
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#06b6d4',
      '#ffffff',
      '#ffd700'
    ];

    // 2. Initial High-Altitude Dual Confetti & Sparkle Cannon Blast from Bottom Corners
    confetti({
      particleCount: 85,
      angle: 64,
      spread: 62,
      origin: { x: 0, y: 1 },
      colors,
      startVelocity: 95,
      gravity: 0.82,
      ticks: 400,
      zIndex: 99999
    });

    confetti({
      particleCount: 85,
      angle: 116,
      spread: 62,
      origin: { x: 1, y: 1 },
      colors,
      startVelocity: 95,
      gravity: 0.82,
      ticks: 400,
      zIndex: 99999
    });

    // 3. Continuous Corner Stream Waves
    const interval = setInterval(() => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 36 * (timeLeft / duration);

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
    }, 220);
  } catch (err) {
    console.warn('Celebration trigger note:', err);
  }
}
