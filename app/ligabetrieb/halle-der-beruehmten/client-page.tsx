"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Champion {
  year: string;
  winner: string;
  rosterId?: number;
}

export default function HalleDerBeruehmten({ initialHistory }: { initialHistory: Champion[] }) {
  const [openYear, setOpenYear] = useState<string | null>(null);

  const toggleYear = (year: string) => {
    setOpenYear(openYear === year ? null : year);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-white">Halle der Berühmten</h1>
      
      <div className="grid gap-4">
        {initialHistory.map((champion) => (
          <div key={champion.year} className="border border-slate-700 bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleYear(champion.year)}
              className="w-full p-6 flex justify-between items-center text-left"
            >
              <div>
                <h2 className="text-xl font-bold text-white">{champion.year}</h2>
                <p className="text-slate-300">
                  <span className="font-semibold text-slate-400">Sieger:</span> {champion.winner}
                </p>
              </div>
              {champion.rosterId ? (
                openYear === champion.year ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />
              ) : null}
            </button>
            
            {openYear === champion.year && champion.rosterId && (
              <div className="p-6 border-t border-slate-700 bg-slate-900 text-slate-300">
                <p className="text-sm italic">Hier werden bald die Kader-Daten für {champion.year} angezeigt...</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
