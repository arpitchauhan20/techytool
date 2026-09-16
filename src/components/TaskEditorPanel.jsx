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

          {/* Mode Segmented Controls */}
          <div className="reminder-mode-segmented">
            <button
              type="button"
              className={`mode-segment-btn ${reminderMode === 'preset' ? 'active' : ''}`}
              onClick={() => setReminderMode('preset')}
            >
              <ClockIcon size={13} style={{ marginRight: '6px' }} />
              <span>Preset Timing</span>
            </button>
            <button
              type="button"
              className={`mode-segment-btn ${reminderMode === 'offset' ? 'active' : ''}`}
              onClick={() => setReminderMode('offset')}
            >
              <HourglassIcon size={13} style={{ marginRight: '6px' }} />
              <span>Custom Offset</span>
            </button>
            <button
              type="button"
              className={`mode-segment-btn ${reminderMode === 'exact' ? 'active' : ''}`}
              onClick={() => setReminderMode('exact')}
            >
              <CalendarIcon size={13} style={{ marginRight: '6px' }} />
              <span>Exact Time</span>
            </button>
            <button
              type="button"
              className={`mode-segment-btn ${reminderMode === 'none' ? 'active' : ''}`}
              onClick={() => setReminderMode('none')}
            >
              <XIcon size={13} style={{ marginRight: '6px' }} />
              <span>No Alert</span>
            </button>
          </div>

          {/* Preset Panel */}
          {reminderMode === 'preset' && (
            <div className="reminder-options-body animate-fade-in">
              <div className="options-section-header">
                <span className="options-label">CHOOSE ADVANCE NOTICE BEFORE DEADLINE:</span>
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
                    className={`preset-timer-btn ${reminderPresetMinutes === p.val ? 'selected' : ''}`}
                    onClick={() => setReminderPresetMinutes(p.val)}
                  >
                    <ClockIcon size={12} className="timer-icon" />
                    <span>{p.label}</span>
                    {reminderPresetMinutes === p.val && (
                      <CheckIcon size={12} className="timer-check-icon" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Offset Panel */}
          {reminderMode === 'offset' && (
            <div className="reminder-options-body animate-fade-in">
              <div className="options-section-header">
                <span className="options-label">CUSTOM ADVANCE NOTICE:</span>
              </div>
              <div className="custom-offset-inputs">
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="form-input offset-input-val"
                  value={reminderOffsetValue}
                  onChange={e => setReminderOffsetValue(parseInt(e.target.value) || 1)}
                  placeholder="2"
                />
                <select
                  className="form-select offset-select-unit"
                  value={reminderOffsetUnit}
                  onChange={e => setReminderOffsetUnit(e.target.value)}
                >
                  <option value="minutes">Minutes before deadline</option>
                  <option value="hours">Hours before deadline</option>
                  <option value="days">Days before deadline</option>
                </select>
              </div>
            </div>
          )}

          {/* Exact Time Panel */}
          {reminderMode === 'exact' && (
            <div className="reminder-options-body animate-fade-in">
              <div className="options-section-header">
                <span className="options-label">EXACT NOTIFICATION DATE &amp; TIME:</span>
              </div>
              <input
                type="datetime-local"
                className="form-input"
                value={reminderExact}
                onChange={e => setReminderExact(e.target.value)}
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
              <div className={`channel-toggle-card ${channels.push ? 'is-active' : ''}`}>
                <div className="channel-card-left">
                  <div className="channel-avatar push-bg">
                    <BellIcon size={16} />
                  </div>
                  <div className="channel-card-details">
                    <div className="channel-card-title">Browser Push</div>
                    <div className="channel-card-desc">Desktop &amp; mobile alerts</div>
                  </div>
                </div>
                <div className="toggle-switch-wrapper">
                  <button
                    type="button"
                    className={`cool-switch-btn ${channels.push ? 'is-on' : 'is-off'} chan-push`}
                    onClick={() => toggleChannel('push')}
                    role="switch"
                    aria-checked={channels.push}
                    aria-label="Toggle Browser Push notifications"
                    title={channels.push ? 'Disable Browser Push' : 'Enable Browser Push'}
                  >
                    <span className="cool-switch-track">
                      <span className="cool-switch-thumb">
                        <span className="cool-thumb-ring" />
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Channel 2: Audio Bell */}
              <div className={`channel-toggle-card ${channels.sound ? 'is-active' : ''}`}>
                <div className="channel-card-left">
                  <div className="channel-avatar sound-bg">
                    <VolumeIcon size={16} />
                  </div>
                  <div className="channel-card-details">
                    <div className="channel-card-title">Audio Bell</div>
                    <div className="channel-card-desc">Harmonic chime alert</div>
                  </div>
                </div>
                <div className="toggle-switch-wrapper">
                  <button
                    type="button"
                    className={`cool-switch-btn ${channels.sound ? 'is-on' : 'is-off'} chan-sound`}
                    onClick={() => toggleChannel('sound')}
                    role="switch"
                    aria-checked={channels.sound}
                    aria-label="Toggle Audio Bell notifications"
                    title={channels.sound ? 'Disable Audio Bell' : 'Enable Audio Bell'}
                  >
                    <span className="cool-switch-track">
                      <span className="cool-switch-thumb">
                        <span className="cool-thumb-ring" />
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Channel 3: Google Calendar */}
              <div className={`channel-toggle-card ${channels.calendar ? 'is-active' : ''}`}>
                <div className="channel-card-left">
                  <div className="channel-avatar gcal-bg">
                    <CalendarIcon size={16} />
                  </div>
                  <div className="channel-card-details">
                    <div className="channel-card-title">Google Calendar</div>
                    <div className="channel-card-desc">1-click sync &amp; alarms</div>
                  </div>
                </div>
                <div className="toggle-switch-wrapper">
                  <button
                    type="button"
                    className={`cool-switch-btn ${channels.calendar ? 'is-on' : 'is-off'} chan-gcal`}
                    onClick={() => toggleChannel('calendar')}
                    role="switch"
                    aria-checked={channels.calendar}
                    aria-label="Toggle Google Calendar Sync"
                    title={channels.calendar ? 'Disable Google Calendar' : 'Enable Google Calendar'}
                  >
                    <span className="cool-switch-track">
                      <span className="cool-switch-thumb">
                        <span className="cool-thumb-ring" />
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Channel 4: Email */}
              <div className={`channel-toggle-card ${channels.email ? 'is-active' : ''}`}>
                <div className="channel-card-left">
                  <div className="channel-avatar email-bg">
                    <MailIcon size={16} />
                  </div>
                  <div className="channel-card-details">
                    <div className="channel-card-title">Email Notice</div>
                    <div className="channel-card-desc">Direct inbox delivery</div>
                  </div>
                </div>
                <div className="toggle-switch-wrapper">
                  <button
                    type="button"
                    className={`cool-switch-btn ${channels.email ? 'is-on' : 'is-off'} chan-email`}
                    onClick={() => toggleChannel('email')}
                    role="switch"
                    aria-checked={channels.email}
                    aria-label="Toggle Email notifications"
                    title={channels.email ? 'Disable Email Notice' : 'Enable Email Notice'}
                  >
                    <span className="cool-switch-track">
                      <span className="cool-switch-thumb">
                        <span className="cool-thumb-ring" />
                      </span>
                    </span>
                  </button>
                </div>
              </div>
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
