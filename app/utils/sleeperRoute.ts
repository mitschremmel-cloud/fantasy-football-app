// app/utils/sleeperRoute.ts

const LEAGUE_ID = "1251196293691211776";

const DRAFT_IDS: Record<string, string> = {
  "2022": "862027516456595457",
  "2023": "988096670053306369",
  "2024": "1124825210735206401",
  "2025": "1251196293699616768"
};

export interface SpielerDaten {
  name: string;
  manager: string;
  runde2025: string;
  istWaiver: boolean;
  jahreGekeept: number;
  dbEintrag: Record<string, string>;
}

export async function holeSleeperLigaKader(): Promise<SpielerDaten[] | { error: string }> {
  try {
    const resAllPlayers = await fetch('https://api.sleeper.app/v1/players/nfl', { cache: 'no-store' });
    const allPlayersMap = await resAllPlayers.json();

    const fetchDraft = async (id: string) => {
      try {
        const res = await fetch(`https://api.sleeper.app/v1/draft/${id}/picks`);
        return res.ok ? await res.json() : [];
      } catch { return []; }
    };

    const [d22, d23, d24, d25] = await Promise.all([
      fetchDraft(DRAFT_IDS["2022"]),
      fetchDraft(DRAFT_IDS["2023"]),
      fetchDraft(DRAFT_IDS["2024"]),
      fetchDraft(DRAFT_IDS["2025"])
    ]);

    const drafts: Record<string, any[]> = { "2022": d22, "2023": d23, "2024": d24, "2025": d25 };

    const [resUsers, resRosters] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`, { next: { revalidate: 900 } }),
      fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`, { next: { revalidate: 900 } })
    ]);
    
    if (!resUsers.ok || !resRosters.ok) throw new Error("Sleeper API nicht erreichbar");
    
    const users = await resUsers.json();
    const rosters = await resRosters.json();

    const normalisiereName = (n: string) => n ? n.toLowerCase().replace(/[^a-z0-9]/g, "").trim() : "";

    const spielerZuManagerMap: Record<string, string> = {};
    if (Array.isArray(rosters)) {
      rosters.forEach((roster: any) => {
        const managerUser = Array.isArray(users) ? users.find((u: any) => u.user_id === roster.owner_id) : null;
        const managerName = managerUser ? (managerUser.metadata?.team_name || managerUser.display_name) : "Unbekannter Manager";
        
        (roster.players || []).forEach((pId: string) => {
          const pInfo = allPlayersMap ? allPlayersMap[pId] : null;
          if (pInfo) {
            // Mapping für den vollen Namen
            const sNorm = normalisiereName(`${pInfo.first_name || ""} ${pInfo.last_name || ""}`);
            if (sNorm) spielerZuManagerMap[sNorm] = managerName;
            
            // AUTOMATISCHE ERWEITERUNG: Nachname als separater Match-Key
            if (pInfo.last_name && pInfo.last_name.length > 3) {
              spielerZuManagerMap[normalisiereName(pInfo.last_name)] = managerName;
            }
          }
        });
      });
    }

    const alleGedraftetenSpielerFormatiert: Record<string, { name: string, picks: Record<string, any> }> = {};

    Object.keys(drafts).forEach(jahr => {
      if (Array.isArray(drafts[jahr])) {
        drafts[jahr].forEach(pick => {
          let vollerName = pick.metadata?.first_name ? `${pick.metadata.first_name} ${pick.metadata.last_name}`.trim() : "";
          if (!vollerName && allPlayersMap?.[pick.player_id]) {
            const pInfo = allPlayersMap[pick.player_id];
            vollerName = `${pInfo.first_name || ""} ${pInfo.last_name || ""}`.trim();
          }

          const sNorm = normalisiereName(vollerName);
          if (!sNorm) return;

          if (!alleGedraftetenSpielerFormatiert[sNorm]) {
            alleGedraftetenSpielerFormatiert[sNorm] = { name: vollerName, picks: { "2022": null, "2023": null, "2024": null, "2025": null } };
          }
          alleGedraftetenSpielerFormatiert[sNorm].picks[jahr] = pick;
        });
      }
    });

    return Object.values(alleGedraftetenSpielerFormatiert).map(spieler => {
      const sNorm = normalisiereName(spieler.name);
      const picks = spieler.picks;
      
      const r = (j: string) => picks[j] ? Number(picks[j].round) : 16;
      const isK = (j: string) => picks[j] ? (!!picks[j].is_keeper || !!picks[j].metadata?.is_keeper) : false;

      let jahreGekeept = 0;
      if (isK("2025")) {
        jahreGekeept = 1;
        if (isK("2024")) {
          jahreGekeept = 2;
          if (isK("2023")) jahreGekeept = 3;
        }
      }

      return {
        name: spieler.name,
        manager: spielerZuManagerMap[sNorm] || "Free Agent / Karriereende",
        runde2025: String(r("2025")),
        istWaiver: !picks["2025"],
        jahreGekeept,
        dbEintrag: {
          "Spieler Name": spieler.name,
          "Jahre in Folge gekeept": String(jahreGekeept),
          "Draft Runde 2022": String(r("2022")),
          "Draft Runde 2023": String(r("2023")),
          "Draft Runde 2024": String(r("2024")),
          "Draft Runde 2025": String(r("2025"))
        }
      };
    });
  } catch (error) {
    console.error("Fehler in holeSleeperLigaKader:", error);
    return { error: "Fehler beim Generieren der Daten aus der Sleeper API" };
  }
}