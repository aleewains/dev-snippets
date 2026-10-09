# Contributor & Architecture Guide: CommandVault

> This guide documents the codebase layout, design rationale, extension workflows, verification procedures, and fragile areas so that any engineer can contribute features or fixes without breaking existing functionality.

---

## 1. Codebase Layout & Architectural Rationale

The project follows a modular, feature-oriented React + TypeScript structure designed for low cognitive overhead and clear separation of concerns:

```
dev-snippets/
├── src/
│   ├── components/            # UI components and view layouts
│   │   ├── TuiView.tsx        # Zed/Helix terminal aesthetic workspace (Concept 1)
│   │   ├── LinearView.tsx     # 3-Pane ergonomic inspector workspace (Concept 2)
│   │   ├── GlobalTooltip.tsx  # Document-root portal tooltip (zero overflow clipping)
│   │   ├── SnippetModal.tsx   # Add/Edit snippet modal dialog
│   │   ├── CommandPaletteHeader.tsx # Legacy/fallback search header
│   │   ├── SnippetList.tsx    # Legacy/fallback snippet list
│   │   ├── SnippetPreview.tsx # Legacy/fallback snippet preview pane
│   │   └── FooterShortcuts.tsx# Keyboard shortcuts status HUD
│   ├── data/
│   │   └── defaultSnippets.ts # Initial seed data (Docker, Git, Bash, K8s, SQL, Regex)
│   ├── types/
│   │   └── snippet.ts         # TypeScript domain models (Snippet, Category, ViewMode)
│   ├── utils/
│   │   ├── fuzzySearch.ts     # Multi-factor fuzzy ranking & search algorithm
│   │   └── storage.ts         # LocalStorage read/write and default seeding abstraction
│   ├── App.tsx                # Root state orchestration, hotkeys, theme sync
│   ├── main.tsx               # React 19 DOM entry point
│   └── styles.css             # Theme tokens, layout grids, scrollbars, animations
├── index.html                 # Single page application HTML shell
├── package.json               # Scripts and dependency declarations
├── tsconfig.json              # TypeScript strict compiler configuration
└── vite.config.ts             # Vite build & development server configuration
```

### Why It Is Organized This Way
* **Strict decoupling of Views from State**: `App.tsx` owns the global state (snippets, active search, selection index, view mode, theme). `TuiView.tsx` and `LinearView.tsx` are pure presentational engines that receive data and callbacks. This allows toggling between two radically different UI paradigms with zero state loss or data desync.
* **Domain Isolation (`src/types/snippet.ts`)**: Type definitions are separated from business logic. Any change to the snippet schema is compiler-enforced across all components, storage utilities, and seed data.
* **Extracted Utilities (`src/utils/`)**: Storage and search logic are isolated from React lifecycles. They can be unit-tested independently without mocking the DOM or React hooks.
* **Global Portals at Root**: Overlays that must escape parent stacking contexts (`GlobalTooltip.tsx`, `SnippetModal.tsx`) mount at the document root to avoid CSS overflow clipping.

---

## 2. Where New Features Belong & What to Touch

### Scenario A: Adding a New Snippet Category
To add a new category (e.g., `'aws'` or `'python'`):
1. **Update Types** in [`src/types/snippet.ts`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/types/snippet.ts):
   - Add the new string literal to `SnippetCategory`:
     ```ts
     export type SnippetCategory = 'all' | 'docker' | 'git' | 'bash' | 'k8s' | 'sql' | 'regex' | 'aws' | 'custom';
     ```
2. **Add Starter Snippets** in [`src/data/defaultSnippets.ts`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/data/defaultSnippets.ts):
   - Add new snippet objects with `category: 'aws'`.
3. **Register Category in Views**:
   - In [`src/components/TuiView.tsx`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/components/TuiView.tsx): Add `{ label: 'AWS', value: 'aws' }` to the `categories` array.
   - In [`src/components/LinearView.tsx`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/components/LinearView.tsx): Add `{ label: 'AWS', value: 'aws', icon: <Cloud size={14} /> }` to the `categories` array.
   - In [`src/components/SnippetModal.tsx`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/components/SnippetModal.tsx): Add `<option value="aws">AWS</option>` to the category dropdown.
4. **Add Theme Styling** in [`src/styles.css`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/styles.css):
   - Add dark theme badge colors: `.linear-tag-aws { background: ...; color: ...; }`
   - Add light theme badge colors under `[data-theme="light"]`: `[data-theme="light"] .linear-tag-aws { ... }`

### Scenario B: Adding a Global Keyboard Shortcut
To add a new hotkey (e.g., `⌘E` to export snippets):
1. **Listen in `App.tsx`**: Add a case inside the `window.addEventListener('keydown', handleKeyDown)` effect in [`src/App.tsx`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/App.tsx).
   - Ensure you check `(e.metaKey || e.ctrlKey)` for cross-platform support (macOS vs Linux/Windows).
   - Ignore events if `isModalOpen` is true or if an `<input>` / `<textarea>` currently has active focus.
2. **Display Shortcut Hint**:
   - Add the `<kbd>` badge to the statusbar hints in `TuiView.tsx` (`tui-status-hints`) and `LinearView.tsx` (`linear-footer-hints`).

### Scenario C: Adding an Alternate Workspace View Mode
1. **Extend Type**: Add the mode identifier to `ViewMode` in `src/types/snippet.ts` (e.g., `export type ViewMode = 'tui' | 'linear' | 'bento';`).
2. **Create View Component**: Build `src/components/BentoView.tsx` implementing the standard view props interface (`snippets`, `activeSnippet`, `onCopyCommand`, etc.).
3. **Wire in `App.tsx`**: Add the mode button to the masthead switcher and add a conditional render branch inside `<main>`.

