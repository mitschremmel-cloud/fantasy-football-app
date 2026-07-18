'use client';

export function ShareButton() {
  return (
    <button 
      onClick={() => {
        const freshUrl = `${window.location.origin}${window.location.pathname}?t=${Date.now()}`;
        navigator.clipboard.writeText(freshUrl);
        alert('Link wurde in die Zwischenablage kopiert!');
      }}
      className="bg-slate-700 hover:bg-indigo-600 text-white px-6 py-2 rounded-full text-sm transition-all shadow-lg border border-slate-600"
    >
      🔗 Link zum Teilen kopieren
    </button>
  );
}