import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GameNavigationHeader } from '../components/GameNavigationHeader';
import { ClassCard3D } from '../components/ClassCard3D';
import { getTodayWorkout } from '../services/api';

const CLASS_MILESTONES: Record<string, string[]> = {
  dhruva: ["Today's Practice", 'Stamina Path', 'Endurance Trial', 'Dhruva Challenge', 'Week Finale'],
  samanvaya: ["Today's Practice", 'Movement Flow', 'Agility Trial', 'Samanvaya Challenge', 'Week Finale'],
  sthira: ["Today's Practice", 'Core Control', 'Stability Trial', 'Sthira Challenge', 'Week Finale'],
  vistara: ["Today's Practice", 'Range of Motion', 'Mobility Trial', 'Vistāra Challenge', 'Week Finale'],
  yodha: ["Today's Practice", 'Resistance Path', 'Power Trial', 'Yodha Challenge', 'Week Finale'],
};

export const HomeDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useApp();

  const [workoutData, setWorkoutData] = useState<any>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);
  const [isTodayCompleted, setIsTodayCompleted] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('sadhana_today_quest_completed') === 'true' ||
      localStorage.getItem('sadhana_today_quest_completed') === 'true'
    );
  });

  useEffect(() => {
    const handleQuestCompleted = () => {
      setIsTodayCompleted(true);
    };
    window.addEventListener('sadhana_quest_completed', handleQuestCompleted);
    return () => window.removeEventListener('sadhana_quest_completed', handleQuestCompleted);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchWorkout = async () => {
      try {
        const res = await getTodayWorkout();
        if (isMounted && res) {
          setWorkoutData(res);
        }
      } catch (err) {
        console.warn('Using offline workout template for dashboard:', err);
      } finally {
        if (isMounted) setLoadingWorkout(false);
      }
    };
    fetchWorkout();
    return () => {
      isMounted = false;
    };
  }, []);

  const userName = profile?.name ? profile.name.split(' ')[0] : (profile?.username || 'Warrior');
  const streak = profile?.current_streak ?? profile?.streak ?? (isTodayCompleted ? 13 : 12);
  const aura = profile?.total_aura ?? profile?.aura_score ?? (isTodayCompleted ? 4520 : 4320);
  const currentLevel = profile?.current_level ?? profile?.level ?? 4;
  const nextLevel = currentLevel + 1;
  const currentXp = profile?.current_xp ?? profile?.xp ?? (isTodayCompleted ? 6440 : 6240);
  const xpGoal = 10000;
  const xpPercent = Math.min(100, Math.round((currentXp / xpGoal) * 100));
  const sessionsLogged = profile?.workouts_completed_count ?? (isTodayCompleted ? 1 : 0);

  const classSlug = (profile?.assigned_class?.slug || profile?.assigned_class_slug || 'dhruva').toLowerCase();
  const className = profile?.assigned_class?.name || (classSlug.charAt(0).toUpperCase() + classSlug.slice(1));

  const classTitles: Record<string, string> = {
    sthira: 'Strength & Core Stability',
    vistara: 'Mobility & Joint Freedom',
    yodha: 'Functional Power & Combat',
    dhruva: 'Cardio & Endurance',
    samanvaya: 'Holistic Mind-Body Balance',
  };
  const classFocus = classTitles[classSlug] || 'Cardio & Endurance';
  const milestones = CLASS_MILESTONES[classSlug] || CLASS_MILESTONES.dhruva;

  const workoutTitle = workoutData?.title || 'Cardio Foundations';
  const workoutDuration = workoutData?.estimated_duration_min ? `${workoutData.estimated_duration_min} min` : '12–15 min';
  const workoutEquipment = workoutData?.target_equipment || 'Bodyweight';
  const exercisesCount = workoutData?.exercises?.length || 3;
  const completedCount = isTodayCompleted
    ? exercisesCount
    : (workoutData?.exercises?.filter((e: any) => e.is_completed || e.completed)?.length || 0);
  const completionPercent = isTodayCompleted ? 100 : (exercisesCount > 0 ? Math.round((completedCount / exercisesCount) * 100) : 0);

  const openSai = (prompt?: string) => {
    window.dispatchEvent(new CustomEvent('open-sai-coach', { detail: { prompt } }));
  };

  return (
    <div className="min-h-screen bg-[#24170f] text-[#352419]">
      {/* Shared RPG Topbar HUD */}
      <GameNavigationHeader />

      <main className="page-wrap home-wrap">
        {/* Welcome Banner */}
        <section className="home-welcome">
          <div className="welcome-copy">
            <div className="eyebrow">Your journey continues</div>
            <h1 className="page-title">
              <span id="greeting">Welcome back</span>, {userName}
            </h1>
            <p className="page-subtitle">
              Train for the life you have today. Every session builds real ability.
            </p>
            <div className="welcome-actions">
              <Link className="rpg-btn" to="/player">
                ▶ Begin today's training
              </Link>
              <Link className="rpg-btn dark" to="/today">
                View quest journal
              </Link>
            </div>
          </div>
          <div className="welcome-art" aria-label="Sādhanā adventure world illustration">
            <img src="/assets/world_scene_crop.jpg" alt="Illustrated Sādhanā training world" />
            <div className="art-caption">
              <span className="pill green">{isTodayCompleted ? 'QUEST COMPLETED ✓' : 'CURRENT QUEST'}</span>
              <strong>{workoutTitle}</strong>
              <small>{workoutDuration} · {workoutEquipment}</small>
            </div>
          </div>
        </section>

        {/* 4 Quickstats Cards */}
        <section className="home-quickstats" aria-label="Your current stats">
          <div className="quickstat">
            <span className="quickstat-icon">🔥</span>
            <div>
              <small>Day streak</small>
              <strong>
                <span data-stat="streak">{streak}</span> days
              </strong>
            </div>
          </div>
          <div className="quickstat">
            <span className="quickstat-icon">✦</span>
            <div>
              <small>Total Aura</small>
              <strong data-stat="aura">{typeof aura === 'number' ? aura.toLocaleString() : aura}</strong>
            </div>
          </div>
          <div className="quickstat">
            <span className="quickstat-icon">✓</span>
            <div>
              <small>Sessions logged</small>
              <strong data-stat="completed">{sessionsLogged}</strong>
            </div>
          </div>
          <div className="quickstat">
            <span className="quickstat-icon">⚔</span>
            <div>
              <small>Assigned class</small>
              <strong>
                {className} · Lv. <span data-stat="level">{currentLevel}</span>
              </strong>
            </div>
          </div>
        </section>

        {/* Milestone Progression Row from sadhana_final_project */}
        <section className="wood-panel home-progression-row" aria-labelledby="homeJourneyTitle">
          <div className="panel-inner">
            <div className="panel-head">
              <div>
                <div className="eyebrow">One step at a time</div>
                <h2 id="homeJourneyTitle">Your {className} Journey</h2>
              </div>
              <Link to="/today" className="text-link">
                Open level tree →
              </Link>
            </div>
            <div className="home-milestone-list" aria-label="Interactive weekly milestones">
              <button
                type="button"
                className={`home-milestone ${isTodayCompleted ? 'is-completed' : 'is-current'}`}
                onClick={() => navigate('/player')}
                title="Active today's training node"
              >
                <span className="milestone-number">01</span>
                <span className="milestone-copy">
                  <b>{milestones[0]}</b>
                  <small>{isTodayCompleted ? 'Completed ✓' : 'Current'}</small>
                </span>
                <span className="milestone-arrow">{isTodayCompleted ? '✓' : '↗'}</span>
              </button>
              <button
                type="button"
                className="home-milestone is-locked"
                onClick={() => navigate('/today')}
                title="Milestone 2"
              >
                <span className="milestone-number">02</span>
                <span className="milestone-copy">
                  <b>{milestones[1]}</b>
                  <small>Locked</small>
                </span>
                <span className="milestone-arrow">↗</span>
              </button>
              <button
                type="button"
                className="home-milestone is-locked"
                onClick={() => navigate('/today')}
                title="Milestone 3"
              >
                <span className="milestone-number">03</span>
                <span className="milestone-copy">
                  <b>{milestones[2]}</b>
                  <small>Locked</small>
                </span>
                <span className="milestone-arrow">↗</span>
              </button>
              <button
                type="button"
                className="home-milestone is-locked"
                onClick={() => navigate('/today')}
                title="Milestone 4"
              >
                <span className="milestone-number">04</span>
                <span className="milestone-copy">
                  <b>{milestones[3]}</b>
                  <small>Locked</small>
                </span>
                <span className="milestone-arrow">↗</span>
              </button>
              <button
                type="button"
                className="home-milestone is-locked"
                onClick={() => navigate('/today')}
                title="Milestone 5"
              >
                <span className="milestone-number">05</span>
                <span className="milestone-copy">
                  <b>{milestones[4]}</b>
                  <small>Locked</small>
                </span>
                <span className="milestone-arrow">↗</span>
              </button>
            </div>
          </div>
        </section>

        {/* Home Main Grid */}
        <div className="home-main-grid">
          {/* Today's Quest Panel */}
          <section className="wood-panel home-quest-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <div>
                  <div className="eyebrow">Ready when you are</div>
                  <h2>Today's Quest</h2>
                </div>
                <span className="pill">+200 XP</span>
              </div>
              <div className="today-quest-content">
                <div className="quest-emblem">⚡</div>
                <div className="today-quest-copy">
                  <h3>{workoutTitle}</h3>
                  <p>
                    {workoutData?.description ||
                      'Build steady physical ability with a short, adaptable session tuned for your path.'}
                  </p>
                  <div className="quest-meta">
                    <span>◷ {workoutDuration}</span>
                    <span>♧ {workoutEquipment}</span>
                    <span>✦ {className} path</span>
                  </div>
                  <div className="meter quest-mini-meter">
                    <span id="homeDailyMeter" style={{ width: `${completionPercent}%` }}></span>
                  </div>
                  <small id="homeDailyStatus">
                    {completionPercent === 100
                      ? 'Quest fully conquered today!'
                      : completionPercent > 0
                      ? `${completedCount} of ${exercisesCount} exercises recorded`
                      : 'Not started today'}
                  </small>
                </div>
                <div className="today-quest-actions">
                  <Link className="rpg-btn" to="/player">
                    {isTodayCompleted ? 'Review training ✓' : 'Start quest →'}
                  </Link>
                  <Link className="text-link" to="/today">
                    Quest details
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Training Path Panel with interactive 3D tarot and designed card */}
          <section className="wood-panel home-class-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <h2>Your Training Path</h2>
                <Link to="/profile#about" className="text-link">
                  About my class →
                </Link>
              </div>
              <div className="home-class-content">
                <ClassCard3D
                  classSlug={classSlug}
                  classNameTitle={className}
                  compact={true}
                  showHint={true}
                  allowDesignedToggle={true}
                />
                <div className="home-class-copy">
                  <span className="pill green">ASSIGNED CLASS</span>
                  <h3>{className}</h3>
                  <p>{classFocus}</p>
                  <div className="xp-label">
                    <span>Class XP</span>
                    <b>
                      <span data-stat="progress">{currentXp.toLocaleString()}</span> /{' '}
                      <span data-stat="xpgoal">{xpGoal.toLocaleString()}</span>
                    </b>
                  </div>
                  <div className="meter xp-meter">
                    <span data-stat-bar="xp" style={{ width: `${xpPercent}%` }}></span>
                  </div>
                  <small>
                    Next milestone: Level <span data-stat="nextlevel">{nextLevel}</span>
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* Active Quests Stack */}
          <section className="wood-panel home-active-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <h2>Quest Log</h2>
                <Link to="/today" className="text-link">
                  See all →
                </Link>
              </div>
              <div className="home-quest-list">
                <article className="home-quest-item">
                  <span className="quest-icon">⚡</span>
                  <div>
                    <strong>Daily quest</strong>
                    <small>{workoutTitle} · {workoutDuration}</small>
                  </div>
                  <Link className="rpg-btn compact" to="/player">
                    Start
                  </Link>
                </article>
                <article className="home-quest-item">
                  <span className="quest-icon blue">🛡</span>
                  <div>
                    <strong>Class quest</strong>
                    <small>Complete 3 {className} sessions</small>
                  </div>
                  <Link className="rpg-btn dark compact" to="/today">
                    Track
                  </Link>
                </article>
                <article className="home-quest-item">
                  <span className="quest-icon green">🌿</span>
                  <div>
                    <strong>Recovery check</strong>
                    <small>Tell sAI how you're feeling</small>
                  </div>
                  <button
                    type="button"
                    className="rpg-btn dark compact"
                    onClick={() => openSai("Help me check my readiness for today's workout.")}
                  >
                    Ask sAI
                  </button>
                </article>
              </div>
            </div>
          </section>

          {/* Interactive Quest Map Panel from sadhana_final_project */}
          <section className="wood-panel home-map-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <div>
                  <h2>Quest Map</h2>
                  <small>Week 1 · Interactive milestone tree</small>
                </div>
                <Link to="/today" className="text-link">
                  Open tree →
                </Link>
              </div>
              <div
                className="home-map-link home-map-interactive"
                aria-label="Interactive quest map preview"
              >
                <img
                  src="/assets/quest_tree_designed.jpg"
                  alt="Your illustrated quest tree. Select a milestone to see its status."
                />
                <div className="home-map-nodes" aria-label="Quest map milestone buttons">
                  <button
                    type="button"
                    className="is-completed"
                    style={{ left: '7.5%', top: '41.2%' }}
                    aria-label="Profile assessed milestone"
                    onClick={() => navigate('/today')}
                  />
                  <button
                    type="button"
                    className="is-completed"
                    style={{ left: '17.6%', top: '60.8%' }}
                    aria-label="Class assigned milestone"
                    onClick={() => navigate('/today')}
                  />
                  <button
                    type="button"
                    className="is-current"
                    style={{ left: '31.8%', top: '72.7%' }}
                    aria-label="Today's practice milestone"
                    onClick={() => navigate('/player')}
                  />
                  <button
                    type="button"
                    className="is-locked"
                    style={{ left: '48.1%', top: '60%' }}
                    aria-label="Stamina path milestone"
                    onClick={() => navigate('/today')}
                  />
                  <button
                    type="button"
                    className="is-locked"
                    style={{ left: '66%', top: '51%' }}
                    aria-label="Endurance trial milestone"
                    onClick={() => navigate('/today')}
                  />
                  <button
                    type="button"
                    className="is-locked"
                    style={{ left: '85.7%', top: '23.3%' }}
                    aria-label="Dhruva challenge milestone"
                    onClick={() => navigate('/today')}
                  />
                  <button
                    type="button"
                    className="is-locked"
                    style={{ left: '83.7%', top: '74.7%' }}
                    aria-label="Week finale milestone"
                    onClick={() => navigate('/today')}
                  />
                </div>
                <Link className="map-open-label" to="/today">
                  Explore quest tree <b>↗</b>
                </Link>
              </div>
              <div className="map-legend">
                <span>
                  <i className="legend-dot"></i> Completed
                </span>
                <span>
                  <i className="legend-dot current"></i> Current
                </span>
                <span>
                  <i className="legend-dot locked"></i> Locked
                </span>
              </div>
              <div className="map-weekly-note">
                <div>
                  <strong>Weekly direction</strong>
                  <small>{classFocus}, supported by mobility and strength.</small>
                </div>
                <span className="pill" data-stat="weekcount">3 / 5 sessions</span>
              </div>
              <Link to="/today" className="rpg-btn dark map-full-button">
                Explore all milestones →
              </Link>
            </div>
          </section>
        </div>

        {/* sAI strip */}
        <section className="home-sai-strip">
          <button
            className="sai-face-button"
            type="button"
            onClick={() => openSai()}
            aria-label="Open sAI fitness coach chat"
          >
            <img src="/assets/sai_robot_in_its_idle_pose.webp" alt="sAI robot coach" />
          </button>
          <div>
            <strong>Need a hand, adventurer?</strong>
            <p>
              Ask sAI to adapt your session, explain an exercise, or help you reflect on your progress.
            </p>
          </div>
          <button className="rpg-btn" type="button" onClick={() => openSai()}>
            Chat with sAI ↗
          </button>
        </section>
      </main>

      <footer className="footer">
        SĀDHANĀ · Adapt to the person. Challenge the person. Develop the person.
      </footer>
    </div>
  );
};

export default HomeDashboardView;
