// app/components/Highlights.tsx
"use client";

import { useEffect, useState } from 'react';
import { Tweet } from 'react-tweet';
import { RefreshCw } from 'lucide-react';

export default function Highlights() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHighlights() {
      try {
        const res = await fetch('/api/highlights');
        const data = await res.json();
        setHighlights(data);
      } catch (err) {
        console.error("Fehler beim Laden der Highlights:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHighlights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Suche nach Highlights...
      </div>
    );
  }

  if (highlights.length === 0) {
    return <div className="p-4 text-center text-slate-500 text-sm">Keine aktuellen Highlights gefunden.</div>;
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      {highlights.map((h) => (
        <div key={h.tweetId} className="w-full max-w-md">
          <Tweet id={h.tweetId} />
        </div>
      ))}
    </div>
  );
}