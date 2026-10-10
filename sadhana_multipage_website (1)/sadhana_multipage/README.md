# Sādhanā Multi-page RPG Frontend

Open `index.html` to start. Each destination is a separate HTML page sharing `styles.css`, `app.js`, and the `assets/` folder. Keep the folder structure intact.

## Pages
- `index.html` — compact Quest Hub dashboard, today's quest, assigned class XP preview, and quest-map preview
- `quests.html` — quest journal, XP-to-next-level progress bar, weekly training direction, and interactive map-node options
- `training.html` — exercise poses, timer, set tracking, and coaching shortcuts
- `feedback.html` — post-workout feedback; submission shows the Quest Complete / Progress Recorded message
- `progress.html` — progression metrics and session history
- `community.html` — community roadmap
- `profile.html` — profile; use Profile → About · My Class to view the designed Dhruva class card

There is no Classes page or Classes navigation item. Class assignment is shown as system-assigned, not user-selectable.

## Interactions
- Header links navigate to separate pages; the Profile menu and mobile navigation toggle open and close.
- Primary quest, training, profile, progression, and quest-map actions navigate to their relevant pages.
- The sAI mascot and floating “Ask sAI” button open a shared chat panel on each page. In this static preview, replies are local examples. To call a backend, set `window.SADHANA_CONFIG = { aiChatEndpoint: '/api/ai/chat/' }` before `app.js` runs and return JSON with a `reply`, `message`, or `response` field.
- Quest Journal XP is tracked toward a sample 10,000-XP level threshold. Completing a session increments demo XP/Aura and updates the bar. Map node options respond to clicks.
- Training timer controls advance through three sets; finishing the workout leads to feedback. Submitting feedback opens the completion message.

## Preview-mode note
The static preview uses browser `localStorage` for sample session history, Aura, XP, and streak data. These are not authoritative. Production should replace preview persistence with authenticated Django REST API calls and let Django validate workouts, record completion, update progression, and return reward values. Images are local assets included in the bundle.
