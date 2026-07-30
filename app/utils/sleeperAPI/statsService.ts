import { cache } from 'react';

// Historische Daten für Meisterschaften und Finals
const MANUAL_HISTORY: Record<string, { champ: string, finalists: string[] }> = {
  "2025": { champ: "", finalists: ["Bockwurstmeta", "Mitsch"] },
  "2024": { champ: "", finalists: ["Bockwurstmeta", "Gewinne"] },
  "2023": { champ: "", finalists: ["KaisLeisten", "Gewinne"] },
  "2022": { champ: "", finalists: ["JeanBaptiste", "Gewinne"] },
  "2021": { champ: "", finalists: ["JeanBaptiste", "mackmack"] },
};

const LEAGUE_ID = "1379487727849832448";
function normalisiereName(name: string): string {
  if (name === "senffrancisco49ers" || name === "sleepyjoes") {
    return "sleepyoes";
  }
  return name;
}

export async function holeLigastatistiken(): Promise<any[] | { error: string }> {
  try {
    let currentId = LEAGUE_ID;
    const statsMap: Record<string, { wins: number, losses: number, fpts: number, fptsAgainst: number, winsChampionship: number, winsFinals: number }> = {};

    for (let i = 0; i < 10; i++) {
      const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}`);
      if (!leagueRes.ok) break;
      const league = await leagueRes.json();

      if (parseInt(league.season) < 2021) {
        if (!league.previous_league_id) break;
        currentId = league.previous_league_id;
        continue;
      }

      const [rostersRes, usersRes, winnersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${currentId}/rosters`),
        fetch(`https://api.sleeper.app/v1/league/${currentId}/users`),
        fetch(`https://api.sleeper.app/v1/league/${currentId}/winners_bracket`)
      ]);

      if (rostersRes.ok && usersRes.ok) {
        const rosters = await rostersRes.json();
        const users = await usersRes.json();
        const winners = winnersRes.ok ? await winnersRes.json() : [];

        const finalMatch = winners.filter((m: any) => m.w !== null).find((m: any, idx: number, arr: any[]) => !arr.some(o => o.l === m.w));
        const champRosterId = finalMatch ? finalMatch.w : null;

        let finalists: number[] = [];
        if (winners && winners.length > 0) {
            const maxRound = Math.max(...winners.map((m: any) => m.round || 0));
            const finalMatchup = winners.find((m: any) => m.round === maxRound);
            if (finalMatchup) finalists = [finalMatchup.t1, finalMatchup.t2].filter(id => id !== null);
        }

        rosters.forEach((r: any) => {
          const user = users.find((u: any) => u.user_id === r.owner_id);
          let loginName = normalisiereName(user ? user.display_name : "Unbekannt");

          if (!statsMap[loginName]) statsMap[loginName] = { wins: 0, losses: 0, fpts: 0, fptsAgainst: 0, winsChampionship: 0, winsFinals: 0 };

          statsMap[loginName].wins += r.settings.wins || 0;
          statsMap[loginName].losses += r.settings.losses || 0;
          statsMap[loginName].fpts += (r.settings.fpts || 0) + (r.settings.fpts_decimal || 0) / 100;
          statsMap[loginName].fptsAgainst += (r.settings.fpts_against || 0) + (r.settings.fpts_against_decimal || 0) / 100;

          if (r.roster_id === champRosterId) statsMap[loginName].winsChampionship += 1;
          if (finalists.includes(r.roster_id)) statsMap[loginName].winsFinals += 1;

          const seasonData = MANUAL_HISTORY[league.season];
          if (seasonData) {
              if (seasonData.champ === loginName) statsMap[loginName].winsChampionship += 1;
              if (seasonData.finalists.includes(loginName)) statsMap[loginName].winsFinals += 1;
          }
        });
      }
      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
    }

    return Object.entries(statsMap).map(([manager, stats]) => ({
      manager,
      winsChampionship: stats.winsChampionship,
      winsFinals: stats.winsFinals,
      record: `${stats.wins}-${stats.losses}`,
      fpts: stats.fpts.toFixed(1),
      fptsAgainst: stats.fptsAgainst.toFixed(1)
    })).sort((a: any, b: any) => b.winsChampionship - a.winsChampionship || b.winsFinals - a.winsFinals || b.record.split('-')[0] - a.record.split('-')[0]);
  } catch (error) {
    return { error: "Fehler beim Laden" };
  }
}

