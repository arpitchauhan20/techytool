import React, { useState, useEffect, useRef } from 'react';
import { SoundFX } from '../services/soundEngine';
import {
  XIcon,
  ClockIcon,
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
          <div>
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
              PRIORITY
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
        <div className="reminder-card" style={{ marginTop: '6px' }}>
          <div className="reminder-card-header">
            <div className="reminder-header-icon">
              <ClockIcon size={16} />
            </div>
            <div className="reminder-header-title">
              <strong>Reminder &amp; Alerts</strong>
              <span className="reminder-subtitle">Customize trigger timing and delivery channels</span>
            </div>
            <span className={`reminder-status-badge ${reminderMode !== 'none' ? 'active' : ''}`}>
              {reminderMode !== 'none' ? 'ALERTS ACTIVE' : 'NO ALERT'}
            </span>
          </div>

          {/* Mode Tabs / Chips */}
          <div className="reminder-mode-tabs">
            <button
              type="button"
              className={`mode-tab-btn ${reminderMode === 'preset' ? 'active' : ''}`}
              onClick={() => setReminderMode('preset')}
            >
              Preset Timing
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${reminderMode === 'offset' ? 'active' : ''}`}
              onClick={() => setReminderMode('offset')}
            >
              Custom Offset
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${reminderMode === 'exact' ? 'active' : ''}`}
              onClick={() => setReminderMode('exact')}
            >
              Exact Time
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${reminderMode === 'none' ? 'active' : ''}`}
              onClick={() => setReminderMode('none')}
            >
              No Alert
            </button>
          </div>

          {/* Preset Panel */}
          {reminderMode === 'preset' && (
            <div className="reminder-panel visible">
              <span className="panel-label">Choose advance notice before deadline:</span>
              <div className="preset-chips">
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
                    className={`preset-chip ${reminderPresetMinutes === p.val ? 'selected' : ''}`}
                    onClick={() => setReminderPresetMinutes(p.val)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Offset Panel */}
          {reminderMode === 'offset' && (
            <div className="reminder-panel visible">
              <span className="panel-label">Remind me exactly:</span>
              <div className="custom-offset-row">
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="form-input offset-number-input"
                  value={reminderOffsetValue}
                  onChange={e => setReminderOffsetValue(parseInt(e.target.value) || 1)}
                />
                <select
                  className="form-select offset-unit-select"
                  value={reminderOffsetUnit}
                  onChange={e => setReminderOffsetUnit(e.target.value)}
                >
                  <option value="minutes">Minutes before</option>
                  <option value="hours">Hours before</option>
                  <option value="days">Days before</option>
                </select>
              </div>
            </div>
          )}

          {/* Exact Time Panel */}
          {reminderMode === 'exact' && (
            <div className="reminder-panel visible">
              <span className="panel-label">Select exact reminder date &amp; time:</span>
              <input
                type="datetime-local"
                className="form-input"
                value={reminderExact}
                onChange={e => setReminderExact(e.target.value)}
              />
            </div>
          )}

          {/* Calculated Time Preview */}
          {calculatedTimeStr && (
            <div className="reminder-preview-box">
              <div className="preview-indicator">
                <span className="preview-caption">🔔 Trigger Schedule:</span>
                <span className="preview-datetime">{calculatedTimeStr}</span>
              </div>
            </div>
          )}

          {/* Delivery Channels Grid */}
          <div className="channels-section">
            <span className="channels-label">DELIVERY CHANNELS</span>
            <div className="channels-grid">
              {/* Channel 1: Browser Push */}
              <div
                className={`channel-pill ${channels.push ? 'checked' : ''}`}
                onClick={() => toggleChannel('push')}
                role="checkbox"
                aria-checked={channels.push}
                tabIndex={0}
              >
                <div className="channel-pill-icon push">
                  <BellIcon size={14} />
                </div>
                <div className="channel-pill-info">
                  <strong>Browser Push</strong>
                  <span>Desktop &amp; mobile alerts</span>
                </div>
                <div className="channel-checkbox">
                  {channels.push && <CheckIcon size={11} />}
                </div>
              </div>

              {/* Channel 2: Audio Bell */}
              <div
                className={`channel-pill ${channels.sound ? 'checked' : ''}`}
                onClick={() => toggleChannel('sound')}
                role="checkbox"
                aria-checked={channels.sound}
                tabIndex={0}
              >
                <div className="channel-pill-icon sound">
                  <VolumeIcon size={14} />
                </div>
                <div className="channel-pill-info">
                  <strong>Audio Bell</strong>
                  <span>Harmonic chime alert</span>
                </div>
                <div className="channel-checkbox">
                  {channels.sound && <CheckIcon size={11} />}
                </div>
              </div>

              {/* Channel 3: Google Calendar */}
              <div
                className={`channel-pill ${channels.calendar ? 'checked' : ''}`}
                onClick={() => toggleChannel('calendar')}
                role="checkbox"
                aria-checked={channels.calendar}
                tabIndex={0}
              >
                <div className="channel-pill-icon gcal">
                  <CalendarIcon size={14} />
                </div>
                <div className="channel-pill-info">
                  <strong>Google Calendar</strong>
                  <span>1-click sync &amp; alarms</span>
                </div>
                <div className="channel-checkbox">
                  {channels.calendar && <CheckIcon size={11} />}
                </div>
              </div>

              {/* Channel 4: Email */}
              <div
                className={`channel-pill ${channels.email ? 'checked' : ''}`}
                onClick={() => toggleChannel('email')}
                role="checkbox"
                aria-checked={channels.email}
                tabIndex={0}
              >
                <div className="channel-pill-icon email">
                  <MailIcon size={14} />
                </div>
                <div className="channel-pill-info">
                  <strong>Email Notice</strong>
                  <span>Direct inbox delivery</span>
                </div>
                <div className="channel-checkbox">
                  {channels.email && <CheckIcon size={11} />}
                </div>
              </div>
            </div>

            {/* Email Input Field if checked */}
            {channels.email && (
              <div className="channel-input-card group-email" style={{ marginTop: '10px' }}>
                <div className="channel-input-header">
                  <MailIcon size={14} style={{ color: '#38bdf8' }} />
                  <span>Recipient Email Address</span>
                </div>
                <input
                  type="email"
                  className="form-input"
                  placeholder="recipient@gmail.com"
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
