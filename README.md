# Boxing Camp Tracker

A private, single-user, mobile-first web app to run a boxing fight camp: training program, calendar, session logging, bodyweight & body-fat tracking against a target curve, weekly check-ins, and progress benchmarks. No backend — everything is stored locally in the browser, with JSON export/import for backup.

## Features
- **Dashboard** — countdown to fight day, current weight vs. target, today's sessions, weekly consistency.
- **Calendar** — month/week views colour-coded by training phase; tap any day to plan, log, reschedule, or delete sessions.
- **Program** — Base / Travel / Base / Build / Sharpen / Peak phases, fully editable (dates, names, weight targets) in Settings.
- **Weight** — bodyweight + body-fat trend on a hand-built chart vs. the target curve.
- **Weekly check-in** — auto-pulled stats plus reflection prompts, saved to history.
- **Progress** — camp consistency and conditioning benchmarks.
- **Settings** — light/dark theme, passcode lock, JSON backup (export/import), program editor.
- **Installable** — Add to Home Screen on iOS/Android for a full-screen app experience.

## Run it
It's a static site — no build step. Open `index.html` in a browser, or host the folder anywhere static (e.g. GitHub Pages).

### GitHub Pages
1. Push this repository to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Your app will be live at `https://<username>.github.io/<repo>/`.
4. On your iPhone, open that URL in Safari → **Share → Add to Home Screen**.

## Project structure
- `index.html` — app entry (loads everything below)
- `app/` — application modules (program engine, store, UI kit, chart, screens, lock)
- `manifest.webmanifest`, `app-icon-*.png` — install/PWA assets
- `Boxing Camp Tracker.html` — development copy of the entry file

## Data & privacy
All data lives in your browser's `localStorage` on your device. There is no server and no account. Use **Settings → Export JSON** to back up, and **Import** to restore or move to another device. The passcode lock is a local privacy screen, not account security.

## Tech
Vanilla React (via CDN) + in-browser Babel, no bundler. Hand-built SVG charts. ~no dependencies to install.
