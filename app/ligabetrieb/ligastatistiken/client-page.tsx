"use client";

import { useState } from "react";

export default function LigastatistikenPage({ initialStats }: { initialStats: any[] }) {
  const [stats, setStats] = useState(initialStats);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig?.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }

    const sortedStats = [...stats].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // Spezielle Logik für Record ("W-L")
      if (key === "record") {
        aVal = parseInt(a.record.split("-")[0]);
        bVal = parseInt(b.record.split("-")[0]);
      } else if (typeof aVal === "string" && !isNaN(parseFloat(aVal))) {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setStats(sortedStats);
    setSortConfig({ key, direction });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-white">Ligastatistiken (Ab 2021)</h1>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-900 uppercase text-xs font-bold text-slate-400">
            <tr>
              {["manager", "winsChampionship", "playoffs", "record", "fpts", "fptsAgainst"].map((k) => (
                <th key={k} className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort(k)}>
                  {k === "manager" ? "Login Name" : k === "winsChampionship" ? "Siege" : k === "playoffs" ? "Playoffs" : k === "record" ? "Record" : k === "fpts" ? "PF" : "PA"}
                  {sortConfig?.key === k && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {stats.map((s: any, i: number) => (
              <tr key={i} className="hover:bg-slate-700/50 cursor-pointer" onClick={() => window.location.href = `/ligabetrieb/ligastatistiken/${s.manager}`}>
                <td className="p-4 font-bold text-white">{s.manager}</td>
                <td className="p-4 text-center">{s.winsChampionship}</td>
                <td className="p-4 text-center">{s.playoffs}</td>
                <td className="p-4 text-center font-mono">{s.record}</td>
                <td className="p-4 text-center font-mono">{s.fpts}</td>
                <td className="p-4 text-center font-mono">{s.fptsAgainst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

