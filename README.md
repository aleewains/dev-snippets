# CommandVault — Developer Snippet & Command Cheat Sheet

CommandVault is a keyboard-first, zero-latency developer command cheat sheet and snippet manager built with React 19, TypeScript, and Vite. Designed to eliminate context-switching for engineers who repeatedly search for tricky Git undos, Docker purge commands, Kubernetes log flags, PostgreSQL upserts, and Regex recipes, it delivers instant fuzzy search, live argument placeholder substitution, dual customizable workspaces (Zed Terminal TUI and Linear 3-Pane), and complete Light and Dark theme modes.

---

## 🚀 How to Run It

Follow these instructions literally from a terminal:

### Prerequisites
* **Node.js**: Version 18.0.0 or higher
* **npm**: Version 9.0.0 or higher

### Installation & Launch
```bash
# 1. Clone or navigate to the repository directory
cd dev-snippets

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open `http://localhost:5173` (or the URL printed in your terminal) in any modern browser.

### Verification & Production Build
```bash
# Run TypeScript type check
npx tsc --noEmit

# Compile production bundle
npm run build
```
A successful build outputs compiled chunks in `dist/` and exits with code `0`.

---

## 🔑 Environment Variables

**No environment variables are required.**

| Variable | Purpose | Default | Required? | Behavior Without It |
| :--- | :--- | :--- | :--- | :--- |
| *None* | N/A | N/A | No | The application runs completely in-browser without third-party API keys, tokens, or backend secrets. |

**Rationale**: CommandVault is deliberately engineered as a self-contained, privacy-first client application. Snippets, preferences, and favorites are stored locally in the browser (`localStorage`), preventing private commands, credentials, or internal URLs from ever leaving your machine.

---

## 🎯 How to Use It (Shortest Path to Seeing It Work)

1. **Search**: Press <kbd>⌘ + K</kbd> (or <kbd>Ctrl + K</kbd>) and type `docker` or `undo`. The fuzzy ranking engine instantly surfaces relevant commands.
2. **Navigate & Copy**: Use the <kbd>↑</kbd> and <kbd>↓</kbd> arrow keys to highlight a command, then hit <kbd>↵ Enter</kbd> to copy it to your clipboard.
3. **Live Parameter Substitution**: In the detail/inspector pane, change any `<placeholder>` argument (e.g., replace `<container>` with `my-web-api`). The command preview updates in real time with copy-ready syntax.
4. **Switch Workspaces**: Press <kbd>⌘ + M</kbd> to toggle between the **Zed / Helix Terminal TUI** and the **Linear 3-Pane** workspace.
5. **Toggle Theme**: Press <kbd>⌘ + T</kbd> to switch between Dark mode and high-contrast Light mode.
6. **Filter Favorites**: Press <kbd>⌘ + P</kbd> on any snippet to toggle its favorite star, then click `[★ FAVS]` in the category bar to view only pinned commands.

---

## ⚠️ What It Does Not Do (Known Limits & Deliberate Omissions)

Documenting what the application does *not* do distinguishes deliberate architectural boundaries from oversights:

1. **No Remote Cloud Sync**: Snippets are stored in browser `localStorage`. There is currently no multi-device cloud synchronization or user authentication; clearing your browser cache resets to the default starter snippets unless manually exported.
2. **No Interactive Terminal Execution (`exec`)**: CommandVault is an authoring, documentation, and clipboard tool. It does not spawn subshells or run commands directly on the host machine for security reasons.
3. **Single Selection Only**: Bulk operations (multi-select deletion, batch category re-tagging) are not supported in the current interface.
4. **No Git Versioning of Snippet History**: Editing a snippet overwrites its previous content in `localStorage` without a rollback revision history.

---

## 🏗️ Architecture & Contributing

For a deep dive into the code layout, file rationale, instructions on how to add new features without breaking existing behavior, and notes on fragile areas (such as CSS height constraint traps), refer to the companion guide:

👉 **[Read the Contributor & Architecture Guide (`CONTRIBUTING.md`)](./CONTRIBUTING.md)**
