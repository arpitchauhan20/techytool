import React, { useState, useEffect } from 'react';
import { triggerDualCornerCelebration } from '../services/celebrationService';
import { AuthClient } from '../services/authClient';
import {
  ZapIcon,
  SparklesIcon,
  CalendarIcon,
  BellIcon,
  CheckIcon,
  LockIcon,
  UserIcon,
  MailIcon,
  ClockIcon,
  AlertTriangleIcon,
  InfoIcon,
  RefreshCwIcon,
  ArrowLeftIcon
} from './Icons';

// Eye icon SVGs for show/hide toggle
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function AuthGate({
  initialMode = 'login',
  initialResetToken = '',
  onAuthSuccess,
  onShowToast
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenInput, setTokenInput] = useState(initialResetToken || '');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (initialResetToken) {
      setTokenInput(initialResetToken);
      setMode('reset');
    }
  }, [initialResetToken]);

  const switchMode = (newMode) => {
    setErrorMessage('');
    setInfoMessage('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMode(newMode);
  };

  const triggerConfetti = () => {
    triggerDualCornerCelebration({ duration: 3200 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await AuthClient.login({ email, password });
        triggerConfetti();
        if (onShowToast) {
          onShowToast('success', '✨', `Welcome back, ${res.user.name || 'Executive'}!`);
        }
        onAuthSuccess(res.user);
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        const res = await AuthClient.register({ name, email, password });
        triggerConfetti();
        if (onShowToast) {
          onShowToast('success', '✨', `Welcome to Techy Tool, ${res.user.name}!`);
        }
        onAuthSuccess(res.user);
      } else if (mode === 'forgot') {
        const res = await AuthClient.forgotPassword(email);
        if (res.resetUrl) {
          setInfoMessage(`Reset link generated! In development mode, use:\n${res.resetUrl}`);
        } else {
          setInfoMessage(res.message || 'If an account exists with that email, a password reset link has been dispatched to your inbox.');
        }
        if (onShowToast) {
          onShowToast('info', '✉️', 'Password reset instructions dispatched.');
        }
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        const res = await AuthClient.resetPassword({
          token: tokenInput,
          newPassword: password
        });
        triggerConfetti();
        if (onShowToast) {
          onShowToast('success', '🔑', 'Password updated successfully! Welcome back.');
        }
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication request failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = () => {
    const guestUser = {
      id: 'guest_' + Date.now().toString(36),
      name: 'Executive Guest',
      email: 'guest@techytool.pro',
      isGuest: true
    };
    triggerConfetti();
    if (onShowToast) {
      onShowToast('success', '✨', 'Welcome to Techy Tool Demo Workspace!');
    }
    onAuthSuccess(guestUser);
  };

  // Password requirements calculation
  const passHasLength = password.length >= 8;
  const passHasNumber = /\d/.test(password);
  const passHasMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="authgate-root">
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="authgate-bg-glow orb-1" />
      <div className="authgate-bg-glow orb-2" />
      <div className="authgate-bg-glow orb-3" />
      <div className="authgate-bg-mesh" />

      {/* Main Container */}
      <div className="authgate-container">
        
        {/* Left Side: Brand Showcase & Interactive Highlights */}
        <div className="authgate-showcase">
          {/* Brand Badge */}
          <div className="authgate-brand-header">
            <div className="authgate-logo-badge">
              <div className="authgate-logo-icon">
                <ZapIcon size={20} />
              </div>
              <div className="authgate-logo-text">
                <span className="authgate-logo-title">Techy Tool</span>
                <span className="authgate-logo-tag">PRO</span>
              </div>
            </div>
            <span className="authgate-edition-pill">v2.0 Executive Automations</span>
          </div>

          {/* Hero Typography */}
          <div className="authgate-hero-text">
            <h1 className="authgate-headline">
              Intelligent Helpers <br />
              <span className="text-gradient-neon">&amp; Smart Automations.</span>
            </h1>
            <p className="authgate-subtext">
              Unified executive productivity suite featuring 2-way Google Calendar synchronization, zero-drift multi-channel reminders, and precision task telemetry.
            </p>
          </div>

          {/* Feature Showcase Cards */}
          <div className="authgate-feature-cards">
            <div className="authgate-feature-card">
              <div className="authgate-feature-icon cal">
                <CalendarIcon size={18} />
              </div>
              <div className="authgate-feature-info">
                <div className="authgate-feature-title-row">
                  <h4>Bi-Directional Calendar Sync</h4>
                  <span className="authgate-mini-badge highlight">Live Bridge</span>
                </div>
                <p>Instant Google Calendar event creation, 1-click schedule sync, and automatic .ics exports.</p>
              </div>
            </div>

            <div className="authgate-feature-card">
              <div className="authgate-feature-icon bell">
                <BellIcon size={18} />
              </div>
              <div className="authgate-feature-info">
                <div className="authgate-feature-title-row">
                  <h4>Multi-Channel Dispatcher</h4>
                  <span className="authgate-mini-badge highlight">Zero Drift</span>
                </div>
                <p>Harmonic audio deadline chimes, native push notifications, and automated Resend email delivery.</p>
              </div>
            </div>

            <div className="authgate-feature-card">
              <div className="authgate-feature-icon zap">
                <ZapIcon size={18} />
              </div>
              <div className="authgate-feature-info">
                <div className="authgate-feature-title-row">
                  <h4>Automated Priority Queue</h4>
                  <span className="authgate-mini-badge">Optimized</span>
                </div>
                <p>Instant deadline calculations, auto-sorted urgency ranks, and intelligent workflow execution.</p>
              </div>
            </div>
          </div>

          {/* Live Telemetry Status Widget */}
          <div className="authgate-telemetry-widget">
            <div className="authgate-telemetry-header">
              <div className="authgate-telemetry-status-pill">
                <span className="telemetry-live-dot" />
                <span>SYSTEM TELEMETRY</span>
              </div>
              <span className="authgate-telemetry-tag">All Systems Operational</span>
            </div>
            <div className="authgate-telemetry-grid">
              <div className="telemetry-cell">
                <span className="telemetry-label">Cloud Sync</span>
                <strong className="telemetry-val text-accent">Active (256-bit)</strong>
              </div>
              <div className="telemetry-cell">
                <span className="telemetry-label">On-Time Rate</span>
                <strong className="telemetry-val text-success">99.2%</strong>
              </div>
              <div className="telemetry-cell">
                <span className="telemetry-label">Auto-Dispatch</span>
                <strong className="telemetry-val text-cyan">Zero-Drift</strong>
              </div>
            </div>
          </div>

          {/* Social Proof & Trust Strip */}
          <div className="authgate-trust-footer">
            <div className="authgate-avatar-stack">
              <div className="avatar av-1">TT</div>
              <div className="avatar av-2">JD</div>
              <div className="avatar av-3">AC</div>
              <div className="avatar av-4">SR</div>
            </div>
            <div className="authgate-trust-text">
              <div className="authgate-stars">★★★★★</div>
              <span>Trusted by executive teams, engineering leads &amp; creators</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glass Auth Form Card */}
        <div className="authgate-card">
          {/* Form Mode Selector Tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="authgate-tab-pills">
              <button
                type="button"
                className={`authgate-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`authgate-tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => switchMode('register')}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Card Header */}
          <div className="authgate-card-header">
            {mode === 'login' && (
              <>
                <h2 className="authgate-card-title">Welcome Back</h2>
                <p className="authgate-card-desc">Sign in to access your intelligent workspace &amp; automations suite.</p>
              </>
            )}
            {mode === 'register' && (
              <>
                <h2 className="authgate-card-title">Create Workspace</h2>
                <p className="authgate-card-desc">Activate your executive account with calendar sync &amp; smart tools.</p>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <button type="button" className="authgate-back-link" onClick={() => switchMode('login')}>
                  <ArrowLeftIcon size={14} /> Back to Sign In
                </button>
                <h2 className="authgate-card-title" style={{ marginTop: '12px' }}>Reset Password</h2>
                <p className="authgate-card-desc">Enter your account email to receive instant recovery instructions.</p>
              </>
            )}
            {mode === 'reset' && (
              <>
                <button type="button" className="authgate-back-link" onClick={() => switchMode('login')}>
                  <ArrowLeftIcon size={14} /> Back to Sign In
                </button>
                <h2 className="authgate-card-title" style={{ marginTop: '12px' }}>Set New Password</h2>
                <p className="authgate-card-desc">Choose a strong, secure password for your Techy Tool account.</p>
              </>
            )}
          </div>

          {/* Alerts / Feedback */}
          {errorMessage && (
            <div className="authgate-alert error">
              <AlertTriangleIcon size={18} className="authgate-alert-icon" />
              <div className="authgate-alert-text">{errorMessage}</div>
            </div>
          )}

          {infoMessage && (
            <div className="authgate-alert info">
              <InfoIcon size={18} className="authgate-alert-icon" />
              <div className="authgate-alert-text" style={{ whiteSpace: 'pre-line' }}>{infoMessage}</div>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="authgate-form">
            {/* Full Name Field (Register Only) */}
            {mode === 'register' && (
              <div className="authgate-field">
                <label className="authgate-label" htmlFor="auth-name">Full Name</label>
                <div className="authgate-input-wrapper">
                  <span className="authgate-input-icon"><UserIcon size={17} /></span>
                  <input
                    id="auth-name"
                    type="text"
                    className="authgate-input"
                    placeholder="e.g. Alex Sterling"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Email Field (Sign In, Register, Forgot) */}
            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div className="authgate-field">
                <label className="authgate-label" htmlFor="auth-email">Email Address</label>
                <div className="authgate-input-wrapper">
                  <span className="authgate-input-icon"><MailIcon size={17} /></span>
                  <input
                    id="auth-email"
                    type="email"
                    className="authgate-input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus={mode !== 'register'}
                  />
                </div>
              </div>
            )}

            {/* Token Field (Reset Mode Only) */}
            {mode === 'reset' && (
              <div className="authgate-field">
                <label className="authgate-label" htmlFor="auth-token">Reset Token</label>
                <div className="authgate-input-wrapper">
                  <span className="authgate-input-icon"><LockIcon size={17} /></span>
                  <input
                    id="auth-token"
                    type="text"
                    className="authgate-input"
                    placeholder="Paste your reset token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field (Sign In, Register, Reset) */}
            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div className="authgate-field">
                <div className="authgate-label-row">
                  <label className="authgate-label" htmlFor="auth-pass">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="authgate-forgot-link"
                      onClick={() => switchMode('forgot')}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="authgate-input-wrapper">
                  <span className="authgate-input-icon"><LockIcon size={17} /></span>
                  <input
                    id="auth-pass"
                    type={showPassword ? 'text' : 'password'}
                    className="authgate-input has-toggle"
                    placeholder={mode === 'register' || mode === 'reset' ? 'At least 8 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === 'register' || mode === 'reset' ? 8 : undefined}
                  />
                  <button
                    type="button"
                    className="authgate-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field (Register, Reset) */}
            {(mode === 'register' || mode === 'reset') && (
              <div className="authgate-field">
                <label className="authgate-label" htmlFor="auth-confirm-pass">Confirm Password</label>
                <div className="authgate-input-wrapper">
                  <span className="authgate-input-icon"><LockIcon size={17} /></span>
                  <input
                    id="auth-confirm-pass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="authgate-input has-toggle"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="authgate-eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>
            )}

            {/* Real-Time Password Security Checklist */}
            {(mode === 'register' || mode === 'reset') && password.length > 0 && (
              <div className="authgate-pass-check">
                <div className={`authgate-check-item ${passHasLength ? 'valid' : ''}`}>
                  <CheckIcon size={13} /> Minimum 8 characters
                </div>
                <div className={`authgate-check-item ${passHasNumber ? 'valid' : ''}`}>
                  <CheckIcon size={13} /> Contains a number
                </div>
                {confirmPassword.length > 0 && (
                  <div className={`authgate-check-item ${passHasMatch ? 'valid' : ''}`}>
                    <CheckIcon size={13} /> Passwords match
                  </div>
                )}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              className="authgate-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="authgate-btn-loading">
                  <RefreshCwIcon size={16} className="spinning" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span>
                  {mode === 'login' && 'Sign In to Workspace →'}
                  {mode === 'register' && 'Create Executive Account ✨'}
                  {mode === 'forgot' && 'Send Recovery Instructions →'}
                  {mode === 'reset' && 'Update Password & Access →'}
                </span>
              )}
            </button>
          </form>

          {/* Quick Guest Demo Option (when on login/register) */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="authgate-divider">
                <span>OR EXPLORE INSTANTLY</span>
              </div>
              <button
                type="button"
                className="authgate-guest-btn"
                onClick={handleGuestDemo}
              >
                <SparklesIcon size={16} className="authgate-guest-sparkle" />
                <span>Try Instant Guest Demo Mode</span>
                <span className="authgate-guest-tag">1-Click</span>
              </button>
            </>
          )}

          {/* Card Footer Info */}
          <div className="authgate-card-footer">
            <div className="authgate-security-note">
              <LockIcon size={12} />
              <span>256-Bit SSL Encrypted &amp; Secure Session</span>
            </div>
            <div className="authgate-legal-links">
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              <span>•</span>
              <a href="/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
