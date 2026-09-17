import React, { useState, useEffect, useRef } from 'react';
import { SoundFX } from '../services/soundEngine';
import {
  XIcon,
  ClockIcon,
  HourglassIcon,
  AlertTriangleIcon,
  BellIcon,
  VolumeIcon,
  CalendarIcon,
  MailIcon,
  PlayIcon,
  CheckIcon,
  PlusIcon,
  ZapIcon
} from './Icons';

export default function TaskEditorPanel({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultEmail,
  soundEnabled
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  // Reminder State
  const [reminderMode, setReminderMode] = useState('preset'); // 'none' | 'preset' | 'offset' | 'exact'
  const [reminderPresetMinutes, setReminderPresetMinutes] = useState(15);
  const [reminderOffsetValue, setReminderOffsetValue] = useState(2);
  const [reminderOffsetUnit, setReminderOffsetUnit] = useState('hours');
  const [reminderExact, setReminderExact] = useState('');

  // Channels State
  const [channels, setChannels] = useState({
    push: true,
    sound: true,
    calendar: true,
    email: false
  });

  const [reminderEmail, setReminderEmail] = useState('');
  const titleInputRef = useRef(null);

  // Populate form on open or taskToEdit change
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDeadline(taskToEdit.deadline || '');
      setPriority(taskToEdit.priority || 'medium');
      setReminderMode(taskToEdit.reminderMode || 'preset');
      setReminderPresetMinutes(taskToEdit.reminderPresetMinutes || 15);
      setReminderOffsetValue(taskToEdit.reminderOffsetValue || 2);
      setReminderOffsetUnit(taskToEdit.reminderOffsetUnit || 'hours');
      setReminderExact(taskToEdit.reminderExact || '');
      setChannels(taskToEdit.channels || { push: true, sound: true, calendar: true, email: false });
      setReminderEmail(taskToEdit.reminderEmail || defaultEmail || '');
    } else {
      // Default new task (Tomorrow 5:00 PM)
      const def = new Date();
      def.setDate(def.getDate() + 1);
      def.setHours(17, 0, 0, 0);
      const defLocal = new Date(def.getTime() - def.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setTitle('');
      setDescription('');
      setDeadline(defLocal);
      setPriority('medium');
      setReminderMode('preset');
      setReminderPresetMinutes(15);
      setReminderOffsetValue(2);
      setReminderOffsetUnit('hours');
      setReminderExact('');
      setChannels({ push: true, sound: true, calendar: true, email: false });
      setReminderEmail(defaultEmail || '');
    }

    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [taskToEdit, isOpen, defaultEmail]);

  if (!isOpen) return null;

  const toggleChannel = (key) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCalculatedReminderTime = () => {
    if (reminderMode === 'none') return null;
    if (reminderMode === 'exact') return reminderExact ? new Date(reminderExact).getTime() : null;
    if (!deadline) return null;

    const deadTime = new Date(deadline).getTime();
    if (isNaN(deadTime)) return null;

    if (reminderMode === 'preset') {
      return deadTime - reminderPresetMinutes * 60000;
    }
    if (reminderMode === 'offset') {
      const multipliers = { minutes: 60000, hours: 3600000, days: 86400000 };
      const ms = (reminderOffsetValue || 1) * (multipliers[reminderOffsetUnit] || 3600000);
      return deadTime - ms;
    }
    return null;
  };

  const calculatedTimeMs = getCalculatedReminderTime();
  const calculatedTimeStr = calculatedTimeMs
    ? new Date(calculatedTimeMs).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      deadline,
      priority,
      reminderMode,
      reminderPresetMinutes,
      reminderOffsetValue,
      reminderOffsetUnit,
      reminderExact,
      channels,
      reminderEmail: channels.email ? reminderEmail.trim() : ''
    });
  };

  return (
    <div className="task-inline-creator-card animate-fade-in" id="task-creator-panel">
      {/* Panel Header */}
      <div className="task-creator-header">
        <div className="task-creator-lead">
          <div className="task-creator-icon-wrap">
            {taskToEdit ? <ZapIcon size={18} /> : <PlusIcon size={18} />}
          </div>
          <div className="task-creator-header-text">
            <h3 className="task-creator-title">
              {taskToEdit ? 'Edit Task Details' : 'Create New Task'}
            </h3>
            <p className="task-creator-subtitle">
              Define deadline, priority, delivery channels &amp; automated reminders
            </p>
          </div>
        </div>

        <button
          type="button"
          className="task-creator-close-btn"
          onClick={onClose}
          title="Close Editor"
          aria-label="Close Editor"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Panel Form */}
      <form onSubmit={handleSubmit} className="task-creator-form">
        {/* Title Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="inline-task-title">
            TASK TITLE <span className="required-star">*</span>
          </label>
          <input
            ref={titleInputRef}
            id="inline-task-title"
            className="form-input"
            type="text"
            placeholder="e.g. Quarterly Board Presentation, Code Review..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={120}
          />
        </div>

        {/* Deadline & Priority Row */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="inline-task-deadline">
              DEADLINE &amp; TIME <span className="required-star">*</span>
            </label>
            <input
              id="inline-task-deadline"
              className="form-input"
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inline-task-priority">
              PRIORITY LEVEL
            </label>
            <select
              id="inline-task-priority"
              className="form-select"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <div className="form-group">
          <label className="form-label" htmlFor="inline-task-desc">
            DESCRIPTION / NOTES <span className="optional-badge">Optional</span>
          </label>
          <textarea
            id="inline-task-desc"
            className="form-textarea"
            rows={2}
            placeholder="Add key deliverables, agenda, notes, or reference links..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Reminder & Smart Alerts Suite */}
        <div className="reminder-suite-card">
          <div className="reminder-suite-header">
            <div className="reminder-suite-left">
              <div className="reminder-suite-icon">
                <ClockIcon size={18} />
              </div>
              <div className="reminder-suite-text">
                <h4 className="reminder-suite-title">Reminder &amp; Alerts</h4>
                <p className="reminder-suite-desc">Customize trigger timing and delivery channels</p>
              </div>
            </div>
            <div className="reminder-suite-right">
              <span className={`reminder-status-pill ${reminderMode !== 'none' ? 'active' : 'inactive'}`}>
                <span className="status-dot"></span>
                {reminderMode !== 'none' ? 'Alerts Active' : 'No Alert'}
              </span>
            </div>
          </div>

          {/* Timing Pills Grid (Presets + Custom Date/Time + No Alert) */}
          <div className="reminder-options-body" style={{ marginTop: '12px' }}>
            <div className="options-section-header">
              <span className="options-label">CHOOSE ADVANCE NOTICE OR EXACT ALERT TIME:</span>
            </div>
            <div className="preset-timer-grid">
              {[
                { label: '5m before', val: 5 },
                { label: '15m before', val: 15 },
                { label: '30m before', val: 30 },
                { label: '1h before', val: 60 },
                { label: '2h before', val: 120 },
                { label: '1 day before', val: 1440 }
              ].map(p => (
                <button
                  key={p.val}
                  type="button"
                  className={`preset-timer-btn ${reminderMode === 'preset' && reminderPresetMinutes === p.val ? 'selected' : ''}`}
                  onClick={() => {
                    setReminderMode('preset');
                    setReminderPresetMinutes(p.val);
                  }}
                >
                  <ClockIcon size={12} className="timer-icon" />
                  <span>{p.label}</span>
                  {reminderMode === 'preset' && reminderPresetMinutes === p.val && (
                    <CheckIcon size={12} className="timer-check-icon" />
                  )}
                </button>
              ))}

              {/* Custom Date & Time Button */}
              <button
                type="button"
                className={`preset-timer-btn ${reminderMode === 'exact' ? 'selected' : ''}`}
                onClick={() => {
                  setReminderMode('exact');
                  if (!reminderExact) {
                    if (deadline) {
                      setReminderExact(deadline);
                    } else {
                      const now = new Date();
                      now.setHours(now.getHours() + 1);
                      setReminderExact(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                    }
                  }
                }}
              >
                <CalendarIcon size={12} className="timer-icon" />
                <span>Custom Date &amp; Time</span>
                {reminderMode === 'exact' && (
                  <CheckIcon size={12} className="timer-check-icon" />
                )}
              </button>

              {/* No Alert Button */}
              <button
                type="button"
                className={`preset-timer-btn ${reminderMode === 'none' ? 'selected' : ''}`}
                onClick={() => setReminderMode('none')}
              >
                <XIcon size={12} className="timer-icon" />
                <span>No Alert</span>
                {reminderMode === 'none' && (
                  <CheckIcon size={12} className="timer-check-icon" />
                )}
              </button>
            </div>
          </div>

          {/* Exact Date & Time Picker */}
          {reminderMode === 'exact' && (
            <div className="custom-exact-picker-box animate-fade-in" style={{ marginTop: '14px' }}>
              <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarIcon size={13} style={{ color: 'var(--accent)' }} />
                <span>SPECIFY EXACT ALERT DATE &amp; TIME:</span>
              </label>
              <input
                type="datetime-local"
                className="form-input custom-exact-input"
                value={reminderExact}
                onChange={e => setReminderExact(e.target.value)}
                required
              />
            </div>
          )}

          {/* Calculated Time Trigger Banner */}
          {calculatedTimeStr && (
            <div className="reminder-schedule-banner">
              <div className="schedule-banner-content">
                <span className="schedule-badge">
                  <BellIcon size={12} style={{ marginRight: '4px' }} />
                  TRIGGER SCHEDULE
                </span>
                <span className="schedule-time">{calculatedTimeStr}</span>
              </div>
            </div>
          )}

          {/* Delivery Channels Section with Modern Toggle Switches */}
          <div className="channels-section-block">
            <div className="channels-section-header">
              <span className="channels-title-tag">DELIVERY CHANNELS</span>
              <span className="channels-subtitle-tag">Select one or more notification channels</span>
            </div>

            <div className="channel-toggle-grid">
              {/* Channel 1: Browser Push */}
              <button
                type="button"
                className={`channel-icon-btn ${channels.push ? 'is-active' : ''} chan-push`}
                onClick={() => toggleChannel('push')}
                title={channels.push ? 'Browser Push (Active - click to disable)' : 'Browser Push (Inactive - click to enable)'}
                aria-label="Browser Push notifications"
                aria-pressed={channels.push}
              >
                <div className="channel-icon-avatar push-bg">
                  <BellIcon size={18} />
                </div>
                <span className={`channel-icon-badge ${channels.push ? 'active' : ''}`}>
                  {channels.push ? <CheckIcon size={10} /> : <span className="channel-badge-dot" />}
                </span>
              </button>

              {/* Channel 2: Audio Bell */}
              <button
                type="button"
                className={`channel-icon-btn ${channels.sound ? 'is-active' : ''} chan-sound`}
                onClick={() => toggleChannel('sound')}
                title={channels.sound ? 'Audio Bell (Active - click to disable)' : 'Audio Bell (Inactive - click to enable)'}
                aria-label="Audio Bell chime alerts"
                aria-pressed={channels.sound}
              >
                <div className="channel-icon-avatar sound-bg">
                  <VolumeIcon size={18} />
                </div>
                <span className={`channel-icon-badge ${channels.sound ? 'active' : ''}`}>
                  {channels.sound ? <CheckIcon size={10} /> : <span className="channel-badge-dot" />}
                </span>
              </button>

              {/* Channel 3: Google Calendar */}
              <button
                type="button"
                className={`channel-icon-btn ${channels.calendar ? 'is-active' : ''} chan-gcal`}
                onClick={() => toggleChannel('calendar')}
                title={channels.calendar ? 'Google Calendar (Active - click to disable)' : 'Google Calendar (Inactive - click to enable)'}
                aria-label="Google Calendar Sync"
                aria-pressed={channels.calendar}
              >
                <div className="channel-icon-avatar gcal-bg">
                  <CalendarIcon size={18} />
                </div>
                <span className={`channel-icon-badge ${channels.calendar ? 'active' : ''}`}>
                  {channels.calendar ? <CheckIcon size={10} /> : <span className="channel-badge-dot" />}
                </span>
              </button>

              {/* Channel 4: Email */}
              <button
                type="button"
                className={`channel-icon-btn ${channels.email ? 'is-active' : ''} chan-email`}
                onClick={() => toggleChannel('email')}
                title={channels.email ? 'Email Notice (Active - click to disable)' : 'Email Notice (Inactive - click to enable)'}
                aria-label="Email notifications"
                aria-pressed={channels.email}
              >
                <div className="channel-icon-avatar email-bg">
                  <MailIcon size={18} />
                </div>
                <span className={`channel-icon-badge ${channels.email ? 'active' : ''}`}>
                  {channels.email ? <CheckIcon size={10} /> : <span className="channel-badge-dot" />}
                </span>
              </button>
            </div>

            {/* Email Input Drawer if Email Channel is active */}
            {channels.email && (
              <div className="channel-email-drawer animate-fade-in">
                <div className="email-drawer-header">
                  <MailIcon size={14} className="email-drawer-icon" />
                  <span className="email-drawer-label">Recipient Email Address:</span>
                </div>
                <input
                  type="email"
                  className="form-input email-drawer-input"
                  placeholder="recipient@example.com"
                  value={reminderEmail}
                  onChange={e => setReminderEmail(e.target.value)}
                  required={channels.email}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="task-creator-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!title.trim() || !deadline}
          >
            <CheckIcon size={14} style={{ marginRight: '6px' }} />
            <span>{taskToEdit ? 'Save Changes' : 'Save Task'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
