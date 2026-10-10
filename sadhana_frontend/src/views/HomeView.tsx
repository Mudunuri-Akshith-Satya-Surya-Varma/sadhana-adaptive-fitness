import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout } = useApp();

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authStatus, setAuthStatus] = useState<{ message: string; isError: boolean } | null>(null);

  // SAI mascot pose cycling
  const [saiPoseIndex, setSaiPoseIndex] = useState(0);
  const saiCaptions = [
    'Ready when you are.',
    'A little wave to say hello.',
    'Every small win counts.',
    'Take a moment to move well.',
    "Thinking through today's plan.",
    "You've got this.",
    'Building strength, one rep at a time.',
    'Rest is part of progress.',
  ];

  // SAI mascot pose - normal standing pose only
  const saiPose = '/assets/sai_robot_in_its_idle_pose.webp';

  useEffect(() => {
    const timer = setInterval(() => {
      setSaiPoseIndex((prev) => (prev + 1) % 8);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  // 3D Class Flip Card states
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({
    sthira: false,
    vistara: false,
    yodha: false,
    dhruva: false,
    samanvaya: false,
  });

  const toggleFlip = (cardKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedCards((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate('/today');
    } else {
      navigate('/register');
    }
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    if (isAuthenticated) {
      navigate('/today');
      return;
    }
    setAuthMode(mode);
    setAuthStatus(null);
    setAuthModalOpen(true);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register' && !authName.trim()) {
      setAuthStatus({ message: 'Please enter your name.', isError: true });
      return;
    }
    if (!authEmail.trim()) {
      setAuthStatus({ message: 'Please enter your email.', isError: true });
      return;
    }
    if (authPassword.length < 6) {
      setAuthStatus({ message: 'Password must be at least 6 characters.', isError: true });
      return;
    }
    // Navigate to respective auth route with query
    if (authMode === 'register') {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  const activeUserName = profile?.name || profile?.username || 'NEW ADVENTURER';
  const activeClass = profile?.archetype || 'UNDISCOVERED';
  const activeLevel = profile?.level || 1;
  const activeAura = profile?.aura_score || 120;
  const activeStreak = profile?.streak || 1;

  return (
    <div className="w-full text-[#352419] bg-[#FFFBF2]">
      {/* Sādhanā RPG Command-Bar Header */}
      <header className="site-header rpg-header">
        <nav aria-label="Main navigation" className="nav wrap">
          <a aria-label="Sādhanā home" className="brand" href="#home">
            <img
              alt="Sādhanā mascot"
              src="/assets/sai_logo.png"
            />
            <span>
              <span className="brand-name">SĀDHANĀ</span>
              <span className="brand-sub">FITNESS, YOUR WAY</span>
            </span>
          </a>

          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="navLinks">
            <a href="#why" onClick={() => setMobileMenuOpen(false)}>Why Sādhanā</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>What you get</a>
            <a href="#classes" onClick={() => setMobileMenuOpen(false)}>Classes</a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            {isAuthenticated ? (
              <a href="/today" className="text-[#F1D58A] font-black">Quest Journal →</a>
            ) : null}
          </div>

          {isAuthenticated ? (
            <button
              className="btn nav-cta"
              type="button"
              onClick={() => navigate('/today')}
            >
              Today's Quest <span className="arrow">→</span>
            </button>
          ) : (
            <button
              className="btn nav-cta"
              type="button"
              onClick={() => handleOpenAuthModal('register')}
            >
              Get started <span className="arrow">→</span>
            </button>
          )}

          <button
            aria-controls="navLinks"
            aria-expanded={mobileMenuOpen}
            aria-label="Open navigation menu"
            className="menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </nav>
      </header>

      <main>
        {/* RPG Hero Section */}
        <section className="hero rpg-hero" id="home">
          <div className="wrap">
            <div className="rpg-intro">
              <div className="rpg-intro-copy">
                <div className="eyebrow">
                  <span className="eyebrow-dot"></span>SĀDHANĀ RPG · YOUR FITNESS ADVENTURE
                </div>
                <h1>
                  Your real life.<br />
                  <span className="headline-accent">Your next level.</span>
                </h1>
                <p className="hero-copy">
                  Meet Sādhanā: the adaptive AI fitness companion that turns your real-world effort
                  into quests, class progression, and visible growth. Start where you are. Let SAI shape the next step.
                </p>
                <div className="hero-actions">
                  <button className="btn" type="button" onClick={handleStartJourney}>
                    {isAuthenticated ? "Enter Sanctuary" : "Start your journey"} <span className="arrow">→</span>
                  </button>
                  <a className="btn btn-quiet" href="#classes">
                    Choose your class <span className="arrow">↓</span>
                  </a>
                </div>
              </div>

              <div className="rpg-intro-status" aria-label="Sādhanā game status">
                <div className="rpg-status-line">
                  <span className="status-led"></span>
                  <span>SAI SYSTEM ONLINE</span>
                  <span className="status-version">V.01</span>
                </div>
                <div className="rpg-intro-stat">
                  <span>YOUR JOURNEY</span>
                  <strong>{isAuthenticated ? `DAY ${activeStreak} · ACTIVE` : 'STARTS HERE'}</strong>
                </div>
                <div className="rpg-mini-progress">
                  <span style={{ width: isAuthenticated ? '45%' : '18%' }}></span>
                </div>
                <div className="rpg-intro-foot">
                  <span>01 · DISCOVER</span>
                  <span>02 · TRAIN</span>
                  <span>03 · EVOLVE</span>
                </div>
              </div>
            </div>

            {/* RPG Console Display */}
            <div className="rpg-console" aria-label="Sādhanā RPG interface preview">
              <div className="rpg-console-topbar">
                <div className="rpg-console-brand">
                  <span className="rpg-brand-gem">✦</span>
                  <span>SĀDHANĀ <small>ADAPTIVE FITNESS RPG</small></span>
                </div>
                <div className="rpg-top-hud">
                  <span><i className="hud-square"></i> {activeUserName.toUpperCase()}</span>
                  <span><i className="hud-square gold"></i> DAY {activeStreak.toString().padStart(2, '0')}</span>
                  <span className="hud-online"><i></i> ONLINE</span>
                </div>
              </div>

              <div className="rpg-interface-grid">
                {/* Panel 1: World Field View */}
                <section className="rpg-panel rpg-world-panel" aria-label="Training Grove quest scene">
                  <div className="rpg-panel-heading">
                    <span><b className="panel-caret">▶</b> FIELD VIEW / 01</span>
                    <span className="panel-code">TRAINING GROVE</span>
                  </div>
                  <div className="rpg-world-scene">
                    <div className="world-sun"></div>
                    <div className="world-cloud cloud-one"></div>
                    <div className="world-cloud cloud-two"></div>
                    <div className="world-mountain mountain-back"></div>
                    <div className="world-mountain mountain-mid"></div>
                    <div className="world-mountain mountain-front"></div>
                    <div className="world-ground"></div>
                    <div className="world-ground-line"></div>
                    <div className="world-location-chip">
                      <span>ZONE 01</span>
                      <strong>THE TRAINING GROVE</strong>
                    </div>
                    <div className="world-online-chip">
                      <span className="status-led"></span> SAI COMPANION READY
                    </div>

                    <div className="rpg-mascot-stage">
                      <div
                        aria-label="Sādhanā written in multiple Indian languages around SAI"
                        className="sai-orbit-scene"
                      >
                        <svg
                          aria-label="Sādhanā written around the mascot in English, Hindi, Telugu, Tamil, Malayalam, Kannada and Bengali"
                          className="sai-mantra-orbit"
                          role="img"
                          viewBox="0 0 520 520"
                        >
                          <defs>
                            <path d="M260 35 A225 225 0 1 1 259.9 35" id="saiOuterTextPathHome"></path>
                            <path d="M260 75 A185 185 0 1 0 260.1 75" id="saiInnerTextPathHome"></path>
                          </defs>
                          <circle className="orbit-guide orbit-guide-outer" cx="260" cy="260" r="225"></circle>
                          <circle className="orbit-guide orbit-guide-inner" cx="260" cy="260" r="198"></circle>
                          <g className="sai-ring-rotate sai-ring-outer">
                            <text className="sai-orbit-text sai-orbit-text-outer">
                              <textPath href="#saiOuterTextPathHome" lengthAdjust="spacing" startOffset="0%" textLength="1400">
                                SĀDHANĀ • साधना • సాధన • சாதனா • സാധന • ಸಾಧನಾ • সাধনা • SĀDHANĀ • साधना • సాధన • சாதனா • സാധന • ಸಾಧನಾ • সাধনা • SĀDHANĀ • साधना • సాధన • சாதனா • സാധന • ಸಾಧನಾ • সাধনা •
                              </textPath>
                            </text>
                          </g>
                          <g className="sai-ring-rotate sai-ring-inner">
                            <text className="sai-orbit-text sai-orbit-text-inner">
                              <textPath href="#saiInnerTextPathHome" lengthAdjust="spacing" startOffset="0%" textLength="1155">
                                साधना • SĀDHANĀ • సాధన • சாதனா • സാധന • ಸಾಧನಾ • SĀDHANĀ • साधना • సాధన • சாதனா • സാധന • ಸಾಧನಾ •
                              </textPath>
                            </text>
                          </g>
                          <circle className="orbit-dot" cx="260" cy="30" r="3.5"></circle>
                          <circle className="orbit-dot" cx="490" cy="260" r="3.5"></circle>
                          <circle className="orbit-dot" cx="260" cy="490" r="3.5"></circle>
                          <circle className="orbit-dot" cx="30" cy="260" r="3.5"></circle>
                        </svg>

                        <div aria-label="SAI mascot animation" className="sai-animation">
                          <img
                            alt="SAI robot mascot"
                            className="sai-pose active"
                            draggable="false"
                            src={saiPose}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="world-coordinates">N 01° · PROGRESS PATH UNLOCKED</div>
                  </div>

                  <div className="rpg-dialogue-box">
                    <div className="dialogue-avatar">SAI</div>
                    <div className="dialogue-copy">
                      <div className="dialogue-name">
                        SAI <span>· YOUR FITNESS COMPANION</span>
                      </div>
                      <p>{saiCaptions[saiPoseIndex]}</p>
                    </div>
                    <div className="dialogue-spark">✦</div>
                  </div>

                  <div className="rpg-game-actions">
                    <button className="game-action-primary" type="button" onClick={handleStartJourney}>
                      <span>▶</span> BEGIN FIRST QUEST
                    </button>
                    <a className="game-action-secondary" href="#how">
                      <span>▤</span> HOW TO PLAY
                    </a>
                  </div>
                </section>

                {/* Panel 2: Quest Log */}
                <section className="rpg-panel rpg-quest-panel" aria-label="Quest log">
                  <div className="rpg-panel-heading">
                    <span><b className="panel-caret">▶</b> QUEST LOG</span>
                    <span className="panel-count">03 ACTIVE</span>
                  </div>
                  <div className="rpg-quest-feature">
                    <div className="quest-meta">
                      <span className="quest-ribbon">MAIN QUEST</span>
                      <span className="quest-difficulty">✦ STARTER</span>
                    </div>
                    <h2>The First Step</h2>
                    <p>
                      Tell SAI about your goals, routine, available time, and experience. Your path begins with you.
                    </p>
                    <div className="quest-progress-row">
                      <span>OBJECTIVE PROGRESS</span>
                      <strong>{isAuthenticated ? '1 / 1 COMPLETED' : '0 / 1'}</strong>
                    </div>
                    <div className="quest-progress">
                      <span style={{ width: isAuthenticated ? '100%' : '15%' }}></span>
                    </div>
                    <div className="quest-reward-row">
                      <span>REWARD</span>
                      <strong><b>✦</b> +50 AURA</strong>
                    </div>
                  </div>
                  <div className="rpg-side-quest">
                    <div className="side-quest-icon">↗</div>
                    <div>
                      <span className="side-quest-kind">DAILY QUEST</span>
                      <strong>Move for 10 minutes</strong>
                      <small>A small win still counts.</small>
                    </div>
                    <span className="quest-xp">+15 XP</span>
                  </div>
                  <div className="rpg-side-quest">
                    <div className="side-quest-icon blue">⌁</div>
                    <div>
                      <span className="side-quest-kind">WEEKLY QUEST</span>
                      <strong>Build your consistency</strong>
                      <small>Complete 3 training sessions.</small>
                    </div>
                    <span className="quest-xp blue">+60 XP</span>
                  </div>
                  <button className="quest-log-cta" type="button" onClick={handleStartJourney}>
                    ACCEPT MAIN QUEST <span>→</span>
                  </button>
                </section>

                {/* Panel 3: Discipline Party */}
                <section className="rpg-panel rpg-party-panel" aria-label="Choose a fitness class">
                  <div className="rpg-panel-heading">
                    <span><b className="panel-caret">▶</b> DISCIPLINE PARTY</span>
                    <span className="panel-code">CHOOSE YOUR PATH</span>
                  </div>
                  <p className="party-intro">
                    Five disciplines. One balanced fitness journey. Your class guides your focus — it never limits your growth.
                  </p>
                  <div className="rpg-class-roster">
                    <a href="#classes" className="roster-class roster-sthira">
                      <span className="roster-sigil">S</span>
                      <span><strong>STHIRA</strong><small>Balance</small></span>
                    </a>
                    <a href="#classes" className="roster-class roster-vistara">
                      <span className="roster-sigil">V</span>
                      <span><strong>VISTĀRA</strong><small>Flexibility</small></span>
                    </a>
                    <a href="#classes" className="roster-class roster-yodha">
                      <span className="roster-sigil">Y</span>
                      <span><strong>YODHA</strong><small>Strength</small></span>
                    </a>
                    <a href="#classes" className="roster-class roster-dhruva">
                      <span className="roster-sigil">D</span>
                      <span><strong>DHRUVA</strong><small>Cardio & endurance</small></span>
                    </a>
                    <a href="#classes" className="roster-class roster-samanvaya">
                      <span className="roster-sigil">Sa</span>
                      <span><strong>SAMANVAYA</strong><small>Coordination</small></span>
                    </a>
                  </div>
                </section>

                {/* Panel 4: Player Status */}
                <section className="rpg-panel rpg-character-panel" aria-label="Player status and fitness attributes">
                  <div className="rpg-panel-heading">
                    <span><b className="panel-caret">▶</b> PLAYER STATUS</span>
                    <span className="panel-count">{isAuthenticated ? 'STATUS: ACTIVE' : 'PROFILE: NEW'}</span>
                  </div>
                  <div className="player-card-head">
                    <div className="player-emblem">✦</div>
                    <div className="player-name-wrap">
                      <strong>{activeUserName}</strong>
                      <span>CLASS <b>{activeClass.toUpperCase()}</b></span>
                    </div>
                    <div className="player-level">
                      <small>LVL</small>
                      <strong>{activeLevel.toString().padStart(2, '0')}</strong>
                    </div>
                  </div>
                  <div className="player-xp-label">
                    <span>EXPERIENCE</span>
                    <strong>{profile?.xp || 20} / 100 XP</strong>
                  </div>
                  <div className="player-xp-bar">
                    <span style={{ width: `${Math.min(100, profile?.xp || 20)}%` }}></span>
                  </div>
                  <div className="attribute-heading">
                    TRAINING ATTRIBUTES <span>ADAPTIVE</span>
                  </div>
                  <div className="attribute-list">
                    <div className="attribute-row">
                      <span className="attribute-label">STR <small>Strength</small></span>
                      <span className="attribute-track"><i style={{ width: '45%' }}></i></span>
                      <b>45</b>
                    </div>
                    <div className="attribute-row">
                      <span className="attribute-label">END <small>Endurance</small></span>
                      <span className="attribute-track blue"><i style={{ width: '55%' }}></i></span>
                      <b>55</b>
                    </div>
                    <div className="attribute-row">
                      <span className="attribute-label">MOB <small>Mobility</small></span>
                      <span className="attribute-track gold"><i style={{ width: '40%' }}></i></span>
                      <b>40</b>
                    </div>
                    <div className="attribute-row">
                      <span className="attribute-label">BAL <small>Balance</small></span>
                      <span className="attribute-track green"><i style={{ width: '50%' }}></i></span>
                      <b>50</b>
                    </div>
                  </div>
                  <div className="equipment-strip">
                    <span className="equipment-title">LOADOUT</span>
                    <span className="equipment-chip">◷ FLEXIBLE TIME</span>
                    <span className="equipment-chip">✦ SAI COACH</span>
                    <span className="equipment-chip">◇ YOUR GEAR</span>
                  </div>
                </section>
              </div>

              <div className="rpg-console-footer">
                <span><i className="status-led"></i> QUEST SYSTEM READY</span>
                <span>ADAPT TO LIFE · CHALLENGE YOURSELF · GROW</span>
                <button type="button" onClick={handleStartJourney}>
                  {isAuthenticated ? "TODAY'S QUEST" : "START GAME"} <b>↗</b>
                </button>
              </div>
            </div>

            <div className="rpg-under-note">
              <span>✦</span> Real training powers your RPG progression. Every quest reflects effort in the real world.
            </div>
          </div>
        </section>

        {/* Section: The Problem */}
        <section className="problem" id="why">
          <div className="wrap">
            <div className="section-head">
              <div className="section-kicker">The problem, simply</div>
              <h2>Fitness plans often expect life to stand still.</h2>
              <p>
                But your time, energy, experience and equipment can change from one day to the next.
                A rigid plan can turn one missed workout into a reason to give up.
              </p>
            </div>
            <div className="problem-grid">
              <article className="problem-card">
                <div className="problem-icon">◷</div>
                <h3>Life gets in the way</h3>
                <p>Busy days and changing schedules make fixed workout routines difficult to follow.</p>
              </article>
              <article className="problem-card">
                <div className="problem-icon">◎</div>
                <h3>One plan doesn't fit everyone</h3>
                <p>People have different goals, fitness levels, preferences and equipment available.</p>
              </article>
              <article className="problem-card">
                <div className="problem-icon">↗</div>
                <h3>Progress can feel invisible</h3>
                <p>Without meaningful feedback and milestones, it is harder to stay motivated over time.</p>
              </article>
            </div>
            <div className="problem-answer">
              Sādhanā's answer: <span>adapt the training to your life — and keep your growth moving.</span>
            </div>
          </div>
        </section>

        {/* Section: Features */}
        <section className="features" id="features">
          <div className="wrap features-layout">
            <div className="features-intro">
              <div className="section-kicker">More than a workout tracker</div>
              <h2>Your fitness journey, with a little more meaning.</h2>
              <p>
                Sādhanā combines smart training with a class-based progression journey, so your
                workouts feel personal and your effort adds up to something visible.
              </p>
              <button className="btn" type="button" onClick={handleStartJourney}>
                Find your starting point <span className="arrow">→</span>
              </button>
            </div>
            <div className="feature-list">
              <article className="feature-card">
                <div className="feature-symbol">✳</div>
                <h3>AI fitness coach</h3>
                <p>
                  Ask for guidance, explain what changed today, and get training suggestions shaped by your
                  goals and recent performance.
                </p>
                <a className="text-link" href="#coach">Meet your coach <span>→</span></a>
              </article>
              <article className="feature-card">
                <div className="feature-symbol">↻</div>
                <h3>Adaptive workouts</h3>
                <p>
                  Short on time or missing equipment? Your session can adjust to today's circumstances without
                  losing sight of your training direction.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-symbol">⬡</div>
                <h3>RPG-style progression</h3>
                <p>
                  Build levels, complete quests and unlock milestones through real workouts, consistency and
                  improvements — not just tapping buttons.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-symbol">◈</div>
                <h3>Your own fitness class</h3>
                <p>
                  Discover a training direction that matches your current capabilities and goals, with
                  supporting work for a more balanced foundation.
                </p>
                <a className="text-link" href="#classes">Explore the classes <span>→</span></a>
              </article>
            </div>
          </div>
        </section>

        {/* Section: Classes with 3D Click-to-Flip Cards */}
        <section className="classes" id="classes">
          <div className="wrap">
            <div className="section-head">
              <div className="section-kicker">Find your discipline</div>
              <h2>Five classes. One personal journey.</h2>
              <p>Tap any class card to turn it over and explore its focus, benefits and suggested practice.</p>
            </div>

            <div className="class-grid">
              {/* Sthira */}
              <article className={`class-card visual-class sthira ${flippedCards.sthira ? 'is-flipped' : ''}`} aria-label="Sthira fitness class">
                <button
                  className="class-flip-target"
                  type="button"
                  aria-pressed={flippedCards.sthira}
                  aria-label="Show Sthira class details"
                  onClick={() => toggleFlip('sthira')}
                >
                  <span className="flip-inner">
                    <span className="flip-face flip-front">
                      <img src="/assets/card_sthira_front.jpg" alt="Sthira class front artwork" draggable="false" />
                    </span>
                    <span className="flip-face flip-back">
                      <img src="/assets/card_sthira_back.jpg" alt="Sthira class explanation and training focus" draggable="false" />
                    </span>
                  </span>
                </button>
              </article>

              {/* Vistara */}
              <article className={`class-card visual-class vistara ${flippedCards.vistara ? 'is-flipped' : ''}`} aria-label="Vistāra fitness class">
                <button
                  className="class-flip-target"
                  type="button"
                  aria-pressed={flippedCards.vistara}
                  aria-label="Show Vistāra class details"
                  onClick={() => toggleFlip('vistara')}
                >
                  <span className="flip-inner">
                    <span className="flip-face flip-front">
                      <img src="/assets/card_vistara_front.jpg" alt="Vistāra class front artwork" draggable="false" />
                    </span>
                    <span className="flip-face flip-back">
                      <img src="/assets/card_vistara_back.jpg" alt="Vistāra class explanation and training focus" draggable="false" />
                    </span>
                  </span>
                </button>
              </article>

              {/* Yodha */}
              <article className={`class-card visual-class yodha ${flippedCards.yodha ? 'is-flipped' : ''}`} aria-label="Yodha fitness class">
                <button
                  className="class-flip-target"
                  type="button"
                  aria-pressed={flippedCards.yodha}
                  aria-label="Show Yodha class details"
                  onClick={() => toggleFlip('yodha')}
                >
                  <span className="flip-inner">
                    <span className="flip-face flip-front">
                      <img src="/assets/card_yodha_front.jpg" alt="Yodha class front artwork" draggable="false" />
                    </span>
                    <span className="flip-face flip-back">
                      <img src="/assets/card_yodha_back.jpg" alt="Yodha class explanation and training focus" draggable="false" />
                    </span>
                  </span>
                </button>
              </article>

              {/* Dhruva */}
              <article className={`class-card visual-class dhruva ${flippedCards.dhruva ? 'is-flipped' : ''}`} aria-label="Dhruva fitness class">
                <button
                  className="class-flip-target"
                  type="button"
                  aria-pressed={flippedCards.dhruva}
                  aria-label="Show Dhruva class details"
                  onClick={() => toggleFlip('dhruva')}
                >
                  <span className="flip-inner">
                    <span className="flip-face flip-front">
                      <img src="/assets/card_dhruva_front.jpg" alt="Dhruva class front artwork" draggable="false" />
                    </span>
                    <span className="flip-face flip-back">
                      <img src="/assets/card_dhruva_back.jpg" alt="Dhruva class explanation and training focus" draggable="false" />
                    </span>
                  </span>
                </button>
              </article>

              {/* Samanvaya */}
              <article className={`class-card visual-class samanvaya ${flippedCards.samanvaya ? 'is-flipped' : ''}`} aria-label="Samanvaya fitness class">
                <button
                  className="class-flip-target"
                  type="button"
                  aria-pressed={flippedCards.samanvaya}
                  aria-label="Show Samanvaya class details"
                  onClick={() => toggleFlip('samanvaya')}
                >
                  <span className="flip-inner">
                    <span className="flip-face flip-front">
                      <img src="/assets/card_samanvaya_front.jpg" alt="Samanvaya class front artwork" draggable="false" />
                    </span>
                    <span className="flip-face flip-back">
                      <img src="/assets/card_samanvaya_back.jpg" alt="Samanvaya class explanation and training focus" draggable="false" />
                    </span>
                  </span>
                </button>
              </article>
            </div>

            <p className="class-note">
              <strong>Your class is your focus, not your limit.</strong> Every class supports the five foundations of fitness.
            </p>
          </div>
        </section>

        {/* Section: How It Works */}
        <section className="how" id="how">
          <div className="wrap">
            <div className="section-head">
              <div className="section-kicker">A simple loop that grows with you</div>
              <h2>Understand. Adapt. Progress.</h2>
              <p>Your fitness journey should respond to what actually happens — not just what a calendar predicted.</p>
            </div>
            <div className="steps">
              <article className="step">
                <div className="step-num">01</div>
                <h3>Understand you</h3>
                <p>
                  Share your goals, experience, schedule, preferences and available equipment to establish a suitable training direction.
                </p>
                <span className="step-arrow">→</span>
              </article>
              <article className="step">
                <div className="step-num">02</div>
                <h3>Adapt today's workout</h3>
                <p>
                  Your daily session takes your time, recent training and feedback into account, with difficulty adjusted to the situation.
                </p>
                <span className="step-arrow">→</span>
              </article>
              <article className="step">
                <div className="step-num">03</div>
                <h3>Make progress visible</h3>
                <p>
                  Track performance, build consistency, earn progress and take on new class challenges as you develop.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Section: AI Coach Simulation */}
        <section className="coach" id="coach">
          <div className="wrap">
            <div className="coach-panel">
              <div className="coach-copy">
                <div className="section-kicker">A coach that listens</div>
                <h2>Real life changed the plan? Let's work with that.</h2>
                <p>
                  Tell your Sādhanā coach what is different today. It uses your training context to help reshape
                  the workout, rather than handing you the same generic routine again.
                </p>
                <button className="btn" type="button" onClick={handleStartJourney}>
                  Start your journey <span className="arrow">→</span>
                </button>
              </div>
              <div aria-label="Example Sādhanā AI coach conversation" className="chat-window">
                <div className="chat-head">
                  <div className="chat-avatar">
                    <img alt="sAI Coach" src="/assets/sai_robot_in_its_idle_pose.webp" />
                  </div>
                  <div>
                    <strong>Sādhanā Coach</strong>
                    <small>YOUR TRAINING COMPANION</small>
                  </div>
                </div>
                <div className="chat-message user-message">
                  I only have 20 minutes today, and I'm working out at home.
                </div>
                <div className="chat-message ai-message">
                  Got it. I'll shape a focused session around your time and available equipment while keeping your current training goal in view.
                </div>
                <div className="chat-quest">
                  <div>
                    <strong>Today's Quest</strong>
                    <small>Focused home session · built for you</small>
                  </div>
                  <span className="quest-time">20 MIN</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta" id="get-started">
          <div className="wrap">
            <div className="cta-band">
              <div className="section-kicker">Every journey starts somewhere</div>
              <h2>
                You don't need a perfect routine.<br />
                You need a place to begin.
              </h2>
              <p>Start with where you are. Let the next level take shape one session at a time.</p>
              <button className="btn" type="button" onClick={handleStartJourney}>
                Get started with Sādhanā <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap footer-inner">
          <a className="footer-brand" href="#home">
            <img alt="Sādhanā logo" src="/assets/sai_logo.png" />
            SĀDHANĀ
          </a>
          <span>Adapt to the person. Challenge the person. Develop the person.</span>
          <div className="footer-links">
            <a href="#why">Why Sādhanā</a>
            <a href="#classes">Classes</a>
            <a href="#home">Back to top ↑</a>
          </div>
        </div>
      </footer>

      {/* Auth Screen Modal from sadhana_homepage_rpg_final.html */}
      <section
        aria-hidden={!authModalOpen}
        aria-label="Sādhanā account access"
        className={`auth-page ${authModalOpen ? 'open' : ''}`}
        id="authPage"
      >
        <div className="auth-layout">
          <aside className="auth-story">
            <button className="auth-back" type="button" onClick={() => setAuthModalOpen(false)}>
              ← <span>Back to Sādhanā</span>
            </button>
            <a aria-label="Sādhanā home" className="auth-brand" href="#home">
              <img alt="Sādhanā brand" src="/assets/sai_logo.png" />
              <span>SĀDHANĀ<small>FITNESS, YOUR WAY</small></span>
            </a>
            <div className="auth-story-copy">
              <span className="auth-eyebrow">YOUR JOURNEY, YOUR RULES</span>
              <h2>Small steps.<br /><em>Real evolution.</em></h2>
              <p>Your routines, your pace, your next level. Sign in to continue your Sādhanā journey with SAI.</p>
              <div className="auth-story-points">
                <span>✦ Adaptive workouts</span>
                <span>✦ Your own fitness class</span>
                <span>✦ Progress that feels like a quest</span>
              </div>
            </div>
            <div aria-hidden="true" className="auth-script-orbit">
              साधना · SĀDHANĀ · సాధన · சாதனா · സാധന ·
            </div>
          </aside>

          <div className="auth-form-side">
            <div className="auth-form-wrap">
              <div className="auth-mobile-back">
                <button className="auth-back" type="button" onClick={() => setAuthModalOpen(false)}>
                  ← Back
                </button>
              </div>

              <div aria-label="Account access" className="auth-tabs" role="tablist">
                <button
                  aria-selected={authMode === 'login'}
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  role="tab"
                  type="button"
                  onClick={() => setAuthMode('login')}
                >
                  Sign in
                </button>
                <button
                  aria-selected={authMode === 'register'}
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  role="tab"
                  type="button"
                  onClick={() => setAuthMode('register')}
                >
                  Create account
                </button>
              </div>

              <div className="auth-heading">
                <span className="auth-mini-kicker">WELCOME TO SĀDHANĀ</span>
                <h1>{authMode === 'register' ? 'Create your account.' : 'Welcome back.'}</h1>
                <p>{authMode === 'register' ? 'Your fitness journey starts with one step.' : 'Your next level is waiting.'}</p>
              </div>

              <button
                className="google-button"
                type="button"
                onClick={() => navigate(authMode === 'register' ? '/register' : '/login')}
              >
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.35 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                Continue with Google
              </button>

              <div className="auth-divider">
                <span></span>
                <small>OR WITH EMAIL</small>
                <span></span>
              </div>

              <form onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <div className="auth-field">
                    <label htmlFor="authNameInput">Your Name</label>
                    <input
                      id="authNameInput"
                      type="text"
                      placeholder="e.g. Vikram"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                    />
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="authEmailInput">Email Address</label>
                  <input
                    id="authEmailInput"
                    type="email"
                    placeholder="you@domain.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="authPassInput" className="m-0">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => navigate('/login')}
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    id="authPassInput"
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>

                <button className="btn auth-submit" type="submit">
                  {authMode === 'register' ? 'Create account' : 'Sign in'} <span className="arrow">→</span>
                </button>

                {authStatus && (
                  <div className={`auth-status ${authStatus.isError ? 'error' : ''}`}>
                    {authStatus.message}
                  </div>
                )}
              </form>

              <div className="auth-switch-copy">
                {authMode === 'register' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setAuthMode('login')}
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New to Sādhanā?{' '}
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setAuthMode('register')}
                    >
                      Create an account
                    </button>
                  </>
                )}
              </div>

              <div className="auth-legal">
                Protected by Sādhanā Sanctuary security. Adaptive AI respects your privacy.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