export const holeSpielerStatistik = cache(async (loginName: string) => {
  try {
    const resPlayers = await fetch('https://api.sleeper.app/v1/players/nfl');
    const allPlayersMap = await resPlayers.json();

    let currentId = LEAGUE_ID;
    const history: any[] = [];
    for (let i = 0; i < 10; i++) {
      const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}`);
      if (!leagueRes.ok) break;
      const league = await leagueRes.json();
      if (parseInt(league.season) < 2021) {
        if (!league.previous_league_id) break;
        currentId = league.previous_league_id;
        continue;
      }

      const [rostersRes, usersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${currentId}/rosters`),
        fetch(`https://api.sleeper.app/v1/league/${currentId}/users`)
      ]);

      if (rostersRes.ok && usersRes.ok) {
        const rosters = await rostersRes.json();
        const users = await usersRes.json();
        const user = users.find((u: any) => normalisiereName(u.display_name) === normalisiereName(loginName));
        if (user) {
          const roster = rosters.find((r: any) => r.owner_id === user.user_id);
          if (roster) {
            let weeklyStats: any[] = [];
            for (let week = 1; week <= 17; week++) {
              const mRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}/matchups/${week}`);
              if (mRes.ok) {
                const matchups = await mRes.json();
                const myMatchup = matchups.find((m: any) => m.roster_id === roster.roster_id);
                if (myMatchup) {
                  weeklyStats.push({ starters: myMatchup.starters || [], playersPoints: myMatchup.players_points || {} });
                }
              }
            }
            history.push({ season: league.season, wins: roster.settings.wins || 0, losses: roster.settings.losses || 0, weeklyStats });
          }
        }
      }
      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
    }

    const playerStats: Record<string, { games: number, points: number }> = {};
    history.forEach(h => {
      h.weeklyStats.forEach((week: any) => {
        week.starters.forEach((pId: string) => {
          const player = allPlayersMap[pId];
          if (player && player.position !== 'DEF') {
            playerStats[pId] = {
              games: (playerStats[pId]?.games || 0) + 1,
              points: (playerStats[pId]?.points || 0) + (week.playersPoints[pId] || 0)
            };
          }
        });
      });
    });

    const topPlayers = Object.entries(playerStats)
      .sort((a, b) => b[1].games - a[1].games || b[1].points - a[1].points)
      .slice(0, 5)
      .map(([id, stats]) => ({
        name: allPlayersMap[id] ? `${allPlayersMap[id].first_name} ${allPlayersMap[id].last_name}` : id,
        games: stats.games,
        points: stats.points.toFixed(1)
      }));

    return { bestSeason: [...history].sort((a, b) => b.wins - a.wins || a.losses - b.losses)[0], worstSeason: [...history].sort((a, b) => b.losses - a.losses || a.wins - b.wins)[0], topPlayers };
  } catch (e) {
    return { error: "Fehler beim Laden" };
  }
});

export const holeH2HStatistik = cache(async (loginName: string) => {
  try {
    let currentId = LEAGUE_ID;
    const h2hMap: Record<string, { wins: number, losses: number }> = {};

    for (let i = 0; i < 10; i++) {
      const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}`);
      if (!leagueRes.ok) break;
      const league = await leagueRes.json();
      if (parseInt(league.season) < 2021) {
        if (!league.previous_league_id) break;
        currentId = league.previous_league_id;
        continue;
      }

      const [rostersRes, usersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${currentId}/rosters`),
        fetch(`https://api.sleeper.app/v1/league/${currentId}/users`)
      ]);

      if (!rostersRes.ok || !usersRes.ok) {
        if (!league.previous_league_id) break;
        currentId = league.previous_league_id;
        continue;
      }

      const rosters = await rostersRes.json();
      const users = await usersRes.json();
      const user = users.find((u: any) => normalisiereName(u.display_name) === normalisiereName(loginName));

      if (user) {
        const myRosterId = rosters.find((r: any) => r.owner_id === user.user_id)?.roster_id;

        for (let week = 1; week <= 17; week++) {
          const mRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}/matchups/${week}`);
          if (!mRes.ok) continue;
          const matchups = await mRes.json();
          const myMatchup = matchups.find((m: any) => m.roster_id === myRosterId);
          if (myMatchup && myMatchup.matchup_id) {
            const opponentMatchup = matchups.find((m: any) => m.matchup_id === myMatchup.matchup_id && m.roster_id !== myRosterId);
            if (opponentMatchup) {
              const opponentRoster = rosters.find((r: any) => r.roster_id === opponentMatchup.roster_id);
              const opponentUser = users.find((u: any) => u.user_id === opponentRoster?.owner_id);
              const opponentName = normalisiereName(opponentUser ? opponentUser.display_name : "Unbekannt");
              if (!h2hMap[opponentName]) h2hMap[opponentName] = { wins: 0, losses: 0 };
              if (myMatchup.points > opponentMatchup.points) h2hMap[opponentName].wins += 1;
              else h2hMap[opponentName].losses += 1;
            }
          }
        }
      }
      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
    }

    return h2hMap;
  } catch (e) {
    return { error: "Fehler beim Laden" };
  }
});

