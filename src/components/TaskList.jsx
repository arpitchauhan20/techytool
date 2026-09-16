import React, { useState } from 'react';
import TaskRow from './TaskRow';
import TaskEditorPanel from './TaskEditorPanel';
import { ClipboardIcon, TargetIcon, PlusIcon } from './Icons';

export default function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onSyncGoogleCalendar,
  onDownloadICS,
  onSendEmail,
  onOpenNewTask,
  currentFilter,
  currentSort = 'deadline-asc',
  onSortChange,
  isCreatorOpen = false,
  onCloseCreator,
  onSaveTask,
  taskToEdit = null,
  defaultEmail = '',
  soundEnabled = true
}) {
  const [isOpen, setIsOpen] = useState(true);

  const filterNames = {
    all: 'Dashboard',
    today: 'Due Today',
    upcoming: 'Upcoming',
    high: 'High Priority',
    overdue: 'Overdue',
    completed: 'Completed'
  };

  const pendingCount = tasks.filter(t => !t.completed).length;

  // Auto-expand task list view if creator is opened
  const effectiveIsOpen = isOpen || isCreatorOpen;

  return (
    <section className={`tasks-container dashboard-mini-card ${effectiveIsOpen ? 'expanded' : 'collapsed'}`}>
      {/* Task Details Card Header Bar (Always Clickable) */}
      <div
        className="mini-card-header"
        onClick={() => setIsOpen(prev => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={effectiveIsOpen}
        title={effectiveIsOpen ? 'Click to collapse task details' : 'Click to open task details'}
      >
        <div className="mini-card-lead">
          <div className="mini-card-icon-wrap task">
            <ClipboardIcon size={18} />
          </div>
          <div className="mini-card-info">
            <div className="mini-card-title-row">
              <h3 className="mini-card-title">Tasks</h3>
              <span className="mini-card-badge filter-badge">
                {filterNames[currentFilter] || 'All Tasks'} ({tasks.length})
              </span>
              {pendingCount > 0 && (
                <span className="mini-card-badge count-badge">
                  {pendingCount} Active
                </span>
              )}
            </div>
            <p className="mini-card-subtitle">
              {effectiveIsOpen
                ? 'Manage active tasks, deadlines, priorities & automated reminders'
                : `${tasks.length} task${tasks.length === 1 ? '' : 's'} in view • Click to expand and manage details`}
            </p>
          </div>
        </div>

        <div className="mini-card-actions" onClick={e => e.stopPropagation()}>
          {/* Timeline Sort Dropdown placed inside Task Details */}
          {onSortChange && (
            <div className="sort-wrapper task-details-sort" onClick={e => e.stopPropagation()}>
              <select
                className="sort-select"
                value={currentSort}
                onChange={e => onSortChange(e.target.value)}
                title="Sort task timeline"
              >
                <option value="deadline-asc">Timeline: Soonest first</option>
                <option value="deadline-desc">Timeline: Latest first</option>
                <option value="priority-desc">Priority: High to Low</option>
                <option value="created-desc">Recently Created</option>
                <option value="title-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNewTask();
            }}
            title="Create a new task"
          >
            <PlusIcon size={13} style={{ marginRight: '4px' }} />
            <span>Add Task</span>
          </button>
          <button
            type="button"
            className="mini-card-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
            aria-label={effectiveIsOpen ? 'Collapse' : 'Expand'}
          >
            <span>{effectiveIsOpen ? 'Collapse ▴' : 'Open ▾'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Content Area with Smooth Tab Transition */}
      {effectiveIsOpen && (
        <div className="mini-card-body tab-view-animated" key={currentFilter}>
          {/* In-Window Task Creator & Editor Panel (Zero Popups) */}
          {isCreatorOpen && (
            <TaskEditorPanel
              isOpen={isCreatorOpen}
              onClose={onCloseCreator}
              onSave={onSaveTask}
              taskToEdit={taskToEdit}
              defaultEmail={defaultEmail}
              soundEnabled={soundEnabled}
            />
          )}
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <TargetIcon size={32} style={{ color: 'var(--accent-light, #818cf8)' }} />
              </div>
              <h3 className="empty-title">
                {currentFilter === 'completed'
                  ? 'No completed tasks yet'
                  : currentFilter === 'overdue'
                  ? 'No overdue tasks! You are on top of everything.'
                  : 'Clear horizon: no tasks found'}
              </h3>
              <p className="empty-subtitle">
                {currentFilter === 'all'
                  ? 'All clear! Create a new task or check the Completed tab.'
                  : 'Try changing your filter or add a new task.'}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onOpenNewTask}
                style={{ marginTop: '14px' }}
              >
                <PlusIcon size={13} style={{ marginRight: '4px' }} />
                <span>Create New Task</span>
              </button>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSyncGoogleCalendar={onSyncGoogleCalendar}
                  onDownloadICS={onDownloadICS}
                  onSendEmail={onSendEmail}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
