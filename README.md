# Void Cloud Notes App

## Goal

Build a local-first notes app using Void Cloud from VoidZero as the hosting and backend platform.

The app should work like a client-side app after the first visit. Notes should load from local storage, be available offline, and sync with the cloud when the user is online.

## Recommended Stack

- Frontend: React + TypeScript + Vite
- Deployment and backend: Void Cloud
- Offline local database: IndexedDB through Dexie.js
- Editor: Tiptap
- Search: MiniSearch
- PWA: Vite PWA plugin or equivalent service worker setup
- Cloud database: Void Cloud database
- File storage: Void Cloud object storage
- Auth: Void Cloud auth, if available for the project

## Why This Stack

Void Cloud is designed for Vite apps, so it fits naturally with a Vite-based notes app.

The app should not depend on the network for normal use. IndexedDB stores notes locally in the browser, and Void Cloud is used for deployment, authentication, cloud backup, and sync.

This gives the app:

- Fast startup after the first visit
- Offline note reading and editing
- Installable PWA behavior on mobile
- Cloud sync across devices
- A simpler deployment path than managing separate hosting, database, storage, and server infrastructure

## Architecture

```text
Browser / PWA
  React + Vite app
  Tiptap editor
  Dexie.js local database
  MiniSearch local search index
  Service worker for offline app loading

Void Cloud
  Vite app deployment
  API/server functions
  Auth
  Database
  Object storage
  Custom domain
```

## Offline-First Flow

1. User opens the website.
2. The Vite app loads and registers the service worker.
3. App files are cached for offline use.
4. Notes load from IndexedDB immediately.
5. If online, the app pulls the latest cloud changes from Void Cloud.
6. User edits notes locally first.
7. Changes are written to IndexedDB and added to a sync queue.
8. When online, the sync queue pushes changes to Void Cloud.
9. The app resolves conflicts and updates local data.

## Core Features

### Notes

- Create, edit, delete, and archive notes
- Rich text editing
- Autosave
- Offline editing
- Full-text search
- Pin important notes
- Trash or soft delete

### Folders

- Create folders
- Nested folders
- Move notes between folders
- Sort folders manually or alphabetically

### Tags

- Add multiple tags to a note
- Filter notes by tag
- Tag colors
- Search by tag

### Interview Prep

- Store interview questions and answers
- Group by topic, company, role, or difficulty
- Link prep items to normal notes
- Track review status
- Add spaced repetition later

### PWA

- Installable on mobile and desktop
- Offline app shell
- Offline note access
- Sync status indicator

## Suggested Data Model

### notes

```text
id
title
content_json
content_text
folder_id
pinned
archived
deleted_at
created_at
updated_at
version
sync_status
```

### folders

```text
id
name
parent_id
sort_order
created_at
updated_at
deleted_at
```

### tags

```text
id
name
color
created_at
updated_at
deleted_at
```

### note_tags

```text
note_id
tag_id
created_at
```

### interview_prep_items

```text
id
question
answer
topic
difficulty
company
role
note_id
last_reviewed_at
next_review_at
confidence
created_at
updated_at
deleted_at
```

### sync_queue

```text
id
entity_type
entity_id
operation
payload
created_at
attempt_count
last_error
```

## Sync Strategy

Use client-generated IDs so users can create notes offline before the server sees them.

Every record should have:

- `id`
- `created_at`
- `updated_at`
- `deleted_at`
- `version`

For the first version, use last-write-wins conflict handling based on `updated_at` and `version`.

Later, improve conflict handling for note content by keeping conflicting copies or using a merge strategy.

## MVP Scope

Build the first version with:

- React + Vite project
- PWA support
- Dexie local database
- Notes CRUD
- Folders
- Tags
- Tiptap editor
- Local search
- Basic interview prep section
- Void Cloud deployment
- Basic cloud sync
- Export to JSON or Markdown

## Local Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

The current implementation includes the local-first MVP pieces:

- Vite + React + TypeScript project
- PWA manifest and service worker setup
- Dexie IndexedDB database
- Notes CRUD with autosave
- Folders
- Tags
- Tiptap rich text editor
- MiniSearch local search
- Interview prep board
- Sync queue placeholder for Void Cloud sync
- JSON export
- Add samples action for seeding useful starter notes from the app UI

## Void Cloud Integration TODO

The app is ready for a Void Cloud backend integration, but the cloud calls are intentionally not hardcoded yet.

Next backend tasks:

- Add Void Cloud auth once the project is created in Void Cloud
- Create database tables matching the local schema
- Add server/API functions for pull and push sync
- Replace the local sync queue placeholder with real Void Cloud requests
- Add object storage support for attachments
- Configure the production custom domain in Void Cloud

## Later Features

- Attachments
- Markdown import/export
- Better conflict resolution
- Spaced repetition for interview prep
- Keyboard shortcuts
- Global command palette
- Note backlinks
- Daily notes
- Templates
- End-to-end encryption

## Main Risk

Void Cloud is still a newer platform. The app should include export and backup early so notes are not locked into one backend.

The local-first design reduces this risk because the browser keeps a full local copy of the user's notes.
