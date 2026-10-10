import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GameNavigationHeader } from '../components/GameNavigationHeader';
import { getTodayWorkout } from '../services/api';
import { gameAudio } from '../utils/gameAudio';
import type { WorkoutPlan, ExerciseItem } from '../types';

interface QuestNodeInfo {
  title: string;
  description: string;
  goal: string;
  reward: string;
}

const CLASS_INFO: Record<string, { name: string; focus: string; description: string }> = {
  dhruva: {
    name: 'Dhruva',
    focus: 'Cardio & endurance',
    description: 'Dhruva develops cardiovascular capacity, stamina and sustained pacing.',
  },
  samanvaya: {
    name: 'Samanvaya',
    focus: 'Coordination & flow',
    description: 'Samanvaya develops agility, movement coordination and rhythm.',
  },
  sthira: {
    name: 'Sthira',
    focus: 'Strength & stability',
    description: 'Sthira develops solid structural power, core stability and balance.',
  },
  vistara: {
    name: 'Vistāra',
    focus: 'Mobility & range of motion',
    description: 'Vistāra develops expansive joint mobility, flexibility and ease of movement.',
  },
  yodha: {
    name: 'Yodha',
    focus: 'Strength & power',
    description: 'Yodha develops functional strength, explosive athletic power and combat fitness.',
  },
};

const QUEST_BASE_NODES = [
  {
    title: 'Fitness Profile',
    description:
      'Your goals, current activity and constraints establish the starting point for your training journey.',
    goal: 'Profile assessment saved',
    reward: 'Foundational step · complete',
  },
  {
    title: 'Class Revealed',
    description:
      'Sādhanā assigns your training specialization based on your profile assessment. Your class sets a direction; every session still supports all five fitness components.',
    goal: 'Class assigned by the system',
    reward: 'Not user-selectable · based on your profile',
  },
];

