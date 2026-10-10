import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { registerUser, loginDemoUser, googleLoginUser } from '../services/api';

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatusMsg({ text: 'Please enter your name.', isError: true });
      return;
    }
    if (!email.trim()) {
      setStatusMsg({ text: 'Please enter your email address.', isError: true });
      return;
    }
    if (password.length < 6) {
      setStatusMsg({ text: 'Use a password with at least 6 characters.', isError: true });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const username = email.trim().toLowerCase().split('@')[0] + Math.floor(100 + Math.random() * 900);
      const resp = await registerUser({
        username,
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      });

      login(resp.token, resp.user);
      setStatusMsg({ text: 'Account created successfully! Beginning your fitness assessment...', isError: false });

      setTimeout(() => {
        navigate('/onboarding');
      }, 450);
    } catch (err: any) {
      console.error('Registration error:', err);
      setStatusMsg({
        text: err.response?.data?.detail || err.response?.data?.error || err.response?.data?.email?.[0] || 'Unable to create account with this email. It may already be registered.',
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
        setStatusMsg({ text: 'Google authentication successful! Beginning fitness assessment...', isError: false });
        setTimeout(() => {
          if (res.user.assigned_class_slug || res.user.assigned_class) {
            navigate('/today');
          } else {
            navigate('/onboarding');
          }
        }, 400);
      } catch (err: any) {
        setStatusMsg({
          text: err.response?.data?.detail || 'Google signup token verification failed on server.',
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

          const btnEl = document.getElementById('register-google-btn-container');
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
              Your routines, your pace, your next level. Sign up to begin your personalized Sādhanā journey with SAI.
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
                aria-selected="false"
                className="auth-tab"
                role="tab"
                type="button"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
              <button
                aria-selected="true"
                className="auth-tab active"
                role="tab"
                type="button"
              >
                Create account
              </button>
            </div>

            {/* Heading */}
            <div className="auth-heading">
              <span className="auth-mini-kicker">WELCOME TO SĀDHANĀ</span>
              <h1>Create your account.</h1>
              <p>Your fitness journey starts with one step.</p>
            </div>

            {/* Official Google Sign-In Button */}
            <div id="register-google-btn-container" className="w-full flex justify-center min-h-[44px]" />

            {/* Divider */}
            <div className="auth-divider">
              <span></span>
              <small>OR CONTINUE WITH EMAIL</small>
              <span></span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="authName">Your name</label>
                <input
                  id="authName"
                  type="text"
                  autoComplete="name"
                  placeholder="Arjun Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="authEmail">Email address</label>
                <input
                  id="authEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="arjun@sadhana.fit"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="authPassword">Password</label>
                  <span className="text-[11px] font-bold text-[#76675A]">Min. 6 chars</span>
                </div>
                <div className="relative">
                  <input
                    id="authPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
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

              <button
                className="btn auth-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'} <span className="arrow">→</span>
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
                ⚡ Try Instantly: One-Click Demo Account
              </button>
            </div>

            {/* Switch to Login */}
            <p className="auth-switch-copy">
              Already have an account?{' '}
              <button
                className="text-button font-bold"
                type="button"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
            </p>

            <p className="auth-legal">
              By continuing, you agree to Sādhanā terms of practice. After registration, you will be guided through your initial fitness assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
