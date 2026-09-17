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

  // Store callbacks in refs to prevent timer teardown if parent re-renders
  const onCardsReadyRef = useRef(onCardsReady);
  const onWelcomeAnimationCompleteRef = useRef(onWelcomeAnimationComplete);

  useEffect(() => {
    onCardsReadyRef.current = onCardsReady;
    onWelcomeAnimationCompleteRef.current = onWelcomeAnimationComplete;
  });

  // Trigger typing when isWelcomeAnimating is true
  useEffect(() => {
    if (!isWelcomeAnimating) {
      setTypedTitleLength(fullTitle.length);
      setTypedSubtitleLength(fullSubtitle.length);
      setTypingStep('done');
      setIsEnlarged(false);
      if (onCardsReadyRef.current) {
        onCardsReadyRef.current();
      }
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

  // Step 2: Type Subtitle
  useEffect(() => {
    if (typingStep !== 'subtitle') return;

    if (typedSubtitleLength < fullSubtitle.length) {
      const timer = setTimeout(() => {
        setTypedSubtitleLength(prev => prev + 1);
      }, 18);
      return () => clearTimeout(timer);
    } else {
      // Subtitle typing completed! Move to shrinking phase
      setTypingStep('shrinking');
    }
  }, [typingStep, typedSubtitleLength, fullSubtitle.length]);

  // Step 3: Smoothly shrink greeting, reveal module cards one by one at a graceful pace, then finish
  useEffect(() => {
    if (typingStep !== 'shrinking') return;

    // Timeline after subtitle typing finishes:
    // T = 150ms: Begin smooth size reduction
    // T = 500ms (150ms + 350ms): Size reduction complete -> REVEAL CARDS one by one!
    // T = 1300ms (500ms + 800ms): Both cards finished graceful staggered entrance -> complete welcome animation
    const t1 = setTimeout(() => {
      setIsEnlarged(false);
    }, 150);

    const t2 = setTimeout(() => {
      if (onCardsReadyRef.current) {
        onCardsReadyRef.current();
      }
    }, 500);

    const t3 = setTimeout(() => {
      setTypingStep('done');
      if (onWelcomeAnimationCompleteRef.current) {
        onWelcomeAnimationCompleteRef.current();
      }
    }, 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [typingStep]);

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

