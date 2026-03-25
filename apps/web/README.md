# Lowo Application

Lowo is a Nigerian-context personal budget planner designed to act like a robust, native mobile application on the web. Built specifically with a local-first philosophy, it operates fully offline and stores all your exact financial metadata in your device using IndexedDB, syncing to the cloud only if toggled on.

## Tech Stack

This project was built utilizing cutting-edge web technologies:
- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) with **Svelte 5 Runes** (compiled natively, no virtual DOM).
- **Toolchain**: [Vite+](https://viteplus.dev/) monorepo structure.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn-svelte](https://www.shadcn-svelte.com/).
- **Data Layer (Local)**: [Dexie.js](https://dexie.org/) for IndexedDB local-first storage.
- **Validation**: [Valibot](https://valibot.dev/) for tiny, robust schema parsing.
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) executing directly in the client (`gemini-2.5-flash`).
- **PWA**: Fully offline-capable application shell with Service Workers & Manifest.

## Core Features

- **Multi-step Onboarding**: Smoothly guides the user through setting up their currency, initial pool, and recurring incomes.
- **Dashboard & Budgets**: Keep track of your exact spending periods with custom start dates or rotating calendar anchors (like a recurring 25th of the month salary).
- **Quick-Add Expense Tracking**: Log expenses within 2 taps using a prominent UI button, supporting multiple payment methods (Bank Transfer, USSD, Cash, Card).
- **Google Gemini Insights**: Real-time spending analysis utilizing your locally stored device API key. No server roundtrips, total privacy.
- **Savings Goals**: Visualize your big purchases (e.g. buying a new house or car) alongside your active budgets.
- **Offline First**: All data defaults to local. Never wait for a loading spinner when pulling up your list of budgets inside a supermarket with a bad network connection.

## Development

First, ensure you have ran the Vite+ install script inside the monorepo root:

```bash
vp install
```

Start the local development server:

```bash
vp run dev
```

Build for production (generates the service worker and production assets):

```bash
vp build
```

## Cloud Sync Architecture (Feature Flagged)

While the default MVP stores all user preferences, secrets, and raw financial streams directly inside the browser sandbox using IndexedDB (for absolute privacy), a remote cloud synchronization module using **Drizzle ORM**, **better-auth**, and a Remote SvelteKit server function is scaffolded in `src/lib/features/sync/sync.ts`.

It behaves utilizing a delta-sync mechanism, capturing recent writes and dispatching them gracefully through server endpoints when network connectivity is restored (`navigator.onLine`).
