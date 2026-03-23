# Steam Status Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page site that shows whether Joe is currently active on Steam.

**Architecture:** One async Server Component (`app/page.tsx`) fetches Joe's Steam status via the Steam Web API and renders a minimal dark-mode UI with a colored status dot. No client JS, no database, no state.

**Tech Stack:** Next.js 16.2.1, React 19, TypeScript, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-03-23-steam-status-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `.env.local` | Create | Steam API key |
| `app/globals.css` | Modify | Force dark background, remove light-mode CSS vars |
| `app/layout.tsx` | Modify | Update metadata (title, description) |
| `app/page.tsx` | Rewrite | Fetch Steam status, render UI |

---

### Task 1: Environment setup

**Files:**
- Create: `.env.local`

- [ ] **Step 1: Create `.env.local`**

```
STEAM_API_KEY=your_key_here
```

The user will replace `your_key_here` with their actual key. `.env.local` is already in `.gitignore` by default.

- [ ] **Step 2: Verify env is gitignored**

Run: `grep '.env.local' .gitignore`
Expected: A matching line confirming it's ignored.

---

### Task 2: Update layout and global styles for dark mode

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update `app/globals.css`**

Replace the entire file. Force dark background colors (no light mode toggle needed — the spec says dark mode):

```css
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Update metadata in `app/layout.tsx`**

Change the `metadata` export:

```tsx
export const metadata: Metadata = {
  title: "Is Joe Procrastinating?",
  description: "Check if Joe is playing games on Steam right now.",
};
```

No other changes to `layout.tsx` — the Geist font setup and html/body structure are fine as-is.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: configure dark mode and update page metadata"
```

---

### Task 3: Build the Steam status page

**Files:**
- Rewrite: `app/page.tsx`

**Reference:** Steam Web API docs — `GetPlayerSummaries/v0002` returns a `players` array. Each player object has `personastate` (int), `personaname` (string), and optionally `gameextrainfo` (string) if currently in a game.

**Important:** This is Next.js 16. Per the docs at `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`, async Server Components use plain `fetch()` — no caching by default. The component should be an `async function` that awaits the fetch.

- [ ] **Step 1: Replace `app/page.tsx` with the full implementation**

Replace the entire file with:

```tsx
const STEAM_ID = "REPLACE_WITH_YOUR_STEAM64_ID";

type SteamPlayer = {
  personaname: string;
  personastate: number;
  gameextrainfo?: string;
};

type SteamResponse = {
  response: {
    players: SteamPlayer[];
  };
};

function getStatus(player: SteamPlayer) {
  if (player.gameextrainfo) {
    return {
      label: `In Game: ${player.gameextrainfo}`,
      color: "bg-red-500",
    };
  }
  if (player.personastate >= 1) {
    return { label: "Online", color: "bg-green-500" };
  }
  return { label: "Offline", color: "bg-neutral-500" };
}

export default async function Page() {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-neutral-500">Steam API key not configured.</p>
      </main>
    );
  }

  let player: SteamPlayer | null = null;

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${STEAM_ID}`
    );
    const data: SteamResponse = await res.json();
    player = data.response.players[0] ?? null;
  } catch {
    // fall through to error UI
  }

  if (!player) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-neutral-500">Couldn't check status.</p>
      </main>
    );
  }

  const status = getStatus(player);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {player.personaname}
      </h1>
      <div className="flex items-center gap-3">
        <span className={`inline-block h-3 w-3 rounded-full ${status.color}`} />
        <span className="text-lg">{status.label}</span>
      </div>
      <p className="text-sm text-neutral-500">
        Checked {new Date().toLocaleString()}
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Ask the user for their Steam64 ID**

The user needs to replace `REPLACE_WITH_YOUR_STEAM64_ID` with their actual Steam64 ID (a 17-digit number like `76561198000000000`).

- [ ] **Step 3: Verify it runs**

Run: `npm run dev`

Visit `http://localhost:3000` and confirm:
- Dark background
- Steam display name shows as heading
- Status dot + text appears (green/gray/red depending on current state)
- Timestamp at the bottom

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add Steam status page"
```

---

### Task 4: Add `.env.local` to env example and update user

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example` for reference**

```
STEAM_API_KEY=your_steam_web_api_key_here
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example for Steam API key"
```
