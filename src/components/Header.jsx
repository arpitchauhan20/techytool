import React, { useState, useEffect } from 'react';
import { SearchIcon, XIcon } from './Icons';

export default function Header({
  activeDashboardBoard,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu
}) {
  const [currentDateText, setCurrentDateText] = useState('');

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
    if (activeDashboardBoard === 'calendar') return 'Calendar Reminder Suite';
    if (activeDashboardBoard === 'tasks') return 'Task Details & Workspace';
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="topbar-actions">
        {/* Date Context Badge */}
        <span className="date-badge">{currentDateText}</span>

        {/* Search */}
        <div className="topbar-search">
          <span className="search-icon"><SearchIcon size={14} /></span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <XIcon size={12} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
