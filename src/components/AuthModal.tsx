import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, authMode, closeAuthModal, switchAuthMode, login, signup } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('demo@shopcart.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const res = signup(name, email, password);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleDemoLogin = () => {
    const res = login('demo@shopcart.com', 'password123');
    if (res.success) {
      showToast(res.message, 'success');
    }
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
          <h2>{authMode === 'login' ? 'Welcome Back!' : 'Create Your Account'}</h2>
          <p>
            {authMode === 'login'
              ? 'Sign in to access your orders, saved wishlist, and exclusive discounts.'
              : 'Join ShopCart for faster checkout, personalized deals, and track shipments.'}
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

        {authMode === 'login' ? (
          <form className="auth-form" id="login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                name="email"
                required
                placeholder="e.g. alex@example.com"
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
                  onClick={() =>
                    showToast('Demo hint: Use password123 or 1-Click Demo Login below.', 'info')
                  }
                >
                  Forgot password?
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
                  👁️
                </button>
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="custom-checkbox">
                <input type="checkbox" id="remember-me" defaultChecked />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign In to ShopCart →
            </button>

            <div className="auth-divider">
              <span>OR QUICK ACCESS</span>
            </div>

            <button type="button" className="demo-login-btn" onClick={handleDemoLogin}>
              <span>⚡</span> 1-Click Demo Login (Alex Johnson)
            </button>
          </form>
        ) : (
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
                placeholder="e.g. alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  👁️
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
                  👁️
                </button>
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="custom-checkbox">
                <input type="checkbox" required defaultChecked />
                <span>I agree to ShopCart's Terms of Use and Privacy Notice.</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn">
              Create My Account ✨
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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};
