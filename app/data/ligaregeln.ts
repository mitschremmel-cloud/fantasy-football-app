export type Regel = {
  id: string;
  title: string;
  year: string;
  description: string;
  pro: string[];
  contra: string[];
};

export const LIGAREGELN: Regel[] = [
  {
    id: 'playoff',
    title: 'Playoffs',
    year: '2025',
    description: 'Es gibt 6 Playoff Spots. Die ersten 4 Seeds gehen an die jeweiligen Top 2 Teams jeder Division. Das Seeding erfolgt nach Ranking der jeweiligen Division, dann nach Record, dann nach Points For. Die Seeds 5 und 6 werden divisionübergreifend an die 2 Teams mit den höchsten PF vergeben.',
    pro: [],
    contra: []
  },
  {
    id: 'divisions',
    title: 'Divisions und Rivalries',
    year: '2025',
    description: 'Es gibt Divisions, mit jeweils 5 Teams, die über den Ort bestimmt sind (Highdelberg und Kiffruhe) und feststehen. Mit ihnen gibt es fixe Rivalitäten zwischen einzelnen Teams. Gegen den Rivalen aus der anderen Divsision spielt man im Jahr 2 mal. Im ersten Game darf der Sieger dem Verlierer ein neues Sleeper Bild zuweisen. Der Sieger des zweiten Spiels bekommt die Namensrechte des Verliererteams für das restliche Jahr. Die Division mit den meisten Wins darf ebenfalls die Verlierer Division umbenennen. Die Regelanpassung wurde durchgeführt, um mehr Spannung um die Playoff Spots zu ermöglichen und insgesamt über Rivalitätsdenken für mehr Engagement zu sorgen. ',
    pro: [],
    contra: []
  },
  {
    id: 'defensive-scoring',
    title: 'Defensive Scoring',
    year: '2025',
    description: 'Anpassung des Defensive Scorings. Das wurde das System von <a href="https://draftysports.com/articles/you-deserve-better-defense-scoring" class="text-indigo-400 hover:underline" target="_blank">DraftySports</a> übernommen und mit einzelnen kleinen Regeln ergänzt (siehe Safety Regel). Im Wesentlichen erwitschaften Defenses im Schnitt genauso viele Punkte wie zuvor. Allerdings geschieht dies auf eine andere Weise u.a. durch den Einbezug von Stats, wie tackle for loss, passes defended etc. Insgesamt ist der Fokus etwas von schlechtem Offense Game der Gegner hin zu gutem Defense Game der eigenen Mannschaft gerückt. Die Motivation liegt hier darin, dass im Standard Scoring die Punkte anders als bei allen anderen Positionen sinken, statt zu steigen. Das hat das Standard System unintuitiv gemacht. Außerdem war es sehr stark von einzelnen Punktestufen abhängig. ',
    pro: [''],
    contra: ['']
  },
  {
    id: 'safety-scoring',
    title: 'Safety Scoring',
    year: '2023',
    description: 'Das Safety Scoring ist auf 2 (Turnover) + 2 (Punkte) = 4 Punkte angehoben.',
    pro: [],
    contra: []
  },
  {
    id: 'trade-deadline',
    title: 'Trade Deadline',
    year: '2022',
    description: 'Die Trade Deadline ist nach Woche 13. Diese Regel wurde im Jahr 2023 von der Liga bestätigt.',
    pro: [],
    contra: []
  },  
  {
    id: 'keeper-anzahl',
    title: 'Keeper',
    year: '2021',
    description: 'Jeder Manager darf bis zu 3 Keeper behalten. Für die Kostenbestimmung des Keepers kann der <a href="/rechner/keeper" class="text-indigo-400 hover:underline">Keeper-Rechner</a> genutzt werden. Ein 4ter Keeper wurde 2024 abgelehnt.',
    pro: [],
    contra: []
  },

  {
    id: 'flexposition',
    title: 'Zweite Flexposition',
    year: '2021',
    description: 'Es gibt 2 Flexpositionen. Sie können mit WR/RB/TE besetzt werden. Eine dritte Flexposition wurde im Jahr 2024 von der Liga abgelehnt.',
    pro: [],
    contra: []
  },
  {
    id: 'receiving-scoring',
    title: 'Receiving Scoring',
    year: '2019',
    description: 'Das Receiving Scoring ist 0.5 PPR. Die Motivation ist Receivern gegenüber Running Backs ein größeres Gewicht zu verleihen.',
    pro: [],
    contra: []
  },
  {
    id: 'kicker',
    title: 'Kicker',
    year: '2019',
    description: 'Die Kicker Position ist abgeschafft. Eine Einführung wurde 2024 abgelehnt.',
    pro: [],
    contra: []
  },



  
];

