import { LIGAREGELN } from '@/app/data/ligaregeln';

export default function LigaRegelnPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Ligaregeln</h1>
      <div className="space-y-6">
        {LIGAREGELN.map((regel) => (
          <div key={regel.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-3 border-b border-slate-600 pb-2">
              {regel.title}
            </h2>
            <p 
              className="text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: regel.description }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
