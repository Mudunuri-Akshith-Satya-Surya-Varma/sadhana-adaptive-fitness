import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const GameNavigationHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const streak = profile?.current_streak ?? 12;
  const aura = profile?.total_aura ?? profile?.current_xp ?? 4320;
  const formattedAura = typeof aura === 'number' ? aura.toLocaleString() : aura;

  const pathname = location.pathname;

  return (
    <header className="site-header game-header">
      <nav className="nav" aria-label="Main navigation">
        {/* Brand */}
        <Link className="brand" to="/home" onClick={() => setMobileMenuOpen(false)}>
          <img
            src="/assets/sai_logo.png"
            alt="Sādhanā mascot"
          />
          <span>
            <span className="brand-name">SĀDHANĀ</span>
            <span className="brand-sub">FITNESS, YOUR WAY</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="navLinks">
          <Link
            to="/home"
            className={pathname === '/home' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            ⌂ Home
          </Link>
          <Link
            to="/today"
            className={pathname === '/today' || pathname === '/quest' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            ⚔ Quests
          </Link>
          <Link
            to="/player"
            className={pathname === '/player' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            🏋 Training
          </Link>
          <Link
            to="/progress"
            className={pathname === '/progress' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            ▥ Progress
          </Link>
          <Link
            to="/community"
            className={pathname === '/community' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            ♟ Community
          </Link>
        </div>

        {/* Right Stats & Profile Dropdown */}
        <div className="nav-right">
          <span className="stat-chip" title="Active Day Streak">
            🔥 <b data-stat="streak">{streak}</b> <small>Day Streak</small>
          </span>
          <span className="stat-chip" title="Total Aura Points">
            🪙 <b data-stat="aura">{formattedAura}</b>
          </span>

          <div className="profile-menu" ref={dropdownRef}>
            <button
              className="profile-trigger"
              type="button"
              aria-label="Open profile menu"
              aria-expanded={profileDropdownOpen}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <img src="/assets/player_avatar.png" alt="Adventurer Avatar" />
              <span>{profile?.name ? profile.name.split(' ')[0] : 'Profile'} ▾</span>
            </button>
            <div className={`profile-dropdown ${profileDropdownOpen ? 'open' : ''}`}>
              <Link to="/profile" onClick={() => setProfileDropdownOpen(false)}>
                Profile Overview
              </Link>
              <Link to="/profile#about" onClick={() => setProfileDropdownOpen(false)}>
                About · My Class
              </Link>
              <Link to="/profile#settings" onClick={() => setProfileDropdownOpen(false)}>
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  color: '#8b2e1e',
                  borderTop: '1px solid #d4b77f',
                  borderRadius: 0,
                  marginTop: '4px',
                  paddingTop: '8px',
                }}
              >
                Sign Out ⎋
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="navLinks"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </nav>
    </header>
  );
};

export default GameNavigationHeader;
