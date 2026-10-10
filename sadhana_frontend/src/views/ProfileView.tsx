import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GameNavigationHeader } from '../components/GameNavigationHeader';
import { ClassCard3D } from '../components/ClassCard3D';
import { gameAudio } from '../utils/gameAudio';

export const ProfileView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'about' | 'settings'>('overview');

  useEffect(() => {
    if (location.hash === '#about') {
      setActiveTab('about');
    } else if (location.hash === '#settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [location.hash]);

  const userName = profile?.name || profile?.username || 'Warrior';
  const streak = profile?.current_streak ?? profile?.streak ?? 12;
  const aura = profile?.total_aura ?? profile?.aura_score ?? profile?.current_xp ?? 4320;
  const currentLevel = profile?.current_level ?? profile?.level ?? 4;
  const currentXp = profile?.current_xp ?? profile?.xp ?? 6240;
  const xpGoal = 10000;
  const xpPercent = Math.min(100, Math.round((currentXp / xpGoal) * 100));

  const classSlug = profile?.assigned_class?.slug || profile?.assigned_class_slug || 'dhruva';
  const className = profile?.assigned_class?.name || (classSlug.charAt(0).toUpperCase() + classSlug.slice(1));

  const classDetails: Record<
    string,
    { title: string; subtitle: string; desc: string }
  > = {
    sthira: {
      title: 'Sthira',
      subtitle: 'स्थिर · Steadfast Strength & Core',
      desc: 'Sthira develops solid structural power, core stability, and compound control. Your training still includes necessary mobility, endurance, and restorative balance.',
    },
    vistara: {
      title: 'Vistāra',
      subtitle: 'विस्तार · Free Range & Joint Mobility',
      desc: 'Vistāra develops expansive joint mobility, fascial elasticity, and pain-free movement. Your training still includes essential foundation strength and cardiovascular conditioning.',
    },
    yodha: {
      title: 'Yodha',
      subtitle: 'योद्धा · Functional Power & Combat Athletics',
      desc: 'Yodha develops athletic speed, explosive force, and warrior coordination. Your training still incorporates essential flexibility and stamina work.',
    },
    dhruva: {
      title: 'Dhruva',
      subtitle: 'ध्रुव · Steadfast Cardiovascular Endurance',
      desc: 'Dhruva develops cardiovascular capacity, aerobic pacing, and sustained stamina. Your training still includes essential strength, mobility, and balance work.',
    },
    samanvaya: {
      title: 'Samanvaya',
      subtitle: 'समन्वय · Mind-Body Synthesis & Flow',
      desc: 'Samanvaya develops harmonious integration of balance, breathing, and calisthenic flow. Your training still includes strength and conditioning elements.',
    },
  };

  const currentClassInfo = classDetails[classSlug.toLowerCase()] || classDetails.dhruva;

  return (
    <div className="min-h-screen bg-[#24170f] text-[#352419]">
      <GameNavigationHeader />

      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Your account · Your discipline</div>
            <h1 className="page-title">Player Profile</h1>
            <p className="page-subtitle">
              Your assigned class is shown in About. It is determined by your initial fitness
              assessment and biomechanical requirements.
            </p>
          </div>
        </div>

        <div className="profile-layout">
          {/* Left Sidebar */}
          <aside className="wood-panel">
            <div className="panel-inner profile-avatar">
              <img src="/assets/player_avatar.png" alt="Player avatar" />
              <div>
                <h2 style={{ margin: '5px 0', fontSize: '24px' }}>{userName}</h2>
                <p className="small muted">
                  Level <b data-stat="level">{currentLevel}</b> · Adventurer
                </p>
                <span className="pill">
                  🔥 <span data-stat="streak">{streak}</span> day streak
                </span>
              </div>
            </div>

            <div className="panel-inner profile-menu-links" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => {
                  gameAudio.playClick();
                  setActiveTab('overview');
                  window.location.hash = 'overview';
                }}
              >
                Profile Overview
              </button>
              <button
                type="button"
                className={activeTab === 'about' ? 'active' : ''}
                onClick={() => {
                  gameAudio.playClick();
                  setActiveTab('about');
                  window.location.hash = 'about';
                }}
              >
                About · My Class
              </button>
              <button
                type="button"
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => {
                  gameAudio.playClick();
                  setActiveTab('settings');
                  window.location.hash = 'settings';
                }}
              >
                Settings
              </button>
            </div>
          </aside>

          {/* Right Content Panels */}
          <div style={{ display: 'grid', gap: '13px' }}>
            {/* Overview Panel */}
            {activeTab === 'overview' && (
              <section id="overview" className="wood-panel">
                <div className="panel-inner">
                  <div className="panel-head">
                    <h2>Player Overview</h2>
                    <small>Authenticated Profile</small>
                  </div>
                  <div className="stat-grid">
                    <div className="stat-card">
                      <small>Total Aura</small>
                      <strong data-stat="aura">
                        {typeof aura === 'number' ? aura.toLocaleString() : aura}
                      </strong>
                    </div>
                    <div className="stat-card">
                      <small>Sessions Completed</small>
                      <strong data-stat="completed">
                        {profile?.workouts_completed_count ?? 3}
                      </strong>
                    </div>
                    <div className="stat-card">
                      <small>Equipment</small>
                      <strong>
                        {profile?.equipment_access?.length
                          ? profile.equipment_access.join(', ')
                          : 'Bodyweight'}
                      </strong>
                    </div>
                    <div className="stat-card">
                      <small>Primary Target</small>
                      <strong>{currentClassInfo.title}</strong>
                    </div>
                  </div>
                  <p className="muted" style={{ marginTop: '16px', lineHeight: 1.6 }}>
                    Your biomechanical preferences, active workout logs, and adaptive trajectory
                    are connected directly to the Sādhanā intelligence engine. Each completed
                    session records your real fatigue context and dynamically calibrates future
                    exercises.
                  </p>
                </div>
              </section>
            )}

            {/* About Class Panel with 3D Flip Card */}
            {activeTab === 'about' && (
              <section id="about" className="wood-panel">
                <div className="panel-inner">
                  <div className="panel-head">
                    <h2>About My Class</h2>
                    <small>System-assigned specialization</small>
                  </div>
                  <div className="about-class-card">
                    <ClassCard3D
                      classSlug={classSlug}
                      classNameTitle={className}
                      compact={false}
                      showHint={true}
                    />
                    <div id="classExplanation" tabIndex={-1}>
                      <span className="pill green">Current class</span>
                      <h2 style={{ fontSize: '30px', margin: '8px 0 2px' }}>
                        {currentClassInfo.title}
                      </h2>
                      <h3 style={{ margin: '0 0 10px', color: '#7b451b', fontSize: '16px' }}>
                        {currentClassInfo.subtitle}
                      </h3>
                      <p style={{ lineHeight: 1.5, margin: '8px 0 12px' }}>
                        {currentClassInfo.desc}
                      </p>
                      <p className="small muted">
                        Class assignment is determined by your onboarding assessment and Django rules.
                        This profile specializes along the {className} discipline while maintaining
                        balanced physical development across all 5 health metrics.
                      </p>
                      <div className="meter" style={{ marginTop: '12px' }}>
                        <span style={{ width: `${xpPercent}%` }}></span>
                      </div>
                      <p className="small" style={{ margin: '6px 0 14px' }}>
                        <b data-stat="progress">{currentXp.toLocaleString()}</b> /{' '}
                        {xpGoal.toLocaleString()} XP · Level <b data-stat="level">{currentLevel}</b>
                      </p>
                      <button
                        className="rpg-btn"
                        onClick={() => navigate('/progress')}
                      >
                        View progression →
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Settings Panel */}
            {activeTab === 'settings' && (
              <section id="settings" className="wood-panel">
                <div className="panel-inner">
                  <div className="panel-head">
                    <h2>Settings & Account</h2>
                    <small>Preferences</small>
                  </div>
                  <div style={{ display: 'grid', gap: '14px', maxWidth: '480px' }}>
                    <div className="field">
                      <label>Adventurer Name</label>
                      <input
                        type="text"
                        value={userName}
                        readOnly
                        style={{ background: '#f5e9d2', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="field">
                      <label>Account Email</label>
                      <input
                        type="text"
                        value={profile?.email || `${profile?.username || 'warrior'}@sadhana.fit`}
                        readOnly
                        style={{ background: '#f5e9d2', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="button"
                        className="rpg-btn dark"
                        onClick={() => navigate('/home')}
                      >
                        ← Return home
                      </button>
                      <button
                        type="button"
                        className="rpg-btn red"
                        onClick={async () => {
                          await logout();
                          navigate('/login');
                        }}
                      >
                        Sign Out ⎋
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        SĀDHANĀ · Adapt to the person. Challenge the person. Develop the person.
      </footer>
    </div>
  );
};

export default ProfileView;
