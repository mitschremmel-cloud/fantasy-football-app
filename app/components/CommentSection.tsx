'use client';
import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { saveComment } from '../actions/saveComment';

export function CommentSection({ articleId }: { articleId: string }) {
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');
  const [token, setToken] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { alert('Bitte Captcha lösen.'); return; }
    try {
      await saveComment(articleId, username, comment, token);
      setComment('');
      alert('Kommentar gepostet!');
      window.location.reload(); 
    } catch (error) {
      alert('Fehler beim Posten.');
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-700 text-white">
      <h3 className="text-xl font-bold mb-4">Neuen Kommentar verfassen</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
            type="text" 
            placeholder="Dein Nickname" 
            className="w-full bg-slate-800 p-3 rounded border border-slate-700" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required 
        />
        <textarea 
            placeholder="Dein Kommentar" 
            className="w-full bg-slate-800 p-3 rounded border border-slate-700 h-24" 
            value={comment}
            onChange={(e) => setComment(e.target.value)} 
            required 
        />
        <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} onSuccess={setToken} />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-bold">Posten</button>
      </form>
    </div>
  );
}

