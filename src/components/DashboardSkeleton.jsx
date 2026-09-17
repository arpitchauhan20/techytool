import React from 'react';

export default function DashboardSkeleton({ activeDashboardBoard = null }) {
  return (
    <div className="dashboard-skeleton-view animate-fade-in" aria-label="Loading content..." role="status">
      {/* Overview Skeleton */}
      {activeDashboardBoard === null && (
        <div className="skeleton-overview-layout">
          {/* Greeting Hero Skeleton */}
          <div className="skeleton-hero-card">
            <div className="skeleton-shimmer-box skeleton-hero-title" />
            <div className="skeleton-shimmer-box skeleton-hero-sub" />
          </div>

          {/* Module Cards Skeleton Grid */}
          <div className="skeleton-cards-grid">
            <div className="skeleton-module-card">
              <div className="skeleton-card-header">
                <div className="skeleton-shimmer-box skeleton-icon-box" />
                <div className="skeleton-shimmer-box skeleton-badge-box" />
              </div>
              <div className="skeleton-shimmer-box skeleton-text-line-lg" />
              <div className="skeleton-shimmer-box skeleton-text-line-md" />
              <div className="skeleton-shimmer-box skeleton-btn-box" />
            </div>

            <div className="skeleton-module-card">
              <div className="skeleton-card-header">
                <div className="skeleton-shimmer-box skeleton-icon-box" />
                <div className="skeleton-shimmer-box skeleton-badge-box" />
              </div>
              <div className="skeleton-shimmer-box skeleton-text-line-lg" />
              <div className="skeleton-shimmer-box skeleton-text-line-md" />
              <div className="skeleton-shimmer-box skeleton-btn-box" />
            </div>
          </div>
        </div>
      )}

      {/* Calendar & Reminders Skeleton */}
      {activeDashboardBoard === 'calendar' && (
        <div className="skeleton-calendar-layout">
          {/* Calendar Box Skeleton */}
          <div className="skeleton-calendar-card">
            <div className="skeleton-cal-header">
              <div className="skeleton-shimmer-box skeleton-cal-title" />
              <div className="skeleton-shimmer-box skeleton-cal-actions" />
            </div>
            {/* Days Grid Skeleton (7x5) */}
            <div className="skeleton-cal-grid">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer-box skeleton-cal-day" />
              ))}
            </div>
          </div>

          {/* Scheduled Reminders List Skeleton */}
          <div className="skeleton-reminders-card">
            <div className="skeleton-shimmer-box skeleton-section-heading" />
            <div className="skeleton-reminders-list">
              <div className="skeleton-shimmer-box skeleton-reminder-item" />
              <div className="skeleton-shimmer-box skeleton-reminder-item" />
              <div className="skeleton-shimmer-box skeleton-reminder-item" />
            </div>
          </div>
        </div>
      )}

      {/* Tasks Workspace Skeleton */}
      {activeDashboardBoard === 'tasks' && (
        <div className="skeleton-tasks-layout">
          {/* Metrics Strip Skeleton */}
          <div className="skeleton-metrics-strip">
            <div className="skeleton-shimmer-box skeleton-metric-pill" />
            <div className="skeleton-shimmer-box skeleton-metric-pill" />
            <div className="skeleton-shimmer-box skeleton-metric-pill" />
            <div className="skeleton-shimmer-box skeleton-metric-pill" />
          </div>

          {/* Task Items Skeleton */}
          <div className="skeleton-tasks-list">
            <div className="skeleton-shimmer-box skeleton-task-row" />
            <div className="skeleton-shimmer-box skeleton-task-row" />
            <div className="skeleton-shimmer-box skeleton-task-row" />
            <div className="skeleton-shimmer-box skeleton-task-row" />
          </div>
        </div>
      )}
    </div>
  );
}
