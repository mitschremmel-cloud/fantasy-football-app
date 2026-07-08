import { getQbStatsByYear } from './baseStats'; // Wir nutzen die Basis-Funktion

export interface KickerScoringWeights {
  fg0_19: number; miss0_19: number;
  fg20_29: number; miss20_29: number;
  fg30_39: number; miss30_39: number;
  fg40_49: number; miss40_49: number;
  fg50_59: number; miss50_59: number;
  fg60plus: number; miss60plus: number;
  fg_inc: number;
  pat: number; patMiss: number;
}
export async function calculateKickerSimulation(year: number, weights: KickerScoringWeights) {
  const data = await getQbStatsByYear(year);
  
  // Filtere nach Kickern (Position 'K')
  const kickers = data.filter(row => row.position === 'K');
  
  // Standard-Gewichte für Vergleich
  const standardWeights = {
    fg0_19: 3, miss0_19: 0,
    fg20_29: 3, miss20_29: 0,
    fg30_39: 3, miss30_39: 0,
    fg40_49: 4, miss40_49: 0,
    fg50_59: 5, miss50_59: 0,
    fg60plus: 6, miss60plus: 0,
    fg_inc: 0, pat: 1, patMiss: 0
  };

  return kickers.map(p => {
    const madeList = (p.fg_made_list as string || '').split(';').filter(Boolean).map(Number);
    // Wir müssen die Distanzen der Fehlversuche mappen - falls die API das nicht liefert,
    // ist das hier ein Limitation der NFLVerse Datenquelle.
    const missedList = (p.fg_missed_list as string || '').split(';').filter(Boolean).map(Number);
    const patMade = Number(p.pat_made || p.xp_made || 0);
    const patMissed = Number(p.pat_missed || p.xp_missed || 0);
    const games = Number(p.games || 1) || 1;

    const calc = (w: KickerScoringWeights) => {
      let pts = (patMade * w.pat) + (patMissed * w.patMiss);

      madeList.forEach(dist => {
        if (dist < 20) pts += w.fg0_19;
        else if (dist < 30) pts += w.fg20_29;
        else if (dist < 40) pts += w.fg30_39;
        else if (dist < 50) pts += w.fg40_49;
        else if (dist < 60) pts += w.fg50_59;
        else pts += w.fg60plus;

        pts += dist * w.fg_inc;
      });

      // Anwendung von Minus-Punkten falls Missed-Distanz bekannt
      missedList.forEach(dist => {
        if (dist < 20) pts += w.miss0_19;
        else if (dist < 30) pts += w.miss20_29;
        else if (dist < 40) pts += w.miss30_39;
        else if (dist < 50) pts += w.miss40_49;
        else if (dist < 60) pts += w.miss50_59;
        else pts += w.miss60plus;
      });
      return pts;
    };

    const simulatedPoints = calc(weights);
    const standardPoints = calc(standardWeights);

    return {
      name: p.player_name,
      totalPoints: simulatedPoints, // Das bleibt die simulierte Punktzahl
      standardTotalPoints: standardPoints, // Neu hinzugefügt für die Tabelle
      pointsPerGame: simulatedPoints / games,
      standardPointsPerGame: standardPoints / games,
      fgMade: madeList.length,
      fgMissed: missedList.length,
      patMade,
      patMissed
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
}

