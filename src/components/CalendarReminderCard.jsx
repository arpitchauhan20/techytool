import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { triggerDualCornerCelebration } from '../services/celebrationService';
import { SoundFX } from '../services/soundEngine';
import { createCalendarReminder, deleteCalendarReminder } from '../services/calendarService';
import {
  CalendarIcon,
  GlobeIcon,
  CheckCircleIcon,
  PlusIcon,
  CheckIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  LinkIcon,
  ZapIcon,
  TrashIcon,
  XIcon,
  AlertTriangleIcon
} from './Icons';

export default function CalendarReminderCard({
  isCalendarConnected,
  isCalendarLoading,
  currentUser,
  onConnectCalendar,
  onDisconnectCalendar,
  onOpenAuthModal,
  onShowToast,
  onBack,
  tasks = [],
  isCreatorOpen = false,
  onCloseCreator,
  onOpenCreator
}) {
  // Calendar View State (Month/Year)
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Filter mode for reminder list below calendar: 'all' | 'selected' | 'upcoming'
  const [reminderFilter, setReminderFilter] = useState('all');

  // Internal modal state (can be triggered by local button or parent via isCreatorOpen)
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const isModalOpen = isCreatorOpen || localModalOpen;

  const handleOpenModal = (presetDate = null) => {
    if (presetDate) {
      setDate(presetDate);
      setSelectedDate(presetDate);
    }
    setLocalModalOpen(true);
    if (onOpenCreator) onOpenCreator();
  };

  const handleCloseModal = () => {
    setLocalModalOpen(false);
    if (onCloseCreator) onCloseCreator();
  };

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [recentEvents, setRecentEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_calendar_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastAddedDate, setLastAddedDate] = useState(null);

  // Sync recent events to storage
  useEffect(() => {
    try {
      localStorage.setItem('taskflow_calendar_events', JSON.stringify(recentEvents));
    } catch {}
  }, [recentEvents]);

  // Detect local IANA timezone
  const localTimeZone = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

  // Handle Month Navigation
  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToday = () => {
    const today = new Date();
    setViewDate(today);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    setSelectedDate(todayStr);
    setDate(todayStr);
  };

  const handleSelectDay = (dayStr) => {
    setSelectedDate(dayStr);
    setDate(dayStr);
    setReminderFilter('selected');
  };

  // Build Calendar Matrix for viewDate
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const pDay = daysInPrevMonth - i;
      const pMonth = month === 0 ? 12 : month;
      const pYear = month === 0 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      days.push({ dayNumber: pDay, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill grid
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let n = 1; n <= remaining; n++) {
      const nMonth = month + 2 > 12 ? 1 : month + 2;
      const nYear = month + 2 > 12 ? year + 1 : year;
      const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      days.push({ dayNumber: n, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [viewDate]);

  // Map dates to events count
  const taskDatesMap = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (t.deadline) {
        const dStr = t.deadline.slice(0, 10);
        map[dStr] = (map[dStr] || 0) + 1;
      }
    });
    recentEvents.forEach(e => {
      if (e.startTime) {
        const dStr = e.startTime.slice(0, 10);
        map[dStr] = (map[dStr] || 0) + 1;
      }
    });
    return map;
  }, [tasks, recentEvents]);

  // Unified list of all reminders/events
  const allScheduledEvents = useMemo(() => {
    const list = recentEvents.map(e => ({
      ...e,
      isRemovable: true
    }));

    tasks.forEach(t => {
      if (t.deadline) {
        list.push({
          id: t.id,
          title: t.title,
          description: t.description,
          startTime: t.deadline,
          source: 'task',
          priority: t.priority,
          completed: t.completed,
          isRemovable: false // Tasks are deleted from Tasks workspace
        });
      }
    });

    return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [recentEvents, tasks]);

  // Filtered Reminders List based on active tab
  const displayedReminders = useMemo(() => {
    const now = new Date();
    if (reminderFilter === 'selected') {
      return allScheduledEvents.filter(e => e.startTime && e.startTime.startsWith(selectedDate));
    }
    if (reminderFilter === 'upcoming') {
      return allScheduledEvents.filter(e => {
        if (!e.startTime) return false;
        return new Date(e.startTime).getTime() >= now.getTime() - 60000;
      });
    }
    return allScheduledEvents;
  }, [allScheduledEvents, reminderFilter, selectedDate]);

  const selectedDateEventsCount = useMemo(() => {
    return allScheduledEvents.filter(e => e.startTime && e.startTime.startsWith(selectedDate)).length;
  }, [allScheduledEvents, selectedDate]);

  const handleConnectClick = (e) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal('login');
      if (onShowToast) onShowToast('info', 'lock', 'Please sign in first to connect Google Calendar.');
      return;
    }
    if (onConnectCalendar) {
      onConnectCalendar();
    }
  };

  // Submit new reminder
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      if (onShowToast) onShowToast('error', '⚠️', 'Please enter a reminder title.');
      return;
    }

    if (!date || !time) {
      if (onShowToast) onShowToast('error', '⚠️', 'Please select both date and time.');
      return;
    }

    const startDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(startDateTime.getTime())) {
      if (onShowToast) onShowToast('error', '⚠️', 'Invalid date or time specified.');
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);
    setIsSubmitting(true);

    try {
      let gcalEvent = null;
      if (isCalendarConnected) {
        try {
          const res = await createCalendarReminder({
            title: title.trim(),
            description: description.trim(),
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            reminderMinutes: parseInt(reminderMinutes, 10),
            timeZone: localTimeZone
          });
          if (res && res.event) {
            gcalEvent = res.event;
          }
        } catch (err) {
          console.warn('Google Calendar sync warning:', err);
        }
      }

      const newEv = {
        id: gcalEvent?.id || 'rem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        gcalId: gcalEvent?.id || null,
        title: title.trim(),
        description: description.trim(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reminderMinutes: parseInt(reminderMinutes, 10),
        htmlLink: gcalEvent?.htmlLink || null,
        source: 'reminder',
        createdAt: new Date().toISOString()
      };

      setRecentEvents(prev => [newEv, ...prev]);
      setSelectedDate(date);
      setLastAddedDate(date);
      setTitle('');
      setDescription('');
      handleCloseModal();

      try {
        SoundFX.playSuccessChord(true);
        triggerDualCornerCelebration({ duration: 2500 });
      } catch {}

      if (onShowToast) {
        const dateFormatted = new Date(`${date}T12:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' });
        onShowToast('success', '📅', `Reminder "${newEv.title}" scheduled for ${dateFormatted}!`);
      }

      setTimeout(() => setLastAddedDate(null), 3500);
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', '❌', err.message || 'Failed to schedule reminder.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete reminder function
  const handleDeleteReminder = async (reminder, e) => {
    if (e) e.stopPropagation();
    const eventId = reminder.id || reminder.gcalId;
    setDeletingId(eventId);

    try {
      // 1. Remove from local storage / state
      setRecentEvents(prev => prev.filter(item => item.id !== reminder.id && item.gcalId !== reminder.id));

      // 2. If it has a Google Calendar event ID and user is connected, delete from Google Calendar
      if (reminder.gcalId || reminder.source === 'gcal_reminder' || reminder.htmlLink) {
        const idToDelete = reminder.gcalId || reminder.id;
        try {
          await deleteCalendarReminder(idToDelete);
        } catch (err) {
          console.warn('Remote calendar delete note:', err);
        }
      }

      try {
        SoundFX.playClick();
      } catch {}

      if (onShowToast) {
        onShowToast('info', '🗑️', `Reminder "${reminder.title}" deleted.`);
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', '❌', 'Could not delete reminder.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-board-wrapper tab-view-animated">
      {/* Main Calendar View Section */}
      <div className="calendar-card-clean">
        {/* Calendar Nav & Controls */}
        <div className="calendar-clean-header">
          <div className="calendar-month-display">
            <CalendarIcon size={18} style={{ color: 'var(--accent, #6366f1)', marginRight: '8px' }} />
            <span className="calendar-month-title">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
          </div>

          <div className="calendar-nav-controls">
            <button
              type="button"
              className="cal-nav-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              <ChevronLeftIcon size={15} />
            </button>
            <button
              type="button"
              className="cal-today-btn"
              onClick={handleJumpToday}
              title="Jump to Today"
            >
              Today
            </button>
            <button
              type="button"
              className="cal-nav-btn"
              onClick={handleNextMonth}
              title="Next Month"
            >
              <ChevronRightIcon size={15} />
            </button>
          </div>
        </div>

        {/* Weekday Row */}
        <div className="calendar-weekdays-row">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <span key={day} className="weekday-label">{day}</span>
          ))}
        </div>

        {/* Day Grid Matrix */}
        <div className="calendar-matrix-grid">
          {calendarDays.map((item, idx) => {
            const isToday = item.dateStr === todayStr;
            const isSelected = item.dateStr === selectedDate;
            const eventCount = taskDatesMap[item.dateStr] || 0;
            const hasEvents = eventCount > 0;
            const isJustAdded = lastAddedDate === item.dateStr;

            return (
              <button
                key={idx}
                type="button"
                className={`cal-day-cell ${!item.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''} ${isJustAdded ? 'just-added-pulse' : ''}`}
                onClick={() => handleSelectDay(item.dateStr)}
                title={`${item.dateStr}${hasEvents ? ` • ${eventCount} scheduled reminder${eventCount > 1 ? 's' : ''}` : ''}`}
              >
                <span className="day-number">{item.dayNumber}</span>
                {hasEvents && (
                  <span className="day-reminder-pill animate-pop-in">
                    <span className="day-bell-icon">🔔</span>
                    {eventCount > 1 && <span className="day-event-num">{eventCount}</span>}
                  </span>
                )}
                {isJustAdded && (
                  <span className="day-sparkle-burst animate-pop-in">✨</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Summary & Quick Action Bar */}
        <div className="calendar-selected-summary-strip">
          <div className="selected-summary-left">
            <span className="selected-date-badge-pill">Selected Date</span>
            <strong className="selected-date-text">
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </strong>
            <span className="selected-date-count-tag">
              {selectedDateEventsCount} reminder{selectedDateEventsCount === 1 ? '' : 's'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm btn-quick-add-day"
            onClick={() => handleOpenModal(selectedDate)}
            title={`Schedule reminder for ${selectedDate}`}
          >
            <PlusIcon size={12} style={{ marginRight: '4px' }} />
            <span>Add for this Day</span>
          </button>
        </div>
      </div>

      {/* Reminders List Section Directly After Calendar */}
      <div className="reminders-list-container">
        <div className="reminders-list-header">
          <div className="reminders-list-title-wrap">
            <ClockIcon size={17} style={{ color: 'var(--accent, #6366f1)' }} />
            <h3 className="reminders-list-heading">Scheduled Reminders</h3>
            <span className="badge-count-pill">{displayedReminders.length}</span>
          </div>

          {/* Filter Pills */}
          <div className="reminders-filter-tabs">
            <button
              type="button"
              className={`filter-tab-pill ${reminderFilter === 'all' ? 'active' : ''}`}
              onClick={() => setReminderFilter('all')}
            >
              All ({allScheduledEvents.length})
            </button>
            <button
              type="button"
              className={`filter-tab-pill ${reminderFilter === 'selected' ? 'active' : ''}`}
              onClick={() => setReminderFilter('selected')}
            >
              Selected Day ({selectedDateEventsCount})
            </button>
            <button
              type="button"
              className={`filter-tab-pill ${reminderFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setReminderFilter('upcoming')}
            >
              Upcoming
            </button>
          </div>
        </div>

        {/* Reminders Items List */}
        {displayedReminders.length === 0 ? (
          <div className="reminders-empty-card">
            <div className="empty-reminder-icon">🔔</div>
            <h4 className="empty-reminder-title">
              {reminderFilter === 'selected'
                ? `No reminders scheduled for ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'No scheduled reminders found'}
            </h4>
            <p className="empty-reminder-desc">
              Schedule alarms and deadlines that auto-sync with Google Calendar.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenModal(reminderFilter === 'selected' ? selectedDate : null)}
              style={{ marginTop: '12px' }}
            >
              <PlusIcon size={13} style={{ marginRight: '4px' }} />
              <span>Schedule a Reminder</span>
            </button>
          </div>
        ) : (
          <div className="reminders-cards-grid">
            {displayedReminders.map((rem, idx) => {
              const d = rem.startTime ? new Date(rem.startTime) : null;
              const dateStr = d && !isNaN(d.getTime())
                ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                : 'Flexible Date';
              const timeStr = d && !isNaN(d.getTime())
                ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : '';

              const isDeleting = deletingId === (rem.id || rem.gcalId);

              return (
                <div key={rem.id || idx} className="reminder-item-card">
                  <div className="reminder-item-main">
                    <div className="reminder-icon-badge">
                      <span>🔔</span>
                    </div>

                    <div className="reminder-item-details">
                      <div className="reminder-title-row">
                        <h4 className="reminder-item-title">{rem.title}</h4>
                        {rem.source === 'task' && (
                          <span className="badge-task-source">Task Workspace</span>
                        )}
                      </div>

                      {rem.description && (
                        <p className="reminder-item-desc">{rem.description}</p>
                      )}

                      <div className="reminder-meta-row">
                        <span className="reminder-timing-badge">
                          📅 {dateStr} {timeStr && `• ${timeStr}`}
                        </span>

                        {rem.reminderMinutes !== undefined && rem.reminderMinutes >= 0 && (
                          <span className="reminder-alert-badge">
                            ⏰ {rem.reminderMinutes === 0 ? 'At time' : `${rem.reminderMinutes}m before`}
                          </span>
                        )}

                        {rem.htmlLink && (
                          <a
                            href={rem.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="reminder-gcal-link"
                            title="View in Google Calendar"
                          >
                            <LinkIcon size={11} style={{ marginRight: '3px' }} />
                            <span>Google Cal ↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Delete Button */}
                  <div className="reminder-item-actions">
                    {rem.isRemovable ? (
                      <button
                        type="button"
                        className="btn-delete-reminder"
                        onClick={(e) => handleDeleteReminder(rem, e)}
                        disabled={isDeleting}
                        title="Delete this reminder"
                        aria-label="Delete reminder"
                      >
                        {isDeleting ? (
                          <span className="deleting-spinner">...</span>
                        ) : (
                          <TrashIcon size={14} />
                        )}
                      </button>
                    ) : (
                      <span className="task-linked-hint" title="Manage deadline in Tasks Workspace">
                        Task
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Reminder Modal Popup */}
      {isModalOpen && (
        <div className="reminder-modal-overlay animate-fade-in" onClick={handleCloseModal}>
          <div
            className="reminder-modal-box animate-pop-in"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-modal-title"
          >
            <div className="reminder-modal-header">
              <div className="reminder-modal-title-wrap">
                <div className="reminder-modal-icon">
                  <PlusIcon size={16} />
                </div>
                <h3 id="reminder-modal-title" className="reminder-modal-title">
                  Add New Reminder
                </h3>
              </div>
              <button
                type="button"
                className="reminder-modal-close"
                onClick={handleCloseModal}
                title="Close"
                aria-label="Close modal"
              >
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="reminder-modal-form">
              <div className="reminder-modal-body">
                {/* Title */}
                <div className="form-group">
                  <label htmlFor="modal-rem-title" className="form-label-styled">
                    Reminder Title <span className="req-star">*</span>
                  </label>
                  <input
                    id="modal-rem-title"
                    type="text"
                    className="form-input form-input-styled"
                    placeholder="e.g. Executive Sync, Team Standup, Client Review"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {/* Notes / Agenda */}
                <div className="form-group">
                  <label htmlFor="modal-rem-desc" className="form-label-styled">
                    Notes / Agenda (Optional)
                  </label>
                  <textarea
                    id="modal-rem-desc"
                    className="form-input form-input-styled form-textarea-styled"
                    placeholder="Meeting link, brief agenda, or notes..."
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Date & Time Grid */}
                <div className="reminder-modal-grid-2">
                  <div className="form-group">
                    <label htmlFor="modal-rem-date" className="form-label-styled">
                      Date <span className="req-star">*</span>
                    </label>
                    <input
                      id="modal-rem-date"
                      type="date"
                      className="form-input form-input-styled"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSelectedDate(e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-rem-time" className="form-label-styled">
                      Time <span className="req-star">*</span>
                    </label>
                    <input
                      id="modal-rem-time"
                      type="time"
                      className="form-input form-input-styled"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Alarm Notice */}
                <div className="form-group">
                  <label htmlFor="modal-rem-alert" className="form-label-styled">
                    Alert Notice Timing
                  </label>
                  <select
                    id="modal-rem-alert"
                    className="form-input form-select form-input-styled"
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  >
                    <option value={0}>At time of event</option>
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>

                {/* Google Calendar Connection Status Notice */}
                {isCalendarConnected ? (
                  <div className="modal-sync-notice synced">
                    <CheckCircleIcon size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span>Auto-sync enabled: This reminder will be saved to your Google Calendar.</span>
                  </div>
                ) : (
                  <div className="modal-sync-notice offline">
                    <AlertTriangleIcon size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <span>Google Calendar offline. Reminder will be saved locally.</span>
                  </div>
                )}
              </div>

              <div className="reminder-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-submit-reminder-modal"
                  disabled={isSubmitting}
                >
                  <ZapIcon size={15} />
                  <span>{isSubmitting ? 'Scheduling...' : 'Save & Schedule Reminder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