const CLASS_QUESTS: Record<string, QuestNodeInfo[]> = {
  dhruva: [
    {
      title: "Today's Practice",
      description:
        'Complete the current adaptive workout. The result and feedback are saved to preview history, award XP, and move your weekly path forward.',
      goal: 'Complete one workout',
      reward: '+200 XP / Aura · advances your weekly path',
    },
    {
      title: 'Stamina Path',
      description:
        'Continue the weekly direction with a cardio session while the system considers your previous performance and available time.',
      goal: 'Second weekly workout',
      reward: 'XP, Aura and a new path marker',
    },
    {
      title: 'Endurance Trial',
      description:
        'Build consistency with another appropriately challenging session. Difficulty should adapt to performance, not only to level.',
      goal: 'Third weekly workout',
      reward: 'Progress toward the class milestone',
    },
    {
      title: 'Dhruva Challenge',
      description:
        'A class-focused milestone for sustainable stamina and aerobic conditioning, while maintaining mobility, balance, coordination and strength.',
      goal: 'Fourth weekly workout',
      reward: 'Unlock the Week Finale',
    },
    {
      title: 'Week Finale',
      description:
        'Complete the fifth weekly session to finish the path. The next week unlocks automatically and keeps your previous session history.',
      goal: 'Fifth weekly workout',
      reward: 'Complete the week · unlock the next path',
    },
  ],
  samanvaya: [
    {
      title: "Today's Practice",
      description:
        'Start with a coordinated movement session suited to your current context and available time.',
      goal: 'Complete one workout',
      reward: '+200 XP / Aura · advances your weekly path',
    },
    {
      title: 'Movement Flow',
      description:
        'Build timing and smooth movement sequencing while supporting strength, cardio, flexibility and balance.',
      goal: 'Second weekly workout',
      reward: 'XP, Aura and a new path marker',
    },
    {
      title: 'Agility Trial',
      description:
        'Practice appropriately challenging footwork and coordination. Adjust difficulty to actual performance.',
      goal: 'Third weekly workout',
      reward: 'Progress toward the class milestone',
    },
    {
      title: 'Samanvaya Challenge',
      description:
        'Bring reaction, agility and coordinated movement together in a class-focused challenge.',
      goal: 'Fourth weekly workout',
      reward: 'Unlock the Week Finale',
    },
    {
      title: 'Week Finale',
      description:
        'Complete five sessions to finish the path and unlock the next week. Previous history remains available.',
      goal: 'Fifth weekly workout',
      reward: 'Complete the week · unlock the next path',
    },
  ],
  sthira: [
    {
      title: "Today's Practice",
      description:
        'Begin with a balance and controlled-movement session matched to your current readiness.',
      goal: 'Complete one workout',
      reward: '+200 XP / Aura · advances your weekly path',
    },
    {
      title: 'Core Control',
      description:
        'Continue building stability and postural control while maintaining the other essential fitness components.',
      goal: 'Second weekly workout',
      reward: 'XP, Aura and a new path marker',
    },
    {
      title: 'Stability Trial',
      description:
        'Progress into controlled balance work while keeping movement comfortable and safe.',
      goal: 'Third weekly workout',
      reward: 'Progress toward the class milestone',
    },
    {
      title: 'Sthira Challenge',
      description:
        'Combine balance, core stability and mindful body control in a class-focused milestone.',
      goal: 'Fourth weekly workout',
      reward: 'Unlock the Week Finale',
    },
    {
      title: 'Week Finale',
      description:
        'Complete five sessions to finish the path and unlock the next week. Previous history remains available.',
      goal: 'Fifth weekly workout',
      reward: 'Complete the week · unlock the next path',
    },
  ],
  vistara: [
    {
      title: "Today's Practice",
      description:
        'Begin with mobility and movement-quality work suited to your experience and available time.',
      goal: 'Complete one workout',
      reward: '+200 XP / Aura · advances your weekly path',
    },
    {
      title: 'Range of Motion',
      description:
        'Develop controlled flexibility and joint movement while keeping balanced strength and cardio support.',
      goal: 'Second weekly workout',
      reward: 'XP, Aura and a new path marker',
    },
    {
      title: 'Mobility Trial',
      description:
        'Progress range-of-motion work in a controlled way. Avoid forcing uncomfortable stretches.',
      goal: 'Third weekly workout',
      reward: 'Progress toward the class milestone',
    },
    {
      title: 'Vistāra Challenge',
      description:
        'Build a consistent mobility routine and movement freedom in this class-focused milestone.',
      goal: 'Fourth weekly workout',
      reward: 'Unlock the Week Finale',
    },
    {
      title: 'Week Finale',
      description:
        'Complete five sessions to finish the path and unlock the next week. Previous history remains available.',
      goal: 'Fifth weekly workout',
      reward: 'Complete the week · unlock the next path',
    },
  ],
  yodha: [
    {
      title: "Today's Practice",
      description:
        'Begin with a strength session appropriate to your experience, equipment and current context.',
      goal: 'Complete one workout',
      reward: '+200 XP / Aura · advances your weekly path',
    },
    {
      title: 'Resistance Path',
      description:
        'Continue progressive resistance work with attention to control, technique and recovery.',
      goal: 'Second weekly workout',
      reward: 'XP, Aura and a new path marker',
    },
    {
      title: 'Power Trial',
      description:
        'Develop strength and power through an appropriately challenging session; progression follows performance, not level alone.',
      goal: 'Third weekly workout',
      reward: 'Progress toward the class milestone',
    },
    {
      title: 'Yodha Challenge',
      description:
        'Bring strength and controlled effort together while maintaining mobility, endurance, balance and coordination.',
      goal: 'Fourth weekly workout',
      reward: 'Unlock the Week Finale',
    },
    {
      title: 'Week Finale',
      description:
        'Complete five sessions to finish the path and unlock the next week. Previous history remains available.',
      goal: 'Fifth weekly workout',
      reward: 'Complete the week · unlock the next path',
    },
  ],
};

const MAP_NODE_POSITIONS = [
  { left: '7.5%', top: '41.2%', label: 'Profile assessed' },
  { left: '17.6%', top: '60.8%', label: 'Class assigned' },
  { left: '31.8%', top: '72.7%', label: "Today's practice" },
  { left: '48.1%', top: '60%', label: 'Stamina path' },
  { left: '66%', top: '51%', label: 'Endurance trial' },
  { left: '85.7%', top: '23.3%', label: 'Class challenge' },
  { left: '83.7%', top: '74.7%', label: 'Week finale' },
];

