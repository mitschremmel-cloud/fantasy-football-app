import { kv } from '@vercel/kv';

const LEAGUE_ID = "1379487727849832448";

export async function getLeagueStandings() {
  const cached = await kv.get('sleeper_standings_full');
  if (cached) return cached;

  try {
    const [standingsRes, usersRes] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/standings`),
      fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`)
    ]);

    if (!standingsRes.ok || !usersRes.ok) return null;

    const standings = await standingsRes.json();
    const users = await usersRes.json();

    const data = standings.map((s: any) => {
      // Suche den User, der diesem Roster gehört
      const user = users.find((u: any) => u.user_id === s.owner_id);
      const teamName = user?.metadata?.team_name || user?.display_name || `Team ${s.roster_id}`;
      return { ...s, team_name: teamName };
    });

    await kv.set('sleeper_standings_full', data, { ex: 300 });
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

