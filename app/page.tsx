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
