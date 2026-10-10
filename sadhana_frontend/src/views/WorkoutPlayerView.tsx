import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GameNavigationHeader } from '../components/GameNavigationHeader';
import { toggleCompleteExercise } from '../services/api';
import { gameAudio } from '../utils/gameAudio';
import type { WorkoutPlan, ExerciseItem } from '../types';

export const WorkoutPlayerView: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateXpAndLevel, completeQuest, isAuthenticated } = useApp();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const totalSets = 3;

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(40);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Victory feedback modal
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [feedbackDifficulty, setFeedbackDifficulty] = useState<string>('Just right');
  const [feedbackPain, setFeedbackPain] = useState<string>('no');
  const [feedbackDuration, setFeedbackDuration] = useState<number>(12);
  const [sessionAuraEarned, setSessionAuraEarned] = useState<number>(200);

  // Single-frame alternating GIF simulation (0.5s per image)
  const [poseFrame, setPoseFrame] = useState<0 | 1>(0);

  useEffect(() => {
    const loopInterval = setInterval(() => {
      setPoseFrame((prev) => (prev === 0 ? 1 : 0));
    }, 500); // 0.5s per image cadence
    return () => clearInterval(loopInterval);
  }, []);

  const userName = profile?.name ? profile.name.split(' ')[0] : (profile?.username || 'Warrior');
  const currentLvl = profile?.current_level || 4;
  const currentXp = profile?.current_xp || 6240;

  // Load active plan from session storage or fallback
  useEffect(() => {
    const cached = sessionStorage.getItem('sadhana_active_plan');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.exercises && parsed.exercises.length > 0) {
          setPlan(parsed);
          const idx = sessionStorage.getItem('sadhana_active_exercise_index');
          if (idx) {
            const num = parseInt(idx, 10);
            if (!isNaN(num) && num < parsed.exercises.length) {
              setCurrentIdx(num);
            }
          }
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default template matching training.html demo
    setPlan({
      id: 1,
      title: 'Cardio Foundations',
      class_slug: 'dhruva',
      is_ai_adapted: false,
      description: 'Build steady endurance with a short, adaptable bodyweight session.',
      duration_minutes: 15,
      target_equipment: 'Bodyweight',
      exercises: [
        {
          id: 1,
          name: 'Warm Up Dynamic Stretches',
          exercise_name: 'Warm Up Dynamic Stretches',
          sets_reps: '1 set × 2 min',
          duration_seconds: 120,
          xp_reward: 100,
          completed: true,
          instructions: 'Gentle arm swings, leg swings, and thoracic rotations to prime joints.',
        },
        {
          id: 2,
          name: 'Jumping Jacks',
          exercise_name: 'Jumping Jacks',
          sets_reps: '3 sets × 40 sec',
          duration_seconds: 40,
          xp_reward: 200,
          completed: false,
          instructions:
            'Stand tall with feet together. Jump feet apart while raising arms overhead. Return with controlled movement. Breathe steadily.',
        },
        {
          id: 3,
          name: 'High Knees Cadence',
          exercise_name: 'High Knees Cadence',
          sets_reps: '3 sets × 30 sec',
          duration_seconds: 30,
          xp_reward: 200,
          completed: false,
          instructions:
            'Drive knees alternately toward chest level with rhythmic footstrikes and upright posture.',
        },
      ],
    });
  }, []);

  const exercises = plan?.exercises || [];
  const currentEx = exercises[currentIdx] || {
    name: 'Jumping Jacks',
    exercise_name: 'Jumping Jacks',
    sets_reps: '3 sets × 40 sec',
    duration_seconds: 40,
    xp_reward: 200,
    instructions:
      'Stand tall with feet together. Jump feet apart while raising arms overhead. Return with controlled movement. Breathe steadily.',
  };

  // Reset timer on exercise switch
  useEffect(() => {
    const dur = currentEx.duration_seconds || 40;
    setTimerSeconds(dur);
    setIsTimerRunning(false);
    setCurrentSet(1);
  }, [currentIdx]);

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          gameAudio.playLevelUp();
          setIsTimerRunning(false);
          handleNextSet();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleNextSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet((s) => s + 1);
      setTimerSeconds(currentEx.duration_seconds || 40);
      setIsTimerRunning(false);
    } else {
      handleCompleteCurrentExercise();
    }
  };

  const handleCompleteCurrentExercise = () => {
    gameAudio.playXpGain();
    if (plan) {
      const updated = { ...plan };
      if (updated.exercises[currentIdx]) {
        updated.exercises[currentIdx].completed = true;
      }
      setPlan(updated);
      sessionStorage.setItem('sadhana_active_plan', JSON.stringify(updated));
    }

    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      // Completed all exercises -> Open victory feedback modal!
      gameAudio.playLevelUp();
      setSessionAuraEarned(200);
      setShowVictoryModal(true);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const openSai = (prompt?: string) => {
    gameAudio.playClick();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    window.dispatchEvent(new CustomEvent('open-sai-coach', { detail: { prompt } }));
  };

  const handleSaveFeedbackAndFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    gameAudio.playLevelUp();
    await completeQuest(sessionAuraEarned, 200);
    navigate('/home');
  };

  // Load simultaneous starting and ending pose images from the database
  const startPoseImg =
    currentEx.image_url_0 ||
    currentEx.exercise_details?.image_url_0 ||
    '/assets/jumping_jacks_start.jpg';
  const endPoseImg =
    currentEx.image_url_1 ||
    currentEx.exercise_details?.image_url_1 ||
    currentEx.image_url_0 ||
    currentEx.exercise_details?.image_url_0 ||
    '/assets/jumping_jacks_end.jpg';

  const exerciseInstructionsList = currentEx.instructions
    ? currentEx.instructions
        .split('.')
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        'Stand tall with feet together and arms by your sides.',
        'Jump feet apart while raising your arms overhead.',
        'Return to the starting position with controlled movement.',
        'Keep a comfortable pace and breathe steadily.',
      ];

  return (
    <div className="min-h-screen bg-[#24170f] text-[#352419]">
      <GameNavigationHeader />

      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Training grounds · Daily quest</div>
            <h1 className="page-title">Today's Training</h1>
            <p className="page-subtitle">
              Train with disciplined form. Every recorded repetition tunes your upcoming trajectory.
            </p>
          </div>
          <button className="rpg-btn dark" onClick={() => navigate('/today')}>
            ← Back to quests
          </button>
        </div>

        {/* Main Training Console Panel */}
        <section className="wood-panel">
          <div className="panel-inner">
            <div className="panel-head">
              <div>
                <span className="pill green">{currentEx.category || 'Cardio'}</span>{' '}
                <span className="pill">{currentEx.equipment || plan?.target_equipment || 'No equipment'}</span>
                <h2 style={{ fontSize: '27px', margin: '7px 0 0' }}>
                  {currentEx.exercise_name || currentEx.name}
                </h2>
                <small>
                  Exercise {currentIdx + 1} of {exercises.length || 3} · {totalSets} sets ×{' '}
                  {currentEx.sets_reps || '40 seconds'}
                </small>
              </div>
              <span className="pill">+{currentEx.xp_reward || 200} Aura on completion</span>
            </div>

            <div
              className="exercise-layout"
              style={{
                display: 'grid',
                gridTemplateColumns: '210px minmax(0, 1fr)',
                gap: '14px',
                alignItems: 'start',
              }}
            >
              {/* Steps Aside List */}
              <aside
                className="steps"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                }}
              >
                {exercises.map((ex, idx) => {
                  const isDone = ex.completed && idx < currentIdx;
                  const isActive = idx === currentIdx;
                  return (
                    <div
                      key={idx}
                      className={`step ${isDone ? 'done' : isActive ? 'active' : ''}`}
                      onClick={() => {
                        gameAudio.playClick();
                        setCurrentIdx(idx);
                      }}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        background: isActive ? '#ffe3a1' : isDone ? '#eaf4e6' : '#fff0cf',
                        border: `2px solid ${isActive ? '#e0a02c' : isDone ? '#8da87c' : '#a8793d'}`,
                        borderRadius: '7px',
                        boxShadow: isActive ? '0 0 0 2px #fff1c6' : 'none',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <span
                        className="num"
                        style={{
                          width: '30px',
                          height: '30px',
                          minWidth: '30px',
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          background: isDone ? '#23755e' : isActive ? '#b97a22' : '#4a3927',
                          color: '#fff0cf',
                          fontWeight: 900,
                          fontSize: '12px',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {isActive ? <b>{ex.exercise_name || ex.name}</b> : ex.exercise_name || ex.name}
                      </span>
                    </div>
                  );
                })}
              </aside>

              {/* Main Pose Figures & Timer Card */}
              <div
                className="exercise-main"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 165px',
                  gap: '14px',
                  alignItems: 'stretch',
                }}
              >
                <div
                  className="exercise-poses"
                  style={{ display: 'flex', width: '100%', height: '100%' }}
                >
                  <figure
                    className="pose"
                    style={{
                      width: '100%',
                      background: '#fff9eb',
                      border: '2px solid #a7753b',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 5px rgba(30, 20, 10, 0.08)',
                      position: 'relative',
                    }}
                  >
                    {/* Frame container holding both images for smooth 0.5s GIF looping */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '240px',
                        background: '#f1e2c9',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={startPoseImg}
                        alt={`${currentEx.exercise_name || currentEx.name} Starting Pose`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: poseFrame === 0 ? 'block' : 'none',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/jumping_jacks_start.jpg';
                        }}
                      />
                      <img
                        src={endPoseImg}
                        alt={currentEx.exercise_name || currentEx.name}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: poseFrame === 1 ? 'block' : 'none',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/jumping_jacks_end.jpg';
                        }}
                      />
                    </div>
                  </figure>
                </div>

                {/* Right Timer Card with perfectly sized, uniform buttons */}
                <div
                  className="timer-card"
                  style={{
                    background: '#291b11',
                    color: '#fff0cf',
                    border: '3px solid #b47c38',
                    borderRadius: '8px',
                    padding: '14px 12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(20, 10, 5, 0.35)',
                  }}
                >
                  <div
                    className="timer-ring"
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      border: '7px solid #d7a94c',
                      boxShadow: 'inset 0 0 0 4px #4a3522',
                      display: 'grid',
                      placeContent: 'center',
                      margin: '0 auto 4px',
                      font: '900 24px Arial, sans-serif',
                    }}
                  >
                    <span id="timer">{formatTimer(timerSeconds)}</span>
                    <small id="round" style={{ fontSize: '11px', color: '#ffd27d' }}>
                      Set {currentSet} / {totalSets}
                    </small>
                  </div>

                  {!isTimerRunning ? (
                    <button
                      id="timerStart"
                      className="rpg-btn"
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        fontSize: '13px',
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() => {
                        gameAudio.playClick();
                        setIsTimerRunning(true);
                      }}
                    >
                      ▶ Start
                    </button>
                  ) : (
                    <button
                      id="timerPause"
                      className="rpg-btn red"
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        fontSize: '13px',
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() => {
                        gameAudio.playClick();
                        setIsTimerRunning(false);
                      }}
                    >
                      Ⅱ Pause
                    </button>
                  )}
                  <button
                    id="timerNextSet"
                    className="rpg-btn dark"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      fontSize: '13px',
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => {
                      gameAudio.playClick();
                      handleNextSet();
                    }}
                  >
                    Set Done ✓
                  </button>
                  <button
                    id="finishWorkout"
                    className="rpg-btn"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 10px',
                      fontSize: '12px',
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => setShowVictoryModal(true)}
                  >
                    Finish workout ✓
                  </button>
                </div>
              </div>
            </div>

            {/* Lower row: Instructions + sAI Coach panel */}
            <div className="two-col" style={{ marginTop: '14px', gap: '14px' }}>
              <div
                style={{
                  background: '#fffaf0',
                  border: '1px solid #d9bc84',
                  borderRadius: '8px',
                  padding: '14px 16px',
                }}
              >
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#382317' }}>Instructions</h3>
                <ol
                  className="instructions"
                  style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: '#563e2a',
                    lineHeight: 1.5,
                  }}
                >
                  {exerciseInstructionsList.map((inst, i) => (
                    <li key={i} style={{ marginBottom: '5px' }}>
                      {inst}.
                    </li>
                  ))}
                </ol>
              </div>
              <div
                className="coach-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: '#fff4d9',
                  border: '1px solid #d9bc84',
                  padding: '12px 16px',
                  borderRadius: '8px',
                }}
              >
                <img
                  src="/assets/sai_robot_in_its_idle_pose.webp"
                  alt="sAI fitness coach"
                  style={{
                    width: '76px',
                    height: '82px',
                    objectFit: 'contain',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => openSai()}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b
                    style={{
                      fontSize: '15px',
                      color: '#382317',
                      display: 'block',
                      marginBottom: '3px',
                    }}
                  >
                    sAI Coach
                  </b>
                  <p
                    className="small"
                    style={{ margin: 0, color: '#684d34', fontSize: '12.5px', lineHeight: 1.45 }}
                  >
                    Keep your movement controlled. If you experience pain, stop and adjust rather than
                    pushing through it.
                  </p>
                  <div
                    className="choice-row"
                    style={{ display: 'flex', gap: '10px', marginTop: '10px' }}
                  >
                    <button
                      className="rpg-btn dark"
                      type="button"
                      style={{
                        height: '34px',
                        minWidth: '100px',
                        padding: '0 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() =>
                        openSai('This workout feels too difficult. Help me adjust safely.')
                      }
                    >
                      Too difficult?
                    </button>
                    <button
                      className="rpg-btn dark"
                      type="button"
                      style={{
                        height: '34px',
                        minWidth: '100px',
                        padding: '0 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() => openSai('Help me record feedback about this workout.')}
                    >
                      Give feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className="small" style={{ color: '#d6bd92', margin: '12px 4px' }}>
          Safety note: use an appropriate space and pace. This prototype is not medical advice; stop
          if you experience concerning pain or symptoms.
        </p>
      </main>

      {/* Completion & Feedback Modal (feedback.html) */}
      {showVictoryModal && (
        <div
          id="completionModal"
          className="modal-backdrop show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completionTitle"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(18, 11, 11, 0.88)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '18px',
          }}
        >
          <div
            className="completion-modal"
            style={{
              width: 'min(500px, 100%)',
              border: '4px solid #a76f2c',
              borderRadius: '10px',
              background: '#fff0cf',
              padding: '7px',
              boxShadow: '0 0 0 3px #2b190d, 0 20px 70px rgba(0,0,0,0.7)',
              animation: 'pop .24s ease-out',
            }}
          >
            <div
              className="completion-inner"
              style={{
                textAlign: 'center',
                border: '2px solid #d2a158',
                borderRadius: '5px',
                padding: '22px',
                background: 'linear-gradient(#fff1d2, #e9c68b)',
                color: '#382317',
              }}
            >
              <img
                src="/assets/quest_complete_scene.jpg"
                alt="Sādhanā adventurer celebrating victory"
                style={{
                  width: '100%',
                  maxHeight: '140px',
                  objectFit: 'cover',
                  borderRadius: '5px',
                  border: '2px solid #a56a2c',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
              <h2
                id="completionTitle"
                style={{
                  fontSize: '27px',
                  margin: '12px 0 4px',
                  color: '#2c180d',
                  fontFamily: 'Georgia, serif',
                  fontWeight: 900,
                }}
              >
                Quest Complete!
              </h2>
              <p
                id="completionMessage"
                style={{
                  margin: '0 0 10px',
                  color: '#523824',
                  fontSize: '14px',
                  lineHeight: 1.45,
                }}
              >
                Well done, {userName}! Your training effort has been inscribed into your journey.
              </p>
              <div
                id="completionXp"
                className="xp-award"
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#a45c13',
                  margin: '10px 0 14px',
                  textShadow: '0 1px 0 #ffe0a3',
                }}
              >
                +{sessionAuraEarned} Aura
              </div>

              {/* Quick Session Feedback */}
              <form
                onSubmit={handleSaveFeedbackAndFinish}
                style={{ margin: '14px 0 0', textAlign: 'left' }}
              >
                <div className="field" style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#382317',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    How did the session feel?
                  </label>
                  <div
                    className="choice-row"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}
                  >
                    {['Too easy', 'Just right', 'Too difficult'].map((d) => (
                      <label
                        key={d}
                        className="choice"
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          border: `1.5px solid ${feedbackDifficulty === d ? '#8b4d1f' : '#b88b4a'}`,
                          background: feedbackDifficulty === d ? '#ffeed0' : '#fff6e2',
                          borderRadius: '5px',
                          fontSize: '13px',
                          color: '#352419',
                          fontWeight: 700,
                        }}
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          value={d}
                          checked={feedbackDifficulty === d}
                          onChange={() => setFeedbackDifficulty(d)}
                          style={{ accentColor: '#8b4d1f', cursor: 'pointer' }}
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#382317',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Any concerning pain or discomfort?
                  </label>
                  <div
                    className="choice-row"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}
                  >
                    <label
                      className="choice"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        border: `1.5px solid ${feedbackPain === 'no' ? '#8b4d1f' : '#b88b4a'}`,
                        background: feedbackPain === 'no' ? '#ffeed0' : '#fff6e2',
                        borderRadius: '5px',
                        fontSize: '13px',
                        color: '#352419',
                        fontWeight: 700,
                      }}
                    >
                      <input
                        type="radio"
                        name="pain"
                        value="no"
                        checked={feedbackPain === 'no'}
                        onChange={() => setFeedbackPain('no')}
                        style={{ accentColor: '#8b4d1f', cursor: 'pointer' }}
                      />
                      <span>No</span>
                    </label>
                    <label
                      className="choice"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        border: `1.5px solid ${feedbackPain === 'yes' ? '#8b4d1f' : '#b88b4a'}`,
                        background: feedbackPain === 'yes' ? '#ffeed0' : '#fff6e2',
                        borderRadius: '5px',
                        fontSize: '13px',
                        color: '#352419',
                        fontWeight: 700,
                      }}
                    >
                      <input
                        type="radio"
                        name="pain"
                        value="yes"
                        checked={feedbackPain === 'yes'}
                        onChange={() => setFeedbackPain('yes')}
                        style={{ accentColor: '#8b4d1f', cursor: 'pointer' }}
                      />
                      <span>Yes — adjust next time</span>
                    </label>
                  </div>
                </div>

                <div
                  className="modal-actions"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginTop: '16px',
                  }}
                >
                  <button type="submit" className="rpg-btn" style={{ minWidth: '160px' }}>
                    Continue journey →
                  </button>
                  <button
                    type="button"
                    className="rpg-btn dark"
                    style={{ minWidth: '140px' }}
                    onClick={async () => {
                      gameAudio.playLevelUp();
                      await completeQuest(sessionAuraEarned, 200);
                      navigate('/progress');
                    }}
                  >
                    View progress
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        SĀDHANĀ · Adapt to the person. Challenge the person. Develop the person.
      </footer>
    </div>
  );
};

export default WorkoutPlayerView;
