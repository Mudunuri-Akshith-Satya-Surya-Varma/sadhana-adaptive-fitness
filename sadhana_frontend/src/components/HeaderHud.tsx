import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, User, Flame, Activity } from 'lucide-react';

export const HeaderHud: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, isAuthenticated, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      navigate('/' + id);
      return;
    }
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="nav wrap">
        {/* Brand */}
        <Link aria-label="Sādhanā home" className="brand" to="/">
          <img alt="Sādhanā robot mascot holding a dumbbell" src="/assets/sai_logo.png" />
          <span>
            <span className="brand-name">SĀDHANĀ</span>
            <span className="brand-sub">FITNESS, YOUR WAY</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="navLinks">
          <button
            type="button"
            onClick={() => scrollToSection('#why')}
            className="text-left bg-transparent border-0 font-bold hover:text-[#A52A2A] transition-colors"
          >
            Why Sādhanā
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('#features')}
            className="text-left bg-transparent border-0 font-bold hover:text-[#A52A2A] transition-colors"
          >
            What you get
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('#classes')}
            className="text-left bg-transparent border-0 font-bold hover:text-[#A52A2A] transition-colors"
          >
            Classes
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('#how')}
            className="text-left bg-transparent border-0 font-bold hover:text-[#A52A2A] transition-colors"
          >
            How it works
          </button>

          {isAuthenticated && (
            <>
              <Link
                to="/today"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#A52A2A] transition-colors flex items-center gap-1.5 font-bold"
              >
                <Activity className="w-4 h-4 text-[#A52A2A]" />
                Today's Workout
              </Link>
              <Link
                to="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#A52A2A] transition-colors font-bold"
              >
                Fitness Assessment
              </Link>
            </>
          )}

          {/* Mobile Auth actions inside menu */}
          <div className="md:hidden pt-3 border-t border-[#F0E5D1] flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#76675A]">
                  Signed in as <strong>{profile?.name || profile?.username}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-quiet btn-sm"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-quiet btn-sm flex-1 text-center">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-sm flex-1 text-center">
                  Get started →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && profile ? (
            <div className="flex items-center gap-3">
              {profile.assigned_class && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1 border"
                  style={{
                    backgroundColor: `${profile.assigned_class.accent_color || '#A52A2A'}15`,
                    color: profile.assigned_class.accent_color || '#A52A2A',
                    borderColor: `${profile.assigned_class.accent_color || '#A52A2A'}40`,
                  }}
                >
                  <Flame className="w-3.5 h-3.5" />
                  {profile.assigned_class.name}
                </span>
              )}
              <Link
                to="/today"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5EBD8] hover:bg-[#EBDDC5] text-xs font-black text-[#6D291C] border border-[#E1D4BE] transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>{profile.name || profile.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl border border-[#E1D4BE] bg-white hover:bg-[#FBEFEA] text-[#76675A] hover:text-[#A52A2A] transition-colors"
                title="Sign out of Sādhanā"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-extrabold text-[#625145] hover:text-[#A52A2A] px-2 py-1 transition-colors"
              >
                Sign in
              </Link>
              <Link to="/register" className="btn nav-cta">
                Get started <span className="arrow">→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          aria-controls="navLinks"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="menu-toggle"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '×' : '☰'}
        </button>
      </nav>
    </header>
  );
};
