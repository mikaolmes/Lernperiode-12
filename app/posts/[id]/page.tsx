'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { pb, Post } from '@/lib/pocketbase';

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const record = await pb.collection('posts').getOne<Post>(id);
      setPost(record);
      setTitle(record.title);
      setContent(record.content);
    } catch (error) {
      console.error('Error loading post:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pb.collection('posts').update(id, { title, content });
      setIsEditing(false);
      loadPost();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Fehler beim Aktualisieren');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Beitrag wirklich löschen?')) return;
    try {
      await pb.collection('posts').delete(id);
      router.push('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Fehler beim Löschen');
    }
  };

  if (!post) return <div className="p-8">Lädt...</div>;

  const isAuthor = pb.authStore.model?.id === post.author;

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Beitrag bearbeiten</h1>
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titel</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Inhalt</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded h-64"
                required
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded">
                Speichern
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-6 py-2 rounded"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => router.push('/')}
          className="text-blue-500 mb-6"
        >
          ← Zurück
        </button>
        <article className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-500 mb-6">
            {new Date(post.created).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <div className="prose max-w-none whitespace-pre-wrap">
            {post.content}
          </div>
          
          {isAuthor && (
            <div className="mt-8 flex gap-4 pt-6 border-t">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded"
              >
                Bearbeiten
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded"
              >
                Löschen
              </button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}