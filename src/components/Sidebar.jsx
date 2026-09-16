import React, { useEffect } from 'react';
import {
  ZapIcon,
  ClipboardIcon,
  CalendarIcon,
  KeyIcon,
  SunIcon,
  FlameIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from './Icons';

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  activeDashboardBoard = null,
  onSelectDashboardBoard,
  currentFilter,
  onSelectFilter,
  taskCounts = { all: 0, today: 0, upcoming: 0, high: 0, overdue: 0, completed: 0 },
  isCalendarConnected = false,
  currentPalette,
  onChangePalette,
  soundEnabled,
  onToggleSound,
  userName,
  onOpenSettings,
  onOpenNewTask,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  // Main Suite Tools Navigation List
  const suiteTools = [
    {
      id: 'overview',
      boardId: null,
      label: 'Executive Overview',
      sublabel: 'Dashboard Hub',
      icon: <ZapIcon size={16} />,
      badge: 'Hub'
    },
    {
      id: 'calendar',
      boardId: 'calendar',
      label: 'Calendar Reminder',
      sublabel: 'Google Sync & Alarms',
      icon: <CalendarIcon size={16} />,
      badge: isCalendarConnected ? 'Synced' : 'Ready',
      isSuccess: isCalendarConnected
    },
    {
      id: 'tasks',
      boardId: 'tasks',
      label: 'Task Details',
      sublabel: 'Active Workspace',
      icon: <ClipboardIcon size={16} />,
      badge: taskCounts.all,
      isOverdue: taskCounts.overdue > 0
    }
  ];

  // Close sidebar on Escape and lock body scroll on mobile/tablet when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const getInitials = (name, email) => {
    const str = (name || email || 'U').trim();
    const parts = str.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`} id="app-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <div className="brand-icon">
              <ZapIcon size={18} />
            </div>
            <div className="brand-text">
              <div className="brand-name">
                Techy Tool <span>PRO</span>
              </div>
              <div className="brand-workspace">Executive Suite</div>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            title="Close Menu"
            aria-label="Close navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tools Menu Section */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">SUITE TOOLS</div>
          {suiteTools.map(tool => {
            const isActive = activeDashboardBoard === tool.boardId;
            return (
              <button
                key={tool.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (onSelectDashboardBoard) onSelectDashboardBoard(tool.boardId);
                  onClose();
                }}
                title={`Open ${tool.label}`}
              >
                <span className="nav-icon">{tool.icon}</span>
                <span className="nav-label">{tool.label}</span>
                {tool.badge !== undefined && (
                  <span
                    className={`nav-badge ${tool.isOverdue ? 'danger' : ''} ${tool.isSuccess ? 'highlight' : ''}`}
                    title={tool.isSuccess ? 'Google Calendar Connected' : ''}
                  >
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Actions Menu */}
          <div className="nav-section-title" style={{ marginTop: '14px' }}>QUICK ACTIONS</div>
          <button
            type="button"
            className="nav-item"
            onClick={() => {
              onOpenNewTask();
              onClose();
            }}
            title="Create New Task"
          >
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <span className="nav-label">Add New Task</span>
            <span className="nav-badge" style={{ fontSize: '10px' }}>+ N</span>
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            title="Open Automation & Profile Settings"
          >
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span className="nav-label">Settings &amp; Email</span>
          </button>
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: '16px' }} />

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* User Profile Card / Auth Action */}
          {!currentUser ? (
            <div className="sidebar-auth-prompt">
              <button
                type="button"
                className="btn btn-primary btn-sm sidebar-auth-btn"
                onClick={() => {
                  onOpenAuthModal('login');
                  onClose();
                }}
                title="Sign in or create account"
              >
                <KeyIcon size={14} style={{ marginRight: isCollapsed ? 0 : 6 }} />
                {!isCollapsed && <span>Sign In / Register</span>}
              </button>
            </div>
          ) : (
            <div
              className="sidebar-user-card"
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              title={`Signed in as ${currentUser.email || currentUser.name}. Click to open Settings.`}
            >
              <div className="user-avatar">
                {getInitials(currentUser.name, currentUser.email)}
              </div>
              {!isCollapsed && (
                <div className="user-details">
                  <span className="user-name-display">{currentUser.name || 'Executive User'}</span>
                  <span className="user-edit-hint">{currentUser.email || 'Settings & Integrations'}</span>
                </div>
              )}
              {!isCollapsed && (
                <div className="user-card-action" title="Settings & Integrations">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile / Tablet Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
    </>
  );
}
