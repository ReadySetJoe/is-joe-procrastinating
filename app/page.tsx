import { connection } from "next/server";

const STEAM_ID = "76561198061090157";

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
      procrastinating: true,
      label: `Playing ${player.gameextrainfo}`,
      color: "bg-red-500",
    };
  }
  return {
    procrastinating: false,
    label: player.personastate >= 1 ? "Online but not gaming" : "Offline",
    color: "bg-neutral-500",
  };
}

export default async function Page() {
  await connection();
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-neutral-500">Steam API key not configured.</p>
      </main>
    );
  }

  let player: SteamPlayer | null = null;
  let debug = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey.length,
    steamId: STEAM_ID,
    fetchStatus: "",
    fetchError: "",
    rawBody: "",
    playerCount: -1,
  };

  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${STEAM_ID}`;
    const res = await fetch(url);
    debug.fetchStatus = `${res.status} ${res.statusText}`;
    const text = await res.text();
    debug.rawBody = text.slice(0, 500);
    if (!res.ok) throw new Error(`Steam API returned ${res.status}`);
    const data: SteamResponse = JSON.parse(text);
    debug.playerCount = data.response.players.length;
    player = data.response.players[0] ?? null;
  } catch (e) {
    debug.fetchError = e instanceof Error ? e.message : String(e);
  }

  if (!player) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">Couldn't check status.</p>
        <pre className="max-w-lg overflow-auto rounded bg-neutral-900 p-4 text-xs text-neutral-400">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </main>
    );
  }

  const status = getStatus(player);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <p className="text-4xl font-bold tracking-tight">
        {status.procrastinating ? "Yes." : "No."}
      </p>
      <div className="flex items-center gap-3">
        <span className={`inline-block h-3 w-3 rounded-full ${status.color}`} />
        <span className="text-lg text-neutral-400">{status.label}</span>
      </div>
      <p className="text-sm text-neutral-500">
        Checked {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
      </p>
      <pre className="max-w-lg overflow-auto rounded bg-neutral-900 p-4 text-xs text-neutral-400">
        {JSON.stringify(debug, null, 2)}
      </pre>
    </main>
  );
}
