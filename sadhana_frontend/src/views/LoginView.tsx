import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { loginUser, loginDemoUser, googleLoginUser } from '../services/api';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      setStatusMsg({ text: 'Please enter your email or username.', isError: true });
      return;
    }
    if (!password) {
      setStatusMsg({ text: 'Please enter your password.', isError: true });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const resp = await loginUser({
        username: emailOrUsername.trim(),
        password,
      });
      login(resp.token, resp.user);

      setStatusMsg({ text: 'Welcome back! Loading your journey...', isError: false });
      setTimeout(() => {
        if (resp.user.assigned_class_slug || resp.user.assigned_class) {
          navigate('/today');
        } else {
          navigate('/onboarding');
        }
      }, 400);
    } catch (err: any) {
      console.error('Login error:', err);
      setStatusMsg({
        text: err.response?.data?.detail || err.response?.data?.error || 'Invalid email/username or password. Please try again.',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const resp = await loginDemoUser();
      login(resp.token, resp.user);
      setStatusMsg({ text: 'Demo access granted! Redirecting...', isError: false });
      setTimeout(() => navigate('/today'), 350);
    } catch (err: any) {
      console.error('Demo login error:', err);
      setStatusMsg({
        text: 'Failed to connect to backend demo endpoint. Ensure backend server is running.',
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = async (response: any) => {
    if (response?.credential) {
      setIsLoading(true);
      try {
        const res = await googleLoginUser(response.credential);
        login(res.token, res.user);
        setStatusMsg({ text: 'Google Sign-In successful! Entering Sādhanā...', isError: false });
        setTimeout(() => {
          if (res.user.assigned_class_slug || res.user.assigned_class) {
            navigate('/today');
          } else {
            navigate('/onboarding');
          }
        }, 400);
      } catch (err: any) {
        setStatusMsg({
          text: err.response?.data?.detail || 'Google sign-in token verification failed on server.',
          isError: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const googleInitRef = useRef(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          if (!googleInitRef.current) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleCredential,
              auto_select: false,
            });
            googleInitRef.current = true;
          }

          const btnEl = document.getElementById('login-google-btn-container');
          if (btnEl && !btnEl.hasChildNodes()) {
            window.google.accounts.id.renderButton(btnEl, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'pill',
            });
          }
        } catch (e) {
          console.warn('Google GSI initialization error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setTimeout(initGoogle, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleForgotPassword = () => {
    if (emailOrUsername.trim()) {
      setStatusMsg({
        text: `Password reset request registered for ${emailOrUsername}. Contact support or check email once mail gateway is configured.`,
        isError: false,
      });
    } else {
      setStatusMsg({
        text: 'Enter your email address in the field above to receive a password reset link.',
        isError: true,
      });
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-layout">
        {/* Left Story Column */}
        <aside className="auth-story">
          <Link to="/" className="auth-back">
            ← <span>Back to Sādhanā</span>
          </Link>

          <Link to="/" className="auth-brand" aria-label="Sādhanā home">
            <img alt="Sādhanā mascot logo" src="/assets/sai_logo.png" />
            <span>
              SĀDHANĀ
              <small>FITNESS, YOUR WAY</small>
            </span>
          </Link>

          <div className="auth-story-copy">
            <span className="auth-eyebrow">YOUR JOURNEY, YOUR RULES</span>
            <h2>
              Small steps.<br />
              <em>Real evolution.</em>
            </h2>
            <p>
              Your routines, your pace, your next level. Sign in to continue your Sādhanā journey with SAI.
            </p>
            <div className="auth-story-points">
              <span>✦ Adaptive workouts</span>
              <span>✦ Your own fitness class</span>
              <span>✦ Real-life adjustments</span>
              <span>✦ RPG-style milestones</span>
            </div>
          </div>

          <div aria-hidden="true" className="auth-script-orbit">
            साधना · SĀDHANĀ · సాధన · சாதனா · സാധന ·
          </div>
        </aside>

        {/* Right Form Column */}
        <div className="auth-form-side">
          <div className="auth-form-wrap">
            <div className="auth-mobile-back">
              <Link to="/" className="auth-back">
                ← Back
              </Link>
            </div>

            {/* Auth Tabs */}
            <div aria-label="Account access" className="auth-tabs" role="tablist">
              <button
                aria-selected="true"
                className="auth-tab active"
                role="tab"
                type="button"
              >
                Sign in
              </button>
              <button
                aria-selected="false"
                className="auth-tab"
                role="tab"
                type="button"
                onClick={() => navigate('/register')}
              >
                Create account
              </button>
            </div>

            {/* Heading */}
            <div className="auth-heading">
              <span className="auth-mini-kicker">WELCOME TO SĀDHANĀ</span>
              <h1>Welcome back.</h1>
              <p>Your next level is waiting.</p>
            </div>

            {/* Official Google Sign-In Button */}
            <div id="login-google-btn-container" className="w-full flex justify-center min-h-[44px]" />

            {/* Divider */}
            <div className="auth-divider">
              <span></span>
              <small>OR CONTINUE WITH EMAIL</small>
              <span></span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="authEmail">Email address or Username</label>
                <input
                  id="authEmail"
                  type="text"
                  autoComplete="username"
                  placeholder="arjun@sadhana.fit"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="authPassword">Password</label>
                  <button
                    type="button"
                    className="text-button"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="authPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#76675A] hover:text-[#A52A2A] bg-transparent border-0"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>

              <button
                className="btn auth-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'} <span className="arrow">→</span>
              </button>

              {/* Status Message */}
              {statusMsg && (
                <p className={`auth-status ${statusMsg.isError ? 'error' : ''}`}>
                  {statusMsg.text}
                </p>
              )}
            </form>

            {/* Instant Demo Account */}
            <div className="mt-4 pt-3 border-t border-[#F0E5D1] text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="btn btn-quiet btn-sm w-full font-bold"
              >
                ⚡ Instant Access: One-Click Demo Account
              </button>
            </div>

            {/* Switch to Register */}
            <p className="auth-switch-copy">
              New to Sādhanā?{' '}
              <button
                className="text-button font-bold"
                type="button"
                onClick={() => navigate('/register')}
              >
                Create an account
              </button>
            </p>

            <p className="auth-legal">
              By continuing, you agree to Sādhanā terms of practice and community guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
