const LEAGUE_ID = "1379487727849832448";

export interface Champion {
  year: string;
  winner: string;
  rosterId?: number; // Optional um den Kader abzurufen
  leagueId?: string; // ID zur Identifikation der spezifischen Ligasaison
  fPoints?: string;
  record?: string;
}

export async function holeLigaHistorie(): Promise<Champion[] | { error: string }> {
  try {
    // Sleeper API-Historie:
    // Wir navigieren von der aktuellen Liga über previous_league_id rückwärts.

    let currentId = LEAGUE_ID;
    const historyData: Champion[] = [];

    // Bis zu 10 Saisons zurückverfolgen
    for (let i = 0; i < 10; i++) {
      const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}`);
      if (!leagueRes.ok) break;

      const league = await leagueRes.json();
      const season = league.season;

      // Filter: Nur Daten ab 2021 von der API abrufen
      if (parseInt(season) < 2021) {
      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
        continue;
    }

      const [winnersRes, usersRes, rostersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${currentId}/winners_bracket`),
        fetch(`https://api.sleeper.app/v1/league/${currentId}/users`),
        fetch(`https://api.sleeper.app/v1/league/${currentId}/rosters`)
      ]);

      if (winnersRes.ok && usersRes.ok && rostersRes.ok) {
        const winners = await winnersRes.json();
        const users = await usersRes.json();
        const rosters = await rostersRes.json();



        // Wir haben gesehen:
        // 2024: m=1, r=1, w=8
        // 2023: m=1, r=1, w=5
        // Wenn alle m=1 und r=1 sind, ist die Sleeper API Struktur bei dir leider so,
        // dass sie alle Playoff-Spiele in einer flachen Liste ohne eindeutige Hierarchie zurückgibt.
        // ABER: In einer Sleeper-Liga gibt es nur EIN Spiel, bei dem der Sieger
        // NICHT in einem anderen Spiel als Verlierer auftaucht.

        const winnersWithWinners = winners.filter((m: any) => m.w !== null);
        const allLosers = new Set(winners.map((m: any) => m.l).filter(Boolean));

        // Das Finale ist das Spiel, dessen Sieger (w) NICHT in der Menge der Verlierer (l)
        // von anderen Spielen der selben Bracket auftaucht.
        const finalMatch = winnersWithWinners.find((m: any) => !allLosers.has(m.w));

        if (finalMatch && finalMatch.w) {
          const winnerRosterId = finalMatch.w;
          const winnerRoster = rosters.find((r: any) => r.roster_id === winnerRosterId);
          const winnerUser = winnerRoster ? users.find((u: any) => u.user_id === winnerRoster.owner_id) : null;

          const teamName = winnerUser ? winnerUser.metadata?.team_name || winnerUser.display_name : "Unbekannt";
          const loginName = winnerUser ? winnerUser.display_name : "N/A";

          // Statistiken aus dem Sieger-Roster
          const fPoints = winnerRoster ? ((winnerRoster.settings?.fpts || 0) + (winnerRoster.settings?.fpts_decimal || 0) / 100).toFixed(1) : "N/A";
          const record = winnerRoster ? `${winnerRoster.settings?.wins || 0}-${winnerRoster.settings?.losses || 0}` : "N/A";

          historyData.push({
            year: season,
            winner: `${teamName} (${loginName})`,
            fPoints,
            record,
            leagueId: currentId // Wir brauchen die aktuelle Liga-ID für die Spieler-Details
          });
        }
      }

      // Zur nächsten Liga in der Kette springen
      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
    }

    // Hardcoded Ergänzungen für Saisons ohne API-Historie
    historyData.push({ year: "2020", winner: "Wallachfried Allstars (Bockwurstmeta)" });
    historyData.push({ year: "2019", winner: "Team Marvin (gewinne)" });
    historyData.push({ year: "2018", winner: "Wallachfried Allstars (Bockwurstmeta)" });
    historyData.push({ year: "2017", winner: "High del Bergers (Mitsch)" });

    return historyData
      .filter((item, index, self) =>
        index === self.findIndex((t) => t.year === item.year)
      )
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));
  } catch (error) {
    console.error("Fehler beim Abrufen der Historie:", error);
    return { error: "Fehler beim Laden der Historie" };
  }
}

