// data/spielplan.ts
export const ROSTER_TO_TEAM: Record<number, string> = {
  1: "Wallachfrieds Allstars",
  2: "Team Fancy Pass",
  3: "WinstonsBattlehorses",
  4: "Frisch gekocht in Kiffruh",
  5: "High del Bergers",
  6: "Team Marvin",
  7: "NLZ (La Zarett)",
  8: "paddy19",
  9: "Karlsruher Kushfarmer 🪴",
  10: "Ona Saufen mit dem Board"
};

export const GAME_STRUCTURE = [
  { label: "Spiele in der Division", count: 8 },
  { label: "Spiele gegen Rivalen", count: 2 },
  { label: "Spiele gegen andere Division", count: 4 },
  { label: "Summe", count: 14 },
];

export const PLAYOFF_OPTIONS = [
  "Die 2 ersten jeder Division und die 2 mit den höchsten PF",
  "Seeds werden vergeben nach 1. Rang 2. Record 3. Points For",
];

// Map nutzt jetzt exakt die Strings, die auch gerendert werden
export const DIVISIONS_MAP: Record<string, number> = {
  "Wallachfrieds Allstars": 1, 
  "Team Fancy Pass": 1, 
  "WinstonsBattlehorses": 1, 
  "Frisch gekocht in Kiffruh": 1, 
  "High del Bergers": 1,
  "Team Marvin": 2, 
  "NLZ (La Zarett)": 2, 
  "paddy19": 2, 
  "Karlsruher Kushfarmer 🪴": 2, 
  "Ona Saufen mit dem Board": 2
};

export const RIVALRIES = [
  { team1: "Wallachfrieds Allstars", team2: "Team Marvin", color: "border-blue-500" },
  { team1: "Team Fancy Pass", team2: "NLZ (La Zarett)", color: "border-yellow-600" },
  { team1: "WinstonsBattlehorses", team2: "paddy19", color: "border-purple-500" },
  { team1: "Frisch gekocht in Kiffruh", team2: "Karlsruher Kushfarmer 🪴", color: "border-green-500" },
  { team1: "High del Bergers", team2: "Ona Saufen mit dem Board", color: "border-cyan-500" }
];

const normalize = (name: string) => name.trim().replace(/\s+/g, ' ');

export const getMatchType = (team1: string, team2: string) => {
  const t1 = normalize(team1);
  const t2 = normalize(team2);

  // 1. Ist es eine Rivalität?
  const isRivalry = RIVALRIES.some(r => 
    (normalize(r.team1) === t1 && normalize(r.team2) === t2) || 
    (normalize(r.team1) === t2 && normalize(r.team2) === t1)
  );
  if (isRivalry) return 'rivalry';

  // 2. Division Check
  if (DIVISIONS_MAP[t1] === DIVISIONS_MAP[t2]) return 'division';

  return 'conference';
};
