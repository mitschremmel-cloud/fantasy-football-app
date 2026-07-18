export type Regel = {
  id: string;
  title: string;
  description: string;
  pro: string[];
  contra: string[];
};

export const LIGAREGELN: Regel[] = [
  {
    id: 'keeper-anzahl',
    title: 'Keeper Anzahl',
    description: 'Jeder Manager darf maximal 3 Keeper behalten. Für die Kostenbestimmung des Keepers kann der <a href="/rechner/keeper" class="text-indigo-400 hover:underline">Keeper-Rechner</a> genutzt werden.',
    pro: [],
    contra: []
  },
  {
    id: 'trade-deadline',
    title: 'Trade Deadliner',
    description: 'Die Trade Deadline ist nach Woche 13.',
    pro: [],
    contra: []
  },
];

