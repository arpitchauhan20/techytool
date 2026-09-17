import React, { useState, useEffect } from 'react';
import { sendTaskEmail, sendAddUserRequest } from '../services/emailService';
import { SoundFX } from '../services/soundEngine';
import {
  isGoogleCalendarConnected,
  getConnectedGoogleEmail,
  requestGoogleCalendarAccess,
  disconnectGoogleCalendar,
  saveEventToGoogleCalendar,
  fetchCalendarStatus
} from '../services/calendarService';
import {
  XIcon,
  CalendarIcon,
  MailIcon,
  LinkIcon,
  ZapIcon,
  KeyIcon,
  LogOutIcon,
  VolumeIcon,
  PlayIcon,
  CheckIcon,
  UserPlusIcon,
  SendIcon
} from './Icons';

export default function SettingsModal({
  isOpen,
  onClose,
  userName,
  reminderEmail,
  onSaveProfile,
  onShowToast,
  isCalendarConnected: externalConnected,
  isCalendarLoading = false,
  onConnectCalendar,
  onDisconnectCalendar,
  currentUser,
  onOpenAuthModal,
  onLogout,
  currentPalette = 'indigo',
  onChangePalette,
  soundEnabled = true,
  onToggleSound,
  onTriggerWelcomeAnimation,
}) {
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(reminderEmail || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Friend Invite / Google OAuth Request state
  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [isSendingFriendInvite, setIsSendingFriendInvite] = useState(false);

  // Google Calendar OAuth state
  const isInitialConnected = Boolean(externalConnected || currentUser?.google_calendar_connected);
  const [gcalConnected, setGcalConnected] = useState(isInitialConnected);
  const [gcalEmail, setGcalEmail] = useState(() => getConnectedGoogleEmail() || currentUser?.email || null);
  const [isConnectingGCal, setIsConnectingGCal] = useState(false);
  const [isTestingGCal, setIsTestingGCal] = useState(false);

  const initialName = (userName || '').trim();
  const initialEmail = (reminderEmail || (currentUser?.email || '')).trim();
  const hasChanges = name.trim() !== initialName || email.trim() !== initialEmail;

  const handleSendFriendInviteRequest = async () => {
    const fEmail = (friendEmail || '').trim();
    const fName = (friendName || '').trim();
    if (!fEmail || !fEmail.includes('@')) {
      if (onShowToast) onShowToast('error', '⚠️', 'Please enter a valid Gmail address for your friend.');
      return;
    }

    setIsSendingFriendInvite(true);
    if (onShowToast) onShowToast('info', '⏳', 'Sending formatted user addition request to admin...');

    const requesterName = name.trim() || userName || 'Executive User';
    const requesterEmail = email.trim() || currentUser?.email || 'Not provided';

    const res = await sendAddUserRequest({
      requesterName,
      requesterEmail,
      targetName: fName,
      targetEmail: fEmail
    });

    setIsSendingFriendInvite(false);
    if (res.success) {
      if (onShowToast) onShowToast('success', '✨', `Request sent for ${fEmail}! Admin will add them to Google OAuth.`);
      setFriendName('');
      setFriendEmail('');
    } else {
      if (onShowToast) onShowToast('error', '❌', res.error || 'Failed to dispatch invite request.');
    }
  };

  useEffect(() => {
    setName(userName || '');
    setEmail(reminderEmail || (currentUser?.email || ''));
    const isConn = Boolean(externalConnected || currentUser?.google_calendar_connected);
    setGcalConnected(isConn);
    if (isOpen) {
      fetchCalendarStatus().then(connected => {
        if (connected || currentUser?.google_calendar_connected) {
          setGcalConnected(true);
        }
      });
    }
    setGcalEmail(getConnectedGoogleEmail() || currentUser?.email || null);
    setIsEditingProfile(false);
  }, [userName, reminderEmail, isOpen, externalConnected, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim(),
      email: email.trim()
    });
    if (onShowToast) onShowToast('success', 'user', 'Profile and workspace settings saved');
    onClose();
  };

  const handleTestEmail = async () => {
    const target = email.trim() || currentUser?.email;
    if (!target) {
      if (onShowToast) onShowToast('error', 'alert', 'Please enter your email address before testing.');
      return;
    }

    setIsTesting(true);
    if (onShowToast) onShowToast('info', 'clock', `Sending live test email and calendar invite via Resend to ${target}...`);

    const res = await sendTaskEmail({
      recipient: target,
      title: 'TaskFlow Pro - Live Integration Test',
      description: 'This automated test confirms that TaskFlow Pro can deliver emails directly via Resend HTTPS (Port 443) and automatically add events to Google Calendar.',
      deadline: new Date(Date.now() + 2 * 3600000).toISOString(),
      priority: 'high',
      isTest: true
    });

    setIsTesting(false);
    if (res.success) {
      if (onShowToast) onShowToast('success', 'sparkles', `Test email sent to ${target}! Check your inbox.`);
    } else {
      if (onShowToast) onShowToast('error', 'alert', res.error || 'Failed to dispatch test email');
    }
  };

  const handleConnectGoogle = async () => {
    if (onConnectCalendar) {
      onConnectCalendar();
      return;
    }
    setIsConnectingGCal(true);
    try {
      await requestGoogleCalendarAccess({ promptConsent: true });
      setGcalConnected(true);
      setGcalEmail(getConnectedGoogleEmail());
      if (onShowToast) onShowToast('success', 'calendar', 'Google Calendar connected! Tasks will auto-sync directly in the background.');
    } catch (err) {
      if (onShowToast) onShowToast('error', 'alert', err.message || 'Failed to authorize Google Calendar');
    } finally {
      setIsConnectingGCal(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (onDisconnectCalendar) {
      await onDisconnectCalendar();
      setGcalConnected(false);
      setGcalEmail(null);
      return;
    }
    disconnectGoogleCalendar();
    setGcalConnected(false);
    setGcalEmail(null);
    if (onShowToast) onShowToast('info', 'info', 'Google Calendar disconnected.');
  };

  const handleTestGoogleCalendar = async () => {
    setIsTestingGCal(true);
    try {
      const res = await saveEventToGoogleCalendar({
        title: 'TaskFlow Pro Live Test Event',
        description: 'Auto-saved directly via Google Calendar REST API without opening new tabs!',
        deadline: new Date(Date.now() + 3600000).toISOString(),
        priority: 'high',
        reminderMode: 'preset',
        reminderPresetMinutes: 15
      });
      if (res.success) {
        if (onShowToast) onShowToast('success', 'sparkles', 'Event auto-saved directly to Google Calendar! Check calendar.google.com');
      } else {
        if (onShowToast) onShowToast('error', 'alert', res.error || 'Failed to auto-save test event');
      }
    } catch (err) {
      if (onShowToast) onShowToast('error', 'alert', err.message || 'Calendar auto-save failed');
    } finally {
      setIsTestingGCal(false);
    }
  };

  return (
    <div className="modal-overlay active" id="settings-modal" onClick={e => e.target.id === 'settings-modal' && onClose()}>
      {/* Outer Dialog Wrapper for Floating Outside Close Button */}
      <div className="modal-dialog-wrapper settings-dialog-wrapper">
        {/* Floating Outside Close Button */}
        <button
          type="button"
          className="modal-floating-close-btn"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>

        {/* Modal Box */}
        <div className="modal settings-modal-box">
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Account &amp; Workspace Profile</h2>
              <p className="modal-subtitle">Manage appearance, sound alarms, connected services &amp; preferences</p>
            </div>
          </div>

          {/* User Status Banner with Inline Edit */}
          {currentUser ? (
            <div className={`settings-user-banner ${isEditingProfile ? 'editing' : ''}`}>
              {!isEditingProfile ? (
                <>
                  <div className="settings-user-avatar">
                    {(name || currentUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="settings-user-meta">
                    <span className="settings-user-name">{name || currentUser.name}</span>
                    <span className="settings-user-email">{email || currentUser.email}</span>
                  </div>
                  <div className="settings-user-actions">
                    <span className="badge-status-pill active">
                      ✓ Signed In
                    </span>
                    <button
                      type="button"
                      className="btn-edit-profile-subtle"
                      onClick={() => setIsEditingProfile(true)}
                      title="Edit Display Name &amp; Email"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    {onTriggerWelcomeAnimation && (
                      <button
                        type="button"
                        className="btn-edit-profile-subtle"
                        onClick={() => {
                          onClose();
                          onTriggerWelcomeAnimation();
                        }}
                        title="Replay Welcome Center Transition"
                      >
                        <span>✨ Preview Welcome</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="settings-user-edit-form">
                  <div className="settings-edit-title-row">
                    <strong>Edit Profile Information</strong>
                  </div>
                  <div className="settings-edit-inputs-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="settings-edit-name">Display Name</label>
                      <input
                        id="settings-edit-name"
                        type="text"
                        className="form-input form-input-styled"
                        maxLength="30"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="settings-edit-email">Default Notification / Calendar Email</label>
                      <input
                        id="settings-edit-email"
                        type="email"
                        className="form-input form-input-styled"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                      />
                    </div>
                  </div>
                  <div className="settings-edit-actions-row">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setName(userName || '');
                        setEmail(reminderEmail || (currentUser?.email || ''));
                        setIsEditingProfile(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onSaveProfile({ name: name.trim(), email: email.trim() });
                        if (onShowToast) onShowToast('success', 'user', 'Profile updated successfully');
                        setIsEditingProfile(false);
                      }}
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`settings-user-banner guest ${isEditingProfile ? 'editing' : ''}`}>
              {!isEditingProfile ? (
                <>
                  <div className="settings-user-meta">
                    <span className="settings-user-name">{name || 'Local Guest Session'}</span>
                    <span className="settings-user-email">{email || 'Sign in to securely sync tasks across devices'}</span>
                  </div>
                  <div className="settings-user-actions">
                    <button
                      type="button"
                      className="btn-edit-profile-subtle"
                      onClick={() => setIsEditingProfile(true)}
                      title="Edit Local Display Name &amp; Email"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          onClose();
                          onOpenAuthModal('login');
                        }}
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="settings-user-edit-form">
                  <div className="settings-edit-title-row">
                    <strong>Edit Guest Profile</strong>
                  </div>
                  <div className="settings-edit-inputs-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="settings-edit-guest-name">Display Name</label>
                      <input
                        id="settings-edit-guest-name"
                        type="text"
                        className="form-input form-input-styled"
                        maxLength="30"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="settings-edit-guest-email">Notification Email</label>
                      <input
                        id="settings-edit-guest-email"
                        type="email"
                        className="form-input form-input-styled"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                      />
                    </div>
                  </div>
                  <div className="settings-edit-actions-row">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setName(userName || '');
                        setEmail(reminderEmail || '');
                        setIsEditingProfile(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onSaveProfile({ name: name.trim(), email: email.trim() });
                        if (onShowToast) onShowToast('success', 'user', 'Profile updated successfully');
                        setIsEditingProfile(false);
                      }}
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section: Appearance & Sound */}
            <div className="settings-section-divider">
              <span className="settings-section-heading">APPEARANCE &amp; SOUND</span>
            </div>

            {/* Unified Appearance & Sound Card */}
            <div className="settings-card-section">
              {/* 1. Theme Color Selector */}
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <strong className="settings-card-title">Color Themes &amp; Appearance</strong>
                  <div className="settings-card-desc">Choose from light aesthetic pastels or sleek dark obsidian palettes</div>
                </div>

                {/* Light Pastel Themes (Client Reference Palettes) */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary, #64748b)', marginBottom: '8px' }}>
                    ✨ Light Pastel Palettes
                  </div>
                  <div className="settings-theme-grid">
                    {[
                      { id: 'light-lavender', label: 'Irisé Lavande', color: '#7c66dc', bg: '#f4f1f8' },
                      { id: 'light-glacier', label: 'Bleu Glacier', color: '#1e80bf', bg: '#eef5f9' },
                      { id: 'light-rose-pale', label: 'Rose Pêche Pâle', color: '#c26750', bg: '#f6ede2' },
                      { id: 'light-rose', label: 'Rose Poudré', color: '#d64976', bg: '#faf1f3' },
                      { id: 'light-sage', label: 'Sauge Botanique', color: '#3b8658', bg: '#f1f6f2' },
                      { id: 'light-daydream', label: 'Aura Daydream', color: '#5b67e8', bg: '#f3f5fd' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        className={`settings-theme-option ${currentPalette === theme.id ? 'active' : ''}`}
                        onClick={() => onChangePalette && onChangePalette(theme.id)}
                      >
                        <div className="theme-option-preview" style={{ background: theme.bg, border: '1px solid rgba(0,0,0,0.1)' }}>
                          <div className="theme-option-accent" style={{ background: theme.color }} />
                        </div>
                        <span className="theme-option-name">{theme.label}</span>
                        {currentPalette === theme.id && (
                          <span className="theme-option-check">
                            <CheckIcon size={13} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Obsidian Themes */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary, #64748b)', marginBottom: '8px' }}>
                    🌙 Dark Obsidian Palettes
                  </div>
                  <div className="settings-theme-grid">
                    {[
                      { id: 'indigo', label: 'Obsidian Indigo', color: '#6366f1', bg: '#080b13' },
                      { id: 'emerald', label: 'Emerald Mint', color: '#10b981', bg: '#050d09' },
                      { id: 'cyan', label: 'Midnight Cyan', color: '#06b6d4', bg: '#060c16' },
                      { id: 'violet', label: 'Nebula Violet', color: '#a855f7', bg: '#090614' },
                      { id: 'amber', label: 'Sunset Amber', color: '#f59e0b', bg: '#0d0a06' },
                      { id: 'slate', label: 'Titanium Slate', color: '#38bdf8', bg: '#080a0f' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        className={`settings-theme-option ${currentPalette === theme.id ? 'active' : ''}`}
                        onClick={() => onChangePalette && onChangePalette(theme.id)}
                      >
                        <div className="theme-option-preview" style={{ background: theme.bg }}>
                          <div className="theme-option-accent" style={{ background: theme.color }} />
                        </div>
                        <span className="theme-option-name">{theme.label}</span>
                        {currentPalette === theme.id && (
                          <span className="theme-option-check">
                            <CheckIcon size={13} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inner Divider */}
              <div className="settings-card-inner-divider" />

              {/* 2. Sound & Alerts with Toggle Switch */}
              <div className="settings-sound-row">
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <VolumeIcon size={18} style={{ color: soundEnabled ? 'var(--accent-light, #818cf8)' : 'var(--text-tertiary, #64748b)' }} />
                    <strong className="settings-card-title">Audio Bell &amp; Alert Chimes</strong>
                  </div>
                  <div className="settings-card-desc">
                    Play harmonic audio chime on deadline alarms and task completion
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-sound-preview"
                    onClick={() => SoundFX.playReminderChime(true)}
                    title="Test sound chime"
                  >
                    <PlayIcon size={9} style={{ marginRight: '4px' }} />
                    Test
                  </button>

                  <label className="settings-switch" title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={onToggleSound}
                    />
                    <span className="settings-slider" />
                  </label>
                </div>
              </div>
            </div>

            {/* Section: Connect With */}
            <div className="settings-section-divider" style={{ marginTop: '20px' }}>
              <span className="settings-section-heading">CONNECT WITH</span>
            </div>

            {/* Unified Integrations Card */}
            <div className="settings-card-section">
              {/* 1. Google Calendar Integration */}
              <div className="settings-sub-section">
                <div className="settings-card-header" style={{ marginBottom: 0, alignItems: 'center' }}>
                  <div className="settings-card-icon-wrap cal">
                    <CalendarIcon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong className="settings-card-title">Google Calendar</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge-status-pill ${gcalConnected ? 'active' : ''}`}>
                      {gcalConnected ? '✓ Connected' : 'Disconnected'}
                    </span>
                    {!gcalConnected ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleConnectGoogle}
                        disabled={isConnectingGCal || isCalendarLoading}
                      >
                        <LinkIcon size={13} style={{ marginRight: '4px' }} />
                        <span>{isConnectingGCal || isCalendarLoading ? 'Connecting...' : 'Connect'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleDisconnectGoogle}
                        style={{ color: '#f43f5e' }}
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Password section for logged-in users */}
            {currentUser && (
              <>
                <div className="settings-section-divider" style={{ marginTop: '20px' }}>
                  <span className="settings-section-heading">SECURITY &amp; ACCESS</span>
                </div>

                <div className="settings-security-row">
                  <div className="security-info">
                    <span className="security-title">Password Management</span>
                    <span className="security-desc">Update your login password securely</span>
                  </div>
                  {onOpenAuthModal && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onClose();
                        onOpenAuthModal('change-password');
                      }}
                    >
                      <KeyIcon size={13} style={{ marginRight: '4px' }} />
                      Change Password
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Modal Actions */}
            <div className="modal-actions" style={{ marginTop: '22px' }}>
              {currentUser && onLogout && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginRight: 'auto', color: '#fb7185' }}
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                >
                  <LogOutIcon size={14} style={{ marginRight: '4px' }} />
                  Sign Out
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
