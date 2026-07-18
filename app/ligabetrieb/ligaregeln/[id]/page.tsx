import { notFound } from 'next/navigation';
import { LIGAREGELN } from '@/app/data/ligaregeln';

export default async function RegelDetailAnalysePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const regel = LIGAREGELN.find((r) => r.id === id);

  if (!regel) {
    notFound();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto text-white">
      <div className="mb-8">
        <a href="/ligabetrieb/ligaregeln" className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition underline underline-offset-4">
          ← Zurück zu den Regeln
        </a>
      </div>

      <h1 className="text-4xl font-black mb-8 border-b-4 border-indigo-500 pb-2 inline-block">
        {regel.title}
      </h1>
      
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 mb-8">
        <p 
          className="text-lg font-semibold text-slate-200"
          dangerouslySetInnerHTML={{ __html: regel.description }}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-green-900 bg-slate-900 p-4 rounded-lg">
          <h2 className="text-green-400 font-black mb-4 border-b border-green-900 pb-2">Pro</h2>
          <ul className="space-y-3">
            {regel.pro.map((item, i) => (
              <li key={i} className="text-sm text-white border-l-2 border-green-500 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="border border-red-900 bg-slate-900 p-4 rounded-lg">
          <h2 className="text-red-400 font-black mb-4 border-b border-red-900 pb-2">Kontra</h2>
          <ul className="space-y-3">
            {regel.contra.map((item, i) => (
              <li key={i} className="text-sm text-white border-l-2 border-red-500 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
