# Steam Status Page - Design Spec

## Purpose

A single-page site that shows whether Joe is currently active on Steam. Intended as an accountability tool — Joe shares the URL with a friend who can check if he's gaming during work hours.

## Architecture

Server-rendered Next.js page. No client-side JavaScript, no database, no state management.

### Single file: `app/page.tsx`

A Server Component that:

1. Calls the Steam Web API (`GetPlayerSummaries/v0002`) with Joe's Steam ID
2. Reads the `personastate` field and `gameextrainfo` field from the response
3. Renders the result

### Steam API Response (relevant fields)

- `personastate`: 0=Offline, 1=Online, 2=Busy, 3=Away, 4=Snooze, 5=Looking to trade, 6=Looking to play
- `gameextrainfo`: Name of the game currently being played (only present if in a game)
- `gameid`: ID of the game currently being played (only present if in a game)

### Status Display Logic

| Condition | Dot Color | Text |
|-----------|-----------|------|
| `gameextrainfo` present | Red | "In Game: [game name]" |
| `personastate` >= 1 and no game | Green | "Online" |
| `personastate` == 0 | Gray | "Offline" |

"In Game" takes priority over online status because that's the procrastination signal.

## UI

- Dark background (`bg-neutral-950` or similar), centered content
- Steam display name as heading
- Colored dot + status text
- Small muted timestamp at the bottom showing when the page was loaded
- Minimal — no nav, no footer, no extras

## Configuration

- **Steam API key**: stored in `.env.local` as `STEAM_API_KEY` (gitignored by default)
- **Steam ID**: hardcoded constant in `page.tsx` (public info, no security concern)
- **Caching**: `export const dynamic = 'force-dynamic'` to ensure fresh data on every request

## Error Handling

If the Steam API call fails (network error, bad key, etc.), display "Couldn't check status" in muted text instead of crashing.

## Out of Scope

- Auto-refresh / polling
- Multiple users
- Historical tracking
- Authentication
- Game-specific details beyond the name
