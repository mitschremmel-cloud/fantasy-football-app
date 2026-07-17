import { createClient } from '@vercel/kv';

const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  throw new Error("KV_REST_API_URL oder KV_REST_API_TOKEN fehlen in den Umgebungsvariablen!");
}

export const kv = createClient({
  url: url,
  token: token,
});