---

## 3. How to Run Checks & Tests

This repository enforces strict TypeScript types and production bundle compilation.

### Step 1: Type Checking
Run the TypeScript compiler in check-only mode:
```bash
npx tsc --noEmit
```
**Passing output**:
```
(No terminal output, exits with status code 0)
```

### Step 2: Production Build Verification
Compile the assets with Vite and verify bundle chunks:
```bash
npm run build
```
**Passing output**:
```
> dev-snippets@1.0.0 build
> tsc && vite build

vite v8.3.4 building client environment for production...
✓ 1907 modules transformed.
rendering chunks (1)...computing gzip size...
dist/index.html                   0.73 kB │ gzip:  0.46 kB
dist/assets/index-Pek7RRcS.css   40.67 kB │ gzip:  6.92 kB
dist/assets/index-DkXpapdW.js   266.04 kB │ gzip: 82.35 kB

✓ built in 236ms
```
If any imports, unescaped characters, or broken interfaces exist, `tsc` will fail with an exit code of `1` and print the exact line and error.

---

## 4. Fragile Areas & Architectural Gotchas

Every codebase has sensitive seams where seemingly benign edits cause regressions. Below are the fragile areas in CommandVault:

### ⚠️ 1. CSS Grid Height-Constraint Trap (`min-height: 0` vs `overflow`)
* **Where**: [`src/styles.css`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/styles.css) on `main`, `.tui-panes`, `.tui-list`, `.linear-panes`, `.linear-stream-content`.
* **The Fragility**: In CSS Grid and Flexbox, flex items default to `min-height: auto`. If any parent container in the tree between `body` and `.tui-list` omits `min-height: 0` or sets `height: auto`, the browser calculates the container height based on its child content length.
* **Symptom if broken**: The inner scrollbar disappears, the snippet list expands to its full length (hundreds of pixels), and the entire website/body starts scrolling vertically.
* **Rule**: Never remove `min-height: 0` or `height: 100%` from `main`, `.tui-panes`, `.tui-list`, or `.linear-panes`.

### ⚠️ 2. Tooltip Overflow Clipping & Portal Placement
* **Where**: [`src/components/GlobalTooltip.tsx`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/components/GlobalTooltip.tsx) and elements with `data-tooltip`.
* **The Fragility**: Do not replace `GlobalTooltip.tsx` with CSS pseudo-elements (`[data-tooltip]::before` / `::after`).
* **The Reason**: The snippet stream and code blocks live inside containers with `overflow: hidden` and `overflow-y: auto`. Any CSS pseudo-element that extends past the container boundary will be abruptly clipped by the browser rendering engine. `GlobalTooltip` bypasses this by mounting at `document.body` level with `position: fixed` and `z-index: 999999`.
* **Clamping Math**: If you adjust tooltip positioning in `GlobalTooltip.tsx`, always preserve `clampedX` and dynamic `arrowPercent`. Without `clampedX`, tooltips attached to buttons on the right edge of the screen will render off-screen.

### ⚠️ 3. LocalStorage Parsing & Schema Fallbacks
* **Where**: [`src/utils/storage.ts`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/utils/storage.ts).
* **The Fragility**: `loadSnippets()` reads and parses JSON from `localStorage`. If a user has stale or malformed data from an earlier release in their browser storage, a direct `JSON.parse` cast without an array check can crash the entire application on boot with a white screen.
* **Rule**: Always wrap `localStorage.getItem` in a `try...catch` block and fall back to `DEFAULT_SNIPPETS` if `!Array.isArray(parsed)`.

### ⚠️ 4. Input Focus vs Global Hotkeys
* **Where**: [`src/App.tsx`](file:///home/alonejack/.gemini/antigravity/scratch/dev-snippets/src/App.tsx) inside `handleKeyDown`.
* **The Fragility**: Global shortcuts like `↑`, `↓`, `↵`, and `Esc` must not trigger when a user is actively typing inside an `<input>` or `<textarea>` (such as the parameter substitution inputs or the modal form).
* **Rule**: Keep the `isInputActive` check at the very top of `handleKeyDown`:
  ```ts
  const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
    (document.activeElement?.tagName || '')
  );
  if (isInputActive && e.key !== 'Escape') return;
  ```

---

## 5. Architectural Decisions & Trade-Offs

| Decision | Alternative Considered | Trade-off Accepted |
| :--- | :--- | :--- |
| **Vanilla DOM Event Delegation for Tooltips** | Radix UI / Floating UI / Tippy.js npm packages | Avoided pulling in 40+ KB of external runtime dependencies. Accepted writing ~100 lines of manual coordinate collision math. |
| **Dual View Architecture (TUI + Linear)** | Single compromise layout | Maintained two layout components (`TuiView` and `LinearView`). Accepted maintaining CSS classes for both views to deliver zero-compromise developer ergonomics. |
| **Pure Client-Side LocalStorage** | SQLite / IndexedDB / Backend REST API | Instant sub-millisecond boot with zero backend setup or docker container requirements. Accepted that snippet storage is bound to the local browser profile. |
| **Custom Fuzzy Ranking Algorithm** | Fuse.js library | Replaced generic fuzzy search with specialized dev-command ranking prioritizing prefix tokens, command syntax flags, and favorite weights. |
