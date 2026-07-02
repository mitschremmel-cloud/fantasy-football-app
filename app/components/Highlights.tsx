"use client";

import { useEffect, useState } from 'react';
import { Tweet } from 'react-tweet';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Highlights() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHighlights() {
      try {
        setLoading(true);
        const res = await fetch('/api/highlights');
        if (!res.ok) throw new Error("API Fehler");
        const data = await res.json();
        setHighlights(data);
      } catch (err) {
        setError("Highlights konnten aktuell nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }
    loadHighlights();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Analysiere Twitter-Feeds...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 flex items-center gap-3 text-rose-400">
        <AlertCircle className="w-5 h-5" /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {highlights.length > 0 ? (
        highlights.map((h) => (
          <div key={h.tweetId} className="overflow-hidden rounded-xl shadow-lg">
            <Tweet id={h.tweetId} />
          </div>
        ))
      ) : (
        <div className="text-center p-8 text-slate-500 bg-slate-900/50 rounded-2xl">
          Keine neuen Big Plays für deine Liga gefunden.
        </div>
      )}
    </div>
  );
}