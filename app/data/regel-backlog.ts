export type Regel = {
  id: string;
  title: string;
  description: string;
  pro: string[];
  contra: string[];
};

export const REGELBACKLOG: Regel[] = [
  {
    id: 'mulligan-rule',
    title: 'Mulligan Rule / Secret Swap',
    description: 'Diese Regel erlaubt den in der Season einmaligen nachträglichen Tausch eines Spielers in der Regular Season. Dies geschieht geheim, sodass der Gegenspieler davon erst erfährt wenn er nicht mehr eingreifen kann. Es kann diskutiert werden, ob dies generell oder nur bei einem verletzten Spieler möglich ist.',
    pro: ['Federt das Verletzungspech ab', 'Weitere taktische Komponente', 'Spannendes Element'],
    contra: ['Man kann sich gegen einen Spieler in der Saison verbünden', 'Undruchsichtig']
  },
  {
    id: 'faab-waivers',
    title: 'FAAB Waivers',
    description: 'Alle Spieler erhalten das gleiche Budget am Anfang der Saison. Bei jeder Waiverrunde kann blind geboten werden. Das höchste Gebot bekommt den Spieler. Mit 0$ kann man Spieler waiven für die kein anderer geboten hat. Bei 2 mal 0$ gewinnt der schlechtere Spieler.',
    pro: ['Fairness', 'Mehr strategische Kontrolle als bei Waiver nach inversen Ranking'],
    contra: ['Deutlich komplexer also inverse Ranking Waiver', 'Liga wird weniger ausgeglichen sein']
  },
  {
    id: 'double-header',
    title: 'Double Header',
    description: 'Vor der Bye Week spielt jeder 2 Spiele. Die Folge ist, dass man gegen jeden 2 Mal gespielt hat',
    pro: ['Reduziert Glücksfaktor'],
    contra: ['In Sleeper nicht umsetzbar']
  },
  {
    id: 'superflex',
    title: 'Superflex',
    description: 'Zusätzlicher Flex-Spot, der auch QBs erlaubt.',
    pro: ['QBs sind in der jetzigen Form relativ egal, da bei 32 QBs und 10 Spielern genug QBs für alle da sind. Das nimmt der eigentlich wichtigsten Position im Football fast vollständig den Reiz'],
    contra: ['Kann nur in einer Saison eingeführt werden, in der keine QBs gekept werden', 'Einige Standardrankings haben kein Superflex Ranking']
  },
  {
    id: 'te-premium',
    title: 'TE Premium',
    description: 'Tight Ends erhalten mehr Punkte pro Reception.',
    pro: ['Aufwertung der TE-Position', 'Gleicht Value-Lücke aus'],
    contra: ['Kann TE-Topstars zu dominant machen', 'Weicht Standard-Scoring ab']
  },
  {
    id: 'draft-pick-trading',
    title: 'Draft Pick Trading',
    description: 'Ermöglicht den Handel von Draft-Picks für zukünftige Saisons. Man könnte diskutieren, ob wie beim Keepen Erst- und/oder Zweitrunden Picks ausgeschlossen sind. Außerdem könnte man die Trade Deadline auf Woche 11 oder 12 vorverlegen um Tanking zu minimieren. Der <a href="/trade-analyzer" class="text-indigo-400 hover:underline">Trade-Analyzer</a> kann helfen ein Gefühl für den Value von Draft Picks zu bekommen.',
    pro: ['Langfristige Planung', 'Mehr Handlungsspielraum', 'Potentiell mehr Trades','Mehr Action'],
    contra: ['Risiko von "Tanking"', 'Kann Wettbewerbsgleichgewicht gefährden','Alle Spieler müssen in der Liga bleiben', 'Macht das Spiel komplizierter','Erstrundenpicks schwanken stark im Value je nachdem wo der Spieler in der nächsten Saison landet.']
  },
  {
    id: 'round-3-reverse-snake',
    title: 'Round 3 Reverse Snake',
    description: 'Die Draft-Reihenfolge kehrt sich ab Runde 3 um.',
    pro: ['Ausgleich von Draft-Positionen', 'Stärke der ersten 4 Picks nimmt ab'],
    contra: ['Gewöhnungsbedürftiges Format', 'Kein Standard-Verfahren','Bisher gab es keinen super großen Vorteil vorne zu draften']
  },
  {
    id: 'top-seed-playoff-choice',
    title: 'Top Seed chooses Playoff Opponent',
    description: 'Der bestplatzierte Spieler darf sich seinen Playoff-Gegner aussuchen.',
    pro: ['Belohnt gute Saisonleistung', 'Erhöht Drama'],
    contra: []
  },
  {
    id: 'elite-thrower',
    title: 'Elite Thrower',
    description: 'Die Completion Rate fließt in die Berechnung des QBs mit ein. Im Standard Scoring ist es wichtiger, dass ein QB schnell läuft, als das er gut spielt (siehe Justin Fields lol). Dadurch fühlt sich die QB Position im Fantasy Football etwas broken an. Durch das einbeziehen der Completion Rate (z.B. +0,25 pts/completion und -0.5 pts/incompletion) wird der Fokus vom Laufen etwas hin zum Passen verschoben. Für Test kann hier gerne der <a href="/rechner/qb-scoring" class="text-indigo-400 hover:underline">QB Scoring Rechner</a> genutzt werden.',
    pro: ['Belohnt "gutes" QB Play'],
    contra: ['Weicht von den Standard Rankings ab']
  },
  {
    id: 'keeper-tag-trading',
    title: 'Keeper Tag Trading',
    description: 'Es gibt wie sonst auch 3 Keeper Tags. Diese Regel ermöglicht das Handeln dieser Keeper-Tags zwischen Managern.',
    pro: ['Mehr Trades', 'Beide Tradeseiten profitieren potentiell','Belohnt gute Scoutes und aktive Manager'],
    contra: ['Kann die Liga-Balance kippen', 'Mir ist bisher unklar wieviel ein solcher Keeper Tag wert wäre']
  },
  {
    id: 'kicker-anpassung',
    title: 'Wiedereinführung Kicker',
    description: 'Kicker werden mit einem angepassten Scoring eingeführt, die den Skill des Kickers mit abbilden. Nutze den <a href="/rechner/kicker-scoring" class="text-indigo-400 hover:underline">Kicker Scoring Rechner</a> um dich am Kicker Scoring zu probieren.',
    pro: ['Kicker sind eine wichtige Position im Football', 'Die Liga lässt mich englich mit dem scheiss Kicker in Ruhe'],
    contra: ['Bisher kein Kicker Scoring gefunden, dass nicht völlig random ist','Wir haben die Position erst vor 2 Jahren zur Wahl gesetellt und sie wurde abgelehnt','Wir haben die Position aktiv aus der Liga entfernt']
  },
  {
    id: 'dritte-flex',
    title: 'Dritte Flexposition',
    description: 'Eine dritte Flexposition wird eingeführt. Das würde dafür sorgen, dass die Bank etwas ,dünner wird und mehr gescouted werden muss, wen man aufstellt',
    pro: ['Ein bisschen mehr scouting','Unsere 10 Man Liga kommt näher an eine 12 Liga rad','Mehr Spieler zum zuschauen'],
    contra: ['Wurde vor 2 Jahren abgelehnt']
  }
];

