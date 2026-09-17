import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SparklesIcon } from './Icons';

export function TaskMetricsStrip({ stats, currentFilter, onSelectFilter }) {
  return (
    <div className="metrics-strip">
      <div
        className={`metric-item ${currentFilter === 'all' ? 'active-metric' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('all')}
        title="Filter by Dashboard (All Tasks)"
        style={{ cursor: 'pointer' }}
      >
        <span className="metric-val">{stats.total}</span>
        <span className="metric-lbl">Total</span>
      </div>

      <div className="metric-divider" />

      <div
        className={`metric-item ${currentFilter === 'today' ? 'active-metric' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('today')}
        title="Filter by Due Today"
        style={{ cursor: 'pointer' }}
      >
        <span className="metric-val">{stats.today}</span>
        <span className="metric-lbl">Today</span>
      </div>

      <div className="metric-divider" />

      <div
        className={`metric-item ${currentFilter === 'high' ? 'active-metric' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('high')}
        title="Filter by High Priority"
        style={{ cursor: 'pointer' }}
      >
        <span className="metric-val danger">{stats.high}</span>
        <span className="metric-lbl">High</span>
      </div>

      <div className="metric-divider" />

      <div
        className={`metric-item ${currentFilter === 'completed' ? 'active-metric' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('completed')}
        title="Filter by Completed"
        style={{ cursor: 'pointer' }}
      >
        <span className="metric-val">{stats.completed}</span>
        <span className="metric-lbl">Done</span>
      </div>
    </div>
  );
}

export function GreetingHero({
  userName,
  stats,
  isWelcomeAnimating = false,
  onWelcomeAnimationComplete,
  onTriggerWelcomeAnimation
}) {
  const blockRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'init' | 'center' | 'docking'
  const [targetRect, setTargetRect] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greetingText = getGreeting();

  // Trigger measurement when welcome animation is requested
  useLayoutEffect(() => {
    if (!isWelcomeAnimating) {
      if (phase !== 'idle') setPhase('idle');
      return;
    }

    let isMounted = true;

    const measureAndStart = () => {
      if (!isMounted || !blockRef.current) return;
      const rect = blockRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
        setPhase('init');
      } else {
        requestAnimationFrame(measureAndStart);
      }
    };

    const rafId = requestAnimationFrame(measureAndStart);
    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [isWelcomeAnimating]);

  // Choreograph phase sequence: init -> center -> docking -> idle
  useEffect(() => {
    if (phase === 'init') {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setPhase('center');
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }

    if (phase === 'center') {
      const holdTimer = setTimeout(() => {
        setPhase('docking');
      }, 1100);
      return () => clearTimeout(holdTimer);
    }

    if (phase === 'docking') {
      const dockTimer = setTimeout(() => {
        setPhase('idle');
        if (onWelcomeAnimationComplete) {
          onWelcomeAnimationComplete();
        }
      }, 1150);
      return () => clearTimeout(dockTimer);
    }
  }, [phase, onWelcomeAnimationComplete]);

  // Compute centered window transform
  let deltaX = 0;
  let deltaY = 0;
  let scale = 1.25;

  if (targetRect && typeof window !== 'undefined') {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;

    deltaX = windowCenterX - targetCenterX;
    deltaY = windowCenterY - targetCenterY;

    const maxSafeScale = (window.innerWidth * 0.88) / targetRect.width;
    scale = Math.min(1.28, Math.max(1.0, maxSafeScale));
  }

  const isPortalActive = phase !== 'idle' && targetRect;

  return (
    <section className="canvas-hero">
      {/* Real In-Layout Greeting Block */}
      <div
        ref={blockRef}
        className="greeting-block"
        style={{
          visibility: isPortalActive || isWelcomeAnimating ? 'hidden' : 'visible',
        }}
      >
        <h1 className="greeting-text">
          {greetingText},{' '}
          <span className="greeting-name">{userName || 'Executive'}</span>
          <button
            type="button"
            className="sparkle-replay-btn"
            onClick={() => onTriggerWelcomeAnimation && onTriggerWelcomeAnimation()}
            title="Replay Welcome Greeting"
            aria-label="Replay Welcome Greeting"
          >
            <SparklesIcon size={26} className="sparkle-greet" style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--accent-light, #818cf8)' }} />
          </button>
        </h1>
        <p className="greeting-subtitle">
          You have <strong style={{ color: 'var(--text-primary, #ffffff)' }}>{stats?.today || 0}</strong> tasks due today and <strong style={{ color: stats?.high > 0 ? 'var(--danger, #f43f5e)' : 'var(--text-primary, #ffffff)' }}>{stats?.high || 0}</strong> high priority deadlines.
        </p>
      </div>

      {/* Floating Transition Portal */}
      {isPortalActive && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className={`welcome-transition-backdrop ${phase === 'center' ? 'is-active' : ''} ${phase === 'docking' ? 'is-fading' : ''}`}
            aria-hidden="true"
          />

          <div
            className={`welcome-floating-greeting-container phase-${phase}`}
            style={{
              position: 'fixed',
              left: `${targetRect.left}px`,
              top: `${targetRect.top}px`,
              width: `${targetRect.width}px`,
              zIndex: 999990,
              pointerEvents: 'none',
              transformOrigin: 'center center',
              transform: (phase === 'init' || phase === 'center')
                ? `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${phase === 'init' ? scale * 0.94 : scale})`
                : 'translate3d(0px, 0px, 0px) scale(1)',
              opacity: phase === 'init' ? 0 : 1,
              transition: phase === 'docking'
                ? 'transform 1150ms cubic-bezier(0.16, 1, 0.3, 1), filter 1150ms ease, opacity 200ms ease'
                : (phase === 'center'
                    ? 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)'
                    : 'none'),
            }}
          >
            <div className={`welcome-floating-inner ${phase === 'center' ? 'has-glow' : ''}`}>
              <div className="welcome-center-aura" />
              <div className="greeting-block">
                <h1 className="greeting-text">
                  {greetingText},{' '}
                  <span className="greeting-name">{userName || 'Executive'}</span>
                  <span className="sparkle-replay-btn" style={{ cursor: 'default' }}>
                    <SparklesIcon size={26} className="sparkle-greet" style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--accent-light, #818cf8)' }} />
                  </span>
                </h1>
                <p className="greeting-subtitle">
                  You have <strong style={{ color: 'var(--text-primary, #ffffff)' }}>{stats?.today || 0}</strong> tasks due today and <strong style={{ color: stats?.high > 0 ? 'var(--danger, #f43f5e)' : 'var(--text-primary, #ffffff)' }}>{stats?.high || 0}</strong> high priority deadlines.
                </p>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </section>
  );
}

export default function StatCards(props) {
  const {
    variant = 'both',
    stats,
    userName,
    currentFilter,
    onSelectFilter,
    isWelcomeAnimating,
    onWelcomeAnimationComplete,
    onTriggerWelcomeAnimation,
  } = props;

  if (variant === 'metrics') {
    return <TaskMetricsStrip stats={stats} currentFilter={currentFilter} onSelectFilter={onSelectFilter} />;
  }

  if (variant === 'greeting') {
    return (
      <GreetingHero
        userName={userName}
        stats={stats}
        isWelcomeAnimating={isWelcomeAnimating}
        onWelcomeAnimationComplete={onWelcomeAnimationComplete}
        onTriggerWelcomeAnimation={onTriggerWelcomeAnimation}
      />
    );
  }

  return (
    <section className="canvas-hero">
      <GreetingHero
        userName={userName}
        stats={stats}
        isWelcomeAnimating={isWelcomeAnimating}
        onWelcomeAnimationComplete={onWelcomeAnimationComplete}
        onTriggerWelcomeAnimation={onTriggerWelcomeAnimation}
      />
      <TaskMetricsStrip stats={stats} currentFilter={currentFilter} onSelectFilter={onSelectFilter} />
    </section>
  );
}

