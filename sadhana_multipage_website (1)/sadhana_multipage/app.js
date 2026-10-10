const DEMO_KEY = 'sadhanaDemoStateV3';
const XP_GOAL = 10000;
const DEFAULT_STATE = { completed: 0, aura: 4320, streak: 12, history: [], level: 4, progress: 6240 };

function getState() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_KEY));
    return { ...DEFAULT_STATE, ...(saved && typeof saved === 'object' ? saved : {}), history: Array.isArray(saved?.history) ? saved.history : [] };
  } catch (_) { return { ...DEFAULT_STATE, history: [] }; }
}
function saveState(state) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(state)); } catch (_) { /* Preview can still be used without storage. */ }
}
function refreshStats() {
  const state = getState();
  const mappings = { aura: Number(state.aura).toLocaleString(), streak: state.streak, completed: state.completed, level: state.level, progress: Number(state.progress).toLocaleString(), xpgoal: XP_GOAL.toLocaleString(), nextlevel: Number(state.level) + 1, xpremaining: Math.max(0, XP_GOAL - Number(state.progress)).toLocaleString(), xppercent: `${Math.max(0, Math.min(100, Math.round(Number(state.progress) / XP_GOAL * 100)))}%`, weekcount: `${Math.min(5, Math.max(3, state.completed + 3))} / 5 sessions` };
  Object.entries(mappings).forEach(([key, value]) => document.querySelectorAll(`[data-stat="${key}"]`).forEach(el => { el.textContent = value; }));
  const pct = Math.max(0, Math.min(100, Number(state.progress) / XP_GOAL * 100));
  document.querySelectorAll('[data-stat-bar="xp"]').forEach(el => el.style.width = `${pct}%`);
  document.querySelectorAll('.xp-large-meter').forEach(el => el.setAttribute('aria-valuenow', String(Math.max(0, Math.min(XP_GOAL, Number(state.progress))))));
  const today = new Date().toLocaleDateString();
  const doneToday = state.history.some(item => item.date === today && item.status !== 'Partial');
  const dailyMeter = document.getElementById('dailyMeter');
  const homeMeter = document.getElementById('homeDailyMeter');
  if (dailyMeter) dailyMeter.style.width = doneToday ? '100%' : '0%';
  if (homeMeter) homeMeter.style.width = doneToday ? '100%' : '0%';
  const dailyStatus = document.getElementById('homeDailyStatus');
  if (dailyStatus) dailyStatus.textContent = doneToday ? 'Completed today · Great work!' : 'Not started today';
  const dailyTag = document.getElementById('dailyQuestStatus');
  if (dailyTag) dailyTag.textContent = doneToday ? 'Completed today' : 'Ready to begin';
  const classQuestCount = Math.min(3, Number(state.completed) || 0);
  const classQuestLabel = document.getElementById('classQuestCount');
  const classQuestMeter = document.getElementById('classQuestMeter');
  if (classQuestLabel) classQuestLabel.textContent = `${classQuestCount} / 3`;
  if (classQuestMeter) classQuestMeter.style.width = `${classQuestCount / 3 * 100}%`;
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
function getSaiReply(message) {
  const value = message.toLowerCase();
  const state = getState();
  if (/pain|injur|hurt|dizzy|chest|sharp|discomfort/.test(value)) return { text: 'Your safety comes first. Stop the movement that causes pain or concerning symptoms; don’t try to push through it. Record what happened so the next session can be adjusted, and seek appropriate medical help for severe or persistent symptoms.', action: { label: 'Open session feedback', href: 'feedback.html' } };
  if (/20 minutes|twenty minutes|short on time|little time|only have.*minute|time limit/.test(value)) return { text: 'We can focus on the main training objective instead of trying to make up every missed minute. Open today’s workout and use the available-time context before starting; keep the movement controlled.', action: { label: 'Open today’s training', href: 'training.html' } };
  if (/no equipment|without equipment|no dumbbell|no weights|bodyweight/.test(value)) return { text: 'No equipment is fine for a bodyweight session. Today’s preview uses jumping jacks and high knees; choose a comfortable pace and a clear space. In the live app, I’d pass your equipment constraint to the workout generator.', action: { label: 'Open bodyweight session', href: 'training.html' } };
  if (/too hard|too difficult|difficult|beginner|easier|low energy|tired|exhaust/.test(value)) return { text: 'Let’s adjust the challenge rather than force it. Slow the pace, take a longer rest, or stop if anything feels unsafe. Share how the session felt so that the next workout can reflect your actual performance.', action: { label: 'Adjust with feedback', href: 'feedback.html' } };
  if (/progress|xp|experience|aura|level|level up/.test(value)) return { text: `Your preview profile is Dhruva · Level ${state.level}, with ${Number(state.progress).toLocaleString()} / ${XP_GOAL.toLocaleString()} XP toward the next level and ${Number(state.aura).toLocaleString()} Aura. XP and Aura shown here are browser-preview data until Django is connected.`, action: { label: 'View progress', href: 'progress.html' } };
  if (/quest|today|workout|train|exercise|start/.test(value)) return { text: 'Your current preview quest is Cardio Foundations: a short bodyweight session with a warm-up, jumping jacks, and high knees. Complete the session, then record how it actually felt so your progress and next-step context can update.', action: { label: 'Start today’s quest', href: 'training.html' } };
  if (/hello|hi|hey|morning|good evening/.test(value)) return { text: 'Hello, adventurer! I’m sAI, your Sādhanā training companion. Ask me about today’s quest, adapting a session to your time or equipment, exercise form, or your progress.' };
  return { text: 'I can help with your workout plan, time or equipment constraints, exercise difficulty, session feedback, and progression. What is happening with today’s training?' };
}

function initSaiChat() {
  if (document.querySelector('.sai-chat-widget')) return;
  const widget = document.createElement('div'); widget.className = 'sai-chat-widget';
  widget.innerHTML = `
    <button class="sai-launcher" type="button" aria-label="Open sAI chat" aria-expanded="false"><img src="assets/sai_robot_in_its_idle_pose.webp" alt=""><span class="sai-launcher-dot"></span><span class="sai-launcher-label">Ask sAI</span></button>
    <section class="sai-chat-panel" role="dialog" aria-label="Chat with sAI" aria-modal="false" hidden>
      <header class="sai-chat-header"><img src="assets/sai_robot_in_its_idle_pose.webp" alt=""><div><strong>sAI · Your Training Guide</strong><small>Fitness companion · Preview mode</small></div><button class="sai-chat-close" type="button" aria-label="Close sAI chat">×</button></header>
      <div class="sai-chat-messages" aria-live="polite" aria-relevant="additions"></div>
      <div class="sai-chat-suggestions"><button type="button" data-sai-suggest="I only have 20 minutes today">20 min today</button><button type="button" data-sai-suggest="I have no equipment today">No equipment</button><button type="button" data-sai-suggest="How is my progress?">My progress</button></div>
      <form class="sai-chat-form"><label class="sr-only" for="saiChatInput">Message sAI</label><input id="saiChatInput" name="message" autocomplete="off" placeholder="Ask sAI about your training…" required><button class="rpg-btn" type="submit">Send</button></form>
      <p class="sai-chat-note">Preview responses are local examples. Connect Django’s AI endpoint for personalized live responses.</p>
    </section>`;
  document.body.appendChild(widget);
  const panel = widget.querySelector('.sai-chat-panel');
  const launcher = widget.querySelector('.sai-launcher');
  const close = widget.querySelector('.sai-chat-close');
  const messages = widget.querySelector('.sai-chat-messages');
  const form = widget.querySelector('.sai-chat-form');
  const input = widget.querySelector('#saiChatInput');
  let greeted = false;
  const open = (prefill = '') => {
    panel.hidden = false; launcher.setAttribute('aria-expanded', 'true'); launcher.classList.add('is-open');
    if (!greeted) { addChatMessage(messages, 'Namaste! I’m sAI. Tell me about your time, equipment, energy, workout difficulty, or progress. Let’s make today’s training work for you.'); greeted = true; }
    if (prefill) input.value = prefill;
    if (prefill) form.requestSubmit(); else input.focus();
  };
  const shut = () => { panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); launcher.classList.remove('is-open'); launcher.focus(); };
  launcher.addEventListener('click', () => panel.hidden ? open() : shut());
  close.addEventListener('click', shut);
  widget.querySelectorAll('[data-sai-suggest]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.saiSuggest; form.requestSubmit(); }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim(); if (!text) return;
    addChatMessage(messages, text, 'user'); input.value = ''; input.focus();
    const pending = addChatMessage(messages, 'One moment…'); pending.classList.add('sai-pending');
    let reply;
    const endpoint = window.SADHANA_CONFIG && window.SADHANA_CONFIG.aiChatEndpoint;
    if (endpoint) {
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ message: text }) });
        if (!response.ok) throw new Error('AI endpoint request failed');
        const data = await response.json();
        reply = { text: String(data.reply || data.message || data.response || 'I received your message, but no reply text was returned.') };
      } catch (_) { reply = { text: 'I couldn’t reach the live coach service just now. I can still help with the preview guidance, or you can try again once the backend is available.' }; }
    } else reply = getSaiReply(text);
    pending.remove(); addChatMessage(messages, reply.text, 'sai', reply.action || null);
  });
  addChatMessage(messages, 'Namaste! I’m sAI. Tap a suggestion or ask me about today’s workout.'); greeted = true;
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
function initFeedback() {
  const form = document.getElementById('feedbackForm'); if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form); const difficulty = String(data.get('difficulty') || 'Just right'); const duration = Number(data.get('duration') || 12); const status = String(data.get('completion') || 'completed'); const pain = String(data.get('pain') || 'no'); const notes = String(data.get('notes') || '').trim();
    const state = getState();
    let reward = 0;
    if (status === 'completed') {
      reward = pain === 'yes' ? 100 : 200;
      state.completed += 1; state.aura += reward; state.progress += reward;
      while (state.progress >= XP_GOAL) { state.progress -= XP_GOAL; state.level += 1; }
    } else { reward = pain === 'yes' ? 0 : 50; state.aura += reward; }
    state.history.unshift({ title: 'Cardio Foundations', duration: Math.max(1, Math.min(180, duration)), difficulty, date: new Date().toLocaleDateString(), reward, status: status === 'completed' ? 'Completed' : 'Partial', pain, notes: notes.slice(0, 300) });
    state.history = state.history.slice(0, 20); saveState(state); refreshStats();
    const modal = document.getElementById('completionModal');
    if (modal) {
      const title = document.getElementById('completionTitle'), message = document.getElementById('completionMessage'), xp = document.getElementById('completionXp');
      if (status === 'completed') { title.textContent = pain === 'yes' ? 'Session Recorded' : 'Quest Complete!'; message.textContent = pain === 'yes' ? 'Your session has been recorded. Because you reported discomfort, prioritize safety and adjust before your next session.' : 'Well done! Your session was recorded. Your next workout can use this feedback as part of its context.'; xp.textContent = `+${reward} ${pain === 'yes' ? 'Aura' : 'XP / Aura'}`; }
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
function initQuestNodeActions() {
  document.querySelectorAll('[data-node-current]').forEach(button => button.addEventListener('click', () => { location.href = 'training.html'; }));
  document.querySelectorAll('[data-node-info]').forEach(button => button.addEventListener('click', () => toast(button.dataset.nodeInfo || 'Quest node information.')));
}

document.addEventListener('DOMContentLoaded', () => {
  refreshStats();
  const menu = document.querySelector('.mobile-toggle'), links = document.querySelector('.nav-links');
  if (menu && links) menu.addEventListener('click', () => { const open = links.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  const profile = document.querySelector('.profile-trigger'), dropdown = document.querySelector('.profile-dropdown');
  if (profile && dropdown) profile.addEventListener('click', event => { event.stopPropagation(); dropdown.classList.toggle('open'); profile.setAttribute('aria-expanded', String(dropdown.classList.contains('open'))); });
  document.addEventListener('click', event => { if (dropdown && profile && !dropdown.contains(event.target) && !profile.contains(event.target)) { dropdown.classList.remove('open'); profile.setAttribute('aria-expanded', 'false'); } });
  const greeting = document.getElementById('greeting'); if (greeting) { const hour = new Date().getHours(); greeting.textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good to see you' : 'Welcome back'; }
  initWorkoutTimer(); initFeedback(); initCompletionModal(); initHistory(); initQuestNodeActions(); initSaiChat();
});
