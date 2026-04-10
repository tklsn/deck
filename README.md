# D.E.C.K — Design, Engineering, Concept Kit

A desktop app that turns a project idea into a complete specification deck — requirements, architecture, epics, user stories, and design canvas — powered by AI.

## What it does

You describe an idea. D.E.C.K. uses AI to generate:

- **Requirements document** — functional and non-functional requirements
- **Project scope** — in/out-of-scope items and assumptions
- **Architecture** — component breakdown and technical decisions
- **Project plan** — tasks, deliverables and milestones
- **Epics & user stories** — with acceptance criteria and BDD scenarios (Given/When/Then)

  Everything is stored locally via IndexedDB — no cloud account required.

## Supported AI providers

| Provider  | Models                          |
| --------- | ------------------------------- |
| OpenAI    | GPT-4o, o1, o3-mini             |
| Anthropic | Claude Opus, Sonnet, Haiku      |
| Google    | Gemini 2.0 Flash, 1.5 Pro/Flash |
| Ollama    | Any local model                 |
| LM Studio | Any local model                 |

Bring your own API key. Keys are encrypted with the OS keychain via Electron's `safeStorage`.

## Download

Pre-built binaries are available on the [Releases](https://github.com/silvercent011/sofia-desktop/releases) page.

| Platform      | File               |
| ------------- | ------------------ |
| Linux         | `.AppImage`        |
| macOS         | `.dmg`             |
| Windows x64   | `-Setup.exe`       |
| Windows ARM64 | `-arm64-Setup.exe` |

The app checks for updates automatically on startup and notifies you when a new version is available.

> **macOS note:** The app is currently unsigned. On first launch, right-click the `.app` and choose **Open** to bypass the Gatekeeper warning.

## Development

**Requirements:** Node 24, pnpm 10

```bash
pnpm install
pnpm run electron:dev   # dev mode with hot-reload
```

**Build for production:**

```bash
pnpm run build          # packages for the current platform
```

**Release a new version:**

```bash
pnpm run release        # bumps version, generates changelog, pushes tag
```

Pushing a tag triggers the CI workflow which builds and publishes binaries for all three platforms to GitHub Releases automatically.

## Tech stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn-vue](https://www.shadcn-vue.com/)
- [Dexie.js](https://dexie.org/) — local IndexedDB storage
- [electron-updater](https://www.electron.build/auto-update) — auto-updates via GitHub Releases

---

Built with ❤️ by The Koala Solution 🐨 in 🇧🇷