export const TodayWorkoutView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateXpAndLevel } = useApp();

  const classSlug = (profile?.assigned_class_slug || profile?.assigned_class?.slug || 'dhruva').toLowerCase();
  const currentClassInfo = CLASS_INFO[classSlug] || CLASS_INFO.dhruva;
  const className = currentClassInfo.name;
  const classFocus = currentClassInfo.focus;

  const currentLvl = profile?.current_level || 4;
  const nextLvl = currentLvl + 1;
  const currentXp = profile?.current_xp || 6240;
  const targetXp = 10000;
  const remainingXp = Math.max(0, targetXp - currentXp);
  const xpPercent = Math.min(100, Math.round((currentXp / targetXp) * 100));
  const aura = profile?.total_aura ?? profile?.aura_score ?? currentXp;

  const weekSessions = profile?.workouts_completed_count ?? 0;
  const currentActiveNodeIndex = 2 + Math.min(4, weekSessions);

  // Build 7 quest nodes
  const classRevealNode: QuestNodeInfo = {
    ...QUEST_BASE_NODES[1],
    description: `Sādhanā assigned ${className} based on your fitness profile. ${currentClassInfo.description} The class remains assigned by the system, not chosen in this screen.`,
    goal: `${className} · ${classFocus}`,
  };
  const questNodes: QuestNodeInfo[] = [
    QUEST_BASE_NODES[0],
    classRevealNode,
    ...(CLASS_QUESTS[classSlug] || CLASS_QUESTS.dhruva),
  ];

  // Parse query param ?node=X or default to current active node
  const searchParams = new URLSearchParams(location.search);
  const queryNodeParam = searchParams.get('node');
  const initialNode =
    queryNodeParam !== null && !isNaN(Number(queryNodeParam)) && Number(queryNodeParam) >= 0 && Number(queryNodeParam) < 7
      ? Number(queryNodeParam)
      : currentActiveNodeIndex;

  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(initialNode);

  // Workout data & chest claim state
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(true);
  const [chestClaimed, setChestClaimed] = useState<boolean>(false);
  const [particles, setParticles] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchPlan = async () => {
      try {
        const cached = sessionStorage.getItem('sadhana_active_plan');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.exercises && parsed.exercises.length > 0) {
            if (isMounted) {
              setWorkoutPlan(parsed);
              setLoadingPlan(false);
            }
            return;
          }
        }
        const userEquip = profile?.equipment_access?.join(',') || 'bodyweight';
        const data = await getTodayWorkout(classSlug, 30, userEquip, false);
        if (isMounted && data) {
          setWorkoutPlan(data);
          sessionStorage.setItem('sadhana_active_plan', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Failed to fetch plan:', err);
      } finally {
        if (isMounted) setLoadingPlan(false);
      }
    };
    fetchPlan();
    return () => {
      isMounted = false;
    };
  }, [classSlug, profile]);

  const triggerXpParticle = (text: string, e?: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY - 20 : window.innerHeight / 2;
    setParticles((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  const handleLaunchExercise = (index: number) => {
    gameAudio.playClick();
    if (workoutPlan) {
      sessionStorage.setItem('sadhana_active_plan', JSON.stringify(workoutPlan));
      sessionStorage.setItem('sadhana_active_exercise_index', String(index));
      sessionStorage.setItem('sadhana_active_quest_title', workoutPlan.title || `${className} Daily Quest`);
      navigate('/player');
    }
  };

  const handleStartFullQuest = () => {
    gameAudio.playClick();
    if (!workoutPlan) {
      navigate('/player');
      return;
    }
    const firstIncomplete = workoutPlan.exercises?.findIndex((e) => !e.completed) ?? 0;
    handleLaunchExercise(firstIncomplete >= 0 ? firstIncomplete : 0);
  };

  const toggleExerciseCheck = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!workoutPlan) return;
    const updated = { ...workoutPlan };
    const ex = updated.exercises[index];
    const nextState = !ex.completed;
    ex.completed = nextState;
    setWorkoutPlan(updated);
    sessionStorage.setItem('sadhana_active_plan', JSON.stringify(updated));

    if (nextState) {
      gameAudio.playXpGain();
      triggerXpParticle('+150 XP! ⚡', e);
      updateXpAndLevel(currentXp + 150, currentLvl);
    } else {
      gameAudio.playClick();
    }
  };

  const handleClaimChest = (e: React.MouseEvent) => {
    if (chestClaimed) return;
    const allCompleted = workoutPlan?.exercises?.every((e) => e.completed) ?? false;
    if (!allCompleted) {
      gameAudio.playClick();
      alert("Finish all exercises in today's quest to unlock the golden chest! 💪");
      return;
    }

    gameAudio.playLevelUp();
    setChestClaimed(true);
    triggerXpParticle('+300 BONUS AURA! 🏆', e);
    updateXpAndLevel(currentXp + 300, currentLvl);
  };

  const getNodeStatus = (idx: number): 'completed' | 'current' | 'locked' => {
    if (idx < 2 || idx < currentActiveNodeIndex) return 'completed';
    if (idx === currentActiveNodeIndex) return 'current';
    return 'locked';
  };

  const selectedNode = questNodes[selectedNodeIndex] || questNodes[2];
  const selectedNodeStatus = getNodeStatus(selectedNodeIndex);

  const exercises = workoutPlan?.exercises || [];
  const completedExercisesCount = exercises.filter((e) => e.completed).length;
  const exercisesProgressPercent =
    exercises.length > 0 ? Math.round((completedExercisesCount / exercises.length) * 100) : 0;
  const allExercisesCompleted = exercises.length > 0 && completedExercisesCount === exercises.length;

  return (
    <div className="min-h-screen bg-[#24170f] text-[#352419]">
      <GameNavigationHeader />

      {/* Floating XP particle alerts */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none z-50 text-base font-black text-[#D99A16] px-3 py-1 bg-[#24170F]/90 border border-[#D99A16] rounded-full shadow-lg animate-bounce"
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
        >
          {p.text}
        </div>
      ))}

      <main className="page-wrap quests-wrap">
        {/* Page Heading */}
        <div className="page-heading">
          <div>
            <div className="eyebrow">Every session moves you forward</div>
            <h1 className="page-title">Quest Journal & Level Tree</h1>
            <p className="page-subtitle">
              Complete training to earn XP, advance your weekly path, and work toward the next {className} level. Locked
              nodes open as you progress.
            </p>
          </div>
          <button className="rpg-btn" onClick={handleStartFullQuest}>
            ▶ Begin today's quest
          </button>
        </div>

        {/* XP Overview Banner */}
        <section className="wood-panel xp-overview" aria-labelledby="xpOverviewTitle">
          <div className="panel-inner">
            <div className="xp-overview-top">
              <div>
                <span className="pill green">SYSTEM-ASSIGNED CLASS · {className}</span>
                <h2 id="xpOverviewTitle">Class Experience</h2>
                <p className="muted small">
                  XP comes from completed sessions and meaningful progression—not from selecting a class.
                </p>
              </div>
              <div className="xp-level-badge">
                <small>CURRENT LEVEL</small>
                <strong>Lv. <span data-stat="level">{currentLvl}</span></strong>
              </div>
            </div>
            <div className="xp-progress-heading">
              <strong>
                <span data-stat="progress">{currentXp.toLocaleString()}</span> /{' '}
                <span data-stat="xpgoal">{targetXp.toLocaleString()}</span> XP
              </strong>
              <span>
                <b data-stat="xpremaining">{remainingXp.toLocaleString()}</b> XP until Level{' '}
                <b data-stat="nextlevel">{nextLvl}</b> · <b data-stat="xppercent">{xpPercent}%</b>
              </span>
            </div>
            <div
              className="meter xp-large-meter"
              role="progressbar"
              aria-label="XP progress to next level"
              aria-valuemin={0}
              aria-valuemax={targetXp}
              aria-valuenow={currentXp}
            >
              <span data-stat-bar="xp" style={{ width: `${xpPercent}%` }}></span>
            </div>
            <div className="xp-foot">
              <span>✦ Aura: <b data-stat="aura">{typeof aura === 'number' ? aura.toLocaleString() : aura}</b></span>
              <span>🛡 Completed workouts: <b data-stat="completed">{weekSessions}</b></span>
              <span>🔥 Week <b data-stat="week">1</b> · <b data-stat="weekSessions">{weekSessions}</b>/5 sessions</span>
            </div>
          </div>
        </section>

        {/* Interactive Quest Map & Node Detail Layout */}
        <div className="quests-layout">
          {/* Interactive Quest Tree */}
          <section className="wood-panel quest-tree-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <div>
                  <div className="eyebrow">{className} · {classFocus}</div>
                  <h2>Quest Map · Week 1</h2>
                </div>
                <small>Select any marker</small>
              </div>

              <div className="interactive-quest-map" id="questTree" aria-label="Interactive quest milestone tree">
                <img
                  className="quest-tree-background"
                  src="/assets/quest_tree_designed.jpg"
                  alt="Illustrated Sādhanā quest tree with paths and milestone markers"
                />
                {MAP_NODE_POSITIONS.map((pos, idx) => {
                  const status = getNodeStatus(idx);
                  const isSelected = selectedNodeIndex === idx;
                  const node = questNodes[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`quest-map-node is-${status}`}
                      data-map-node={idx}
                      style={{ left: pos.left, top: pos.top }}
                      aria-label={`${node?.title || pos.label} — ${status}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        gameAudio.playClick();
                        setSelectedNodeIndex(idx);
                      }}
                    >
                      <span className="sr-only">{pos.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="map-legend">
                <span><i className="legend-dot"></i> Completed</span>
                <span><i className="legend-dot current"></i> Current</span>
                <span><i className="legend-dot locked"></i> Locked</span>
              </div>
              <p className="map-help small muted">
                The first two milestones reflect profile assessment and class assignment. Each completed workout
                advances the current weekly milestone. Finishing five sessions unlocks the next week's path.
              </p>
            </div>
          </section>

          {/* Quest Node Detail Panel */}
          <aside className="wood-panel quest-detail-panel">
            <div className="panel-inner">
              <div className="panel-head">
                <div>
                  <div className="eyebrow">Selected milestone</div>
                  <h2 id="selectedNodeTitle">{selectedNode.title}</h2>
                </div>
                <span
                  id="selectedNodeStatus"
                  className={`pill ${selectedNodeStatus === 'completed' || selectedNodeStatus === 'current' ? 'green' : ''}`}
                >
                  {selectedNodeStatus.toUpperCase()}
                </span>
              </div>

              <p id="selectedNodeDescription">{selectedNode.description}</p>

              <div className="node-requirement">
                <span className="quest-emblem">⚔</span>
                <div>
                  <b id="selectedNodeGoal">{selectedNode.goal}</b>
                  <small id="selectedNodeReward">{selectedNode.reward}</small>
                </div>
              </div>

              {/* Dynamic Action Button based on status & node */}
              {selectedNodeStatus !== 'locked' ? (
                selectedNodeIndex < 2 ? (
                  <Link id="selectedNodeAction" className="rpg-btn" to="/profile#about">
                    View assigned profile →
                  </Link>
                ) : selectedNodeStatus === 'completed' ? (
                  <Link id="selectedNodeAction" className="rpg-btn" to="/progress">
                    View session history →
                  </Link>
                ) : (
                  <button id="selectedNodeAction" className="rpg-btn" onClick={handleStartFullQuest}>
                    Start today's quest →
                  </button>
                )
              ) : null}

              {selectedNodeStatus === 'locked' && (
                <p id="nodeLockedHint" className="locked-hint small muted">
                  Complete “{questNodes[currentActiveNodeIndex]?.title || "Today's Practice"}” to unlock this milestone.
                </p>
              )}

              <div className="node-detail-foot">
                <Link to="/progress" className="text-link">
                  View session history →
                </Link>
                <Link to="/profile#about" className="text-link">
                  About my class →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Active Exercises List & Golden Chest */}
        <section className="wood-panel" style={{ marginTop: '14px' }}>
          <div className="panel-inner">
            <div className="panel-head">
              <div>
                <h2>Today's Training Exercises</h2>
                <small>Adaptive execution · Record your progress</small>
              </div>
              <span className="pill green">+{workoutPlan?.exercises?.reduce((sum, e) => sum + (e.xp_reward || 150), 0) || 500} XP Available</span>
            </div>

            <div className="quest-list">
              {/* Daily Quest Master Row */}
              <div
                className="quest-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '12px 16px',
                }}
              >
                <span
                  className="quest-icon"
                  style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  ⚡
                </span>
                <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#352419',
                      marginBottom: '3px',
                    }}
                  >
                    Daily Quest · {workoutPlan?.title || 'Cardio Foundations'}
                  </strong>
                  <small style={{ display: 'block', fontSize: '12.5px', color: '#806443' }}>
                    Complete today's personalized session · {workoutPlan?.duration_minutes || 15} min
                  </small>
                  <div className="meter" style={{ marginTop: '8px', maxWidth: '320px', height: '8px' }}>
                    <span style={{ width: `${exercisesProgressPercent}%`, height: '100%', display: 'block' }}></span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rpg-btn"
                  style={{
                    marginLeft: 'auto',
                    flexShrink: 0,
                    height: '38px',
                    minWidth: '92px',
                    padding: '0 16px',
                    fontSize: '13px',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={handleStartFullQuest}
                >
                  Begin
                </button>
              </div>

              {/* Individual Exercises */}
              {exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="quest-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    padding: '12px 16px',
                    background: ex.completed ? '#eaf4e6' : '#fff5df',
                    borderColor: ex.completed ? '#8da87c' : '#d8b982',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleLaunchExercise(idx)}
                >
                  <span
                    className="quest-icon"
                    style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      display: 'grid',
                      placeItems: 'center',
                      background: ex.completed ? '#5da368' : '#e7c783',
                      color: ex.completed ? '#fff' : '#382317',
                      borderColor: ex.completed ? '#45824e' : '#9a682b',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                    onClick={(e) => toggleExerciseCheck(idx, e)}
                    title="Toggle completed"
                  >
                    {ex.completed ? '✓' : idx + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#352419',
                        textDecoration: ex.completed ? 'line-through' : 'none',
                        marginBottom: '3px',
                      }}
                    >
                      {ex.exercise_name || ex.name}
                    </strong>
                    <small style={{ display: 'block', fontSize: '12.5px', color: '#806443' }}>
                      {ex.sets_reps || '3 sets × 10 reps'} · +{ex.xp_reward || 150} XP
                    </small>
                  </div>
                  <button
                    type="button"
                    className={`rpg-btn compact ${ex.completed ? 'dark' : ''}`}
                    style={{
                      marginLeft: 'auto',
                      flexShrink: 0,
                      height: '34px',
                      minWidth: '86px',
                      padding: '0 14px',
                      fontSize: '12px',
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchExercise(idx);
                    }}
                  >
                    {ex.completed ? 'Replay ↻' : 'Play ▶'}
                  </button>
                </div>
              ))}

              {/* Golden Treasure Chest Reward */}
              <div
                className="quest-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '12px 16px',
                  background: chestClaimed ? '#f5ebd2' : allExercisesCompleted ? '#fff2cc' : '#fff5df',
                  borderColor: allExercisesCompleted ? '#d99a16' : '#d8b982',
                  cursor: 'pointer',
                  boxShadow: allExercisesCompleted && !chestClaimed ? '0 0 10px #d99a1655' : 'none',
                }}
                onClick={handleClaimChest}
              >
                <img
                  src="/assets/treasure_chest_gold.jpg"
                  alt="Golden Treasure Chest"
                  style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    borderRadius: '8px',
                    border: '2px solid #a8793d',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#352419',
                      marginBottom: '3px',
                    }}
                  >
                    {chestClaimed
                      ? 'Victory Chest Claimed! 🏆'
                      : allExercisesCompleted
                      ? 'Unlock Golden Treasure Chest! ✨'
                      : 'Daily Victory Chest'}
                  </strong>
                  <small style={{ display: 'block', fontSize: '12.5px', color: '#806443' }}>
                    {chestClaimed
                      ? '+300 Aura Claimed'
                      : allExercisesCompleted
                      ? 'Tap to claim +300 bonus Aura'
                      : 'Complete all exercises to open'}
                  </small>
                </div>
                <button
                  type="button"
                  className={`rpg-btn compact ${chestClaimed ? 'dark' : ''}`}
                  style={{
                    marginLeft: 'auto',
                    flexShrink: 0,
                    height: '34px',
                    minWidth: '92px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={handleClaimChest}
                >
                  {chestClaimed ? 'Claimed ✓' : allExercisesCompleted ? 'Open ✦' : 'Locked 🔒'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Training Direction Panel */}
        <section className="wood-panel week-challenges" style={{ marginTop: '14px' }}>
          <div className="panel-inner">
            <div className="panel-head">
              <div>
                <div className="eyebrow">Support all five fitness components</div>
                <h2>Weekly Direction</h2>
              </div>
              <span className="pill">{weekSessions} / 5 sessions</span>
            </div>
            <div className="week-direction-grid">
              <article>
                <span className="direction-icon">🏃</span>
                <b>Endurance</b>
                <p>Primary {className} focus · steady pacing and stamina.</p>
              </article>
              <article>
                <span className="direction-icon">🏋</span>
                <b>Strength</b>
                <p>Supporting work to maintain whole-body capacity.</p>
              </article>
              <article>
                <span className="direction-icon">🌿</span>
                <b>Mobility & balance</b>
                <p>Supporting work for movement quality and control.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <div id="toast" className="toast" role="status" aria-live="polite"></div>
      <footer className="footer">
        SĀDHANĀ · Adapt to the person. Challenge the person. Develop the person.
      </footer>
    </div>
  );
};

export default TodayWorkoutView;
