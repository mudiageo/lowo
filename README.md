# Lowo 💰 — Local-First, Privacy-Focused Budget Planner

Lowo is a modern, high-performance personal finance manager built focusing on privacy, offline capabilities, and an exceptional mobile-web experience. It treats the web as a first-class citizen for high-utility, PWA-driven applications.

## 🌟 Key Features

- **🔐 Privacy First**: All your financial data, API keys, and preferences are stored exclusively on your device using IndexedDB. No server-side storage of sensitive data.
- **☁️ AI Insights**: Leverage **Google Gemini 2.5 Flash** for real-time spending analysis and financial planning, powered by your own local API key.
- **📱 PWA Ready**: Fully installable on iOS and Android. Works offline with a robust service-worker-backed application shell.
- **🛡️ Security**: Local app lock with 4-digit PIN and **Biometric (WebAuthn)** support for secure, convenient access.
- **⚡ Supercharged UI**: Built with Svelte 5 and Tailwind CSS v4 for buttery smooth animations and a premium look and feel.
- **🌍 Local Context**: Designed with common Nigerian financial workflows in mind (Bank Transfers, USSD, NGN support).

## 🛠️ Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5 (Runes)
- **Monorepo Toolchain**: [Vite+](https://viteplus.dev)
- **Database**: Dexie.js (IndexedDB)
- **Styling**: Tailwind CSS v4 + shadcn-svelte
- **Auth & Logic**: WebAuthn for biometrics, Valibot for validation, Lucide for icons.

## 🚀 Development

This project uses `vp` (Vite+) as the global toolchain.

### Prerequisites

Install `vp` (Vite+) globally if you haven't already done so

**macOS / Linux**
```bash
curl -fsSL https://vite.plus | bash
```

**Windows (PowerShell)**
```powershell
irm https://vite.plus/ps1 | iex
```

### Setup

```bash
# Install dependencies across the monorepo
vp install

# Prepare the development environment
vp run ready
```

### Running Locally

```bash
# Start the development server for the web app
vp run dev
```

### Building & Testing

```bash
# Run unit and e2e tests
vp run test -r

# Build the entire monorepo for production
vp run build -r
```

## 🏗️ Monorepo Structure

- `apps/web`: The main SvelteKit PWA application.
- `packages/shared`: Common types, utilities, and shared logic (if applicable).

---
