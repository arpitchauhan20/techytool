import React, { useState, useEffect, useRef } from 'react';
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
  onTriggerWelcomeAnimation,
  onCardsReady
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greetingPrefix = getGreeting();
  const name = userName || 'Arpit Chauhan';
  const fullTitle = `${greetingPrefix}, ${name}`;
  const fullSubtitle = `You have ${stats?.today || 0} tasks due today and ${stats?.high || 0} high priority deadlines.`;

  // Typing animation states
  const [typedTitleLength, setTypedTitleLength] = useState(() => isWelcomeAnimating ? 0 : fullTitle.length);
  const [typedSubtitleLength, setTypedSubtitleLength] = useState(() => isWelcomeAnimating ? 0 : fullSubtitle.length);
  const [typingStep, setTypingStep] = useState(() => isWelcomeAnimating ? 'title' : 'done');
  const [isEnlarged, setIsEnlarged] = useState(() => Boolean(isWelcomeAnimating));

  // Trigger typing when isWelcomeAnimating is true
  useEffect(() => {
    if (!isWelcomeAnimating) {
      setTypedTitleLength(fullTitle.length);
      setTypedSubtitleLength(fullSubtitle.length);
      setTypingStep('done');
      setIsEnlarged(false);
      return;
    }

    setTypedTitleLength(0);
    setTypedSubtitleLength(0);
    setTypingStep('title');
    setIsEnlarged(true);
  }, [isWelcomeAnimating, fullTitle, fullSubtitle]);

  // Step 1: Type Title
  useEffect(() => {
    if (typingStep !== 'title') return;

    if (typedTitleLength < fullTitle.length) {
      const timer = setTimeout(() => {
        setTypedTitleLength(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const pause = setTimeout(() => {
        setTypingStep('subtitle');
      }, 150);
      return () => clearTimeout(pause);
    }
  }, [typingStep, typedTitleLength, fullTitle.length]);

  // Step 2: Type Subtitle, then shrink greeting smoothly, then reveal cards one by one
  useEffect(() => {
    if (typingStep !== 'subtitle') return;

    if (typedSubtitleLength < fullSubtitle.length) {
      const timer = setTimeout(() => {
        setTypedSubtitleLength(prev => prev + 1);
      }, 18);
      return () => clearTimeout(timer);
    } else {
      // Subtitle typing completed!
      setTypingStep('shrinking');
      // Hold briefly, then smoothly reduce font size
      const holdTimer = setTimeout(() => {
        setIsEnlarged(false);

        // After the shrink transition completes (360ms), reveal the module cards one by one!
        const revealTimer = setTimeout(() => {
          setTypingStep('done');
          if (onCardsReady) {
            onCardsReady();
          }
          const finishTimer = setTimeout(() => {
            if (onWelcomeAnimationComplete) {
              onWelcomeAnimationComplete();
            }
          }, 450);
          return () => clearTimeout(finishTimer);
        }, 360);

        return () => clearTimeout(revealTimer);
      }, 180);

      return () => clearTimeout(holdTimer);
    }
  }, [typingStep, typedSubtitleLength, fullSubtitle.length, onCardsReady, onWelcomeAnimationComplete]);

  const displayedTitle = fullTitle.slice(0, typedTitleLength);
  const displayedSubtitle = fullSubtitle.slice(0, typedSubtitleLength);

  // Format greeting prefix and name with stylish accent
  const prefixCutoff = Math.min(displayedTitle.length, greetingPrefix.length + 2);
  const prefixPart = displayedTitle.slice(0, prefixCutoff);
  const namePart = displayedTitle.slice(prefixCutoff);

  return (
    <section className="canvas-hero">
      <div className={`greeting-block ${isEnlarged ? 'is-typing-focus' : ''}`}>
        <h1 className="greeting-text">
          {prefixPart}
          {namePart && <span className="greeting-name">{namePart}</span>}
          {typingStep === 'title' && <span className="typing-cursor" aria-hidden="true" />}
          {typingStep !== 'title' && (
            <button
              type="button"
              className="sparkle-replay-btn"
              onClick={() => onTriggerWelcomeAnimation && onTriggerWelcomeAnimation()}
              title="Replay Welcome Greeting"
              aria-label="Replay Welcome Greeting"
            >
              <SparklesIcon size={26} className="sparkle-greet" style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--accent-light, #818cf8)' }} />
            </button>
          )}
        </h1>
        <p className="greeting-subtitle">
          {displayedSubtitle}
          {typingStep === 'subtitle' && <span className="typing-cursor" aria-hidden="true" />}
        </p>
      </div>
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
    onCardsReady,
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
        onCardsReady={onCardsReady}
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
        onCardsReady={onCardsReady}
      />
      <TaskMetricsStrip stats={stats} currentFilter={currentFilter} onSelectFilter={onSelectFilter} />
    </section>
  );
}

