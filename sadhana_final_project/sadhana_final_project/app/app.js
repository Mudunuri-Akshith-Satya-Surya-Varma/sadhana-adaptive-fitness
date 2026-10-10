const DEMO_KEY = 'sadhanaDemoStateV3';
const XP_GOAL = 10000;
const DEFAULT_STATE = { completed: 0, aura: 4320, streak: 12, history: [], level: 4, progress: 6240, week: 1, weekSessions: 0 };

function getState() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_KEY));
    const state = { ...DEFAULT_STATE, ...(saved && typeof saved === 'object' ? saved : {}), history: Array.isArray(saved?.history) ? saved.history : [] };
    if (!saved || typeof saved.weekSessions !== 'number') state.weekSessions = Math.max(0, Number(state.completed) || 0) % 5;
    state.weekSessions = Math.max(0, Math.min(4, Number(state.weekSessions) || 0));
    state.week = Math.max(1, Number(state.week) || 1);
    return state;
  } catch (_) { return { ...DEFAULT_STATE, history: [] }; }
}
function saveState(state) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(state)); } catch (_) { /* Preview can still be used without storage. */ }
}
function refreshStats() {
  const state = getState();
  const pct = Math.max(0, Math.min(100, Number(state.progress) / XP_GOAL * 100));
  const mappings = {
    aura: Number(state.aura).toLocaleString(), streak: state.streak,
    completed: state.completed, level: state.level,
    progress: Number(state.progress).toLocaleString(), xpgoal: XP_GOAL.toLocaleString(),
    nextlevel: Number(state.level) + 1,
    xpremaining: Math.max(0, XP_GOAL - Number(state.progress)).toLocaleString(),
    xppercent: `${Math.round(pct)}%`, weekcount: `${state.weekSessions} / 5 sessions`,
    week: state.week, weekSessions: state.weekSessions
  };
  Object.entries(mappings).forEach(([key, value]) => document.querySelectorAll(`[data-stat="${key}"]`).forEach(el => { el.textContent = value; }));
  document.querySelectorAll('[data-stat-bar="xp"]').forEach(el => el.style.width = `${pct}%`);
  document.querySelectorAll('.xp-large-meter').forEach(el => { el.setAttribute('aria-valuenow', String(Math.max(0, Math.min(XP_GOAL, Number(state.progress))))); el.setAttribute('aria-valuetext', `${Math.round(pct)} percent to next level`); });
  const today = new Date().toLocaleDateString();
  const doneToday = state.history.some(item => item.date === today && item.status === 'Completed');
  const dailyMeter = document.getElementById('dailyMeter');
  const homeMeter = document.getElementById('homeDailyMeter');
  if (dailyMeter) dailyMeter.style.width = doneToday ? '100%' : '0%';
  if (homeMeter) homeMeter.style.width = doneToday ? '100%' : '0%';
  const dailyStatus = document.getElementById('homeDailyStatus');
  if (dailyStatus) dailyStatus.textContent = doneToday ? 'Completed today · Great work!' : 'Not started today';
  const dailyTag = document.getElementById('dailyQuestStatus');
  if (dailyTag) dailyTag.textContent = doneToday ? 'Completed today' : 'Ready to begin';
  const startQuest = document.getElementById('homeStartQuest');
  if (startQuest && doneToday) { startQuest.textContent = 'View progress →'; startQuest.href = 'progress.html'; }
  else if (startQuest) { startQuest.textContent = "Start quest →"; startQuest.href = 'training.html'; }
  const classQuestCount = Math.min(3, Number(state.completed) || 0);
  const classQuestLabel = document.getElementById('classQuestCount');
  const classQuestMeter = document.getElementById('classQuestMeter');
  if (classQuestLabel) classQuestLabel.textContent = `${classQuestCount} / 3`;
  if (classQuestMeter) classQuestMeter.style.width = `${classQuestCount / 3 * 100}%`;
  renderQuestTree();
}