export async function holeKaderFuerJahr(jahr: string): Promise<any[] | { error: string }> {
  try {
    const [resPlayers] = await Promise.all([
      fetch('https://api.sleeper.app/v1/players/nfl')
    ]);
    const allPlayersMap = await resPlayers.json();
    let currentId = LEAGUE_ID;
    for (let i = 0; i < 10; i++) {
      const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}`);
      if (!leagueRes.ok) break;
      const league = await leagueRes.json();

      if (league.season === jahr) {
        const [rostersRes, usersRes] = await Promise.all([
          fetch(`https://api.sleeper.app/v1/league/${currentId}/rosters`),
          fetch(`https://api.sleeper.app/v1/league/${currentId}/users`)
        ]);

        if (!rostersRes.ok || !usersRes.ok) return { error: "Konnte Daten nicht laden" };
        const rosters = await rostersRes.json();
        const users = await usersRes.json();

        // Versuche Draft-Daten für diese Saison zu finden
        let draftPicks: any[] = [];

        // Hole alle Drafts für die Liga, um den passenden zu finden
        const draftsRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}/drafts`);
        if (draftsRes.ok) {
            const leagueDrafts = await draftsRes.json();
            if (leagueDrafts.length > 0) {
                // Wir nehmen einfach den ersten Draft der Saison
                const picksRes = await fetch(`https://api.sleeper.app/v1/draft/${leagueDrafts[0].draft_id}/picks`);
                if (picksRes.ok) draftPicks = await picksRes.json();
            }
        }

        // Hole die wöchentlichen Matchup-Punkte, um die Gesamtpunkte am Ende der Season zu summieren
        const totalPointsMap: Record<string, number> = {};
        for (let week = 1; week <= 17; week++) {
            const matchupRes = await fetch(`https://api.sleeper.app/v1/league/${currentId}/matchups/${week}`);
            if (matchupRes.ok) {
                const matchups = await matchupRes.json();
                matchups.forEach((m: any) => {
                    const rosterId = m.roster_id;
                    if (m.players_points) {
                        Object.entries(m.players_points).forEach(([pId, pts]: [string, any]) => {
                            totalPointsMap[pId] = (totalPointsMap[pId] || 0) + (pts as number);
                        });
                    }
                });
            }
        }

        // Wir müssen die Statistiken in den Champion-Typ aufnehmen, um sie in der Übersicht anzuzeigen
        return rosters.map((r: any) => {
          const user = users.find((u: any) => u.user_id === r.owner_id);
          const fPoints = ((r.settings?.fpts || 0) + (r.settings?.fpts_decimal || 0) / 100).toFixed(1);
          const record = `${r.settings?.wins || 0}-${r.settings?.losses || 0}`;

          const playersMapped = (r.players || []).map((pId: string) => {
              const p = allPlayersMap[pId];
              const pick = draftPicks.find((dp: any) => dp.player_id === pId);
              return {
                name: p ? `${p.first_name} ${p.last_name}` : `Unbekannter (${pId})`,
              round: pick ? pick.round : 99,
                status: pick ? `Runde ${pick.round}` : "Waiver",
              points: totalPointsMap[pId] ? totalPointsMap[pId].toFixed(1) : "0.0"
              };
        });

          // Sortieren: Draft Runde (1-98), dann Waiver (99)
          playersMapped.sort((a: any, b: any) => a.round - b.round);

          return {
            manager: user ? user.metadata?.team_name || user.display_name : "Unbekannt",
            fPoints,
            record,
            players: playersMapped
          };
        });
    }
      if (!league.previous_league_id) break;
      currentId = league.previous_league_id;
  }
    return { error: "Keine Daten gefunden" };
  } catch (e) {
    return { error: "Fehler" };
}
}

