function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function serializeForScript(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

const OPENCLAW_SHELL_CSS = String.raw`
:root {
  --bg: #0e1015;
  --bg-accent: #13151b;
  --bg-elevated: #191c24;
  --bg-hover: #1f2330;
  --bg-muted: #1f2330;
  --bg-content: #13151b;
  --card: #161920;
  --card-foreground: #f0f0f2;
  --card-highlight: rgba(255, 255, 255, 0.04);
  --popover: #191c24;
  --popover-foreground: #f0f0f2;
  --panel: #0e1015;
  --panel-strong: #191c24;
  --panel-hover: #1f2330;
  --chrome: rgba(14, 16, 21, 0.96);
  --chrome-strong: rgba(14, 16, 21, 0.98);
  --text: #d4d4d8;
  --text-strong: #f4f4f5;
  --muted: #838387;
  --muted-strong: #75757d;
  --border: #1e2028;
  --border-strong: #2e3040;
  --border-hover: #3e4050;
  --input: #1e2028;
  --ring: #ff5c5c;
  --accent: #ff5c5c;
  --accent-hover: #ff7070;
  --accent-subtle: rgba(255, 92, 92, 0.1);
  --accent-glow: rgba(255, 92, 92, 0.2);
  --primary-foreground: #ffffff;
  --secondary: #161920;
  --ok: #22c55e;
  --warn: #f59e0b;
  --danger: #ef4444;
  --danger-subtle: rgba(239, 68, 68, 0.08);
  --focus-ring: 0 0 0 2px var(--bg), 0 0 0 3px color-mix(in srgb, var(--ring) 80%, transparent);
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.4);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 100ms;
  --duration-normal: 180ms;
  color-scheme: dark;
}

:root[data-theme-mode="light"] {
  --bg: #f8f9fa;
  --bg-accent: #f1f3f5;
  --bg-elevated: #ffffff;
  --bg-hover: #eceef0;
  --bg-muted: #eceef0;
  --bg-content: #f1f3f5;
  --card: #ffffff;
  --card-foreground: #1a1a1e;
  --card-highlight: rgba(0, 0, 0, 0.02);
  --popover: #ffffff;
  --popover-foreground: #1a1a1e;
  --panel: #f8f9fa;
  --panel-strong: #f1f3f5;
  --panel-hover: #e6e8eb;
  --chrome: rgba(248, 249, 250, 0.96);
  --chrome-strong: rgba(248, 249, 250, 0.98);
  --text: #3c3c43;
  --text-strong: #1a1a1e;
  --muted: #6e6e73;
  --muted-strong: #545458;
  --border: #e5e5ea;
  --border-strong: #d1d1d6;
  --border-hover: #aeaeb2;
  --input: #e5e5ea;
  --ring: #dc2626;
  --accent: #dc2626;
  --accent-hover: #ef4444;
  --accent-subtle: rgba(220, 38, 38, 0.08);
  --accent-glow: rgba(220, 38, 38, 0.1);
  --secondary: #f1f3f5;
  --ok: #15803d;
  --warn: #b45309;
  --danger: #dc2626;
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font: 400 14px/1.55 var(--font-body);
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  height: 100vh;
  overflow: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea,
select {
  font: inherit;
  color: inherit;
}

:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.shell {
  --shell-nav-width: 258px;
  --shell-nav-rail-width: 78px;
  --shell-topbar-height: 52px;
  --shell-focus-duration: 200ms;
  --shell-focus-ease: var(--ease-out);
  height: 100vh;
  display: grid;
  grid-template-columns: var(--shell-nav-width) minmax(0, 1fr);
  grid-template-rows: var(--shell-topbar-height) 1fr;
  grid-template-areas:
    "nav topbar"
    "nav content";
  gap: 0;
  overflow: hidden;
  transition: grid-template-columns var(--shell-focus-duration) var(--shell-focus-ease);
}

.shell--nav-collapsed {
  grid-template-columns: var(--shell-nav-rail-width) minmax(0, 1fr);
}

.shell--embedded {
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 1fr;
  grid-template-areas: "content";
}

.topbar {
  grid-area: topbar;
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  padding: 0 24px;
  min-height: 58px;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(12px) saturate(1.6);
  -webkit-backdrop-filter: blur(12px) saturate(1.6);
}

.shell--embedded .topbar,
.shell--embedded .shell-nav,
.shell--embedded .shell-nav-backdrop {
  display: none;
}

.topnav-shell {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: var(--shell-topbar-height);
}

.topbar-nav-toggle,
.nav-collapse-toggle {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bg-elevated) 80%, transparent);
  color: var(--muted);
  cursor: pointer;
  transition:
    background var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}

.topbar-nav-toggle {
  display: none;
}

.topnav-shell__content {
  min-width: 0;
  flex: 1;
}

.topnav-shell__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.dashboard-header__breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
}

.dashboard-header__breadcrumb-link,
.dashboard-header__breadcrumb-sep {
  color: var(--muted);
}

.dashboard-header__breadcrumb-current {
  color: var(--text-strong);
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-theme-mode,
.topbar-language-mode {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bg-elevated) 78%, transparent);
}

.topbar-theme-mode__btn,
.topbar-language-mode__btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition:
    color var(--duration-fast) ease,
    background var(--duration-fast) ease,
    border-color var(--duration-fast) ease;
}

.topbar-language-mode__btn {
  min-width: 42px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 650;
}

.topbar-theme-mode__btn:hover,
.topbar-language-mode__btn:hover {
  color: var(--text);
  background: var(--bg-hover);
}

.topbar-theme-mode__btn--active,
.topbar-language-mode__btn--active {
  color: var(--accent);
  background: var(--accent-subtle);
  border-color: color-mix(in srgb, var(--accent) 25%, transparent);
}

.shell-nav {
  grid-area: nav;
  display: flex;
  min-height: 100%;
  overflow: hidden;
  border-right: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
}

.shell-nav-backdrop {
  display: none;
}

.sidebar {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg) 96%, var(--bg-elevated) 4%);
}

.sidebar-shell {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  padding: 14px 10px 12px;
}

.sidebar-shell__header,
.sidebar-shell__footer {
  flex-shrink: 0;
}

.sidebar-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 8px 18px;
}

.sidebar-shell__body {
  min-height: 0;
  flex: 1;
  display: flex;
}

.sidebar-shell__footer {
  padding: 12px 0 0;
  border-top: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.sidebar-brand__logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 28%, var(--bg-elevated) 72%), color-mix(in srgb, var(--accent) 12%, var(--bg) 88%));
  color: var(--text-strong);
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 8px 18px color-mix(in srgb, black 12%, transparent);
}

.sidebar-brand__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sidebar-brand__eyebrow {
  font-size: 10px;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--muted);
  text-transform: uppercase;
}

.sidebar-brand__title {
  font-size: 15px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section {
  display: grid;
  gap: 6px;
  margin-bottom: 16px;
}

.nav-section__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 0 10px;
  min-height: 28px;
  background: transparent;
  border: none;
  color: color-mix(in srgb, var(--muted) 72%, var(--text) 28%);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.nav-section__items {
  display: grid;
  gap: 4px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  min-height: 40px;
  padding: 0 9px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  transition:
    border-color var(--duration-fast) ease,
    background var(--duration-fast) ease,
    color var(--duration-fast) ease;
}

.nav-item:hover {
  color: var(--text);
  background: color-mix(in srgb, var(--bg-hover) 84%, transparent);
  border-color: color-mix(in srgb, var(--border) 72%, transparent);
}

.nav-item--active {
  color: var(--text-strong);
  background: color-mix(in srgb, var(--accent-subtle) 88%, var(--bg-elevated) 12%);
  border-color: color-mix(in srgb, var(--accent) 18%, transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 10%, transparent),
    0 12px 24px color-mix(in srgb, black 10%, transparent);
}

.nav-item__icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.72;
}

.nav-item__icon svg,
.topbar-nav-toggle svg,
.nav-collapse-toggle svg,
.topbar-theme-mode__btn svg,
.toolbar-button svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.7px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-item--active .nav-item__icon {
  opacity: 1;
  color: var(--accent);
}

.nav-item__text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar--collapsed .sidebar-shell {
  padding: 12px 8px 10px;
}

.sidebar--collapsed .sidebar-brand__copy,
.sidebar--collapsed .nav-item__text,
.sidebar--collapsed .sidebar-footer-copy {
  display: none;
}

.sidebar--collapsed .nav-item {
  justify-content: center;
  width: 44px;
  min-height: 44px;
  padding: 0;
  margin: 0 auto;
}

.sidebar--collapsed .nav-section__label {
  display: none;
}

.sidebar-footer-copy {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.content {
  grid-area: content;
  padding: 16px 20px 32px;
  display: block;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--bg-content);
}

.shell--embedded .content {
  padding: 16px;
}

.content > * + * {
  margin-top: 20px;
}

.content-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 8px;
}

.page-title {
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--text-strong);
}

.page-sub {
  color: var(--muted);
  font-size: 13px;
  margin-top: 4px;
}

.page-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--border);
  padding: 5px 11px;
  border-radius: var(--radius-full);
  background: var(--secondary);
  font-size: 12px;
  font-weight: 500;
}

.pill--ok {
  color: var(--ok);
}

.pill--warn {
  color: var(--warn);
}

.pill--danger {
  color: var(--danger);
  background: var(--danger-subtle);
  border-color: color-mix(in srgb, var(--danger) 16%, transparent);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}

.btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.btn.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--primary-foreground);
}

.btn.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn.danger {
  border-color: color-mix(in srgb, var(--danger) 24%, transparent);
  background: color-mix(in srgb, var(--danger-subtle) 72%, var(--bg-elevated) 28%);
  color: var(--danger);
}

.btn.danger:hover {
  border-color: color-mix(in srgb, var(--danger) 42%, transparent);
  background: color-mix(in srgb, var(--danger-subtle) 84%, var(--bg-hover) 16%);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.toolbar-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--bg-elevated);
  color: var(--muted);
  cursor: pointer;
}

.toolbar-button:hover {
  color: var(--text);
  border-color: var(--border-strong);
  background: var(--bg-hover);
}

.card {
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: 18px;
  transition:
    border-color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-strong);
}

.card-sub {
  color: var(--muted);
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.5;
}

.stat-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.workspace-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border-strong) 70%, transparent);
  border-radius: var(--radius-xl);
  padding: 24px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 16%, transparent), transparent 34%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-elevated) 92%, transparent), color-mix(in srgb, var(--card) 96%, transparent));
  box-shadow: var(--shadow-md);
}

.workspace-hero::after {
  content: "";
  position: absolute;
  inset: auto -10% -30% auto;
  width: 240px;
  height: 240px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  filter: blur(36px);
  pointer-events: none;
}

.workspace-hero__grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.9fr);
  align-items: end;
}

.workspace-hero__eyebrow {
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-hero__title {
  margin-top: 8px;
  color: var(--text-strong);
  font-size: 28px;
  line-height: 1.05;
  letter-spacing: -0.04em;
  font-weight: 700;
  text-wrap: balance;
}

.workspace-hero__copy {
  max-width: 58ch;
  margin-top: 10px;
  color: color-mix(in srgb, var(--text) 82%, var(--muted) 18%);
  font-size: 14px;
  line-height: 1.6;
}

.workspace-hero__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.summary-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.summary-item {
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--bg) 30%, transparent);
}

.summary-item__label {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-item__value {
  margin-top: 6px;
  color: var(--text-strong);
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.03em;
}

.stat {
  background: var(--card);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  border: 1px solid var(--border);
}

.stat-label {
  color: var(--muted);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 6px;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--text-strong);
}

.mail-workbench-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.75fr) minmax(320px, 0.92fr);
  align-items: start;
}

.mail-workbench-main,
.mail-workbench-side {
  display: grid;
  gap: 16px;
}

.mail-workbench-side {
  position: sticky;
  top: 16px;
}

.panel {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  overflow: hidden;
  box-shadow: 0 1px 0 color-mix(in srgb, white 4%, transparent);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg-elevated) 74%, transparent);
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-strong);
}

.panel-body {
  padding: 16px;
  display: grid;
  gap: 14px;
}

.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.actions-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.console-input,
.console-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text);
  padding: 10px 12px;
  font: inherit;
}

.console-textarea {
  min-height: 92px;
  resize: vertical;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section-label {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.muted {
  color: var(--muted);
  font-size: 13px;
}

.code {
  font-family: var(--mono);
}

.list,
.timeline-list,
.mailbox-feed {
  display: grid;
  gap: 10px;
}

.list-card,
.timeline-entry,
.feed-entry {
  width: 100%;
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg-elevated) 84%, transparent);
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) ease,
    background var(--duration-fast) ease,
    transform var(--duration-fast) ease,
    box-shadow var(--duration-fast) ease;
}

.list-card:hover,
.timeline-entry:hover,
.feed-entry:hover {
  border-color: var(--border-strong);
  background: color-mix(in srgb, var(--bg-hover) 84%, transparent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.list-card.active {
  border-color: color-mix(in srgb, var(--accent) 26%, transparent);
  background: color-mix(in srgb, var(--accent-subtle) 86%, var(--bg-elevated) 14%);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 10%, transparent),
    0 10px 22px color-mix(in srgb, black 10%, transparent);
}

.list-card.active::before {
  content: "";
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 3px;
  border-radius: 999px;
  background: var(--accent);
}

.card-top,
.meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-subtitle {
  color: var(--muted);
  font-size: 12px;
}

.title {
  color: var(--text-strong);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.detail {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.detail-strong {
  color: var(--text);
}

.empty,
.loading,
.error-banner {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  padding: 18px;
}

.error-banner {
  border-color: color-mix(in srgb, var(--danger) 18%, transparent);
  background: color-mix(in srgb, var(--danger-subtle) 68%, var(--card) 32%);
}

.link-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--secondary);
  color: var(--text);
  cursor: pointer;
}

.link-chip.active {
  border-color: color-mix(in srgb, var(--accent) 26%, transparent);
  color: var(--accent);
}

.connect-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mono-block {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  font-family: var(--mono);
  font-size: 12px;
  overflow-x: auto;
}

.provider-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.provider-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--bg-elevated) 82%, transparent);
}

.provider-card--active {
  border-color: color-mix(in srgb, var(--accent) 24%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
}

.provider-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.connect-landing {
  position: relative;
  overflow: hidden;
  padding: 40px;
  border-radius: 28px;
  border: 1px solid color-mix(in srgb, var(--border-strong) 72%, transparent);
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 18%, transparent), transparent 34%),
    radial-gradient(circle at bottom left, color-mix(in srgb, white 8%, transparent), transparent 28%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-elevated) 96%, transparent), color-mix(in srgb, var(--card) 96%, transparent));
  box-shadow: var(--shadow-lg);
}

.connect-landing::before {
  content: "";
  position: absolute;
  inset: auto -8% -18% auto;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  filter: blur(44px);
  pointer-events: none;
}

.connect-landing__inner {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 22px;
  max-width: 760px;
}

.connect-landing__eyebrow {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.connect-landing__title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(40px, 6vw, 72px);
  line-height: 0.95;
  letter-spacing: -0.06em;
  font-weight: 760;
  max-width: 10ch;
}

.connect-landing__copy {
  max-width: 46ch;
  color: color-mix(in srgb, var(--text) 84%, var(--muted) 16%);
  font-size: 16px;
  line-height: 1.6;
}

.connect-landing__form {
  display: grid;
  gap: 14px;
  margin-top: 8px;
}

.connect-landing__label {
  display: grid;
  gap: 10px;
}

.connect-landing__label-text {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.connect-landing__input {
  width: 100%;
  min-height: 68px;
  padding: 0 22px;
  border: 1px solid color-mix(in srgb, var(--border-strong) 78%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--bg) 48%, var(--bg-elevated) 52%);
  color: var(--text-strong);
  font-size: 22px;
  letter-spacing: -0.03em;
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 6%, transparent),
    0 18px 42px color-mix(in srgb, black 14%, transparent);
}

.connect-landing__input::placeholder {
  color: color-mix(in srgb, var(--muted) 88%, transparent);
}

.connect-landing__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.connect-landing__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.connect-landing__status {
  max-width: 52ch;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.connect-landing__footer {
  display: grid;
  gap: 14px;
}

@media (max-width: 1100px) {
  .shell,
  .shell--nav-collapsed {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: var(--shell-topbar-height) minmax(0, 1fr);
    grid-template-areas:
      "topbar"
      "content";
  }

  .shell-nav,
  .shell--nav-collapsed .shell-nav {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 70;
    width: min(86vw, 320px);
    min-width: 0;
    border-right: none;
    box-shadow: 0 30px 80px color-mix(in srgb, black 40%, transparent);
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
    transition:
      transform var(--duration-normal) var(--ease-out),
      opacity var(--duration-normal) var(--ease-out);
  }

  .shell--nav-drawer-open .shell-nav {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
  }

  .shell-nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 65;
    border: 0;
    background: color-mix(in srgb, black 52%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--duration-normal) var(--ease-out);
  }

  .shell--nav-drawer-open .shell-nav-backdrop {
    opacity: 1;
    pointer-events: auto;
  }

  .topbar-nav-toggle {
    display: inline-flex;
  }

  .mail-workbench-grid {
    grid-template-columns: 1fr;
  }

  .mail-workbench-side {
    position: static;
    top: auto;
  }

  .workspace-hero__grid {
    grid-template-columns: 1fr;
  }

  .connect-landing {
    padding: 28px 22px;
  }
}

@media (max-width: 768px) {
  .topbar {
    padding: 10px 12px;
  }

  .topnav-shell {
    gap: 10px;
  }

  .topnav-shell__actions {
    gap: 8px;
  }

  .content {
    padding: 12px;
  }

  .content-header {
    display: grid;
    gap: 12px;
    padding: 0;
  }

  .workspace-hero {
    padding: 18px;
    border-radius: var(--radius-lg);
  }

  .workspace-hero__title {
    font-size: 22px;
  }

  .workspace-hero__copy {
    font-size: 13px;
  }

  .connect-landing {
    padding: 22px 16px;
    border-radius: 22px;
  }

  .connect-landing__title {
    font-size: 38px;
    max-width: 12ch;
  }

  .connect-landing__input {
    min-height: 60px;
    font-size: 18px;
    padding: 0 16px;
  }

  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .page-meta {
    justify-content: flex-start;
  }

  .topbar-theme-mode {
    display: none;
  }
}
`;

export function renderOpenClawWorkbenchShellHtml(input: {
  serviceName: string;
  initialWorkbenchPath: string;
  initialConsolePath: string;
  apiBasePath?: string;
}) {
  const embeddedShell =
    input.initialWorkbenchPath === "/workbench/mail/tab" ||
    input.initialWorkbenchPath.startsWith("/workbench/mail/tab/") ||
    input.initialWorkbenchPath.includes("shell=embedded");

  const config = serializeForScript({
    serviceName: input.serviceName,
    initialWorkbenchPath: input.initialWorkbenchPath,
    initialConsolePath: input.initialConsolePath,
    apiBasePath: input.apiBasePath ?? "/api",
    embeddedShell
  });

  return `<!doctype html>
<html lang="en" data-theme-mode="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OpenClaw Workbench · ${escapeHtml(input.serviceName)} Mail</title>
    <style>${OPENCLAW_SHELL_CSS}</style>
  </head>
  <body>
    <div class="shell${embeddedShell ? " shell--embedded" : ""}" id="app-shell">
      <button type="button" class="shell-nav-backdrop" id="nav-backdrop" aria-label="Close navigation"></button>
      <header class="topbar">
        <div class="topnav-shell">
          <button type="button" class="topbar-nav-toggle" id="topbar-nav-toggle" aria-label="Open navigation">
            <svg viewBox="0 0 24 24"><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></svg>
          </button>
          <div class="topnav-shell__content">
            <div class="dashboard-header">
              <div class="dashboard-header__breadcrumb">
                <span class="dashboard-header__breadcrumb-link">OpenClaw</span>
                <span class="dashboard-header__breadcrumb-sep">›</span>
                <span class="dashboard-header__breadcrumb-current" id="breadcrumb-current">Mail</span>
              </div>
            </div>
          </div>
          <div class="topnav-shell__actions">
            <button type="button" class="toolbar-button" id="refresh-button" aria-label="Refresh workbench">
              <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7"></path><path d="M21 3v6h-6"></path></svg>
            </button>
            <div class="topbar-status">
              <span class="pill pill--ok" id="workbench-pill">Workbench</span>
              <span class="pill" id="accounts-pill">accounts 0</span>
              <span class="pill" id="rooms-pill">rooms 0</span>
              <span class="pill" id="approvals-pill">approvals 0</span>
            </div>
            <div class="topbar-language-mode" role="group" aria-label="Language">
              <button type="button" class="topbar-language-mode__btn topbar-language-mode__btn--active" data-language-mode="en" aria-label="English">
                EN
              </button>
              <button type="button" class="topbar-language-mode__btn" data-language-mode="zh-CN" aria-label="简体中文">
                中文
              </button>
            </div>
            <div class="topbar-theme-mode" role="group" aria-label="Color mode">
              <button type="button" class="topbar-theme-mode__btn topbar-theme-mode__btn--active" data-theme-mode="dark" aria-label="Dark mode">
                <svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"></path></svg>
              </button>
              <button type="button" class="topbar-theme-mode__btn" data-theme-mode="light" aria-label="Light mode">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div class="shell-nav">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-shell">
            <div class="sidebar-shell__header">
              <div class="sidebar-brand">
                <span class="sidebar-brand__logo">OC</span>
                <span class="sidebar-brand__copy">
                  <span class="sidebar-brand__eyebrow" id="sidebar-eyebrow">OpenClaw Control</span>
                  <span class="sidebar-brand__title">${escapeHtml(input.serviceName)} Mail</span>
                </span>
              </div>
              <button type="button" class="nav-collapse-toggle" id="nav-collapse-toggle" aria-label="Collapse navigation">
                <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg>
              </button>
            </div>
            <div class="sidebar-shell__body">
              <nav class="sidebar-nav">
                <section class="nav-section">
                  <div class="nav-section__label" id="nav-section-label-mail">Mail</div>
                  <div class="nav-section__items" id="nav-items"></div>
                </section>
              </nav>
            </div>
            <div class="sidebar-shell__footer">
              <div class="sidebar-footer-copy" id="sidebar-footer-copy">OpenClaw-style Mail tab. MailClaws runtime data is rendered directly in the same workbench surface.</div>
            </div>
          </div>
        </aside>
      </div>
      <main class="content">
        <section class="content-header">
          <div>
            <div class="page-title" id="page-title">Mail Workbench</div>
            <div class="page-sub" id="page-sub">Kernel-first mailbox and room inspection from the same workbench route.</div>
          </div>
          <div class="page-meta" id="page-meta"></div>
        </section>
        <div id="content-root" class="loading">Loading mail workspace…</div>
      </main>
    </div>
    <script type="module">
      const config = ${config};

      const ICONS = {
        mail: '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z"></path><path d="m4 8 8 6 8-6"></path></svg>',
        accounts: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        rooms: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        mailboxes: '<svg viewBox="0 0 24 24"><path d="M3 7h18"></path><path d="M5 7l2-3h10l2 3"></path><path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"></path><path d="M9 11h6"></path></svg>',
        approvals: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>'
      };

      const LANGUAGE_STORAGE_KEY = "mailclaw.workbench.language";

      const state = {
        loading: true,
        error: null,
        data: null,
        language: "en",
        connectEmailAddress: "",
        connectDraft: {
          allowSelfOnly: true
        },
        connectValidation: {
          status: "idle",
          signature: "",
          result: null,
          error: ""
        },
        navCollapsed: false,
        navDrawerOpen: false,
        route: null
      };

      function l(english, chinese) {
        return state.language === "zh-CN" ? chinese : english;
      }

      function countText(count, english, chinese) {
        return state.language === "zh-CN"
          ? String(count) + chinese
          : String(count) + " " + english;
      }

      function prefixedText(english, chinese, value) {
        return state.language === "zh-CN"
          ? chinese + String(value)
          : english + String(value);
      }

      function readStoredLanguage() {
        try {
          const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
          if (stored === "zh-CN" || stored === "en") {
            return stored;
          }
        } catch {}
        return "en";
      }

      function escapeHtmlClient(value) {
        return String(value == null ? "" : value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function formatTime(value) {
        if (!value) return l("n/a", "无");
        try {
          return new Date(value).toLocaleString(state.language === "zh-CN" ? "zh-CN" : "en-US");
        } catch {
          return String(value);
        }
      }

      function applyLanguage(language) {
        const mode = language === "zh-CN" ? "zh-CN" : "en";
        state.language = mode;
        document.documentElement.setAttribute("lang", mode);
        document.querySelectorAll("[data-language-mode]").forEach(function(button) {
          button.classList.toggle("topbar-language-mode__btn--active", button.getAttribute("data-language-mode") === mode);
        });
        try {
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, mode);
        } catch {}
      }

      function normalizeBasePath(pathname) {
        const bases = [
          "/console",
          "/workbench/mail/tab",
          "/workbench/mailclaws/tab",
          "/workbench/mailclaw/tab",
          "/workbench/mail",
          "/workbench/mailclaws",
          "/workbench/mailclaw",
          "/dashboard",
          "/mail"
        ];
        for (const base of bases) {
          if (pathname === base || pathname.startsWith(base + "/")) {
            return { base, rest: pathname.slice(base.length) };
          }
        }
        return { base: config.embeddedShell ? "/workbench/mail/tab" : "/workbench/mail", rest: "" };
      }

      function normalizeMailboxIdQueryValue(mailboxId) {
        if (!mailboxId) {
          return null;
        }
        return mailboxId.indexOf("@") !== -1 && mailboxId.indexOf("%40") === -1 ? mailboxId.replace(/@/g, "%40") : mailboxId;
      }

      function parseRoute(pathname, search) {
        const parsed = {
          mode: null,
          accountId: null,
          inboxId: null,
          roomKey: null,
          mailboxId: null,
          status: "",
          originKind: "",
          approvalStatus: ""
        };
        const base = normalizeBasePath(pathname);
        const segments = base.rest.split("/").filter(Boolean);
        if (segments[0] === "connect") {
          parsed.mode = "connect";
        }
        if (segments[0] === "accounts" && segments[1]) {
          parsed.accountId = decodeURIComponent(segments[1]);
          parsed.mode = "accounts";
        }
        if (segments[0] === "rooms" && segments[1]) {
          parsed.roomKey = decodeURIComponent(segments[1]);
          parsed.mode = "rooms";
        }
        if (segments[0] === "inboxes" && segments[1] && segments[2]) {
          parsed.accountId = decodeURIComponent(segments[1]);
          parsed.inboxId = decodeURIComponent(segments[2]);
          parsed.mode = "mailboxes";
        }
        if (segments[0] === "mailboxes" && segments[1] && segments[2]) {
          parsed.accountId = decodeURIComponent(segments[1]);
          parsed.mailboxId = decodeURIComponent(segments[2]);
          parsed.mode = "mailboxes";
        }
        const params = new URLSearchParams(search);
        if (!parsed.mode && params.get("mode")) {
          parsed.mode = params.get("mode");
        }
        if (!parsed.accountId && params.get("accountId")) {
          parsed.accountId = params.get("accountId");
        }
        if (!parsed.roomKey && params.get("roomKey")) {
          parsed.roomKey = params.get("roomKey");
        }
        if (!parsed.mailboxId && params.get("mailboxId")) {
          parsed.mailboxId = normalizeMailboxIdQueryValue(params.get("mailboxId"));
        }
        parsed.status = params.get("status") || "";
        parsed.originKind = params.get("originKind") || "";
        parsed.approvalStatus = params.get("approvalStatus") || "";
        if (!parsed.mode) {
          parsed.mode = "connect";
        }
        return parsed;
      }

      function routeBasePath() {
        const normalized = normalizeBasePath(window.location.pathname);
        return normalized.base;
      }

      function createSuggestedAccountIdClient(emailAddress) {
        return "acct-" + String(emailAddress || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 48);
      }

      function inferSuggestedDisplayNameClient(emailAddress) {
        const local = String(emailAddress || "").split("@")[0] || "";
        return local.trim();
      }

      function resolveProviderForMailbox(emailAddress, providers) {
        const normalizedEmail = String(emailAddress || "").trim().toLowerCase();
        const domain = normalizedEmail.split("@")[1] || "";
        if (!domain) {
          return null;
        }
        const matched = (providers || []).find(function(provider) {
          return Array.isArray(provider.mailboxDomains) && provider.mailboxDomains.includes(domain);
        });
        if (matched) {
          return matched;
        }
        return (providers || []).find(function(provider) {
          return provider.id === "imap";
        }) || null;
      }

      function resolveKnownWebProviderForMailbox(emailAddress, providers) {
        const normalizedEmail = String(emailAddress || "").trim().toLowerCase();
        const domain = normalizedEmail.split("@")[1] || "";
        if (!domain) {
          return null;
        }
        return (providers || []).find(function(provider) {
          return Array.isArray(provider.mailboxDomains) && provider.mailboxDomains.includes(domain);
        }) || null;
      }

      function resolveManualConnectProvider(connectEmailAddress, providerOptions) {
        return resolveProviderForMailbox(connectEmailAddress, providerOptions) || (providerOptions || []).find(function(provider) {
          return provider.id === "imap";
        }) || null;
      }

      function readConnectDraftValue(field, fallbackValue) {
        const draft = state.connectDraft || {};
        const value = draft[field];
        if (typeof value === "string") {
          return value;
        }
        if (typeof value === "number") {
          return String(value);
        }
        if (typeof fallbackValue === "number") {
          return String(fallbackValue);
        }
        return typeof fallbackValue === "string" ? fallbackValue : "";
      }

      function readConnectDraftBoolean(field, fallbackValue) {
        const draft = state.connectDraft || {};
        const value = draft[field];
        if (typeof value === "boolean") {
          return value;
        }
        if (typeof value === "string") {
          return value === "true";
        }
        return Boolean(fallbackValue);
      }

      function parsePositiveIntegerClient(value, fallbackValue) {
        const parsed = Number.parseInt(String(value || ""), 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          return parsed;
        }
        return fallbackValue;
      }

      function buildConnectPayloadSignature(payload) {
        return JSON.stringify(payload);
      }

      function tryBuildConnectMailboxPayload() {
        try {
          return buildConnectMailboxPayload();
        } catch {
          return null;
        }
      }

      function clearConnectValidation() {
        state.connectValidation = {
          status: "idle",
          signature: "",
          result: null,
          error: ""
        };
      }

      function buildConnectMailboxPayload() {
        const workspace = state.data && state.data.workspace ? state.data.workspace : null;
        const connect = workspace && workspace.connect ? workspace.connect : null;
        const providerOptions = connect && Array.isArray(connect.providerOptions) ? connect.providerOptions : [];
        const selectedProvider = resolveManualConnectProvider(state.connectEmailAddress, providerOptions);
        const preset = selectedProvider && selectedProvider.preset ? selectedProvider.preset : null;
        const emailAddress = String(state.connectEmailAddress || "").trim().toLowerCase();
        const accountId = readConnectDraftValue("accountId", createSuggestedAccountIdClient(emailAddress));
        const displayName = readConnectDraftValue("displayName", inferSuggestedDisplayNameClient(emailAddress));
        const credential = readConnectDraftValue("credential", "");
        const imapHost = readConnectDraftValue("imapHost", preset && preset.imapHost ? preset.imapHost : "");
        const imapPort = parsePositiveIntegerClient(
          readConnectDraftValue("imapPort", preset && typeof preset.imapPort === "number" ? preset.imapPort : 993),
          preset && typeof preset.imapPort === "number" ? preset.imapPort : 993
        );
        const imapSecure = readConnectDraftBoolean("imapSecure", preset ? preset.imapSecure !== false : true);
        const imapMailbox = readConnectDraftValue("imapMailbox", preset && preset.imapMailbox ? preset.imapMailbox : "INBOX");
        const smtpHost = readConnectDraftValue("smtpHost", preset && preset.smtpHost ? preset.smtpHost : "");
        const smtpPort = parsePositiveIntegerClient(
          readConnectDraftValue("smtpPort", preset && typeof preset.smtpPort === "number" ? preset.smtpPort : 587),
          preset && typeof preset.smtpPort === "number" ? preset.smtpPort : 587
        );
        const smtpSecure = readConnectDraftBoolean("smtpSecure", preset ? preset.smtpSecure === true : false);
        const smtpFrom = readConnectDraftValue("smtpFrom", emailAddress);
        const allowSelfOnly = readConnectDraftBoolean("allowSelfOnly", true);

        if (!emailAddress || emailAddress.indexOf("@") === -1) {
          throw new Error(l("mailbox address is required", "邮箱地址必填"));
        }
        if (!accountId) {
          throw new Error(l("accountId is required", "accountId 必填"));
        }
        if (!credential) {
          throw new Error(l("mailbox credential is required", "邮箱凭证必填"));
        }
        if (!imapHost) {
          throw new Error(l("IMAP host is required", "IMAP Host 必填"));
        }
        if (!smtpHost) {
          throw new Error(l("SMTP host is required", "SMTP Host 必填"));
        }

        const settings = {
          imap: {
            host: imapHost,
            port: imapPort,
            secure: imapSecure,
            username: emailAddress,
            password: credential,
            mailbox: imapMailbox || "INBOX"
          },
          smtp: {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            username: emailAddress,
            password: credential,
            from: smtpFrom || emailAddress
          }
        };

        settings.security = {
          senderPolicy: allowSelfOnly
            ? {
                allowEmails: [emailAddress]
              }
            : {}
        };

        return {
          accountId: accountId,
          provider: "imap",
          emailAddress: emailAddress,
          displayName: displayName || undefined,
          status: "active",
          settings: settings
        };
      }

      function hrefForRoute(route) {
        const routeBase = routeBasePath();
        let pathname = routeBase;
        if (route.inboxId && route.accountId) {
          pathname = routeBase + "/inboxes/" + encodeURIComponent(route.accountId) + "/" + encodeURIComponent(route.inboxId);
        } else if (route.mailboxId && route.accountId) {
          pathname = routeBase + "/mailboxes/" + encodeURIComponent(route.accountId) + "/" + encodeURIComponent(route.mailboxId);
        } else if (route.roomKey) {
          pathname = routeBase + "/rooms/" + encodeURIComponent(route.roomKey);
        } else if (route.accountId && (!route.mode || route.mode === "accounts")) {
          pathname = routeBase + "/accounts/" + encodeURIComponent(route.accountId);
        }
        const params = new URLSearchParams();
        if (pathname === routeBase && route.mode) {
          params.set("mode", route.mode);
        }
        if (pathname === routeBase && route.accountId) {
          params.set("accountId", route.accountId);
        }
        if (route.status) {
          params.set("status", route.status);
        }
        if (route.originKind) {
          params.set("originKind", route.originKind);
        }
        if (route.approvalStatus) {
          params.set("approvalStatus", route.approvalStatus);
        }
        if (route.mailboxId && route.roomKey) {
          params.set("roomKey", route.roomKey);
        }
        if (config.embeddedShell) {
          params.set("shell", "embedded");
        }
        const search = params.toString();
        return pathname + (search ? "?" + search : "");
      }

      function notifyHost(type, payload) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ source: "mailclaw", type, payload }, "*");
        }
      }

      async function requestJson(path, init) {
        const response = await fetch(path, {
          ...init,
          headers: {
            accept: "application/json",
            ...(init && init.headers ? init.headers : {})
          }
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || ("request failed: " + response.status));
        }
        return response.json();
      }

      function renderPill(label, tone) {
        return '<span class="pill' + (tone ? " " + tone : "") + '">' + escapeHtmlClient(label) + "</span>";
      }

      function renderMetric(label, value) {
        return (
          '<div class="stat">' +
          '<div class="stat-label">' + escapeHtmlClient(label) + "</div>" +
          '<div class="stat-value">' + escapeHtmlClient(value) + "</div>" +
          "</div>"
        );
      }

      function renderSummaryItem(label, value) {
        return (
          '<div class="summary-item">' +
          '<div class="summary-item__label">' + escapeHtmlClient(label) + '</div>' +
          '<div class="summary-item__value">' + escapeHtmlClient(value) + '</div>' +
          '</div>'
        );
      }

      function renderWorkspaceHero(input) {
        return (
          '<section class="workspace-hero">' +
          '<div class="workspace-hero__grid">' +
          '<div>' +
          '<div class="workspace-hero__eyebrow">' + escapeHtmlClient(input.eyebrow || l("Mail workbench", "邮件工作台")) + '</div>' +
          '<div class="workspace-hero__title">' + escapeHtmlClient(input.title || l("Mail", "邮件")) + '</div>' +
          (input.copy ? '<div class="workspace-hero__copy">' + escapeHtmlClient(input.copy) + '</div>' : '') +
          (input.actions ? '<div class="workspace-hero__actions">' + input.actions + '</div>' : '') +
          '</div>' +
          '<div class="summary-strip">' + (input.summaryItems || []).map(function(item) {
            return renderSummaryItem(item.label, item.value);
          }).join("") + '</div>' +
          '</div>' +
          '</section>'
        );
      }

      function renderAccountCard(account) {
        return (
          '<button class="list-card' + (account.accountId === state.route.accountId ? " active" : "") + '" data-action="select-account" data-account-id="' + escapeHtmlClient(account.accountId) + '">' +
          '<div class="card-top">' +
          '<div>' +
          '<div class="card-title">' + escapeHtmlClient(account.displayName || account.emailAddress || account.accountId) + "</div>" +
          '<div class="card-subtitle code">' + escapeHtmlClient(account.accountId) + "</div>" +
          "</div>" +
          renderPill(account.health || "unknown", account.pendingApprovalCount > 0 ? "pill--warn" : "pill--ok") +
          "</div>" +
          '<div class="chips">' +
          renderPill((account.provider || "provider") + "", "") +
          renderPill(countText(account.roomCount || 0, "rooms", " 个房间"), "") +
          renderPill(countText(account.pendingApprovalCount || 0, "approvals", " 个审批"), Number(account.pendingApprovalCount || 0) > 0 ? "pill--warn" : "") +
          "</div>" +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Latest activity ", "最近活动 ", formatTime(account.latestActivityAt))) + "</div>" +
          "</button>"
        );
      }

      function renderRoomCard(room) {
        return (
          '<button class="list-card' + (room.roomKey === state.route.roomKey ? " active" : "") + '" data-action="select-room" data-room-key="' + escapeHtmlClient(room.roomKey) + '" data-account-id="' + escapeHtmlClient(room.accountId || "") + '">' +
          '<div class="card-top">' +
          '<div>' +
          '<div class="card-title">' + escapeHtmlClient(room.latestSubject || room.roomKey) + "</div>" +
          '<div class="card-subtitle code">' + escapeHtmlClient(room.roomKey) + "</div>" +
          "</div>" +
          renderPill(room.state || "open", "") +
          "</div>" +
          '<div class="chips">' +
          renderPill(prefixedText("attention ", "关注度 ", room.attention || "normal"), "") +
          renderPill(prefixedText("rev ", "版本 ", room.revision || 0), "") +
          renderPill(countText(room.pendingApprovalCount || 0, "approvals", " 个审批"), Number(room.pendingApprovalCount || 0) > 0 ? "pill--warn" : "") +
          (room.mailTaskKind ? renderPill(prefixedText("task ", "任务 ", room.mailTaskKind), "") : "") +
          (room.mailTaskStage ? renderPill(prefixedText("stage ", "阶段 ", room.mailTaskStage), "") : "") +
          '</div>' +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Updated ", "更新于 ", formatTime(room.latestActivityAt))) + '</div>' +
          '</button>'
        );
      }

      function renderApprovalCard(approval) {
        return (
          '<button class="list-card" data-action="select-room" data-room-key="' + escapeHtmlClient(approval.roomKey) + '" data-account-id="' + escapeHtmlClient(approval.accountId || "") + '">' +
          '<div class="card-top">' +
          '<div><div class="card-title">' + escapeHtmlClient(approval.subject || approval.requestId) + '</div><div class="card-subtitle code">' + escapeHtmlClient(approval.requestId) + "</div></div>" +
          renderPill(approval.status || "requested", approval.status === "requested" ? "pill--warn" : approval.status === "rejected" ? "pill--danger" : "pill--ok") +
          "</div>" +
          '<div class="chips">' +
          (approval.outboxStatus ? renderPill(approval.outboxStatus, "") : "") +
          renderPill(countText((approval.recipients && approval.recipients.to ? approval.recipients.to.length : 0), "to", " 个收件人"), "") +
          "</div>" +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Updated ", "更新于 ", formatTime(approval.updatedAt))) + "</div>" +
          "</button>"
        );
      }

      function renderMailboxCard(mailbox) {
        return (
          '<button class="list-card' + (mailbox.mailboxId === state.route.mailboxId ? " active" : "") + '" data-action="select-mailbox" data-account-id="' + escapeHtmlClient(mailbox.accountId || state.route.accountId || "") + '" data-mailbox-id="' + escapeHtmlClient(mailbox.mailboxId) + '">' +
          '<div class="card-top">' +
          '<div><div class="card-title code">' + escapeHtmlClient(mailbox.mailboxId) + '</div><div class="card-subtitle">' + escapeHtmlClient(mailbox.kind || l("mailbox", "邮箱")) + (mailbox.role ? " / " + escapeHtmlClient(mailbox.role) : "") + "</div></div>" +
          renderPill(mailbox.active ? l("active", "启用") : l("inactive", "停用"), mailbox.active ? "pill--ok" : "pill--warn") +
          "</div>" +
          '<div class="chips">' +
          renderPill(countText(mailbox.messageCount || 0, "msgs", " 条消息"), "") +
          renderPill(countText(mailbox.roomCount || 0, "rooms", " 个房间"), "") +
          "</div>" +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Latest ", "最近 ", formatTime(mailbox.latestMessageAt))) + "</div>" +
          "</button>"
        );
      }

      function renderInboxCard(entry) {
        const inbox = entry.inbox || {};
        const items = entry.items || [];
        return (
          '<button class="list-card' + (inbox.inboxId === state.route.inboxId ? " active" : "") + '" data-action="select-inbox" data-account-id="' + escapeHtmlClient(inbox.accountId || state.route.accountId || "") + '" data-inbox-id="' + escapeHtmlClient(inbox.inboxId || "") + '">' +
          '<div class="card-top">' +
          '<div><div class="card-title code">' + escapeHtmlClient(inbox.inboxId || l("inbox", "收件箱")) + '</div><div class="card-subtitle">' + escapeHtmlClient(inbox.agentId || l("agent", "代理")) + " / " + escapeHtmlClient(l("public inbox", "公共收件箱")) + "</div></div>" +
          renderPill(countText(items.length, "rooms", " 个房间"), items.length > 0 ? "pill--warn" : "") +
          "</div>" +
          '<div class="chips">' +
          renderPill(prefixedText("ACK ", "ACK ", String(inbox.ackSlaSeconds || 0) + "s"), "") +
          renderPill(prefixedText("limit ", "上限 ", inbox.activeRoomLimit || 0), "") +
          renderPill(prefixedText("burst ", "合并 ", String(inbox.burstCoalesceSeconds || 0) + "s"), "") +
          "</div>" +
          '<div class="detail">' + escapeHtmlClient(items.slice(0, 2).map(function(item) { return item.roomKey; }).join(", ") || l("No projected rooms yet", "还没有投影出来的房间")) + "</div>" +
          "</button>"
        );
      }

      function renderFeedEntry(entry) {
        return (
          '<button class="feed-entry" data-action="select-room" data-room-key="' + escapeHtmlClient(entry.delivery && entry.delivery.roomKey ? entry.delivery.roomKey : "") + '" data-account-id="' + escapeHtmlClient((entry.message && entry.message.accountId) || state.route.accountId || "") + '">' +
          '<div class="meta"><span>' + escapeHtmlClient((entry.message && entry.message.kind) || "message") + " / " + escapeHtmlClient((entry.message && entry.message.originKind) || "origin") + '</span><span>' + escapeHtmlClient(formatTime(entry.message && entry.message.createdAt)) + "</span></div>" +
          '<div class="title">' + escapeHtmlClient((entry.message && entry.message.subject) || "Message") + "</div>" +
          '<div class="detail code">' + escapeHtmlClient(((entry.message && entry.message.fromMailboxId) || "?") + " -> " + (((entry.message && entry.message.toMailboxIds) || []).join(", "))) + "</div>" +
          '<div class="chips">' +
          renderPill((entry.delivery && entry.delivery.status) || "queued", "") +
          '</div>' +
          '</button>'
        );
      }

      function renderTimelineEntry(entry) {
        return (
          '<div class="timeline-entry">' +
          '<div class="meta"><span>' + escapeHtmlClient(entry.category || "event") + " / " + escapeHtmlClient(entry.type || "type") + '</span><span>' + escapeHtmlClient(formatTime(entry.at)) + "</span></div>" +
          '<div class="title">' + escapeHtmlClient(entry.title || entry.type || "Event") + "</div>" +
          (entry.detail ? '<div class="detail">' + escapeHtmlClient(entry.detail) + "</div>" : "") +
          '<div class="chips">' +
          (entry.revision ? renderPill("rev " + entry.revision, "") : "") +
          (entry.status ? renderPill(entry.status, "") : "") +
          "</div>" +
          "</div>"
        );
      }

      function renderVirtualMessageEntry(message) {
        return (
          '<div class="timeline-entry">' +
          '<div class="meta"><span>' + escapeHtmlClient(message.kind || "message") + " / " + escapeHtmlClient(message.originKind || "origin") + '</span><span>' + escapeHtmlClient(formatTime(message.createdAt)) + "</span></div>" +
          '<div class="title">' + escapeHtmlClient(message.subject || message.messageId || "Message") + "</div>" +
          '<div class="detail code">' + escapeHtmlClient((message.fromMailboxId || "?") + " -> " + (((message.toMailboxIds || []).join(", ")) || "n/a")) + "</div>" +
          '<div class="chips">' +
          renderPill(message.visibility || "room", "") +
          renderPill("rev " + escapeHtmlClient(message.roomRevision || 0), "") +
          (message.parentMessageId ? renderPill("reply", "") : renderPill("root", "")) +
          (message.ccMailboxIds && message.ccMailboxIds.length > 0 ? renderPill("cc " + message.ccMailboxIds.length, "") : "") +
          "</div>" +
          "</div>"
        );
      }

      function renderDeliveryEntry(entry) {
        return (
          '<div class="timeline-entry">' +
          '<div class="meta"><span>' + escapeHtmlClient(entry.mailboxId || "mailbox") + '</span><span>' + escapeHtmlClient(formatTime(entry.updatedAt)) + "</span></div>" +
          '<div class="title code">' + escapeHtmlClient(entry.messageId || entry.deliveryId || "delivery") + "</div>" +
          '<div class="chips">' +
          renderPill(entry.status || "queued", entry.status === "consumed" ? "pill--ok" : entry.status === "stale" || entry.status === "vetoed" || entry.status === "superseded" ? "pill--warn" : "") +
          (entry.leaseOwner ? renderPill("lease " + entry.leaseOwner, "") : "") +
          (entry.consumedAt ? renderPill("consumed", "pill--ok") : "") +
          "</div>" +
          (entry.leaseUntil ? '<div class="detail">Lease until ' + escapeHtmlClient(formatTime(entry.leaseUntil)) + "</div>" : "") +
          "</div>"
        );
      }

      function renderOutboxEntry(entry) {
        return (
          '<div class="timeline-entry">' +
          '<div class="meta"><span>' + escapeHtmlClient(entry.kind || "outbox") + '</span><span>' + escapeHtmlClient(formatTime(entry.updatedAt)) + "</span></div>" +
          '<div class="title">' + escapeHtmlClient(entry.subject || entry.intentId || "Outbox intent") + "</div>" +
          '<div class="detail code">' + escapeHtmlClient((entry.to || []).join(", ") || "no visible recipients") + "</div>" +
          '<div class="chips">' +
          renderPill(entry.status || "queued", entry.status === "sent" ? "pill--ok" : entry.status === "failed" || entry.status === "rejected" ? "pill--danger" : entry.status === "pending_approval" ? "pill--warn" : "") +
          renderPill(entry.kind || "final", "") +
          (entry.providerMessageId ? renderPill("provider ack", "pill--ok") : "") +
          "</div>" +
          (entry.errorText ? '<div class="detail">' + escapeHtmlClient(entry.errorText) + "</div>" : "") +
          "</div>"
        );
      }

      function renderMailboxChip(mailboxId, roomKey) {
        return '<button class="link-chip' + (mailboxId === state.route.mailboxId ? " active" : "") + '" data-action="select-mailbox" data-account-id="' + escapeHtmlClient((state.route.accountId || (state.data && state.data.selection && state.data.selection.accountId) || "")) + '" data-mailbox-id="' + escapeHtmlClient(mailboxId) + '"' + (roomKey ? ' data-room-key="' + escapeHtmlClient(roomKey) + '"' : "") + ">" + escapeHtmlClient(mailboxId) + "</button>";
      }

      function renderAgentTemplateCard(template, connect) {
        const accountId = connect && connect.templateApplyAccountId ? connect.templateApplyAccountId : "";
        const tenantId = connect && connect.templateApplyTenantId ? connect.templateApplyTenantId : "";
        const canApply = accountId.length > 0;
        return (
          '<div class="timeline-entry">' +
          '<div class="meta"><span>' + escapeHtmlClient(template.displayName || template.templateId || "template") + '</span><span>' + escapeHtmlClient(String((template.headcount && template.headcount.persistentAgents) || 0) + " agents") + "</span></div>" +
          '<div class="title">' + escapeHtmlClient(template.summary || "") + "</div>" +
          '<div class="detail">' + escapeHtmlClient(template.inspiration || "") + "</div>" +
          '<div class="chips">' +
          renderPill(template.templateId || "template", "") +
          renderPill("burst " + String((template.headcount && template.headcount.burstTargets) || 0), "") +
          "</div>" +
          '<div class="detail">' + escapeHtmlClient(((template.persistentAgents || []).map(function(agent) { return agent.displayName || agent.agentId; }).join(", ")) || "No agents") + "</div>" +
          (canApply
            ? '<div class="actions-inline"><button class="btn" data-action="apply-agent-template" data-template-id="' + escapeHtmlClient(template.templateId || "") + '" data-account-id="' + escapeHtmlClient(accountId) + '" data-tenant-id="' + escapeHtmlClient(tenantId || accountId) + '">Apply Template</button></div>'
            : '<div class="detail">Connect an account first, then apply this template into that workspace.</div>') +
          "</div>"
        );
      }

      function renderAgentDirectoryCard(entry) {
        return (
          '<div class="timeline-entry">' +
          '<div class="meta"><span>' + escapeHtmlClient(entry.displayName || entry.agentId || "agent") + '</span><span>' + escapeHtmlClient(String((entry.virtualMailboxes || []).length) + " mailboxes") + "</span></div>" +
          '<div class="title code">' + escapeHtmlClient(entry.publicMailboxId || ("public:" + (entry.agentId || "agent"))) + "</div>" +
          '<div class="detail">' + escapeHtmlClient(entry.purpose || "") + "</div>" +
          '<div class="chips">' +
          (entry.templateId ? renderPill(entry.templateId, "") : "") +
          ((entry.collaboratorAgentIds || []).slice(0, 3).map(function(agentId) { return renderPill("works with " + agentId, ""); }).join("")) +
          "</div>" +
          ((entry.virtualMailboxes || []).length > 0
            ? '<div class="detail code">' + escapeHtmlClient((entry.virtualMailboxes || []).join(", ")) + "</div>"
            : "") +
          "</div>"
        );
      }

      function renderAgentSkillGroup(entry) {
        const skills = Array.isArray(entry.skills) ? entry.skills : [];
        return (
          '<div class="timeline-entry">' +
          '<div class="meta"><span>' + escapeHtmlClient(entry.displayName || entry.agentId || "agent") + '</span><span>' + escapeHtmlClient(String(skills.length) + " skills") + "</span></div>" +
          '<div class="title code">' + escapeHtmlClient(entry.agentId || "agent") + "</div>" +
          (skills.length > 0
            ? '<div class="chips">' + skills.map(function(skill) {
                return renderPill((skill.source || "default") + " " + (skill.skillId || "skill"), skill.source === "managed" ? "pill--ok" : "");
              }).join("") + "</div>" +
              '<div class="detail">' + escapeHtmlClient(skills.map(function(skill) { return skill.title || skill.skillId || "skill"; }).join(" | ")) + "</div>"
            : '<div class="detail">No skills discovered yet.</div>') +
          "</div>"
        );
      }

      function renderConnectProviderCard(provider, emailAddress, detectedProviderId) {
        const normalizedEmail = String(emailAddress || "").trim().toLowerCase();
        const recommendedCommand = normalizedEmail.indexOf("@") !== -1
          ? "mailclaws login " + normalizedEmail
          : (provider.recommendedCommand || "mailclaws login");
        const actions = [];

        if (provider.web && provider.web.loginUrl) {
          actions.push('<a class="btn primary" href="' + escapeHtmlClient(provider.web.loginUrl) + '" target="_blank" rel="noreferrer">Open Login Page</a>');
        }
        if (provider.web && provider.web.signupUrl) {
          actions.push('<a class="btn" href="' + escapeHtmlClient(provider.web.signupUrl) + '" target="_blank" rel="noreferrer">Register Mailbox</a>');
        }
        if (provider.web && provider.web.settingsUrl) {
          actions.push('<a class="btn" href="' + escapeHtmlClient(provider.web.settingsUrl) + '" target="_blank" rel="noreferrer">Open Mailbox Home</a>');
        }

        return (
          '<div class="provider-card' + (provider.id === detectedProviderId ? " provider-card--active" : "") + '">' +
          '<div class="card-top">' +
          '<div><div class="card-title">' + escapeHtmlClient(provider.displayName || provider.id) + '</div><div class="card-subtitle code">' + escapeHtmlClient(provider.id || "provider") + "</div></div>" +
          renderPill(provider.setupKind === "app_password" ? "password / app password" : "forward", provider.id === detectedProviderId ? "pill--ok" : "") +
          "</div>" +
          '<div class="detail">' + escapeHtmlClient(provider.summary || "") + "</div>" +
          '<div class="chips">' +
          renderPill((provider.accountProvider || "provider") + "", "") +
          (provider.login && provider.login.credentialLabel ? renderPill(provider.login.credentialLabel, "") : "") +
          (provider.mailboxDomains && provider.mailboxDomains.length > 0 ? renderPill(provider.mailboxDomains.join(", "), "") : renderPill("generic", "")) +
          "</div>" +
          '<div class="mono-block">' + escapeHtmlClient(recommendedCommand) + "</div>" +
          (provider.preset
            ? '<div class="detail code">IMAP ' + escapeHtmlClient(provider.preset.imapHost + ":" + provider.preset.imapPort) + ' | SMTP ' + escapeHtmlClient(provider.preset.smtpHost + ":" + provider.preset.smtpPort) + '</div>'
            : '') +
          (provider.login && provider.login.credentialHint
            ? '<div class="detail">' + escapeHtmlClient(provider.login.credentialHint) + '</div>'
            : '') +
          (provider.login && Array.isArray(provider.login.steps) && provider.login.steps.length > 0
            ? '<div class="detail">' + escapeHtmlClient(provider.login.steps.map(function(step, index) { return String(index + 1) + ". " + step; }).join(" ")) + '</div>'
            : '') +
          '<div class="detail">MailClaws connects this mailbox through IMAP/SMTP. Use the provider login page first if you need to generate an app password or mailbox authorization code.</div>' +
          (actions.length > 0
            ? '<div class="provider-card__actions">' + actions.join("") + "</div>"
            : '<div class="detail">No direct provider web login link is known here. Use the CLI path and enter the IMAP/SMTP details manually.</div>') +
          (provider.web && provider.web.settingsUrl
            ? '<div class="detail">Mailbox home: <a href="' + escapeHtmlClient(provider.web.settingsUrl) + '" target="_blank" rel="noreferrer">' + escapeHtmlClient(provider.web.settingsUrl) + "</a></div>"
            : "") +
          "</div>"
        );
      }

      function renderConnectHome() {
        const workspace = state.data && state.data.workspace ? state.data.workspace : null;
        const connect = workspace && workspace.connect ? workspace.connect : null;
        const connectEmailAddress = state.connectEmailAddress || "";
        const providerOptions = connect && Array.isArray(connect.providerOptions) ? connect.providerOptions : [];
        const knownWebProviders = connect && Array.isArray(connect.knownWebProviders) ? connect.knownWebProviders : [];
        const detectedProvider = resolveProviderForMailbox(connectEmailAddress, providerOptions);
        const selectedProvider = resolveManualConnectProvider(connectEmailAddress, providerOptions);
        const detectedWebProvider = resolveKnownWebProviderForMailbox(connectEmailAddress, knownWebProviders);
        const selectedPreset = selectedProvider && selectedProvider.preset ? selectedProvider.preset : null;
        const selectedLogin = selectedProvider && selectedProvider.login ? selectedProvider.login : null;
        const selectedWebLoginUrl = selectedProvider && selectedProvider.web && selectedProvider.web.loginUrl
          ? selectedProvider.web.loginUrl
          : detectedWebProvider && detectedWebProvider.web ? detectedWebProvider.web.loginUrl : "";
        const accountIdValue = readConnectDraftValue("accountId", createSuggestedAccountIdClient(connectEmailAddress));
        const displayNameValue = readConnectDraftValue("displayName", inferSuggestedDisplayNameClient(connectEmailAddress));
        const credentialValue = readConnectDraftValue("credential", "");
        const imapHostValue = readConnectDraftValue("imapHost", selectedPreset && selectedPreset.imapHost ? selectedPreset.imapHost : "");
        const imapPortValue = readConnectDraftValue("imapPort", selectedPreset && typeof selectedPreset.imapPort === "number" ? selectedPreset.imapPort : 993);
        const imapSecureValue = readConnectDraftBoolean("imapSecure", selectedPreset ? selectedPreset.imapSecure !== false : true);
        const imapMailboxValue = readConnectDraftValue(
          "imapMailbox",
          selectedPreset && selectedPreset.imapMailbox ? selectedPreset.imapMailbox : "INBOX"
        );
        const smtpHostValue = readConnectDraftValue("smtpHost", selectedPreset && selectedPreset.smtpHost ? selectedPreset.smtpHost : "");
        const smtpPortValue = readConnectDraftValue("smtpPort", selectedPreset && typeof selectedPreset.smtpPort === "number" ? selectedPreset.smtpPort : 587);
        const smtpSecureValue = readConnectDraftBoolean("smtpSecure", selectedPreset ? selectedPreset.smtpSecure === true : false);
        const smtpFromValue = readConnectDraftValue("smtpFrom", connectEmailAddress);
        const allowSelfOnly = readConnectDraftBoolean("allowSelfOnly", true);
        const currentPayload = connectEmailAddress && connectEmailAddress.indexOf("@") !== -1
          ? tryBuildConnectMailboxPayload()
          : null;
        const currentSignature = currentPayload ? buildConnectPayloadSignature(currentPayload) : "";
        const validation = state.connectValidation || { status: "idle", signature: "", result: null, error: "" };
        const validationReady = validation.status === "success" && validation.signature === currentSignature;
        const emailReady = connectEmailAddress.indexOf("@") !== -1;
        const detectedProviderName =
          (detectedWebProvider && detectedWebProvider.displayName) ||
          (detectedProvider && detectedProvider.displayName) ||
          l("Generic IMAP", "通用 IMAP");
        const workingFlowLabel = l(
          "Working path: email address -> provider detection -> official mailbox sign-in -> advanced connect fallback",
          "已跑通链路：邮箱地址 -> 提供商识别 -> 官方邮箱登录 -> 高级接入兜底"
        );
        const loginHint = selectedLogin && selectedLogin.credentialHint
          ? selectedLogin.credentialHint
          : l("Use the credential accepted by the provider's IMAP/SMTP service.", "请填写该提供商 IMAP/SMTP 接受的凭证。");

        return (
          '<section class="connect-landing"><div class="connect-landing__inner">' +
          '<div class="connect-landing__eyebrow">' + escapeHtmlClient(l("Mailbox Sign In", "邮箱登录")) + '</div>' +
          '<h1 class="connect-landing__title">' + escapeHtmlClient(l("Input your email address.", "输入你的邮箱地址。")) + '</h1>' +
          '<div class="connect-landing__copy">' + escapeHtmlClient(
            l(
              "MailClaws detects the provider and takes you to the right mailbox login page. Manual server setup stays hidden unless you need it.",
              "MailClaws 会识别提供商并带你去正确的邮箱登录页。只有在确实需要时，才会展开手工服务器配置。"
            )
          ) + '</div>' +
          '<div class="connect-landing__status">' + escapeHtmlClient(workingFlowLabel) + '</div>' +
          '<div class="connect-landing__form">' +
          '<label class="connect-landing__label"><span class="connect-landing__label-text">' + escapeHtmlClient(l("Email address", "邮箱地址")) + '</span><input class="connect-landing__input" id="connect-email-input" type="email" placeholder="you@example.com" value="' + escapeHtmlClient(connectEmailAddress) + '" /></label>' +
          '<div class="connect-landing__actions">' +
          (selectedWebLoginUrl
            ? '<a class="btn primary" href="' + escapeHtmlClient(selectedWebLoginUrl) + '" target="_blank" rel="noreferrer">' + escapeHtmlClient(l("Continue to " + detectedProviderName, "继续前往 " + detectedProviderName)) + '</a>'
            : '<button class="btn primary" disabled>' + escapeHtmlClient(l("Continue", "继续")) + '</button>') +
          '</div>' +
          '<div class="connect-landing__footer">' +
          '<div class="connect-landing__status">' + escapeHtmlClient(
            emailReady
              ? l("Detected provider: ", "已识别提供商：") + detectedProviderName + l(". Start there first.", "。请先从这里开始。")
              : l("Type one email address to detect the provider and open the correct sign-in page.", "输入一个邮箱地址后，系统会识别提供商并打开正确的登录页。")
          ) + '</div>' +
          '<div class="connect-landing__meta">' +
          (emailReady ? renderPill(detectedProviderName, "pill--ok") : "") +
          (selectedPreset && selectedPreset.imapHost ? renderPill("IMAP " + selectedPreset.imapHost, "") : "") +
          (selectedPreset && selectedPreset.smtpHost ? renderPill("SMTP " + selectedPreset.smtpHost, "") : "") +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div></section>' +
          '<details class="panel">' +
          '<summary class="panel-header"><h3>' + escapeHtmlClient(l("Advanced options", "高级选项")) + '</h3><span class="muted">' + escapeHtmlClient(l("manual IMAP / SMTP fallback", "手工 IMAP / SMTP 兜底")) + '</span></summary>' +
          '<div class="panel-body">' +
          '<div class="detail-grid">' +
          '<label><div class="section-label">' + escapeHtmlClient((selectedLogin && selectedLogin.credentialLabel) || l("Mailbox password / app password / authorization code", "邮箱密码 / 应用专用密码 / 授权码")) + '</div><input class="console-input" data-connect-field="credential" type="password" autocomplete="current-password" placeholder="' + escapeHtmlClient(l("credential", "凭证")) + '" value="' + escapeHtmlClient(credentialValue) + '" /></label>' +
          '<label><div class="section-label">' + escapeHtmlClient(l("Account ID", "账号 ID")) + '</div><input class="console-input" data-connect-field="accountId" placeholder="acct-you-example-com" value="' + escapeHtmlClient(accountIdValue) + '" /></label>' +
          '<label><div class="section-label">' + escapeHtmlClient(l("Display name", "显示名称")) + '</div><input class="console-input" data-connect-field="displayName" placeholder="you" value="' + escapeHtmlClient(displayNameValue) + '" /></label>' +
          '<label><div class="section-label">' + escapeHtmlClient(l("Inbound whitelist", "入站白名单")) + '</div><label class="detail"><input type="checkbox" data-connect-field="allowSelfOnly"' + (allowSelfOnly ? " checked" : "") + ' /> ' + escapeHtmlClient(l("Allow only this mailbox address during first connect", "首次连接时只允许该邮箱地址发来邮件")) + '</label></label>' +
          '<label><div class="section-label">IMAP Host</div><input class="console-input" data-connect-field="imapHost" placeholder="imap.example.com" value="' + escapeHtmlClient(imapHostValue) + '" /></label>' +
          '<label><div class="section-label">IMAP Port</div><input class="console-input" data-connect-field="imapPort" inputmode="numeric" placeholder="993" value="' + escapeHtmlClient(imapPortValue) + '" /></label>' +
          '<label><div class="section-label">' + escapeHtmlClient(l("IMAP security", "IMAP 安全")) + '</div><select class="console-input" data-connect-field="imapSecure"><option value="true"' + (imapSecureValue ? " selected" : "") + '>TLS / SSL</option><option value="false"' + (!imapSecureValue ? " selected" : "") + '>Plain / STARTTLS</option></select></label>' +
          '<label><div class="section-label">IMAP Mailbox</div><input class="console-input" data-connect-field="imapMailbox" placeholder="INBOX" value="' + escapeHtmlClient(imapMailboxValue) + '" /></label>' +
          '<label><div class="section-label">SMTP Host</div><input class="console-input" data-connect-field="smtpHost" placeholder="smtp.example.com" value="' + escapeHtmlClient(smtpHostValue) + '" /></label>' +
          '<label><div class="section-label">SMTP Port</div><input class="console-input" data-connect-field="smtpPort" inputmode="numeric" placeholder="587" value="' + escapeHtmlClient(smtpPortValue) + '" /></label>' +
          '<label><div class="section-label">' + escapeHtmlClient(l("SMTP security", "SMTP 安全")) + '</div><select class="console-input" data-connect-field="smtpSecure"><option value="true"' + (smtpSecureValue ? " selected" : "") + '>TLS / SSL</option><option value="false"' + (!smtpSecureValue ? " selected" : "") + '>Plain / STARTTLS</option></select></label>' +
          '<label><div class="section-label">SMTP From</div><input class="console-input" data-connect-field="smtpFrom" placeholder="you@example.com" value="' + escapeHtmlClient(smtpFromValue) + '" /></label>' +
          '</div>' +
          '<div class="detail">' + escapeHtmlClient(
            allowSelfOnly
              ? l("Default safety policy is on: the first connected account only accepts inbound mail from its own address until you widen the whitelist later.", "默认安全策略已开启：首次接入的账号只接受来自其自身地址的来信，直到你后续放宽白名单。")
              : l("Inbound sender allowlist is open for this connect payload. Only turn this off when you are ready to accept mail from other senders.", "当前接入载荷对入站发件人白名单已放开。只有准备好接收其他发件人的邮件时才应这样做。")
          ) + '</div>' +
          '<div class="detail">' + escapeHtmlClient(loginHint) + '</div>' +
          (validation.status === "success"
            ? '<div class="detail">' + escapeHtmlClient(l("Validation passed: IMAP ", "校验通过：IMAP ")) + escapeHtmlClient((validation.result && validation.result.imap && validation.result.imap.host) || "ok") + ' / SMTP ' + escapeHtmlClient((validation.result && validation.result.smtp && validation.result.smtp.host) || "ok") + '.</div>'
            : validation.status === "failed"
              ? '<div class="error-banner">' + escapeHtmlClient(validation.error || l("Mailbox validation failed.", "邮箱校验失败。")) + '</div>'
              : '<div class="detail">' + escapeHtmlClient(l("Use this section only if the automatic sign-in path is not enough.", "只有自动登录路径不够用时，才使用这个区域。")) + '</div>') +
          '<div class="actions-inline">' +
          '<button class="btn" data-action="validate-mailbox">' + escapeHtmlClient(l("Validate Mailbox", "校验邮箱")) + '</button>' +
          '<button class="btn primary" data-action="connect-mailbox"' + (validationReady ? "" : " disabled") + '>' + escapeHtmlClient(l("Connect Mailbox", "连接邮箱")) + '</button>' +
          '</div>' +
          (providerOptions.length > 0
            ? '<div class="provider-grid">' + providerOptions.map(function(provider) {
                return renderConnectProviderCard(provider, connectEmailAddress, detectedProvider && detectedProvider.id);
              }).join("") + "</div>"
            : '<div class="empty">' + escapeHtmlClient(l("No provider metadata is available.", "没有可用的提供商元数据。")) + '</div>') +
          '</div>' +
          '</details>'
        );
      }

      function renderProviderPanel() {
        if (!state.data || !state.data.mailboxConsole || !state.data.mailboxConsole.providerState) {
          return '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Provider State", "提供商状态")) + '</h3></div><div class="panel-body"><div class="empty">' + escapeHtmlClient(l("Select an account to inspect provider watch, cursors, and mailbox projection state.", "选择一个账号以查看提供商监听状态、游标和邮箱投影状态。")) + '</div></div></div>';
        }
        const summary = state.data.mailboxConsole.providerState.summary || {};
        return (
          '<div class="panel">' +
          '<div class="panel-header"><h3>' + escapeHtmlClient(l("Provider State", "提供商状态")) + '</h3><span class="muted">' + escapeHtmlClient((summary.watch && summary.watch.state) || "idle") + "</span></div>" +
          '<div class="panel-body">' +
          '<div class="detail-grid">' +
          renderMetric(l("Ingress", "入站"), (summary.ingress && summary.ingress.mode) || "unknown") +
          renderMetric(l("Outbound", "出站"), (summary.outbound && summary.outbound.mode) || "unknown") +
          renderMetric(l("Watch", "监听"), (summary.watch && summary.watch.state) || "idle") +
          renderMetric(l("Last event", "最近事件"), summary.lastEventType || "none") +
          '</div>' +
          '<div class="detail">' + escapeHtmlClient(l("MailClaws still uses the runtime kernel as truth. Provider watch and mailbox projections stay observable here, not authoritative.", "MailClaws 仍以运行时内核为真相源。这里的提供商监听和邮箱投影仅用于观察，而非权威状态。")) + '</div>' +
          '</div>' +
          '</div>'
        );
      }

      function renderAccountDetail() {
        if (!state.data || !state.data.accountDetail) {
          return '<div class="empty">' + escapeHtmlClient(l("Select an account to inspect provider state, inboxes, rooms, and mailbox projections.", "选择一个账号以查看提供商状态、收件箱、房间和邮箱投影。")) + '</div>';
        }
        const detail = state.data.accountDetail;
        const account = detail.account || {};
        const inboxes = detail.inboxes || [];
        const mailboxes = detail.mailboxes || [];
        const rooms = detail.rooms || [];
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Mailbox account", "邮箱账号"),
            title: account.displayName || account.emailAddress || account.accountId || l("Mailbox account", "邮箱账号"),
            copy: l("Inspect provider posture first, then public inbox intake, recent rooms, and mailbox-local collaboration feeds for this connected account.", "先查看提供商状态，再查看该已连接账号的公共收件箱、最近房间和邮箱本地协作消息流。"),
            summaryItems: [
              { label: l("rooms", "房间"), value: String(account.roomCount || 0) },
              { label: l("active", "活跃"), value: String(account.activeRoomCount || 0) },
              { label: l("mailboxes", "邮箱箱体"), value: String(account.mailboxCount || 0) },
              { label: l("inboxes", "收件箱"), value: String(account.inboxCount || 0) }
            ]
          }) +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Mailbox Account", "邮箱账号")) + '</h3><span class="muted code">' + escapeHtmlClient(account.accountId || state.route.accountId || "") + '</span></div><div class="panel-body">' +
          '<div class="chips">' +
          renderPill(account.provider || "provider", "") +
          renderPill(account.health || "healthy", "") +
          renderPill(account.status || "active", "") +
          '</div>' +
          '<div class="detail">' + escapeHtmlClient(account.displayName || account.emailAddress || "") + '</div>' +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Latest activity ", "最近活动 ", formatTime(account.latestActivityAt))) + '</div>' +
          '<div class="actions-inline"><button class="btn danger" data-action="delete-account" data-account-id="' + escapeHtmlClient(account.accountId || state.route.accountId || "") + '">' + escapeHtmlClient(l("Delete Account", "删除账号")) + '</button></div>' +
          '</div></div>' +
          renderProviderPanel() +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Public Inboxes", "公共收件箱")) + '</h3><span class="muted">' + escapeHtmlClient(countText(inboxes.length, "configured", " 个已配置")) + '</span></div><div class="panel-body">' +
          (inboxes.length > 0
            ? '<div class="list">' + inboxes.map(function(inbox) { return renderInboxCard({ inbox: inbox, items: [] }); }).join("") + '</div>'
            : '<div class="empty">' + escapeHtmlClient(l("No public inbox projection exists for this account yet.", "这个账号还没有公共收件箱投影。")) + '</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Recent Mailboxes", "最近邮箱")) + '</h3><span class="muted">' + escapeHtmlClient(countText(Math.min(mailboxes.length, 6), "shown", " 条已显示")) + '</span></div><div class="panel-body">' +
          (mailboxes.length > 0 ? '<div class="list">' + mailboxes.slice(0, 6).map(renderMailboxCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No virtual mailboxes are visible for this account.", "这个账号下没有可见的虚拟邮箱。")) + '</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Recent Conversations", "最近会话")) + '</h3><span class="muted">' + escapeHtmlClient(countText(Math.min(rooms.length, 6), "shown", " 条已显示")) + '</span></div><div class="panel-body">' +
          (rooms.length > 0 ? '<div class="list">' + rooms.slice(0, 6).map(renderRoomCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No room activity has been recorded for this account yet.", "这个账号还没有记录到房间活动。")) + '</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderInboxDetail() {
        const mailboxConsole = state.data && state.data.mailboxConsole ? state.data.mailboxConsole : null;
        if (!mailboxConsole || !state.route.inboxId) {
          return '<div class="empty">' + escapeHtmlClient(l("Select a public inbox to inspect room-level intake, ACK pressure, and work backlog.", "选择一个公共收件箱以查看房间级接入、ACK 压力和工作积压。")) + '</div>';
        }
        const projection = (mailboxConsole.publicAgentInboxes || []).find(function(entry) {
          return entry.inbox && entry.inbox.inboxId === state.route.inboxId;
        });
        if (!projection) {
          return '<div class="empty">' + escapeHtmlClient(l("The selected inbox is not visible in the current account scope.", "当前账号范围内看不到所选收件箱。")) + '</div>';
        }
        const inbox = projection.inbox || {};
        const items = projection.items || [];
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Public inbox", "公共收件箱"),
            title: inbox.inboxId || state.route.inboxId || l("Inbox", "收件箱"),
            copy: l("Inbox items are room-granularity workload, not raw-message tasks. That keeps ACK pressure, backlog, and delegation aligned with the room kernel.", "收件箱项目以房间粒度组织，而不是原始消息任务。这让 ACK 压力、积压和委派都与房间内核保持一致。"),
            summaryItems: [
              { label: l("rooms", "房间"), value: String(items.length) },
              { label: l("ack sla", "ACK SLA"), value: String(inbox.ackSlaSeconds || 0) + "s" },
              { label: l("active limit", "活跃上限"), value: String(inbox.activeRoomLimit || 0) },
              { label: l("burst", "合并窗口"), value: String(inbox.burstCoalesceSeconds || 0) + "s" }
            ]
          }) +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Inbox Summary", "收件箱摘要")) + '</h3><span class="muted code">' + escapeHtmlClient(inbox.inboxId || state.route.inboxId) + '</span></div><div class="panel-body">' +
          '<div class="chips">' +
          renderPill(inbox.agentId || l("agent", "代理"), "") +
          renderPill(prefixedText("account ", "账号 ", inbox.accountId || state.route.accountId || ""), "") +
          '</div>' +
          '<div class="detail">' + escapeHtmlClient(l("Select a room below to move from queue posture into full room inspection.", "从下面选择一个房间，即可从队列视角切换到完整房间检查。")) + '</div>' +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Inbox Items", "收件箱项目")) + '</h3><span class="muted">' + escapeHtmlClient(countText(items.length, "rooms", " 个房间")) + '</span></div><div class="panel-body">' +
          (items.length > 0
            ? '<div class="mailbox-feed">' + items.map(function(item) {
                return (
                  '<button class="feed-entry" data-action="select-room" data-room-key="' + escapeHtmlClient(item.roomKey) + '" data-account-id="' + escapeHtmlClient(item.accountId || state.route.accountId || "") + '">' +
                  '<div class="meta"><span>' + escapeHtmlClient(item.state || "new") + " / " + escapeHtmlClient(item.participantRole || "participant") + '</span><span>' + escapeHtmlClient(formatTime(item.newestMessageAt)) + '</span></div>' +
                  '<div class="title code">' + escapeHtmlClient(item.roomKey) + '</div>' +
                  '<div class="detail">Unread ' + escapeHtmlClient(item.unreadCount || 0) + ", urgency " + escapeHtmlClient(item.urgency || "normal") + ", effort " + escapeHtmlClient(item.estimatedEffort || "medium") + '.</div>' +
                  '<div class="chips">' +
                  renderPill("priority " + escapeHtmlClient(item.priority || 0), "") +
                  (item.needsAckBy ? renderPill("ack by " + formatTime(item.needsAckBy), "pill--warn") : "") +
                  '</div>' +
                  '</button>'
                );
              }).join("") + '</div>'
            : '<div class="empty">' + escapeHtmlClient(l("No room projections are currently visible in this inbox.", "这个收件箱里当前没有可见的房间投影。")) + '</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderMailboxWorkspaceHome() {
        const mailboxConsole = state.data && state.data.mailboxConsole ? state.data.mailboxConsole : null;
        if (!mailboxConsole) {
          return '<div class="empty">' + escapeHtmlClient(l("Select an account to inspect mailboxes and public inboxes.", "选择一个账号以查看邮箱箱体和公共收件箱。")) + '</div>';
        }
        const mailboxes = mailboxConsole.virtualMailboxes || [];
        const inboxes = mailboxConsole.publicAgentInboxes || [];
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Mailbox workspace", "邮箱工作区"),
            title: l("Mailboxes and intake routes", "邮箱箱体与接入路径"),
            copy: l("Use this view when you want to scan internal role mailboxes, public inbox bindings, and the provider posture for one connected account.", "当你需要查看单个已连接账号的内部角色邮箱、公共收件箱绑定和提供商状态时，使用这个视图。"),
            summaryItems: [
              { label: l("mailboxes", "邮箱箱体"), value: String(mailboxes.length) },
              { label: l("inboxes", "收件箱"), value: String(inboxes.length) },
              { label: l("active", "活跃"), value: String(mailboxes.filter(function(entry) { return entry.active; }).length) },
              { label: l("rooms", "房间"), value: String((state.data && state.data.rooms ? state.data.rooms.length : 0)) }
            ]
          }) +
          renderProviderPanel() +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Public Inboxes", "公共收件箱")) + '</h3><span class="muted">' + escapeHtmlClient(countText(inboxes.length, "projected", " 个投影")) + '</span></div><div class="panel-body">' +
          (inboxes.length > 0 ? '<div class="list">' + inboxes.map(renderInboxCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No public inbox projection exists for this account yet.", "这个账号还没有公共收件箱投影。")) + '</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Virtual Mailboxes", "虚拟邮箱")) + '</h3><span class="muted">' + escapeHtmlClient(countText(mailboxes.length, "visible", " 个可见")) + '</span></div><div class="panel-body">' +
          (mailboxes.length > 0 ? '<div class="list">' + mailboxes.map(renderMailboxCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No virtual mailbox is attached to this account yet.", "这个账号还没有挂接虚拟邮箱。")) + '</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderAccountsHome() {
        const accounts = state.data && state.data.accounts ? state.data.accounts : [];
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Accounts", "账号"),
            title: l("Connected mailbox accounts", "已连接邮箱账号"),
            copy: l("Select one connected mailbox account to inspect provider health, public inboxes, recent rooms, and mailbox-local collaboration state.", "选择一个已连接邮箱账号，以查看提供商健康状态、公共收件箱、最近房间和邮箱本地协作状态。"),
            summaryItems: [
              { label: l("accounts", "账号"), value: String(accounts.length) },
              { label: l("healthy", "健康"), value: String(accounts.filter(function(account) { return (account.health || "") === "healthy"; }).length) },
              { label: l("active rooms", "活跃房间"), value: String(accounts.reduce(function(total, account) { return total + Number(account.activeRoomCount || 0); }, 0)) },
              { label: l("mailboxes", "邮箱箱体"), value: String(accounts.reduce(function(total, account) { return total + Number(account.mailboxCount || 0); }, 0)) }
            ]
          }) +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Accounts", "账号")) + '</h3><span class="muted">' + escapeHtmlClient(countText(accounts.length, "connected", " 个已连接")) + '</span></div><div class="panel-body">' +
          (accounts.length > 0 ? '<div class="list">' + accounts.map(renderAccountCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No mailbox accounts have been connected yet.", "还没有连接任何邮箱账号。")) + '</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderRoomsHome() {
        const rooms = state.data && state.data.rooms ? state.data.rooms : [];
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Rooms", "房间"),
            title: l("Durable room timeline", "持久房间时间线"),
            copy: l("Rooms are the truth boundary for external mail, internal collaboration, approvals, and gateway projection. Open one room to inspect the full timeline.", "房间是外部邮件、内部协作、审批和网关投影的真相边界。打开一个房间即可查看完整时间线。"),
            summaryItems: [
              { label: l("rooms", "房间"), value: String(rooms.length) },
              { label: l("active", "活跃"), value: String(rooms.filter(function(room) { return (room.state || "") !== "closed"; }).length) },
              { label: l("approvals", "审批"), value: String(rooms.reduce(function(total, room) { return total + Number(room.pendingApprovalCount || 0); }, 0)) },
              { label: l("deliveries", "投递"), value: String(rooms.reduce(function(total, room) { return total + Number(room.mailboxDeliveryCount || 0); }, 0)) }
            ]
          }) +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Rooms", "房间")) + '</h3><span class="muted">' + escapeHtmlClient(countText(rooms.length, "visible", " 个可见")) + '</span></div><div class="panel-body">' +
          (rooms.length > 0 ? '<div class="list">' + rooms.map(renderRoomCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No rooms are visible under the current filters.", "当前筛选条件下没有可见房间。")) + '</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderApprovalsHome() {
        const approvals = state.data && state.data.approvals ? state.data.approvals : [];
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Approvals", "审批"),
            title: l("Approval queue", "审批队列"),
            copy: l("Outbound side effects stay gated here. Review one request to inspect draft hash, room linkage, and approval lineage before delivery.", "所有出站副作用都在这里受控。交付前可逐条查看草稿哈希、房间关联和审批链路。"),
            summaryItems: [
              { label: l("requests", "请求"), value: String(approvals.length) },
              { label: l("requested", "待审"), value: String(approvals.filter(function(approval) { return (approval.status || "") === "requested"; }).length) },
              { label: l("approved", "通过"), value: String(approvals.filter(function(approval) { return (approval.status || "") === "approved"; }).length) },
              { label: l("rejected", "拒绝"), value: String(approvals.filter(function(approval) { return (approval.status || "") === "rejected"; }).length) }
            ]
          }) +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Approval requests", "审批请求")) + '</h3><span class="muted">' + escapeHtmlClient(countText(approvals.length, "visible", " 个可见")) + '</span></div><div class="panel-body">' +
          (approvals.length > 0 ? '<div class="list">' + approvals.map(renderApprovalCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No approval requests are visible under the current filters.", "当前筛选条件下没有可见审批请求。")) + '</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderMailboxDetail() {
        const mailboxConsole = state.data && state.data.mailboxConsole ? state.data.mailboxConsole : null;
        if (!mailboxConsole || !state.route.mailboxId) {
          return '<div class="empty">' + escapeHtmlClient(l("Select a mailbox to inspect mailbox-local feed and room participation.", "选择一个邮箱以查看邮箱本地消息流和房间参与情况。")) + '</div>';
        }
        const mailbox = (mailboxConsole.virtualMailboxes || []).find(function(entry) {
          return entry.mailboxId === state.route.mailboxId;
        });
        if (!mailbox) {
          return '<div class="empty">' + escapeHtmlClient(l("The selected mailbox is not visible in the current account scope.", "当前账号范围内看不到所选邮箱。")) + '</div>';
        }
        const linkedInboxes = (mailboxConsole.publicAgentInboxes || []).filter(function(entry) {
          return "public:" + entry.inbox.agentId === mailbox.mailboxId;
        });
        const feed = state.data && state.data.mailboxFeed ? state.data.mailboxFeed : [];
        const roomMailboxView = state.data && state.data.roomMailboxView ? state.data.roomMailboxView : [];
        const roomDetail = state.data && state.data.roomDetail ? state.data.roomDetail : null;
        const roomKey = roomDetail && roomDetail.room ? roomDetail.room.roomKey : state.route.roomKey;
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Virtual mailbox", "虚拟邮箱"),
            title: mailbox.mailboxId,
            copy: l("This is the mailbox-local view of internal collaboration. Use it to inspect what one role mailbox can see across feeds and room-local projections.", "这是内部协作的邮箱本地视图。可用于查看某个角色邮箱在消息流和房间本地投影里能看到什么。"),
            summaryItems: [
              { label: l("messages", "消息"), value: String(mailbox.messageCount || 0) },
              { label: l("rooms", "房间"), value: String(mailbox.roomCount || 0) },
              { label: l("inboxes", "收件箱"), value: String(linkedInboxes.length) },
              { label: l("latest room", "最近房间"), value: String(mailbox.latestRoomKey || l("n/a", "无")) }
            ]
          }) +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Mailbox Summary", "邮箱摘要")) + '</h3><span class="muted code">' + escapeHtmlClient(mailbox.mailboxId) + '</span></div><div class="panel-body">' +
          '<div class="chips">' +
          renderPill(mailbox.kind || "mailbox", "") +
          (mailbox.role ? renderPill(mailbox.role, "") : "") +
          renderPill(mailbox.active ? "active" : "inactive", mailbox.active ? "pill--ok" : "pill--warn") +
          ((mailbox.originKinds || []).map(function(kind) { return renderPill(kind, ""); }).join("")) +
          '</div>' +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Latest message ", "最近消息 ", formatTime(mailbox.latestMessageAt))) + '</div>' +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Latest room ", "最近房间 ", mailbox.latestRoomKey || l("n/a", "无"))) + '</div>' +
          (linkedInboxes.length > 0
            ? '<div class="list">' + linkedInboxes.map(renderInboxCard).join("") + '</div>'
            : '<div class="detail">' + escapeHtmlClient(l("No public inbox binding is attached to this mailbox.", "这个邮箱没有挂接任何公共收件箱绑定。")) + '</div>') +
          '</div></div>' +
          (roomKey
            ? '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Room Thread In Mailbox", "邮箱中的房间线程")) + '</h3><span class="muted code">' + escapeHtmlClient(roomKey) + '</span></div><div class="panel-body">' +
              (roomMailboxView.length > 0
                ? '<div class="mailbox-feed">' + roomMailboxView.map(function(entry) {
                    return (
                      '<div class="feed-entry">' +
                      '<div class="meta"><span>' + escapeHtmlClient((entry.message && entry.message.kind) || "message") + " / " + escapeHtmlClient((entry.thread && entry.thread.kind) || "thread") + '</span><span>' + escapeHtmlClient(formatTime(entry.message && entry.message.createdAt)) + '</span></div>' +
                      '<div class="title">' + escapeHtmlClient((entry.message && entry.message.subject) || "Message") + '</div>' +
                      '<div class="detail code">' + escapeHtmlClient(((entry.message && entry.message.fromMailboxId) || "?") + " -> " + (((entry.message && entry.message.toMailboxIds) || []).join(", "))) + '</div>' +
                      '</div>'
                    );
                  }).join("") + '</div>'
                : '<div class="empty">' + escapeHtmlClient(l("No projected entries for this room are visible in the selected mailbox.", "所选邮箱中看不到这个房间的投影条目。")) + '</div>') +
              '</div></div>'
            : '') +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Mailbox Feed", "邮箱消息流")) + '</h3><span class="muted">' + escapeHtmlClient(countText(feed.length, "items loaded", " 条已加载")) + '</span></div><div class="panel-body">' +
          (feed.length > 0 ? '<div class="mailbox-feed">' + feed.map(renderFeedEntry).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No messages are currently projected into the selected mailbox.", "当前没有消息投影到所选邮箱中。")) + '</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderRoomDetail() {
        const roomDetail = state.data && state.data.roomDetail ? state.data.roomDetail : null;
        if (!roomDetail || !roomDetail.room) {
          return '<div class="empty">' + escapeHtmlClient(l("Select a room to inspect its timeline, mailbox participation, approvals, and gateway trace.", "选择一个房间以查看它的时间线、邮箱参与情况、审批状态和网关轨迹。")) + '</div>';
        }
        const room = roomDetail.room;
        const trace = roomDetail.gatewayTrace || {};
        const tasks = roomDetail.tasks || [];
        const timeline = roomDetail.timeline || [];
        const virtualMessages = roomDetail.virtualMessages || [];
        const mailboxDeliveries = roomDetail.mailboxDeliveries || [];
        const outboxIntents = roomDetail.outboxIntents || [];
        const hostIntegration = state.data && state.data.workspace ? state.data.workspace.hostIntegration || null : null;
        const integrationApis = hostIntegration && hostIntegration.apis ? hostIntegration.apis : null;
        return (
          '<div class="mail-workbench-main">' +
          renderWorkspaceHero({
            eyebrow: l("Room", "房间"),
            title: room.latestSubject || room.roomKey,
            copy: l("Room detail is the durable truth view: revisioned room state, mailbox participation, gateway outcomes, task tracking, and the replay-visible timeline all stay here.", "房间详情是持久真相视图：版本化的房间状态、邮箱参与情况、网关结果、任务追踪和可回放时间线都保留在这里。"),
            summaryItems: [
              { label: l("revision", "版本"), value: String(room.revision || 0) },
              { label: l("tasks", "任务"), value: String(roomDetail.counts && roomDetail.counts.taskNodes ? roomDetail.counts.taskNodes : 0) },
              { label: l("messages", "消息"), value: String(roomDetail.counts && roomDetail.counts.virtualMessages ? roomDetail.counts.virtualMessages : 0) },
              { label: l("deliveries", "投递"), value: String(roomDetail.counts && roomDetail.counts.mailboxDeliveries ? roomDetail.counts.mailboxDeliveries : 0) }
            ]
          }) +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Room Summary", "房间摘要")) + '</h3><span class="muted code">' + escapeHtmlClient(room.roomKey) + '</span></div><div class="panel-body">' +
          '<div class="chips">' +
          renderPill(room.state || "open", "") +
          renderPill("account " + (room.accountId || ""), "") +
          (room.mailTaskKind ? renderPill("task " + room.mailTaskKind, "") : "") +
          (room.mailTaskStage ? renderPill("stage " + room.mailTaskStage, "") : "") +
          renderPill(String(room.pendingApprovalCount || 0) + " approvals", Number(room.pendingApprovalCount || 0) > 0 ? "pill--warn" : "") +
          '</div>' +
          '<div class="detail">' + escapeHtmlClient(prefixedText("Front agent ", "前台代理 ", room.frontAgentId || room.frontAgentAddress || l("n/a", "无"))) + '</div>' +
          ((room.publicAgentAddresses || []).length > 0 || (room.publicAgentIds || []).length > 0 || (room.collaboratorAgentAddresses || []).length > 0 || (room.collaboratorAgentIds || []).length > 0 || (room.summonedRoles || []).length > 0
            ? '<div><div class="section-label">Routing</div><div class="chips">' +
              (room.publicAgentIds || []).map(function(agentId) { return renderPill("public " + agentId, ""); }).join("") +
              (room.publicAgentAddresses || []).map(function(address) { return renderPill("public " + address, ""); }).join("") +
              (room.collaboratorAgentIds || []).map(function(agentId) { return renderPill("collab " + agentId, ""); }).join("") +
              (room.collaboratorAgentAddresses || []).map(function(address) { return renderPill("collab " + address, ""); }).join("") +
              (room.summonedRoles || []).map(function(role) { return renderPill("role " + role, ""); }).join("") +
              '</div></div>'
            : '') +
          '<div class="section-label">' + escapeHtmlClient(l("Mailboxes", "邮箱箱体")) + '</div><div class="chips">' + ((roomDetail.mailboxes || []).map(function(mailbox) { return renderMailboxChip(mailbox.mailboxId, room.roomKey); }).join("") || '<span class="muted">' + escapeHtmlClient(l("No mailbox participation recorded.", "还没有记录到邮箱参与情况。")) + '</span>') + '</div>' +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>Gateway Projection</h3><span class="muted">' + escapeHtmlClient(trace.projectedMessageCount || 0) + ' projected messages</span></div><div class="panel-body">' +
          '<div class="detail-grid">' +
          renderMetric("Control planes", (trace.controlPlanes || []).length) +
          renderMetric("Session keys", (trace.sessionKeys || []).length) +
          renderMetric("Projected deliveries", trace.projectedDeliveryCount || 0) +
          renderMetric("Projected outcomes", trace.projectedOutcomeCount || 0) +
          '</div>' +
          '<div class="chips">' +
          (trace.controlPlanes || []).map(function(value) { return renderPill(value, ""); }).join("") +
          (trace.outcomeModes || []).map(function(value) { return renderPill(value, ""); }).join("") +
          ((trace.pendingDispatchCount || 0) > 0 ? renderPill("pending " + trace.pendingDispatchCount, "pill--warn") : "") +
          ((trace.failedDispatchCount || 0) > 0 ? renderPill("failed " + trace.failedDispatchCount, "pill--danger") : "") +
          '</div>' +
          ((trace.outcomeProjections || []).length > 0
            ? '<div class="timeline-list">' + trace.outcomeProjections.map(function(entry) {
                return (
                  '<div class="timeline-entry">' +
                  '<div class="meta"><span>' + escapeHtmlClient(entry.mode || "mode") + '</span><span>' + escapeHtmlClient(formatTime(entry.projectedAt)) + '</span></div>' +
                  '<div class="title code">' + escapeHtmlClient(entry.messageId || "") + '</div>' +
                  '<div class="chips">' + renderPill(entry.dispatchStatus || "queued", "") + '</div>' +
                  '<div class="detail">session ' + escapeHtmlClient(entry.sessionKey || "") + '</div>' +
                  '</div>'
                );
              }).join("") + '</div>'
            : '<div class="detail">No Gateway outcome projection has been recorded for this room yet.</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>Gateway And Mail Sync</h3><span class="muted">governed bridge</span></div><div class="panel-body">' +
          '<div class="detail">Gateway data can be imported into internal mail, and selected room messages can be synchronized back into governed email outbox delivery.</div>' +
          '<div class="detail-grid">' +
          renderMetric("Gateway ingress", hostIntegration && hostIntegration.capabilities && hostIntegration.capabilities.gatewayIngress ? "enabled" : "off") +
          renderMetric("Email sync", hostIntegration && hostIntegration.capabilities && hostIntegration.capabilities.outboundMailSync ? "enabled" : "off") +
          renderMetric("Gateway dispatch", roomDetail.boundaries && roomDetail.boundaries.automaticGatewayRoundTrip ? "automatic" : "manual") +
          renderMetric("Approval gate", Number(room.pendingApprovalCount || 0) > 0 ? "pending" : "ready") +
          '</div>' +
          (integrationApis
            ? '<div class="detail code">' + escapeHtmlClient('POST ' + integrationApis.gatewayHistoryImport + ' | POST ' + String(integrationApis.roomMessageEmailSync || '').replace(':roomKey', room.roomKey).replace(':messageId', '<messageId>')) + '</div>'
            : '') +
          '<div class="detail code">mailctl gateway import-history &lt;sessionKey&gt; ' + escapeHtmlClient(room.roomKey) + ' history.json</div>' +
          '<div class="detail code">mailctl gateway sync-mail ' + escapeHtmlClient(room.roomKey) + ' &lt;messageId&gt;</div>' +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>Mail Tasks</h3><span class="muted">' + escapeHtmlClient(tasks.length) + ' tracked</span></div><div class="panel-body">' +
          (tasks.length > 0
            ? '<div class="timeline-list">' + tasks.map(function(task) {
                return (
                  '<div class="timeline-entry">' +
                  '<div class="meta"><span>r' + escapeHtmlClient(task.revision || 0) + '</span><span>' + escapeHtmlClient(task.status || "open") + '</span></div>' +
                  '<div class="title">' + escapeHtmlClient(task.title || task.kind || "Task") + '</div>' +
                  '<div class="chips">' + renderPill(task.kind || "task", "") + renderPill(task.stage || "stage", "") + '</div>' +
                  (task.summary ? '<div class="detail">' + escapeHtmlClient(task.summary) + '</div>' : '') +
                  '</div>'
                );
              }).join("") + '</div>'
            : '<div class="empty">No mail task classification has been recorded for this room yet.</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>Virtual Mail</h3><span class="muted">' + escapeHtmlClient(virtualMessages.length) + ' messages</span></div><div class="panel-body">' +
          '<div class="detail">This is the internal collaboration chain for the room: single-parent replies, mailbox routing, and origin kinds are visible here without reopening raw transcripts.</div>' +
          (virtualMessages.length > 0
            ? '<div class="timeline-list">' + virtualMessages.slice(0, 24).map(renderVirtualMessageEntry).join("") + '</div>'
            : '<div class="empty">No virtual mail has been recorded for this room yet.</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>Mailbox Deliveries</h3><span class="muted">' + escapeHtmlClient(mailboxDeliveries.length) + ' deliveries</span></div><div class="panel-body">' +
          '<div class="detail">Delivery rows show where each internal message was queued, leased, consumed, or marked stale inside the virtual mail plane.</div>' +
          (mailboxDeliveries.length > 0
            ? '<div class="timeline-list">' + mailboxDeliveries.slice(0, 24).map(renderDeliveryEntry).join("") + '</div>'
            : '<div class="empty">No mailbox delivery rows have been recorded for this room yet.</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>Governed Outbox</h3><span class="muted">' + escapeHtmlClient(outboxIntents.length) + ' intents</span></div><div class="panel-body">' +
          '<div class="detail">Only this governed outbox path can produce real external email. Review it alongside approvals when checking what may leave the room.</div>' +
          (outboxIntents.length > 0
            ? '<div class="timeline-list">' + outboxIntents.slice(0, 12).map(renderOutboxEntry).join("") + '</div>'
            : '<div class="empty">No outbox intents have been recorded for this room yet.</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>Timeline</h3><span class="muted">' + escapeHtmlClient(timeline.length) + ' entries</span></div><div class="panel-body">' +
          (timeline.length > 0 ? '<div class="timeline-list">' + timeline.slice(0, 30).map(renderTimelineEntry).join("") + '</div>' : '<div class="empty">No room timeline entries have been recorded yet.</div>') +
          '</div></div>' +
          '</div>'
        );
      }

      function renderSidePanels() {
        const accounts = state.data && state.data.accounts ? state.data.accounts : [];
        const rooms = state.data && state.data.rooms ? state.data.rooms : [];
        const approvals = state.data && state.data.approvals ? state.data.approvals : [];
        const mailboxConsole = state.data && state.data.mailboxConsole ? state.data.mailboxConsole : null;
        const mailboxes = mailboxConsole ? mailboxConsole.virtualMailboxes || [] : [];
        const inboxes = mailboxConsole ? mailboxConsole.publicAgentInboxes || [] : [];
        return (
          '<div class="mail-workbench-side">' +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Accounts", "账号")) + '</h3><span class="muted">' + escapeHtmlClient(accounts.length) + '</span></div><div class="panel-body">' +
          (accounts.length > 0 ? '<div class="list">' + accounts.slice(0, 8).map(renderAccountCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No mailbox accounts have been connected yet.", "还没有连接任何邮箱账号。")) + '</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Rooms", "房间")) + '</h3><span class="muted">' + escapeHtmlClient(rooms.length) + '</span></div><div class="panel-body">' +
          (rooms.length > 0 ? '<div class="list">' + rooms.slice(0, 8).map(renderRoomCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No rooms are visible under the current filters.", "当前筛选条件下没有可见房间。")) + '</div>') +
          '</div></div>' +
          '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Approvals", "审批")) + '</h3><span class="muted">' + escapeHtmlClient(approvals.length) + '</span></div><div class="panel-body">' +
          (approvals.length > 0 ? '<div class="list">' + approvals.slice(0, 8).map(renderApprovalCard).join("") + '</div>' : '<div class="empty">' + escapeHtmlClient(l("No pending approval requests are visible right now.", "当前没有可见的待处理审批请求。")) + '</div>') +
          '</div></div>' +
          (mailboxes.length > 0
            ? '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Mailboxes", "邮箱箱体")) + '</h3><span class="muted">' + escapeHtmlClient(mailboxes.length) + '</span></div><div class="panel-body"><div class="list">' + mailboxes.slice(0, 8).map(renderMailboxCard).join("") + '</div></div></div>'
            : '') +
          (inboxes.length > 0
            ? '<div class="panel"><div class="panel-header"><h3>' + escapeHtmlClient(l("Public Inboxes", "公共收件箱")) + '</h3><span class="muted">' + escapeHtmlClient(inboxes.length) + '</span></div><div class="panel-body"><div class="list">' + inboxes.slice(0, 8).map(renderInboxCard).join("") + '</div></div></div>'
            : '') +
          '</div>'
        );
      }

      function renderMainContent() {
        if (state.loading) {
          return '<div class="loading">' + escapeHtmlClient(l("Loading mail workspace…", "正在加载邮件工作台…")) + '</div>';
        }
        if (state.error) {
          return '<div class="error-banner">' + escapeHtmlClient(state.error) + '</div>';
        }
        if (!state.data) {
          return '<div class="empty">' + escapeHtmlClient(l("No workbench payload was returned.", "没有返回工作台数据。")) + '</div>';
        }
        let primary = renderConnectHome();
        if (state.route.mailboxId) {
          primary = renderMailboxDetail();
        } else if (state.route.inboxId) {
          primary = renderInboxDetail();
        } else if (state.route.mode === "mailboxes") {
          primary = renderMailboxWorkspaceHome();
        } else if (state.route.mode === "accounts" && state.route.accountId && !state.route.roomKey) {
          primary = renderAccountDetail();
        } else if (state.route.roomKey) {
          primary = renderRoomDetail();
        } else if (state.route.mode === "accounts") {
          primary = renderAccountsHome();
        } else if (state.route.mode === "rooms") {
          primary = renderRoomsHome();
        } else if (state.route.mode === "approvals") {
          primary = renderApprovalsHome();
        } else if (state.route.accountId) {
          primary = renderAccountDetail();
        }
        if (state.route.mode === "connect" && !state.route.accountId && !state.route.roomKey && !state.route.mailboxId && !state.route.inboxId) {
          return primary;
        }
        return '<div class="mail-workbench-grid">' + primary + renderSidePanels() + '</div>';
      }

      function updateShellClasses() {
        const shell = document.getElementById("app-shell");
        const sidebar = document.getElementById("sidebar");
        if (!shell || !sidebar) return;
        shell.classList.toggle("shell--nav-collapsed", state.navCollapsed);
        shell.classList.toggle("shell--nav-drawer-open", state.navDrawerOpen);
        sidebar.classList.toggle("sidebar--collapsed", state.navCollapsed);
      }

      function renderShellCopy() {
        document.title = l("OpenClaw Workbench · " + config.serviceName + " Mail", "OpenClaw 工作台 · " + config.serviceName + " 邮件");
        const refreshButton = document.getElementById("refresh-button");
        if (refreshButton) {
          refreshButton.setAttribute("aria-label", l("Refresh workbench", "刷新工作台"));
        }
        const topbarNavToggle = document.getElementById("topbar-nav-toggle");
        if (topbarNavToggle) {
          topbarNavToggle.setAttribute("aria-label", l("Open navigation", "打开导航"));
        }
        const navBackdrop = document.getElementById("nav-backdrop");
        if (navBackdrop) {
          navBackdrop.setAttribute("aria-label", l("Close navigation", "关闭导航"));
        }
        const navCollapseToggle = document.getElementById("nav-collapse-toggle");
        if (navCollapseToggle) {
          navCollapseToggle.setAttribute("aria-label", state.navCollapsed ? l("Expand navigation", "展开导航") : l("Collapse navigation", "收起导航"));
        }
        const workbenchPill = document.getElementById("workbench-pill");
        if (workbenchPill) {
          workbenchPill.textContent = l("Workbench", "工作台");
        }
        const navSectionLabel = document.getElementById("nav-section-label-mail");
        if (navSectionLabel) {
          navSectionLabel.textContent = l("Mail", "邮件");
        }
        const sidebarEyebrow = document.getElementById("sidebar-eyebrow");
        if (sidebarEyebrow) {
          sidebarEyebrow.textContent = l("OpenClaw Control", "OpenClaw 控制台");
        }
        const sidebarFooterCopy = document.getElementById("sidebar-footer-copy");
        if (sidebarFooterCopy) {
          sidebarFooterCopy.textContent = l(
            "OpenClaw-style Mail tab. MailClaws runtime data is rendered directly in the same workbench surface.",
            "OpenClaw 风格的邮件页签。MailClaws 运行态数据直接渲染在同一块工作台界面中。"
          );
        }
      }

      function translateTabLabel(tabId, fallbackLabel) {
        if (tabId === "mail") return l("Mail", "邮件");
        if (tabId === "accounts") return l("Accounts", "账号");
        if (tabId === "rooms") return l("Rooms", "房间");
        if (tabId === "mailboxes") return l("Mailboxes", "邮箱箱体");
        if (tabId === "approvals") return l("Approvals", "审批");
        return fallbackLabel;
      }

      function renderNav() {
        const navRoot = document.getElementById("nav-items");
        if (!navRoot) return;
        const workspace = state.data && state.data.workspace ? state.data.workspace : null;
        const tabs = workspace && Array.isArray(workspace.tabs) ? workspace.tabs : [];
        navRoot.innerHTML = tabs.map(function(tab) {
          const icon = ICONS[tab.id] || ICONS.mail;
          return (
            '<a class="nav-item ' + (tab.active ? 'nav-item--active' : '') + '" href="' + escapeHtmlClient(tab.href) + '">' +
            '<span class="nav-item__icon" aria-hidden="true">' + icon + '</span>' +
            '<span class="nav-item__text">' + escapeHtmlClient(translateTabLabel(tab.id, tab.label)) + '</span>' +
            '</a>'
          );
        }).join("");
      }

      function renderHeader() {
        const workspace = state.data && state.data.workspace ? state.data.workspace : null;
        const activeTab = workspace && workspace.activeTab ? workspace.activeTab : "mail";
        const pageTitle = document.getElementById("page-title");
        const pageSub = document.getElementById("page-sub");
        const breadcrumb = document.getElementById("breadcrumb-current");
        const pageMeta = document.getElementById("page-meta");
        const accountsPill = document.getElementById("accounts-pill");
        const roomsPill = document.getElementById("rooms-pill");
        const approvalsPill = document.getElementById("approvals-pill");
        if (pageTitle) {
          pageTitle.textContent =
            activeTab === "rooms" ? l("Room Workbench", "房间工作台") :
            activeTab === "mailboxes" ? l("Mailbox Workbench", "邮箱工作台") :
            activeTab === "accounts" ? l("Mailbox Accounts", "邮箱账号") :
            activeTab === "approvals" ? l("Approvals", "审批") :
            l("Mail Workbench", "邮件工作台");
        }
        if (pageSub) {
          pageSub.textContent =
            state.route.roomKey
              ? l("Inspect one room, its mailbox participation, approvals, and gateway projection trace.", "查看单个房间的邮箱参与情况、审批状态和网关投影轨迹。")
              : state.route.mailboxId
                ? l("Inspect one mailbox feed and the room-local projection visible inside it.", "查看单个邮箱中的消息流，以及其中可见的房间本地投影。")
                : state.route.accountId
                  ? l("Inspect provider state, public inboxes, rooms, and mailboxes for one connected account.", "查看单个已连接账号的提供商状态、公共收件箱、房间和虚拟邮箱。")
                  : l("OpenClaw-style shell with MailClaws runtime data rendered directly in the workbench.", "OpenClaw 风格的壳层，MailClaws 运行态数据直接渲染在工作台中。");
        }
        if (breadcrumb) {
          breadcrumb.textContent =
            state.route.roomKey || state.route.mailboxId || state.route.inboxId || state.route.accountId || l("Mail", "邮件");
        }
        if (pageMeta) {
          const bits = [];
          if (state.route.accountId) bits.push(renderPill(prefixedText("account ", "账号 ", state.route.accountId), ""));
          if (state.route.roomKey) bits.push(renderPill(prefixedText("room ", "房间 ", state.route.roomKey), ""));
          if (state.route.mailboxId) bits.push(renderPill(prefixedText("mailbox ", "邮箱 ", state.route.mailboxId), ""));
          if (state.route.inboxId) bits.push(renderPill(prefixedText("inbox ", "收件箱 ", state.route.inboxId), ""));
          if (workspace && workspace.hostIntegration && workspace.hostIntegration.capabilities && workspace.hostIntegration.capabilities.internalMail) {
            bits.push(renderPill(l("internal mail", "内部邮件"), "pill--ok"));
          }
          pageMeta.innerHTML = bits.join("");
        }
        if (accountsPill) accountsPill.textContent = countText((state.data && state.data.accounts ? state.data.accounts.length : 0), "accounts", " 个账号");
        if (roomsPill) roomsPill.textContent = countText((state.data && state.data.rooms ? state.data.rooms.length : 0), "rooms", " 个房间");
        if (approvalsPill) approvalsPill.textContent = countText((state.data && state.data.approvals ? state.data.approvals.length : 0), "approvals", " 个审批");
      }

      function render() {
        updateShellClasses();
        renderShellCopy();
        renderNav();
        renderHeader();
        const content = document.getElementById("content-root");
        if (content) {
          content.innerHTML = renderMainContent();
        }
      }

      function syncUrl(replace) {
        const href = hrefForRoute(state.route);
        const current = window.location.pathname + window.location.search;
        if (href !== current) {
          if (replace) {
            window.history.replaceState({}, "", href);
          } else {
            window.history.pushState({}, "", href);
          }
        }
        notifyHost("mailclaw.workbench.route", {
          href: href,
          routeMode: state.route.mode || "connect",
          accountId: state.route.accountId,
          roomKey: state.route.roomKey,
          mailboxId: state.route.mailboxId
        });
      }

      async function refresh(replaceUrl) {
        state.loading = true;
        state.error = null;
        render();
        try {
          const params = new URLSearchParams();
          if (state.route.mode) params.set("mode", state.route.mode);
          if (state.route.accountId) params.set("accountId", state.route.accountId);
          if (state.route.roomKey) params.set("roomKey", state.route.roomKey);
          if (state.route.mailboxId) params.set("mailboxId", state.route.mailboxId);
          if (state.route.status) params.set("roomStatuses", state.route.status);
          if (state.route.originKind) params.set("originKinds", state.route.originKind);
          if (state.route.approvalStatus) params.set("approvalStatuses", state.route.approvalStatus);
          const payload = await requestJson((config.apiBasePath || "/api") + "/console/workbench" + (params.toString() ? "?" + params.toString() : ""));
          state.data = payload;
          if (payload && payload.selection) {
            if (state.route.accountId) {
              state.route.accountId = payload.selection.accountId || state.route.accountId;
            }
            if (state.route.roomKey) {
              state.route.roomKey = payload.selection.roomKey || state.route.roomKey;
            }
            if (state.route.mailboxId) {
              state.route.mailboxId = payload.selection.mailboxId || state.route.mailboxId;
            }
          }
          if (!state.route.mode && payload && payload.workspace && payload.workspace.activeTab) {
            state.route.mode = payload.workspace.activeTab;
          }
          syncUrl(Boolean(replaceUrl));
          notifyHost("mailclaw.workbench.state", {
            routeMode: state.route.mode || "connect",
            accountCount: payload && payload.accounts ? payload.accounts.length : 0,
            roomCount: payload && payload.rooms ? payload.rooms.length : 0,
            approvalCount: payload && payload.approvals ? payload.approvals.length : 0,
            selectedAccountId: state.route.accountId,
            selectedRoomKey: state.route.roomKey,
            selectedMailboxId: state.route.mailboxId,
            hostIntegration: payload && payload.workspace ? payload.workspace.hostIntegration : null
          });
        } catch (error) {
          state.error = error instanceof Error ? error.message : String(error);
        } finally {
          state.loading = false;
          render();
        }
      }

      function navigate(nextRoute) {
        state.route = {
          mode: nextRoute.mode || state.route.mode || "connect",
          accountId: nextRoute.accountId ?? null,
          inboxId: nextRoute.inboxId ?? null,
          roomKey: nextRoute.roomKey ?? null,
          mailboxId: nextRoute.mailboxId ?? null,
          status: state.route.status || "",
          originKind: state.route.originKind || "",
          approvalStatus: state.route.approvalStatus || ""
        };
        if (state.route.mailboxId || state.route.inboxId) {
          state.route.mode = "mailboxes";
        } else if (state.route.roomKey) {
          state.route.mode = "rooms";
        } else if (state.route.accountId) {
          state.route.mode = "accounts";
        }
        void refresh(false);
      }

      function applyThemeMode(mode) {
        document.documentElement.setAttribute("data-theme-mode", mode);
        document.querySelectorAll("[data-theme-mode]").forEach(function(button) {
          button.classList.toggle("topbar-theme-mode__btn--active", button.getAttribute("data-theme-mode") === mode);
        });
      }

      function readCustomAgentPayload(target) {
        const root = target.closest(".panel") || document;
        function readField(name) {
          const element = root.querySelector('[data-custom-agent-field="' + name + '"]');
          return element && "value" in element ? String(element.value || "").trim() : "";
        }
        return {
          agentId: readField("agentId"),
          displayName: readField("displayName"),
          publicMailboxId: readField("publicMailboxId"),
          collaboratorAgentIds: readField("collaboratorAgentIds"),
          purpose: readField("purpose")
        };
      }

      document.addEventListener("click", function(event) {
        const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
        if (!target) return;
        const action = target.getAttribute("data-action");
        if (action === "validate-mailbox") {
          event.preventDefault();
          let payload;
          try {
            payload = buildConnectMailboxPayload();
          } catch (error) {
            state.error = error instanceof Error ? error.message : String(error);
            clearConnectValidation();
            render();
            return;
          }
          const signature = buildConnectPayloadSignature(payload);
          state.loading = true;
          state.error = "";
          state.connectValidation = {
            status: "pending",
            signature: signature,
            result: null,
            error: ""
          };
          render();
          void requestJson((config.apiBasePath || "/api") + "/accounts/validate", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify(payload)
          })
            .then(function(result) {
              state.connectValidation = {
                status: "success",
                signature: signature,
                result: result,
                error: ""
              };
            })
            .catch(function(error) {
              state.connectValidation = {
                status: "failed",
                signature: "",
                result: null,
                error: error instanceof Error ? error.message : String(error)
              };
            })
            .finally(function() {
              state.loading = false;
              render();
            });
          return;
        }
        if (action === "connect-mailbox") {
          event.preventDefault();
          let payload;
          try {
            payload = buildConnectMailboxPayload();
          } catch (error) {
            state.error = error instanceof Error ? error.message : String(error);
            render();
            return;
          }
          const signature = buildConnectPayloadSignature(payload);
          if (state.connectValidation.status !== "success" || state.connectValidation.signature !== signature) {
            state.error = l("Validate this mailbox first. Any field change requires a fresh validation run.", "请先校验这个邮箱。任何字段变更后都必须重新校验。");
            render();
            return;
          }
          state.loading = true;
          state.error = "";
          render();
          void requestJson((config.apiBasePath || "/api") + "/accounts", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify(payload)
          })
            .then(function(account) {
              state.connectEmailAddress = payload.emailAddress;
              navigate({
                accountId: account && account.accountId ? account.accountId : payload.accountId,
                inboxId: null,
                roomKey: null,
                mailboxId: null,
                mode: "accounts"
              });
            })
            .catch(function(error) {
              state.error = error instanceof Error ? error.message : String(error);
            })
            .finally(function() {
              state.loading = false;
              render();
            });
          return;
        }
        if (action === "delete-account") {
          event.preventDefault();
          const accountId = target.getAttribute("data-account-id") || state.route.accountId;
          if (!accountId) {
            return;
          }
          if (!window.confirm(l("Delete this mailbox account connection? Historical room data is kept for now.", "确定删除这个邮箱账号连接吗？历史房间数据暂时会保留。"))) {
            return;
          }
          state.loading = true;
          state.error = "";
          render();
          void requestJson((config.apiBasePath || "/api") + "/accounts/" + encodeURIComponent(accountId), {
            method: "DELETE"
          })
            .then(function() {
              clearConnectValidation();
              navigate({
                accountId: null,
                inboxId: null,
                roomKey: null,
                mailboxId: null,
                mode: "accounts"
              });
            })
            .catch(function(error) {
              state.error = error instanceof Error ? error.message : String(error);
            })
            .finally(function() {
              state.loading = false;
              render();
            });
          return;
        }
        if (action === "apply-agent-template") {
          event.preventDefault();
          const templateId = target.getAttribute("data-template-id");
          const accountId = target.getAttribute("data-account-id");
          const tenantId = target.getAttribute("data-tenant-id");
          if (!templateId || !accountId) {
            return;
          }
          state.loading = true;
          state.error = "";
          render();
          void requestJson((config.apiBasePath || "/api") + "/console/agent-templates/" + encodeURIComponent(templateId) + "/apply", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              accountId: accountId,
              tenantId: tenantId || accountId
            })
          })
            .then(function() {
              return refresh(true);
            })
            .catch(function(error) {
              state.error = error instanceof Error ? error.message : String(error);
            })
            .finally(function() {
              state.loading = false;
              render();
            });
          return;
        }
        if (action === "create-custom-agent") {
          event.preventDefault();
          const accountId = target.getAttribute("data-account-id");
          const tenantId = target.getAttribute("data-tenant-id");
          const payload = readCustomAgentPayload(target);
          if (!accountId || !payload.agentId) {
            state.error = l("agentId and accountId are required", "agentId 和 accountId 必填");
            render();
            return;
          }
          state.loading = true;
          state.error = "";
          render();
          void requestJson((config.apiBasePath || "/api") + "/console/agents", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              accountId: accountId,
              tenantId: tenantId || accountId,
              agentId: payload.agentId,
              displayName: payload.displayName || undefined,
              publicMailboxId: payload.publicMailboxId || undefined,
              collaboratorAgentIds: payload.collaboratorAgentIds
                ? payload.collaboratorAgentIds.split(",").map(function(value) { return value.trim(); }).filter(Boolean)
                : undefined,
              purpose: payload.purpose || undefined
            })
          })
            .then(function() {
              return refresh(true);
            })
            .catch(function(error) {
              state.error = error instanceof Error ? error.message : String(error);
            })
            .finally(function() {
              state.loading = false;
              render();
            });
          return;
        }
        if (action === "select-account") {
          event.preventDefault();
          navigate({
            accountId: target.getAttribute("data-account-id"),
            inboxId: null,
            roomKey: null,
            mailboxId: null,
            mode: "accounts"
          });
        }
        if (action === "select-room") {
          event.preventDefault();
          navigate({
            accountId: target.getAttribute("data-account-id") || state.route.accountId,
            inboxId: null,
            roomKey: target.getAttribute("data-room-key"),
            mailboxId: null,
            mode: "rooms"
          });
        }
        if (action === "select-mailbox") {
          event.preventDefault();
          navigate({
            accountId: target.getAttribute("data-account-id") || state.route.accountId,
            inboxId: null,
            roomKey: target.getAttribute("data-room-key") || null,
            mailboxId: target.getAttribute("data-mailbox-id"),
            mode: "mailboxes"
          });
        }
        if (action === "select-inbox") {
          event.preventDefault();
          navigate({
            accountId: target.getAttribute("data-account-id") || state.route.accountId,
            inboxId: target.getAttribute("data-inbox-id"),
            roomKey: null,
            mailboxId: null,
            mode: "mailboxes"
          });
        }
      });

      document.addEventListener("input", function(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
          return;
        }
        if (target.id === "connect-email-input") {
          state.connectEmailAddress = String(target.value || "").trim();
          clearConnectValidation();
          return;
        }
        const field = target.getAttribute("data-connect-field");
        if (!field || target instanceof HTMLSelectElement || target.type === "checkbox") {
          return;
        }
        clearConnectValidation();
        state.connectDraft = {
          ...(state.connectDraft || {}),
          [field]: String(target.value || "")
        };
      });

      document.addEventListener("change", function(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
          return;
        }
        if (target.id === "connect-email-input") {
          state.connectEmailAddress = String(target.value || "").trim();
          clearConnectValidation();
          render();
          return;
        }
        const field = target.getAttribute("data-connect-field");
        if (!field) {
          return;
        }
        clearConnectValidation();
        state.connectDraft = {
          ...(state.connectDraft || {}),
          [field]: target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : String(target.value || "")
        };
        if (target instanceof HTMLSelectElement || (target instanceof HTMLInputElement && target.type === "checkbox")) {
          render();
        }
      });

      document.addEventListener("click", function(event) {
        const anchor = event.target instanceof Element ? event.target.closest("a.nav-item") : null;
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (!href || !href.startsWith("/")) return;
        event.preventDefault();
        const nextUrl = new URL(href, window.location.origin);
        state.route = parseRoute(nextUrl.pathname, nextUrl.search);
        void refresh(false);
      });

      const refreshButton = document.getElementById("refresh-button");
      if (refreshButton) {
        refreshButton.addEventListener("click", function() {
          void refresh(true);
        });
      }

      const topbarNavToggle = document.getElementById("topbar-nav-toggle");
      if (topbarNavToggle) {
        topbarNavToggle.addEventListener("click", function() {
          state.navDrawerOpen = !state.navDrawerOpen;
          render();
        });
      }

      const navCollapseToggle = document.getElementById("nav-collapse-toggle");
      if (navCollapseToggle) {
        navCollapseToggle.addEventListener("click", function() {
          state.navCollapsed = !state.navCollapsed;
          render();
        });
      }

      const navBackdrop = document.getElementById("nav-backdrop");
      if (navBackdrop) {
        navBackdrop.addEventListener("click", function() {
          state.navDrawerOpen = false;
          render();
        });
      }

      document.querySelectorAll("[data-theme-mode]").forEach(function(button) {
        button.addEventListener("click", function() {
          applyThemeMode(button.getAttribute("data-theme-mode") || "dark");
        });
      });

      document.querySelectorAll("[data-language-mode]").forEach(function(button) {
        button.addEventListener("click", function() {
          applyLanguage(button.getAttribute("data-language-mode") || "en");
          render();
        });
      });

      window.addEventListener("popstate", function() {
        state.route = parseRoute(window.location.pathname, window.location.search);
        void refresh(true);
      });

      state.route = parseRoute(window.location.pathname, window.location.search);
      applyLanguage(readStoredLanguage());
      applyThemeMode(document.documentElement.getAttribute("data-theme-mode") || "dark");
      notifyHost("mailclaw.workbench.ready", {
        embeddedShell: Boolean(config.embeddedShell),
        href: window.location.pathname + window.location.search
      });
      void refresh(true);
    </script>
  </body>
</html>`;
}