const CLASS_INFO = {
  dhruva: { name: 'Dhruva', focus: 'Cardio & Endurance', subtitle: 'ध्रुव · Steadfast Endurance', image: 'assets/class_dhruva_designed.jpg', questTitle: 'Cardio Foundations', questDescription: 'Build steady endurance with a short, adaptable bodyweight session.', description: 'Dhruva develops cardiovascular capacity, stamina and sustained pacing. Your training still includes essential strength, flexibility, balance and coordination work.' },
  samanvaya: { name: 'Samanvaya', focus: 'Coordination', subtitle: 'समन्वय · Coordination & Harmony', image: 'assets/class_samanvaya_designed.jpg', questTitle: 'Coordination Flow', questDescription: 'Build movement timing and coordination with an adaptable session.', description: 'Samanvaya develops coordination, agility, movement timing and body–mind control, while keeping strength, cardio, flexibility and balance in the training foundation.' },
  sthira: { name: 'Sthira', focus: 'Balance', subtitle: 'स्थिर · Steady & Firm', image: 'assets/class_sthira_designed.jpg', questTitle: 'Stability Foundations', questDescription: 'Build balance and controlled movement with a short, adaptable session.', description: 'Sthira develops balance, core stability, posture and controlled movement, while supporting the other essential fitness components.' },
  vistara: { name: 'Vistāra', focus: 'Flexibility', subtitle: 'विस्तार · Movement Freedom', image: 'assets/class_vistara_designed.jpg', questTitle: 'Mobility Foundations', questDescription: 'Improve movement quality and range of motion at a controlled pace.', description: 'Vistāra develops flexibility, mobility, range of motion and movement quality, while maintaining strength and cardiovascular support.' },
  yodha: { name: 'Yodha', focus: 'Strength', subtitle: 'योद्धा · Warrior', image: 'assets/class_yodha_designed.jpg', questTitle: 'Strength Foundations', questDescription: 'Develop controlled strength with the equipment and time you have.', description: 'Yodha develops strength, resistance capacity and muscular power, while preserving cardiovascular fitness, mobility, balance and coordination.' }
};
function normalizeClassName(value) {
  return String(value || 'Dhruva').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
}
function applyAssignedClass(rawName) {
  const key = normalizeClassName(rawName);
  const aliases = { samanya: 'samanvaya', coordination: 'samanvaya', cardio: 'dhruva', endurance: 'dhruva', flexibility: 'vistara', balance: 'sthira', strength: 'yodha' };
  ACTIVE_CLASS_KEY = (key in CLASS_INFO) ? key : (aliases[key] || 'dhruva');
  const info = CLASS_INFO[ACTIVE_CLASS_KEY] || CLASS_INFO.dhruva;
  window.SADHANA_ACTIVE_CLASS = info.name;
  document.querySelectorAll('[data-assigned-class-name]').forEach(el => { el.textContent = info.name; });
  document.querySelectorAll('[data-assigned-class-focus]').forEach(el => { el.textContent = info.focus; });
  document.querySelectorAll('[data-assigned-class-subtitle]').forEach(el => { el.textContent = info.subtitle; });
  document.querySelectorAll('[data-assigned-class-description]').forEach(el => { el.textContent = info.description; });
  document.querySelectorAll('[data-assigned-class-card]').forEach(el => { el.src = info.image; el.alt = `Designed ${info.name} class card`; el.dataset.assignedClassKey = key in CLASS_INFO ? key : (aliases[key] || 'dhruva'); });
  document.querySelectorAll('[data-assigned-class-label]').forEach(el => { el.textContent = `${info.name} · ${info.focus}`; });
  document.querySelectorAll('[data-current-quest-title]').forEach(el => { el.textContent = info.questTitle; });
  document.querySelectorAll('[data-current-quest-description]').forEach(el => { el.textContent = info.questDescription; });
  if (typeof renderQuestTree === 'function') renderQuestTree();
  const tree = document.getElementById('questTree');
  if (tree) { const selected = document.querySelector('[data-map-node][aria-pressed="true"]'); showQuestNode(selected ? Number(selected.dataset.mapNode) : 2 + Math.min(4, Number(getState().weekSessions) || 0)); }
  return info;
}
async function initAssignedClass() {
  let name = window.SADHANA_CONFIG && window.SADHANA_CONFIG.assignedClass;
  const endpoint = window.SADHANA_CONFIG && window.SADHANA_CONFIG.myClassEndpoint;
  if (!name && endpoint) {
    try {
      const response = await fetch(endpoint, { credentials: 'same-origin', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error('Class endpoint not available');
      const data = await response.json();
      name = data?.assigned_class?.name || data?.class?.name || data?.class_name || data?.name || data?.assigned_class;
    } catch (_) { /* Keep the assigned-class preview if the API is not connected. */ }
  }
  applyAssignedClass(name || document.body.dataset.assignedClass || 'Dhruva');
}

function toast(message) {
  const element = document.getElementById('toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => element.classList.remove('show'), 3000);
}

function addChatMessage(messages, text, who = 'sai', action = null) {
  const bubble = document.createElement('div');
  bubble.className = `sai-message ${who === 'user' ? 'user-message' : 'assistant-message'}`;
  const p = document.createElement('p'); p.textContent = text; bubble.appendChild(p);
  if (action && action.href && action.label) {
    const a = document.createElement('a'); a.href = action.href; a.className = 'sai-message-action'; a.textContent = action.label; bubble.appendChild(a);
  }
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}
function initSaiChat() {
  if (document.querySelector('.sai-chat-widget')) return;
  const widget = document.createElement('div'); widget.className = 'sai-chat-widget';
  widget.innerHTML = `
    <button class="sai-launcher" type="button" aria-label="Open sAI chat" aria-expanded="false"><img src="assets/sai_robot_in_its_idle_pose.webp" alt=""><span class="sai-launcher-dot"></span><span class="sai-launcher-label">Ask sAI</span></button>
    <section class="sai-chat-panel" role="dialog" aria-label="Chat with sAI" aria-modal="false" hidden>
      <header class="sai-chat-header"><img src="assets/sai_robot_in_its_idle_pose.webp" alt=""><div><strong>sAI · Your Training Guide</strong><small>Adaptive Biomechanical Companion</small></div><button class="sai-chat-close" type="button" aria-label="Close sAI chat">×</button></header>
      <div class="sai-chat-messages" aria-live="polite" aria-relevant="additions"></div>
      <div class="sai-chat-suggestions"><button type="button" data-sai-suggest="I only have 20 minutes today">20 min today</button><button type="button" data-sai-suggest="My knees feel sore today, no squats">Knee friendly</button><button type="button" data-sai-suggest="How should I breathe during high intensity?">Form & breathing</button></div>
      <form class="sai-chat-form"><label class="sr-only" for="saiChatInput">Message sAI</label><input id="saiChatInput" name="message" autocomplete="off" placeholder="Ask sAI about your training…" required><button class="rpg-btn" type="submit">Send</button></form>
    </section>`;
  document.body.appendChild(widget);
  const panel = widget.querySelector('.sai-chat-panel');
  const launcher = widget.querySelector('.sai-launcher');
  const close = widget.querySelector('.sai-chat-close');
  const messages = widget.querySelector('.sai-chat-messages');
  const form = widget.querySelector('.sai-chat-form');
  const input = widget.querySelector('#saiChatInput');
  let greeted = false;
  const endpoint = (window.SADHANA_CONFIG && window.SADHANA_CONFIG.aiChatEndpoint) || 'http://127.0.0.1:8000/api/ai-coach/chat/';

  const open = async (prefill = '') => {
    panel.hidden = false; launcher.setAttribute('aria-expanded', 'true'); launcher.classList.add('is-open');
    if (!greeted) {
      greeted = true;
      const pendingGreet = addChatMessage(messages, 'sAI neural stream connecting…');
      pendingGreet.classList.add('sai-pending');
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Hello! Greet me warmly as my AI fitness coach and ask how I feel today.' })
        });
        if (!response.ok) throw new Error('AI greeting request failed');
        const data = await response.json();
        pendingGreet.remove();
        addChatMessage(messages, data.reply || 'sAI neural stream online. Ask me about your training today.', 'sai');
      } catch (_) {
        pendingGreet.remove();
        addChatMessage(messages, 'sAI neural stream online. Send a message below to start your live consultation.', 'sai');
      }
    }
    if (prefill) { input.value = prefill; form.requestSubmit(); } else input.focus();
  };
  const shut = () => { panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); launcher.classList.remove('is-open'); launcher.focus(); };
  launcher.addEventListener('click', () => panel.hidden ? open() : shut());
  close.addEventListener('click', shut);
  widget.querySelectorAll('[data-sai-suggest]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.saiSuggest; form.requestSubmit(); }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim(); if (!text) return;
    addChatMessage(messages, text, 'user'); input.value = ''; input.focus();
    const pending = addChatMessage(messages, 'sAI is analyzing your biomechanics…'); pending.classList.add('sai-pending');
    let reply;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!response.ok) throw new Error('AI endpoint request failed');
      const data = await response.json();
      reply = { text: String(data.reply || data.message || 'Response received from AI.') };
    } catch (_) {
      reply = { text: 'Unable to reach the live sAI coach service. Please verify that the Sādhanā backend and AI connection are active.' };
    }
    pending.remove(); addChatMessage(messages, reply.text, 'sai', reply.action || null);
  });
  // Make existing sAI illustrations both clickable and keyboard-accessible.
  document.querySelectorAll('.coach-bubble, .coach-panel img, img[alt*="sAI"], img[alt*="sai"], .sai-face-button').forEach(el => {
    el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Open sAI chat');
    el.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(el.dataset.chatPrompt || ''); } });
  });
  // Clicking the existing sAI illustration anywhere in the site opens this same chat.
  document.addEventListener('click', event => {
    const origin = event.target instanceof Element ? event.target : null;
    if (!origin || origin.closest('.sai-chat-widget')) return;
    const trigger = origin.closest('[data-open-sai], .coach-bubble, .coach-panel img, img[alt*="sAI"], img[alt*="sai"], .sai-face-button');
    if (!trigger) return;
    event.preventDefault();
    open(trigger.dataset.chatPrompt || '');
  });
}

