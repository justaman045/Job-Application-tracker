# North — Job Application Tracker

> **Track every job application, interview, and offer in one place.** Beautiful, fast, and built for solo job seekers.

[![React](https://img.shields.io/badge/React-20232A?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

- **Dashboard** — Stats, charts, pipeline velocity, and activity feed
- **Application List** — Search, filter, sort, bulk actions, and saved filters
- **Kanban Board** — Drag & drop applications across status columns
- **Detail View** — Full application details, interview rounds, and status timeline
- **Offer Comparison** — Weighted scoring to compare offers side by side
- **Google Sign-In** — Quick and secure authentication
- **Dark Mode** — System-aware with manual toggle
- **Export/Import** — CSV for spreadsheets, JSON for full backup
- **PWA** — Install on desktop or mobile
- **Keyboard Shortcuts** — `N` new, `/` search, `?` help

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google) |
| Styling | Tailwind CSS |
| PWA | Vite PWA plugin |
| Deployment | Firebase Hosting (via GH Actions) |

## Quick Start

### 1. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create project**
2. **Authentication** → Sign-in providers → Enable **Google**
3. **Firestore Database** → Create database → Choose a region → **Start in test mode**
4. **Project Settings (⚙️)** → General → Your apps → **Web (</>)** → Register app → Copy config

### 2. Local Setup

```bash
# Clone
git clone https://github.com/justaman045/JobTracker.git
cd JobTracker

# Install
npm install

# Set up environment
cp .env.example .env
# Paste your Firebase config

# Run dev server
npm run dev
```

### 3. Firestore Rules

Deploy the rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

### 4. Deploy

```bash
npm run build
firebase deploy
```

Or push to `main` — the GitHub Actions workflow at `.github/workflows/deploy.yml` handles deployment automatically.

## Project Structure

```
src/
├── App.jsx                 # Root component
├── components/
│   ├── applications/       # Application list, table, filters
│   ├── dashboard/          # Stats, charts
│   ├── kanban/             # Drag & drop board
│   └── ui/                 # Shared UI components
├── context/                # Auth context
├── hooks/                  # Custom hooks
└── lib/                    # Firebase, utilities
```

For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).
