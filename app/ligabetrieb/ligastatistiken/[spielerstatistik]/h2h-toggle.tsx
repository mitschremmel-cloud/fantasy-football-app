"use client";

import { useState } from "react";

export default function H2HToggle({ h2h }: { h2h: any }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-8">
      <button 
        onClick={() => setShow(!show)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {show ? "H2H ausblenden" : "Head-to-Head Statistiken anzeigen"}
      </button>

      {show && (
        <div className="mt-6 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 uppercase text-xs font-bold text-slate-400">
              <tr>
                <th className="p-4">Gegner</th>
                <th className="p-4 text-center">Siege</th>
                <th className="p-4 text-center">Niederlagen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {Object.entries(h2h).map(([opponent, stats]: any) => (
                <tr key={opponent}>
                  <td className="p-4">{opponent}</td>
                  <td className="p-4 text-center text-emerald-400">{stats.wins}</td>
                  <td className="p-4 text-center text-rose-400">{stats.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
