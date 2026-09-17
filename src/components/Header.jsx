import React, { useState, useEffect } from 'react';
import { SearchIcon, XIcon, ArrowLeftIcon } from './Icons';

export default function Header({
  activeDashboardBoard,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onBack
}) {
  const [currentDateText, setCurrentDateText] = useState('');
  const [isSearchExpandedMobile, setIsSearchExpandedMobile] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      setCurrentDateText(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSectionTitle = () => {
    if (activeDashboardBoard === 'calendar') return 'Calendar & Reminders';
    if (activeDashboardBoard === 'tasks') return 'Tasks';
    return 'Executive Overview';
  };

  return (
    <header className="main-topbar">
      {/* Mobile Menu & Current Window Title */}
      <div className="topbar-context">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="topbar-section-title-wrap">
          <h1 className="topbar-section-title">{getSectionTitle()}</h1>
        </div>
      </div>

      {/* Flexible Topbar Actions: Clean Date badge and Search */}
      <div className={`topbar-actions ${isSearchExpandedMobile ? 'search-expanded' : ''}`}>
        {/* Date Context Badge (Desktop / Tablet) */}
        <span className="date-badge">{currentDateText}</span>

        {/* Search Input Bar */}
        <div className="topbar-search">
          <span className="search-icon"><SearchIcon size={13} /></span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchExpandedMobile(true)}
            onBlur={() => {
              if (!searchQuery) setIsSearchExpandedMobile(false);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                onSearchChange('');
                setIsSearchExpandedMobile(false);
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <XIcon size={12} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
