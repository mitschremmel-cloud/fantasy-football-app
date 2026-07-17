'use server';

import { kv } from '@vercel/kv';
// WICHTIG: Hier darf nur eine exportierte async function stehen!
export async function saveArticle(article: { title: string, content: string, imageUrls?: string[] }) {
  const newArticle = {
    ...article,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: Date.now(),
    imageUrls: article.imageUrls || [] // Immer ein Array
  };

  // Wir nutzen LPUSH um neue Artikel immer oben in die Liste zu setzen
  await kv.lpush('articles', JSON.stringify(newArticle));
  
  return { success: true };
}

// Im Formular-State:
// const [imageUrls, setImageUrls] = useState<string[]>([]);

// Im JSX:
// <UploadButton
//   endpoint="imageUploader"
//   onClientUploadComplete={(res) => {
//     // res ist ein Array von UploadedFileData
//     setImageUrls(res.map(file => file.url));
//   }}
//   onUploadError={(err) => alert(err.message)}
// />

