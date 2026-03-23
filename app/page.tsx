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
    if (!res.ok) throw new Error(`Steam API returned ${res.status}`);
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
    </main>
  );
}
