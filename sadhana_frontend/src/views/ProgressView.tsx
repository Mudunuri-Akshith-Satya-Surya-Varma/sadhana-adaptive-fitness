import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GameNavigationHeader } from '../components/GameNavigationHeader';
import { ClassCard3D } from '../components/ClassCard3D';

export const ProgressView: React.FC = () => {
  const { profile } = useApp();

  const userName = profile?.name ? profile.name.split(' ')[0] : (profile?.username || 'Warrior');
  const streak = profile?.current_streak ?? 12;
  const aura = profile?.total_aura ?? profile?.current_xp ?? 4320;
  const currentLevel = profile?.current_level ?? 4;
  const currentXp = profile?.current_xp ?? 6240;
  const xpGoal = 10000;
  const xpPercent = Math.min(100, Math.round((currentXp / xpGoal) * 100));

  const classSlug = profile?.assigned_class?.slug || profile?.assigned_class_slug || 'dhruva';
  const className = profile?.assigned_class?.name || (classSlug.charAt(0).toUpperCase() + classSlug.slice(1));

  const classTitles: Record<string, string> = {
    sthira: 'Strength & Core Stability',
    vistara: 'Mobility & Joint Freedom',
    yodha: 'Functional Power & Combat',
    dhruva: 'Cardio & Endurance',
    samanvaya: 'Holistic Mind-Body Balance',
  };
  const classFocus = classTitles[classSlug.toLowerCase()] || 'Cardio & Endurance';

  const completedSessions = profile?.workouts_completed_count ?? 3;

  return (
    <div className="min-h-screen bg-[#24170f] text-[#352419]">
      <GameNavigationHeader />

      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Real effort · Visible development</div>
            <h1 className="page-title">Your Progress</h1>
            <p className="page-subtitle">
              Levels describe your journey; actual training decisions still depend on performance
              and current context.
            </p>
          </div>
          <Link className="rpg-btn" to="/today">
            View quest journal →
          </Link>
        </div>

        {/* 4 Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <small>Aura</small>
            <strong>
              ✦ <span data-stat="aura">{typeof aura === 'number' ? aura.toLocaleString() : aura}</span>
            </strong>
            <span>Training reward points</span>
          </div>
          <div className="stat-card">
            <small>Class level</small>
            <strong data-stat="level">{currentLevel}</strong>
            <span>{className} · {classFocus}</span>
          </div>
          <div className="stat-card">
            <small>Workouts logged</small>
            <strong data-stat="completed">{completedSessions}</strong>
            <span>Consistency count</span>
          </div>
          <div className="stat-card">
            <small>Day streak</small>
            <strong>
              🔥 <span data-stat="streak">{streak}</span>
            </strong>
            <span>Active unbroken streak</span>
          </div>
        </div>

        {/* Two-Column: Weekly Momentum Bar Chart + Class Progression Card */}
        <div className="two-col" style={{ marginTop: '14px' }}>
          {/* Weekly Training Momentum */}
          <section className="wood-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <h2>Weekly Training Momentum</h2>
                <small>Session volume & consistency</small>
              </div>
              <div className="bar-chart">
                <div className="bar-col">
                  <div className="bar" style={{ ['--height' as any]: '50%' }}></div>
                  <span>Mon</span>
                </div>
                <div className="bar-col">
                  <div className="bar" style={{ ['--height' as any]: '75%' }}></div>
                  <span>Tue</span>
                </div>
                <div className="bar-col">
                  <div className="bar" style={{ ['--height' as any]: '60%' }}></div>
                  <span>Wed</span>
                </div>
                <div className="bar-col">
                  <div className="bar" style={{ ['--height' as any]: '85%' }}></div>
                  <span>Thu</span>
                </div>
                <div className="bar-col">
                  <div className="bar" style={{ ['--height' as any]: '40%' }}></div>
                  <span>Fri</span>
                </div>
                <div className="bar-col">
                  <div className="bar" style={{ ['--height' as any]: '20%' }}></div>
                  <span>Sat</span>
                </div>
                <div className="bar-col">
                  <div className="bar" style={{ ['--height' as any]: '10%' }}></div>
                  <span>Sun</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <span className="small muted">Weekly target</span>
                <b data-stat="weekcount">{completedSessions} / 5 sessions</b>
              </div>
              <div className="meter" style={{ marginTop: '7px' }}>
                <span style={{ width: `${Math.min(100, (completedSessions / 5) * 100)}%` }}></span>
              </div>
            </div>
          </section>

          {/* Class Progression with 3D Flip Card */}
          <section className="wood-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <h2>Class Progression</h2>
                <small>Assigned specialization</small>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <ClassCard3D
                  classSlug={classSlug}
                  classNameTitle={className}
                  compact={true}
                  showHint={true}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '22px' }}>{className} · {classFocus}</h3>
                  <p className="small muted" style={{ margin: '6px 0 10px' }}>
                    Current class assigned by the system. All five fitness components remain part of
                    balanced training.
                  </p>
                  <div className="meter">
                    <span style={{ width: `${xpPercent}%` }}></span>
                  </div>
                  <p className="small" style={{ margin: '8px 0 12px' }}>
                    <b data-stat="progress">{currentXp.toLocaleString()}</b> / {xpGoal.toLocaleString()}{' '}
                    XP to next level
                  </p>
                  <Link to="/profile#about" className="rpg-btn dark">
                    About my class →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Sessions History */}
        <section className="wood-panel" style={{ marginTop: '14px' }}>
          <div className="panel-inner">
            <div className="panel-head">
              <h2>Recent Sessions</h2>
              <small>Activity journal</small>
            </div>
            <div className="history-list" id="historyList">
              <div className="history-row">
                <span className="session-icon">⚡</span>
                <div>
                  <strong>Cardio Foundations · Completed</strong>
                  <small>15 min · 3 exercises recorded · +200 Aura</small>
                </div>
                <span className="pill green">Recorded</span>
              </div>
              <div className="history-row">
                <span className="session-icon">🛡</span>
                <div>
                  <strong>Endurance Pace Routine · Completed</strong>
                  <small>20 min · 4 exercises recorded · +250 Aura</small>
                </div>
                <span className="pill green">Recorded</span>
              </div>
              <div className="history-row">
                <span className="session-icon">🌿</span>
                <div>
                  <strong>Mobility Check & Stretch · Completed</strong>
                  <small>10 min · Active recovery check · +100 Aura</small>
                </div>
                <span className="pill green">Recorded</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        SĀDHANĀ · Adapt to the person. Challenge the person. Develop the person.
      </footer>
    </div>
  );
};

export default ProgressView;
