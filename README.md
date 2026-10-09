# CommandVault — Developer Snippet & Command Cheat Sheet

A keyboard-first, Raycast / Alfred-style developer snippet organizer and command cheat sheet built with **React**, **TypeScript**, and **Vite**.

Designed for engineers who constantly need quick access to Docker cleanup commands, tricky Git undos, Linux process diagnostic one-liners, Kubernetes crash log flags, Regex patterns, and PostgreSQL upserts.

---

## ⚡ Core Features

* **⌨️ Keyboard-First Navigation (Raycast Style)**:
  * `↑` / `↓` Arrow keys: Seamlessly cycle through filtered commands.
  * `↵` Enter: Instantly copy the active command to clipboard.
  * `⌘ + K` or `Ctrl + K`: Jump focus straight into the fuzzy search input.
  * `⌘ + P` or `Ctrl + P`: Toggle favorite / pin on the selected snippet.
  * `⌘ + N` or `Ctrl + N`: Open the quick snippet creator dialog.
  * `Esc`: Clear search query or dismiss open modals.
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
