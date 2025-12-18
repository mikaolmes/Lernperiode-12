'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb, Post, getPost, deletePost } from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  
  const postId = params.id as string;
  const currentUserId = pb.authStore.model?.id;

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await getPost(postId);
      setPost(data);
    } catch (error) {
      toast.error("Beitrag konnte nicht geladen werden.");
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Möchtest du diesen Beitrag wirklich unwiderruflich löschen?")) return;

    try {
      await deletePost(postId);
      toast.success("Beitrag erfolgreich gelöscht!");
      router.push('/');
    } catch (error) {
      toast.error("Fehler beim Löschen.");
    }
  };

  if (loading) return <div className="text-center p-10">Lade Beitrag...</div>;
  if (!post) return <div className="text-center p-10">Beitrag nicht gefunden.</div>;

  // Edit/Delete nur erlauben, wenn die ID zum Author passt
  const isAuthor = currentUserId === post.author;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Link href="/" className="text-slate-500 hover:text-blue-600 mb-4 inline-block">
        ← Zurück zur Übersicht
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
        
        <div className="flex justify-between items-center text-slate-500 text-sm mb-8 border-b pb-4">
          <span>Von <strong>{post.expand?.author?.username || 'Unbekannt'}</strong></span>
          <span>{new Date(post.created).toLocaleDateString()}</span>
        </div>

        {/* whitespace-pre-wrap erhält Zeilenumbrüche aus der DB */}
        <div className="prose max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap">
          {post.text}
        </div>

        {isAuthor && (
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <Link 
              href={`/posts/${post.id}/edit`}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition font-medium"
            >
              ✏️ Bearbeiten
            </Link>
            
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition font-medium border border-red-100"
            >
              🗑️ Löschen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}