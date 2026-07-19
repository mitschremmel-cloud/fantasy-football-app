'use client';

import { useState } from 'react';
import { LIGAREGELN } from '@/app/data/ligaregeln';
import { ChevronDown } from 'lucide-react';

export default function LigaRegelnPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleRegel = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">Ligaregeln</h1>
      <p className="text-slate-300 mb-8 leading-relaxed">
        Die Ligarregeln sind beschlossene Regeln ergänzend zu dem Standard Sleeper System. Um eine Regel einzuführen braucht es eine Mehrheit der Liga. Bei Gleichstand ist eine Regeländerung abgelehnt. Nach Ablehnung wird eine Regel nach 3 Jahren wieder zur Abstimmung zugelassen.
      </p>

      <div className="space-y-4">
        {LIGAREGELN.map((regel) => (
          <div key={regel.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button 
              onClick={() => toggleRegel(regel.id)}
              className="w-full p-6 flex justify-between items-center hover:bg-slate-700/50 transition-all"
            >
              <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-bold text-white">
                  {regel.title}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">
                    Eingeführt: {regel.year}
                  </span>
                  <ChevronDown className={`text-slate-400 transition-transform ${openId === regel.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>
            
            {openId === regel.id && (
              <div className="px-6 pb-6 pt-0">
                <div className="border-t border-slate-700 pt-4">
                  <p 
                    className="text-slate-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: regel.description }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

