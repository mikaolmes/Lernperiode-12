'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [hideStats, setHideStats] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = pb.authStore.model?.id;
      if (!userId) throw new Error("Du musst eingeloggt sein.");

      await pb.collection('posts').create({
        title,
        text,
        author: userId,
        hide_stats: hideStats, // Hier speichern wir die Einstellung
      });

      router.push('/');
    } catch (error) {
      alert("Fehler beim Erstellen!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Neuen Beitrag verfassen</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Titel</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Inhalt</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg h-48 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
          </div>

          <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                id="hideStats"
                checked={hideStats}
                onChange={(e) => setHideStats(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="hideStats" className="text-slate-700 text-sm select-none cursor-pointer">
                Likes & Dislikes verstecken (nur für mich sichtbar)
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition disabled:opacity-50">
            {loading ? 'Sende...' : 'Veröffentlichen'}
          </button>
        </form>
      </div>
    </div>
  );
}