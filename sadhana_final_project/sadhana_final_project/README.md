# Sādhanā — Final Linked Project

## Start here
Open the root `index.html` in a browser. This is the RPG-style public homepage you provided, with its own class-card flip interactions and responsive navigation. The **Open dashboard** link leads to the separate working app.

## Project structure
- `index.html` — Public Sādhanā RPG landing homepage (original artwork remains embedded in the HTML).
- `app/index.html` — Main Quest Hub / app dashboard.
- `app/quests.html` — Interactive quest tree, XP progress and weekly milestones.
- `app/training.html` — Exercise session, reference images, timer and workout controls.
- `app/feedback.html` — Workout completion feedback and Quest Complete dialog.
- `app/progress.html` — XP, Aura, levels and recorded session history.
- `app/profile.html` — Profile and About · My Class, including the designed class artwork.
- `app/community.html` — Community preview page.
- `app/styles.css`, `app/app.js`, `app/assets/` — Shared app styling, interactions and assets.

Every app page has a **Website ↗** link back to the landing homepage. The app's **Home** item remains the dashboard.

## Preview flow
1. On the landing page, choose **Open dashboard** to enter the app immediately, or use **Get started** and submit valid demo form fields.
2. The demo form redirects to `app/index.html`. It does not create a real account or store a password.
3. Start a quest, complete the training screen, submit feedback, and see the completion message/rewards.
4. XP, Aura, completed sessions and quest-tree progression are preview data stored in browser local storage.
5. Click **Website ↗** in the app navigation to return to the public homepage.

## Backend integration
The app is currently a frontend preview. For production, Django must provide authentication, the assigned class, workout generation, validation, workout history, XP/Aura, class progression and rewards. The frontend demo's localStorage values are not authoritative. The optional `window.SADHANA_CONFIG` examples in the app's JavaScript/README describe API hook locations.

Keep all pages, `styles.css`, `app.js` and the `assets/` directory together. Do not open only an individual HTML page after extracting the project; start with the root `index.html`.
