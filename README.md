# CommandVault — Developer Snippet & Command Cheat Sheet

A keyboard-first, Raycast / Alfred-style developer snippet organizer and command cheat sheet built with **React**, **TypeScript**, and **Vite**.

Designed for engineers who constantly need quick access to Docker cleanup commands, tricky Git undos, Linux process diagnostic one-liners, Kubernetes crash log flags, Regex patterns, and PostgreSQL upserts.

---

## ⚡ Core Features

* **🎨 Dual Workspaces (TUI vs Linear)**:
  * **1. Zed / Helix TUI Mode**: Razor-sharp monospaced terminal density, 1px borders, status line with `NORMAL` mode indicator, instant prompt, zero visual fluff.
  * **2. Linear Precision Mode**: 3-pane ergonomic flow (Categories Sidebar with live counts → Command Stream → Argument Inspector) with warm charcoal darks and tactile parameter chips.
  * **Toggle Switcher**: Instant top-bar toggle or hotkey <kbd>⌘ + M</kbd> / <kbd>Ctrl + M</kbd> to switch between views anytime. Preferences persist in `localStorage`.
* **☀️ Complete Light & Dark Themes**:
  * Developer-grade high-craft light mode (clean paper surfaces, subtle `#e4e4e7` borders, deep ink typography).
  * Quick toggle in header or hotkey <kbd>⌘ + T</kbd> / <kbd>Ctrl + T</kbd>.
* **⌨️ Keyboard-First Navigation**:
  * `↑` / `↓` Arrow keys: Seamlessly cycle through filtered commands.
  * `↵` Enter: Instantly copy the active command to clipboard.
  * `⌘ + K` or `Ctrl + K`: Jump focus straight into the search input.
  * `⌘ + M` or `Ctrl + M`: Toggle workspace view (Zed TUI ↔ Linear 3-Pane).
  * `⌘ + T` or `Ctrl + T`: Toggle color theme (Dark ↔ Light).
  * `⌘ + P` or `Ctrl + P`: Toggle favorite / pin on the selected snippet.
  * `⌘ + N` or `Ctrl + N`: Open the quick snippet creator dialog.
  * `Esc`: Clear search query or dismiss open modals.
* **🛡️ Inline Delete Confirmation**:
  * Micro tooltip-style confirmation bubble attached directly to the trash icon to prevent accidental deletions without annoying alert popups.
* **🫧 Global Portal Tooltips**:
  * Zero-clipping floating tooltips rendered at root (`position: fixed`, z-index 999,999) with automatic viewport boundary flipping — never cut off by overflow containers or bars.
* **📱 Fluid Mobile & Small Viewport Responsiveness**:
  * Complete vertical document scrolling on smaller heights and mobile devices.
  * TUI and Linear workspaces stack gracefully with horizontal category swiping, scrollable lists, and fully accessible inspector panes.
* **🔍 Instant Fuzzy Search**:
  * Multi-dimensional scoring across command syntax, title, tags, description, and category.
  * Prioritizes prefix matches, word boundaries, and favorites.
* **🎛️ Live Parameter Substitution**:
  * Commands containing placeholders like `<container>`, `<port>`, or `<table>` expose interactive input fields in the preview pane.
  * Edit the argument, and the copy-ready command dynamically updates in real time!
* **📖 Markdown Documentation & Flag Cheatsheet**:
  * Each command provides a split-view detail pane explaining CLI flags, warnings, and next steps.
* **💾 Persistent Storage**:
  * All custom snippets, favorites, and edits persist in browser `localStorage`.
  * Pre-seeded with curated recipes for Docker, Git, Bash, Kubernetes, Regex, and SQL.
  * One-click "Reset Defaults" restores curated starter snippets anytime.

---

## 🚀 Quick Start

### Installation & Development
```bash
# Navigate to project directory
cd /home/alonejack/.gemini/antigravity/scratch/dev-snippets

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5174` in your browser.

---

## 🛠️ Tech Stack
* **Framework**: React 19 + TypeScript
* **Build Tool**: Vite 8
* **Styling**: Sleek Raycast/Linear titanium dark UI with tactile `<kbd>` badges
* **Icons**: Lucide React
* **Persistence**: LocalStorage with auto-seeding

