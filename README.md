# North — Job Application Tracker

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/yourusername/north/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/north/actions)

Track every job application, interview, and offer in one place. Beautiful, fast, and built for solo job seekers and open-source enthusiasts.

![Dashboard](https://via.placeholder.com/800x450/6366f1/ffffff?text=Dashboard+Preview)

## Features

- **Dashboard** — Stats, charts, pipeline velocity, activity feed
- **Application List** — Search, filter, sort, bulk actions, saved filters
- **Kanban Board** — Drag & drop applications across status columns
- **Detail View** — Full app details, interview rounds, status timeline
- **Offer Comparison** — Weighted scoring to compare offers side by side
- **Google Sign-In** — Quick and secure authentication
- **Dark Mode** — System-aware with manual toggle
- **Export/Import** — CSV for spreadsheets, JSON for full backup
- **PWA** — Install on desktop or mobile
- **Keyboard Shortcuts** — `N` new, `/` search, `?` help

## Quick Start

### 1. Firebase Setup (5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create project**
2. **Authentication** → Sign-in providers → Enable **Google**
3. **Firestore Database** → Create database → Choose a region → **Start in test mode**
4. **Project Settings (⚙️)** → General → Your apps → **Web (</>)** → Register app
5. Copy the `firebaseConfig` values

### 2. Configure

```bash
cp .env.example .env
# Edit .env and paste your Firebase config values
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Secure Firestore & Storage (After First Run)

Set your Firestore rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /applications/{docId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Set your Storage rules:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## 💰 Spark Plan (Free Forever)

This app runs entirely on Firebase's free **Spark plan**:
- **Authentication** — Google Sign-In (free)
- **Firestore** — 1 GB stored, 50K reads/day, 20K writes/day
- **Storage** — 5 GB, 20K uploads/day, 1 GB/day download
- **Hosting** — 10 GB storage, 100 GB/month bandwidth
- **No Cloud Functions** or paid extensions used

## Deploy

### Firebase Hosting

```bash
npm run build
npx firebase-tools init hosting    # point to dist/
npx firebase-tools deploy --only hosting
```

### Docker

```bash
docker compose up --build
```

## Tech Stack

React + Vite + Tailwind CSS v4 + Firebase (Auth + Firestore) + Recharts + React Router v6 + dnd-kit + Lucide + date-fns

## License

MIT