function initWorkoutTimer() {
  const timer = document.getElementById('timer'); if (!timer) return;
  const seconds = 40; let remaining = seconds; let interval = null; let round = 1;
  const start = document.getElementById('timerStart'), pause = document.getElementById('timerPause'), skip = document.getElementById('timerSkip'), finish = document.getElementById('finishWorkout');
  const paint = () => { timer.textContent = `00:${String(remaining).padStart(2, '0')}`; const roundEl = document.getElementById('round'); if (roundEl) roundEl.textContent = `Set ${round} / 3`; };
  const stop = () => { clearInterval(interval); interval = null; };
  const revealFinish = () => { stop(); if (start) start.classList.add('hidden'); if (pause) pause.classList.add('hidden'); if (skip) skip.classList.add('hidden'); if (finish) finish.classList.remove('hidden'); toast('All sets complete. Record your session feedback next.'); };
  const advance = () => { if (round >= 3) { revealFinish(); return; } round++; remaining = seconds; paint(); if (pause) pause.textContent = '▶ Resume'; toast(`Set ${round - 1} complete. Take a steady breath.`); };
  paint();
  if (start) start.addEventListener('click', () => { if (interval) return; interval = setInterval(() => { remaining--; paint(); if (remaining <= 0) advance(); }, 1000); start.classList.add('hidden'); if (pause) { pause.classList.remove('hidden'); pause.textContent = 'Ⅱ Pause'; } });
  if (pause) pause.addEventListener('click', () => { if (interval) { stop(); pause.textContent = '▶ Resume'; } else if (round <= 3 && (!finish || finish.classList.contains('hidden'))) { interval = setInterval(() => { remaining--; paint(); if (remaining <= 0) advance(); }, 1000); pause.textContent = 'Ⅱ Pause'; } });
  if (skip) skip.addEventListener('click', () => { if (round >= 3) { revealFinish(); return; } stop(); advance(); });
}
function initPoseLoop() {
  const imgStart = document.getElementById('poseImgStart'), imgEnd = document.getElementById('poseImgEnd');
  if (!imgStart || !imgEnd) return;
  let frame = 0;
  setInterval(() => {
    frame = frame === 0 ? 1 : 0;
    imgStart.style.display = frame === 0 ? 'block' : 'none';
    imgEnd.style.display = frame === 1 ? 'block' : 'none';
  }, 500);
}
function initFeedback() {
  const form = document.getElementById('feedbackForm'); if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form); const difficulty = String(data.get('difficulty') || 'Just right'); const duration = Number(data.get('duration') || 12); const status = String(data.get('completion') || 'completed'); const pain = String(data.get('pain') || 'no'); const notes = String(data.get('notes') || '').trim();
    const state = getState();
    const sessionWeek = Number(state.week) || 1;
    let reward = 0; let weekComplete = false;
    if (status === 'completed') {
      reward = pain === 'yes' ? 100 : 200;
      state.completed += 1; state.aura += reward; state.progress += reward;
      while (state.progress >= XP_GOAL) { state.progress -= XP_GOAL; state.level += 1; }
      state.weekSessions = Math.min(5, Number(state.weekSessions || 0) + 1);
      if (state.weekSessions >= 5) { state.week += 1; state.weekSessions = 0; weekComplete = true; }
    } else { reward = pain === 'yes' ? 0 : 50; state.aura += reward; }
    state.history.unshift({ title: 'Cardio Foundations', duration: Math.max(1, Math.min(180, duration)), difficulty, date: new Date().toLocaleDateString(), reward, status: status === 'completed' ? 'Completed' : 'Partial', pain, notes: notes.slice(0, 300), week: sessionWeek });
    state.history = state.history.slice(0, 20); saveState(state); refreshStats();
    const modal = document.getElementById('completionModal');
    if (modal) {
      const title = document.getElementById('completionTitle'), message = document.getElementById('completionMessage'), xp = document.getElementById('completionXp');
      if (status === 'completed') { title.textContent = weekComplete ? `Week ${state.week - 1} Complete!` : (pain === 'yes' ? 'Session Recorded' : 'Quest Complete!'); message.textContent = pain === 'yes' ? 'Your session has been recorded. Because you reported discomfort, prioritize safety and adjust before your next session.' : (weekComplete ? `Outstanding consistency! You completed the five-session path. Week ${state.week} is now unlocked, and your quest tree has reset for the new week.` : 'Well done! Your session was recorded. Your current milestone is complete and the next node on your quest tree is now highlighted.'); xp.textContent = `+${reward} ${pain === 'yes' ? 'Aura' : 'XP / Aura'}`; }
      else { title.textContent = 'Progress Recorded'; message.textContent = 'You logged a partial session. Sādhanā can use your actual duration and feedback to shape the next workout.'; xp.textContent = reward ? `+${reward} Aura` : 'No reward applied'; }
      modal.classList.add('show'); const firstButton = modal.querySelector('button'); firstButton?.focus();
    } else toast('Feedback saved in preview mode.');
  });
}
function initCompletionModal() {
  const continueButton = document.getElementById('modalContinue'), progressButton = document.getElementById('modalProgress'), modal = document.getElementById('completionModal');
  if (continueButton) continueButton.addEventListener('click', () => { location.href = 'quests.html'; });
  if (progressButton) progressButton.addEventListener('click', () => { location.href = 'progress.html'; });
  if (modal) modal.addEventListener('click', event => { if (event.target === modal) { modal.classList.remove('show'); } });
}
function initHistory() {
  const list = document.getElementById('historyList'); if (!list) return;
  const state = getState(); list.replaceChildren();
  if (!state.history.length) { const p = document.createElement('p'); p.className = 'muted small'; p.textContent = 'No sessions recorded yet. Complete a training session and submit your feedback to see it here.'; list.appendChild(p); return; }
  state.history.forEach(item => {
    const row = document.createElement('div'); row.className = 'history-row';
    const icon = document.createElement('span'); icon.className = 'session-icon'; icon.textContent = item.status === 'Partial' ? '◷' : '✓';
    const details = document.createElement('div'); const title = document.createElement('strong'); title.textContent = item.title || 'Training session'; const small = document.createElement('small'); small.textContent = `${item.status || 'Completed'} · ${item.duration} min · ${item.difficulty || 'Recorded'} · ${item.date || ''}`; details.append(title, small);
    const reward = document.createElement('b'); reward.textContent = `+${item.reward || 0}`; row.append(icon, details, reward); list.appendChild(row);
  });
}
let ACTIVE_CLASS_KEY = 'dhruva';
const QUEST_BASE_NODES = [
  { title: 'Fitness Profile', description: 'Your goals, current activity and constraints establish the starting point for your training journey.', goal: 'Profile assessment saved', reward: 'Foundational step · complete', onboarding: true },
  { title: 'Class Revealed', description: 'Sādhanā assigns your training specialization based on the profile assessment. Your class sets a direction; every session still supports all five fitness components.', goal: 'Class assigned by the system', reward: 'Not user-selectable · based on your profile', onboarding: true }
];
const CLASS_QUESTS = {
  dhruva: [
    { title: "Today's Practice", description: 'Complete the current adaptive workout. The result and feedback are saved to preview history, award XP, and move your weekly path forward.', goal: 'Complete one workout', reward: '+200 XP / Aura · advances your weekly path' },
    { title: 'Stamina Path', description: 'Continue the weekly direction with a cardio session while the system considers your previous performance and available time.', goal: 'Second weekly workout', reward: 'XP, Aura and a new path marker' },
    { title: 'Endurance Trial', description: 'Build consistency with another appropriately challenging session. Difficulty should adapt to performance, not only to level.', goal: 'Third weekly workout', reward: 'Progress toward the class milestone' },
    { title: 'Dhruva Challenge', description: 'A class-focused milestone for sustainable stamina and aerobic conditioning, while maintaining mobility, balance, coordination and strength.', goal: 'Fourth weekly workout', reward: 'Unlock the Week Finale' },
    { title: 'Week Finale', description: 'Complete the fifth weekly session to finish the path. The next week unlocks automatically and keeps your previous session history.', goal: 'Fifth weekly workout', reward: 'Complete the week · unlock the next path' }
  ],
  samanvaya: [
    { title: "Today's Practice", description: 'Start with a coordinated movement session suited to your current context and available time.', goal: 'Complete one workout', reward: '+200 XP / Aura · advances your weekly path' },
    { title: 'Movement Flow', description: 'Build timing and smooth movement sequencing while supporting strength, cardio, flexibility and balance.', goal: 'Second weekly workout', reward: 'XP, Aura and a new path marker' },
    { title: 'Agility Trial', description: 'Practice appropriately challenging footwork and coordination. Adjust difficulty to actual performance.', goal: 'Third weekly workout', reward: 'Progress toward the class milestone' },
    { title: 'Samanvaya Challenge', description: 'Bring reaction, agility and coordinated movement together in a class-focused challenge.', goal: 'Fourth weekly workout', reward: 'Unlock the Week Finale' },
    { title: 'Week Finale', description: 'Complete five sessions to finish the path and unlock the next week. Previous history remains available.', goal: 'Fifth weekly workout', reward: 'Complete the week · unlock the next path' }
  ],
  sthira: [
    { title: "Today's Practice", description: 'Begin with a balance and controlled-movement session matched to your current readiness.', goal: 'Complete one workout', reward: '+200 XP / Aura · advances your weekly path' },
    { title: 'Core Control', description: 'Continue building stability and postural control while maintaining the other essential fitness components.', goal: 'Second weekly workout', reward: 'XP, Aura and a new path marker' },
    { title: 'Stability Trial', description: 'Progress into controlled balance work while keeping movement comfortable and safe.', goal: 'Third weekly workout', reward: 'Progress toward the class milestone' },
    { title: 'Sthira Challenge', description: 'Combine balance, core stability and mindful body control in a class-focused milestone.', goal: 'Fourth weekly workout', reward: 'Unlock the Week Finale' },
    { title: 'Week Finale', description: 'Complete five sessions to finish the path and unlock the next week. Previous history remains available.', goal: 'Fifth weekly workout', reward: 'Complete the week · unlock the next path' }
  ],
  vistara: [
    { title: "Today's Practice", description: 'Begin with mobility and movement-quality work suited to your experience and available time.', goal: 'Complete one workout', reward: '+200 XP / Aura · advances your weekly path' },
    { title: 'Range of Motion', description: 'Develop controlled flexibility and joint movement while keeping balanced strength and cardio support.', goal: 'Second weekly workout', reward: 'XP, Aura and a new path marker' },
    { title: 'Mobility Trial', description: 'Progress range-of-motion work in a controlled way. Avoid forcing uncomfortable stretches.', goal: 'Third weekly workout', reward: 'Progress toward the class milestone' },
    { title: 'Vistāra Challenge', description: 'Build a consistent mobility routine and movement freedom in this class-focused milestone.', goal: 'Fourth weekly workout', reward: 'Unlock the Week Finale' },
    { title: 'Week Finale', description: 'Complete five sessions to finish the path and unlock the next week. Previous history remains available.', goal: 'Fifth weekly workout', reward: 'Complete the week · unlock the next path' }
  ],
  yodha: [
    { title: "Today's Practice", description: 'Begin with a strength session appropriate to your experience, equipment and current context.', goal: 'Complete one workout', reward: '+200 XP / Aura · advances your weekly path' },
    { title: 'Resistance Path', description: 'Continue progressive resistance work with attention to control, technique and recovery.', goal: 'Second weekly workout', reward: 'XP, Aura and a new path marker' },
    { title: 'Power Trial', description: 'Develop strength and power through an appropriately challenging session; progression follows performance, not level alone.', goal: 'Third weekly workout', reward: 'Progress toward the class milestone' },
    { title: 'Yodha Challenge', description: 'Bring strength and controlled effort together while maintaining mobility, endurance, balance and coordination.', goal: 'Fourth weekly workout', reward: 'Unlock the Week Finale' },
    { title: 'Week Finale', description: 'Complete five sessions to finish the path and unlock the next week. Previous history remains available.', goal: 'Fifth weekly workout', reward: 'Complete the week · unlock the next path' }
  ]
};
function getQuestNodes() {
  const info = CLASS_INFO[ACTIVE_CLASS_KEY] || CLASS_INFO.dhruva;
  const classReveal = { ...QUEST_BASE_NODES[1], description: `Sādhanā assigned ${info.name} based on the demo profile. ${info.description} The class remains assigned by the system, not chosen in this screen.`, goal: `${info.name} · ${info.focus}`, reward: 'Assigned by the system · not user-selectable' };
  return [QUEST_BASE_NODES[0], classReveal, ...(CLASS_QUESTS[ACTIVE_CLASS_KEY] || CLASS_QUESTS.dhruva)];
}
function getTreeStatus(index, state = getState()) {
  const currentIndex = 2 + Math.min(4, Number(state.weekSessions) || 0);
  if (index < 2 || index < currentIndex) return 'completed';
  if (index === currentIndex) return 'current';
  return 'locked';
}
function renderQuestTree() {
  const state = getState();
  document.querySelectorAll('[data-map-node], [data-home-node]').forEach(button => {
    const index = Number(button.dataset.mapNode ?? button.dataset.homeNode);
    const node = getQuestNodes()[index]; if (!node) return;
    const status = getTreeStatus(index, state);
    button.classList.remove('is-completed', 'is-current', 'is-locked');
    button.classList.add(`is-${status}`);
    const statusLabel = status === 'completed' ? 'completed' : status === 'current' ? 'current and available' : 'locked';
    button.setAttribute('aria-label', `${node.title} — ${statusLabel}. Select to view details.`);
    if (button.dataset.homeNode !== undefined) {
      const small = document.querySelector(`[data-milestone-status="${index}"]`);
      if (small) small.textContent = status === 'completed' ? '✓ Complete' : status === 'current' ? '● Current' : '🔒 Locked';
      button.title = `${node.title}: ${statusLabel}`;
    }
  });
}
function showQuestNode(index) {
  const node = getQuestNodes()[index]; if (!node) return;
  const state = getState(); const status = getTreeStatus(index, state);
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  set('selectedNodeTitle', node.title);
  set('selectedNodeDescription', node.description);
  set('selectedNodeGoal', node.goal);
  set('selectedNodeReward', node.reward);
  const badge = document.getElementById('selectedNodeStatus');
  if (badge) { badge.textContent = status.toUpperCase(); badge.className = `pill node-status-${status}`; }
  const action = document.getElementById('selectedNodeAction');
  const lockHint = document.getElementById('nodeLockedHint');
  if (action) {
    action.hidden = status === 'locked';
    action.href = status === 'completed' ? 'progress.html' : 'training.html';
    action.textContent = status === 'completed' ? 'View session history →' : (index < 2 ? 'View your journey →' : "Start today's quest →");
    if (index === 0 || index === 1) { action.hidden = false; action.href = 'profile.html#about'; action.textContent = 'View assigned profile →'; }
  }
  if (lockHint) { lockHint.hidden = status !== 'locked'; if (status === 'locked') lockHint.textContent = `Complete “${getQuestNodes()[2 + Math.min(4, Number(state.weekSessions) || 0)].title}” to unlock this milestone.`; }
  document.querySelectorAll('[data-map-node]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.mapNode) === index)));
}
function initQuestNodeActions() {
  document.querySelectorAll('[data-map-node]').forEach(button => button.addEventListener('click', () => showQuestNode(Number(button.dataset.mapNode))));
  document.querySelectorAll('[data-home-node]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.homeNode);
    location.href = `quests.html?node=${encodeURIComponent(index)}`;
  }));
  if (document.getElementById('questTree')) {
    const queryNode = Number(new URLSearchParams(location.search).get('node'));
    const state = getState();
    const defaultNode = 2 + Math.min(4, Number(state.weekSessions) || 0);
    showQuestNode(Number.isInteger(queryNode) && queryNode >= 0 && queryNode < getQuestNodes().length ? queryNode : defaultNode);
  }
}
function initClassCardActions() {
  document.querySelectorAll('[data-class-reason]').forEach(button => button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.classReason);
    if (!target) return;
    target.classList.add('class-reason-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
    button.setAttribute('aria-expanded', 'true');
    const info = CLASS_INFO[ACTIVE_CLASS_KEY] || CLASS_INFO.dhruva; toast(`${info.name} focuses on ${info.focus.toLowerCase()} while supporting all five fitness components.`);
  }));
}
document.addEventListener('DOMContentLoaded', () => {
  refreshStats();
  initAssignedClass();
  const menu = document.querySelector('.mobile-toggle'), links = document.querySelector('.nav-links');
  if (menu && links) menu.addEventListener('click', () => { const open = links.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  const profile = document.querySelector('.profile-trigger'), dropdown = document.querySelector('.profile-dropdown');
  if (profile && dropdown) profile.addEventListener('click', event => { event.stopPropagation(); dropdown.classList.toggle('open'); profile.setAttribute('aria-expanded', String(dropdown.classList.contains('open'))); });
  document.addEventListener('click', event => { if (dropdown && profile && !dropdown.contains(event.target) && !profile.contains(event.target)) { dropdown.classList.remove('open'); profile.setAttribute('aria-expanded', 'false'); } });
  const greeting = document.getElementById('greeting'); if (greeting) { const hour = new Date().getHours(); greeting.textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good to see you' : 'Welcome back'; }
  initWorkoutTimer(); initPoseLoop(); initFeedback(); initCompletionModal(); initHistory(); initQuestNodeActions(); initClassCardActions(); initSaiChat();
});
