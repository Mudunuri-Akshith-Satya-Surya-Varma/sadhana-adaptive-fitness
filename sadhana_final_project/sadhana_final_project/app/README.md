# Sādhanā multi-page website preview

Open `index.html` in a browser to start. Keep all HTML pages, `styles.css`, `app.js`, and the `assets/` directory together.

## Pages
- `index.html` — Home / Quest Hub with dynamic milestone buttons and map preview
- `quests.html` — Interactive weekly quest tree and XP-to-next-level progress bar
- `training.html` — Exercise session and timer
- `feedback.html` — Workout feedback and quest-completion dialog
- `progress.html` — XP, Aura, level and saved session history
- `profile.html#about` — Assigned class and the user's designed Dhruva card
- `community.html` — Community preview

## Preview progression logic
Progress is saved in this browser's localStorage. Submitting a completed workout in Feedback grants demo XP/Aura and advances the weekly tree one node. Partial sessions are recorded but do not advance the weekly tree. Completing five sessions advances to the next week. XP overflow raises the level and carries the remainder toward the next level. Clear the `sadhanaDemoStateV3` localStorage key to reset preview state.

The sample assigned class is Dhruva for demonstration. To bind class assignment from Django, define `window.SADHANA_CONFIG` before `app.js` loads, for example:

```html
<script>window.SADHANA_CONFIG = { myClassEndpoint: "/api/my-class/", aiChatEndpoint: "/api/ai/chat/" };</script>
```

The class endpoint may return `{"class":{"name":"Dhruva"}}`, `{"assigned_class":{"name":"Dhruva"}}`, or a `class_name` field. The frontend then selects the matching uploaded designed card and class-specific milestone names. Do not let a user select their assigned class from the frontend. Local rewards/history here are not backend-authoritative; production XP, class assignment, workout generation and saved progression must be validated by Django.
