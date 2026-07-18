'use server';

import { kv } from '@vercel/kv';

export async function saveComment(articleId: string, username: string, comment: string, token: string) {
  // Turnstile Validierung
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY!)}&response=${encodeURIComponent(token)}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  });
  const data = await res.json();
  
  if (!data.success) {
    throw new Error('Bot-Verifizierung fehlgeschlagen.');
  }

  const newComment = {
    username,
    comment,
    createdAt: Date.now(),
  };

  await kv.lpush(`comments:${articleId}`, JSON.stringify(newComment));
  
  return { success: true };
}

