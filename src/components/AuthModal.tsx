import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, authMode, closeAuthModal, switchAuthMode, login, signup, sendOtp, verifyOtp } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  if (!isAuthOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setConfirmPassword('');
    setErrorMessage('');
    setOtpSent(false);
    setOtpCode('');
    setCountdown(0);
    setDevOtpHint(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast(res.message, 'success');
        resetForm();
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup(name, email, password, phone);
      if (res.success) {
        showToast(res.message, 'success');
        resetForm();
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive OTP.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await sendOtp(email);
      if (res.success) {
        setOtpSent(true);
        setCountdown(res.expiresInSeconds || 300);
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        showToast(res.message, 'success');
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await verifyOtp(email, otpCode, name || undefined);
      if (res.success) {
        showToast(res.message, 'success');
        resetForm();
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="modal-overlay open" id="auth-overlay" onClick={closeAuthModal}>
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="close-modal-btn"
          aria-label="Close authentication window"
          onClick={closeAuthModal}
        >
          ✕
        </button>

        <div className="auth-header">
          <div className="auth-brand">
            <span className="brand-mark">shop</span>
            <span className="brand-dot">.</span>
          </div>
          <h2>
            {authMode === 'login' && 'Welcome Back!'}
            {authMode === 'otp' && 'Fast OTP Sign-In'}
            {authMode === 'signup' && 'Create Your Account'}
          </h2>
          <p>
            {authMode === 'login' && 'Sign in with your email and password to access your orders and account.'}
            {authMode === 'otp' && 'Passwordless, time-limited verification code sent directly to your email.'}
            {authMode === 'signup' && 'Join ShopCart for faster checkout, personalized deals, and order tracking.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              switchAuthMode('login');
              setErrorMessage('');
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${authMode === 'otp' ? 'active' : ''}`}
            onClick={() => {
              switchAuthMode('otp');
              setErrorMessage('');
            }}
          >
            OTP Login 🔑
          </button>
          <button
            className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              switchAuthMode('signup');
              setErrorMessage('');
            }}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="auth-alert error">
            <span>⚠️</span> {errorMessage}
          </div>
        )}

        {/* ----------------- TAB 1: PASSWORD LOGIN ----------------- */}
        {authMode === 'login' && (
          <form className="auth-form" id="login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                name="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password">Password</label>
                <a
                  href="javascript:void(0)"
                  className="forgot-pass"
                  onClick={() => {
                    switchAuthMode('otp');
                    showToast('Switching to OTP Login for instant access without password.', 'info');
                  }}
                >
                  Forgot? Use OTP Login →
                </a>
              </div>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-pass-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="custom-checkbox">
                <input type="checkbox" id="remember-me" defaultChecked />
                <span>Keep me signed in with secure session</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Sign In with Password →'}
            </button>
          </form>
        )}

        {/* ----------------- TAB 2: REDIS OTP LOGIN ----------------- */}
        {authMode === 'otp' && (
          <div className="auth-form" id="otp-form">
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label htmlFor="otp-email">Enter Registered Email</label>
                  <input
                    type="email"
                    id="otp-email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <small style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>
                    We'll generate a time-limited 6-digit verification code stored securely on Redis.
                  </small>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  style={{ marginTop: '16px' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating OTP...' : 'Send 6-Digit OTP Code 🚀'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy)' }}>OTP sent to:</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Change Email
                    </button>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{email}</strong>
                </div>

                {devOtpHint && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                    ⚡ <strong>Development OTP:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px' }}>{devOtpHint}</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="otp-code">Enter 6-Digit Code</label>
                  <input
                    type="text"
                    id="otp-code"
                    name="otp"
                    required
                    maxLength={6}
                    placeholder="••••••"
                    style={{ letterSpacing: '6px', textAlign: 'center', fontSize: '20px', fontWeight: 700 }}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0 16px' }}>
                  <span style={{ fontSize: '12px', color: countdown > 0 ? '#0284c7' : '#dc2626', fontWeight: 600 }}>
                    {countdown > 0 ? `Expires in ${formatCountdown(countdown)}` : 'Code expired'}
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 240 || isLoading}
                    onClick={() => handleSendOtp()}
                    style={{ background: 'none', border: 'none', color: countdown > 240 ? '#94a3b8' : 'var(--orange)', fontSize: '12px', fontWeight: 700, cursor: countdown > 240 ? 'not-allowed' : 'pointer' }}
                  >
                    Resend OTP
                  </button>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading || otpCode.length !== 6}>
                  {isLoading ? 'Verifying...' : 'Verify OTP & Sign In ✨'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ----------------- TAB 3: CREATE ACCOUNT ----------------- */}
        {authMode === 'signup' && (
          <form className="auth-form" id="signup-form" onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                name="name"
                required
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="signup-phone"
                name="phone"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Create Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-pass-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-confirm-password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-pass-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="custom-checkbox">
                <input type="checkbox" required defaultChecked />
                <span>I agree to ShopCart's Terms of Use and Privacy Notice.</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create My Account ✨'}
            </button>
          </form>
        )}

        <div className="auth-footer-help">
          {authMode === 'login' ? (
            <span>
              New to ShopCart?{' '}
              <a
                href="javascript:void(0)"
                onClick={() => {
                  switchAuthMode('signup');
                  setErrorMessage('');
                }}
              >
                <strong>Create your account</strong>
              </a>
            </span>
          ) : authMode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <a
                href="javascript:void(0)"
                onClick={() => {
                  switchAuthMode('login');
                  setErrorMessage('');
                }}
              >
                <strong>Sign in instead</strong>
              </a>
            </span>
          ) : (
            <span>
              Prefer passwords?{' '}
              <a
                href="javascript:void(0)"
                onClick={() => {
                  switchAuthMode('login');
                  setErrorMessage('');
                }}
              >
                <strong>Sign in with password</strong>
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
