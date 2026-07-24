const LEAGUE_ID = "1379487727849832448";

export async function holeLigastatistiken(): Promise<any[] | { error: string }> {
  try {
    // Da Sleeper API keine "All Time" Statistiken direkt anbietet, müssen wir die Historie laden
    // Wir iterieren rückwärts durch die Ligen-Kette
    let currentId = LEAGUE_ID;
    const statsMap: Record<string, { wins: number, losses: number, fpts: number, fptsAgainst: number, playoffs: number, winsChampionship: number }> = {};

    for (let i = 0; i < 10; i++) {
      const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}`);
      if (!leagueRes.ok) break;
      const league = await leagueRes.json();

      // Filter: Nur Daten ab 2021 einbeziehen
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

        // Identifiziere Champion
        const finalMatch = winners.filter((m: any) => m.w !== null).find((m: any, idx: number, arr: any[]) => !arr.some(o => o.l === m.w));
        const champRosterId = finalMatch ? finalMatch.w : null;
        rosters.forEach((r: any) => {
      const user = users.find((u: any) => u.user_id === r.owner_id);
          let loginName = user ? user.display_name : "Unbekannt";

          // Alias Zusammenführung
          if (loginName === "senffrancisco49ers" || loginName === "sleepyjoes") {
            loginName = "sleepyoes";
          }

          const key = loginName;

          if (!statsMap[key]) statsMap[key] = { wins: 0, losses: 0, fpts: 0, fptsAgainst: 0, playoffs: 0, winsChampionship: 0 };

          statsMap[key].wins += r.settings.wins || 0;
          statsMap[key].losses += r.settings.losses || 0;
          statsMap[key].fpts += (r.settings.fpts || 0) + (r.settings.fpts_decimal || 0) / 100;
          statsMap[key].fptsAgainst += (r.settings.fpts_against || 0) + (r.settings.fpts_against_decimal || 0) / 100;
          if (r.settings.playoff_seed) statsMap[key].playoffs += 1;
          if (r.roster_id === champRosterId) statsMap[key].winsChampionship += 1;
        });
      }

      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
    }

    return Object.entries(statsMap).map(([manager, stats]) => ({
      manager,
      winsChampionship: stats.winsChampionship,
      playoffs: stats.playoffs,
      record: `${stats.wins}-${stats.losses}`,
      fpts: stats.fpts.toFixed(1),
      fptsAgainst: stats.fptsAgainst.toFixed(1)
    })).sort((a: any, b: any) => b.winsChampionship - a.winsChampionship || b.playoffs - a.playoffs);
  } catch (error) {
    return { error: "Fehler beim Laden" };
  }
}

export async function holeSpielerStatistik(loginName: string) {
  try {
    // Hole alle Spieler-Infos
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
        const user = users.find((u: any) => u.display_name === loginName);

        if (user) {
          const roster = rosters.find((r: any) => r.owner_id === user.user_id);
          if (roster) {
            // Hole Punkte pro Woche für dieses Roster
            let totalPointsForRoster: Record<string, number> = {};
            for (let week = 1; week <= 17; week++) {
                const mRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}/matchups/${week}`);
                if (mRes.ok) {
                    const matchups = await mRes.json();
                    const myMatchup = matchups.find((m: any) => m.roster_id === roster.roster_id);
                    if (myMatchup && myMatchup.players_points) {
                        Object.entries(myMatchup.players_points).forEach(([pId, pts]: [string, any]) => {
                            totalPointsForRoster[pId] = (totalPointsForRoster[pId] || 0) + (pts as number);
                        });
                    }
                }
            }

            history.push({
              season: league.season,
              leagueId: currentId,
              wins: roster.settings.wins || 0,
              losses: roster.settings.losses || 0,
              playersPoints: totalPointsForRoster
            });
          }
        }
      }
      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
    }

    // Berechne Stats
    const bestSeason = [...history].sort((a, b) => b.wins - a.wins || a.losses - b.losses)[0];

    // Sortierung für schlechteste Saison:
    // 1. Meiste Niederlagen (b.losses - a.losses)
    // 2. Wenigste Siege (a.wins - b.wins)
    const worstSeason = [...history].sort((a, b) => b.losses - a.losses || a.wins - b.wins)[0];

    // Zähle Spieler-Einsätze: Jeder Spieler zählt pro Saison nur 1x, wenn er im Roster war
    // Filter Defense aus (Sleeper-Position "DEF")
    const playerStats: Record<string, { seasons: number, points: number }> = {};

    history.forEach(h => {
        Object.entries(h.playersPoints).forEach(([pId, pts]: [string, any]) => {
            const player = allPlayersMap[pId];
            if (player && player.position !== 'DEF') {
            playerStats[pId] = {
                    seasons: (playerStats[pId]?.seasons || 0) + 1,
                points: (playerStats[pId]?.points || 0) + pts
            };
            }
        });
    });

    const topPlayers = Object.entries(playerStats)
      .sort((a, b) => b[1].seasons - a[1].seasons || b[1].points - a[1].points)
      .slice(0, 3)
      .map(([id, stats]) => ({
          name: allPlayersMap[id] ? `${allPlayersMap[id].first_name} ${allPlayersMap[id].last_name}` : id,
          seasons: stats.seasons,
          points: stats.points.toFixed(1)
      }));

    return { bestSeason, worstSeason, topPlayers };
  } catch (e) {
    return { error: "Fehler beim Laden" };
  }
}

