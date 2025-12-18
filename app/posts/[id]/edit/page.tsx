'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPost, updatePost, pb } from '@/lib/pocketbase';
import toast from 'react-hot-toast';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [hideStats, setHideStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Daten beim Laden holen und ins Formular füllen
  useEffect(() => {
    const loadData = async () => {
        try {
            const post = await getPost(postId);
            
            
            if (post.author !== pb.authStore.model?.id) {
                toast.error("Du darfst diesen Beitrag nicht bearbeiten!");
                router.push(`/posts/${postId}`);
                return;
            }

            setTitle(post.title);
            setText(post.text);
            setHideStats(post.hide_stats);
        } catch (e) {
            toast.error("Fehler beim Laden.");
            router.push('/');
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [postId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updatePost(postId, { title, text, hide_stats: hideStats });
      toast.success("Änderungen gespeichert!");
      router.push(`/posts/${postId}`); // Zurück zur Detailansicht
    } catch (error) {
      toast.error("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Lade Daten...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Beitrag bearbeiten</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Titel</label>
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Inhalt</label>
            <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="w-full border border-slate-300 p-3 rounded-lg h-48 focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                id="hideStats"
                checked={hideStats}
                onChange={(e) => setHideStats(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="hideStats" className="text-slate-700 text-sm cursor-pointer">
                Likes & Dislikes verstecken
            </label>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button 
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
                Abbrechen
            </button>
            <button 
                type="submit" 
                disabled={saving} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition disabled:opacity-50"
            >
                {saving ? 'Speichere...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}