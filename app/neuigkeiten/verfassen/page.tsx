'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { generateNewsArticle } from '../../actions/generateNews';
import { saveArticle } from '../../actions/saveArticle';
import { UploadButton } from "../../utils/uploadthing-components";
import type { OurFileRouter } from "../../utils/uploadthing";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ArtikelVerfassenPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [newspaper, setNewspaper] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [token, setToken] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'article' | 'interview'>('article');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDev = process.env.NODE_ENV === 'development';
    if (!token && !isDev) { alert('Bitte Captcha lösen.'); return; }
    setIsGenerating(true);
    try {
      // Modus und Ort/Zeitung übergeben
      const generated = await generateNewsArticle(content, token || "dev-bypass", mode, imageUrls.length, location, newspaper);
      await saveArticle({
        title: title,
        content: generated,
        imageUrls: imageUrls
      });
      router.push('/neuigkeiten');
    } catch (error) {
      alert('Fehler: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="p-8 text-white max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/neuigkeiten" className="text-blue-400 hover:underline">← Zurück zum Feed</Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Neuen Artikel erstellen</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Modus Auswahl */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('article')}
            className={`px-4 py-2 rounded-lg ${mode === 'article' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Zeitungsartikel
        </button>
          <button
            type="button"
            onClick={() => setMode('interview')}
            className={`px-4 py-2 rounded-lg ${mode === 'interview' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Interview
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 bg-gray-800 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Überschrift des Artikels..."
          required
        />
        
        <div className="flex gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-4 bg-gray-800 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ort..."
            required
          />
          <input
            type="text"
            value={newspaper}
            onChange={(e) => setNewspaper(e.target.value)}
            className="w-full p-4 bg-gray-800 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Name der Zeitung..."
            required
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 p-4 bg-gray-800 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Schreibe hier deine News oder Interview-Notizen..."
          required
        />
        
        <div className="w-full relative flex flex-col items-center">

          <div className="bg-blue-600 text-white rounded-md px-4 py-2 cursor-pointer">
            Bilder hinzufügen
          </div>
          <UploadButton
            endpoint="imageUploader"
            content={{
              button: () => <div className="w-32 h-10 opacity-0 cursor-pointer"></div>,
            }}
            appearance={{
              button: "absolute top-0 opacity-0 w-32 h-10 cursor-pointer z-10",
              container: "absolute top-0 flex flex-col items-center",
              allowedContent: "hidden",
            }}
            onClientUploadComplete={(res) => {
              setImageUrls(res.map((f) => f.url));
              alert("Bilder erfolgreich hochgeladen!");
            }}
            onUploadError={(error: Error) => {
              alert(`Fehler: ${error.message}`);
            }}
          />

          <p className="text-gray-500 text-xs mt-10 text-center">
            Max. 4MB pro Bild • Maximal 5 Bilder
          </p>
        </div>
        {imageUrls.length > 0 && <p className="text-green-500 text-sm">Bilder erfolgreich hochgeladen!</p>}

        {/* Captcha-Block */}
        <div className="my-4">
        <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "DEIN_FALLBACK_KEY_ZUM_TESTEN"}
          onSuccess={(token) => setToken(token)}
        />
        </div>
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50"
        >
          {isGenerating ? 'KI formatiert & speichert...' : 'Artikel veröffentlichen'}
        </button>
      </form>
    </main>
  );
}

