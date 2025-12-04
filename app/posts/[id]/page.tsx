'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { pb, Post } from '@/lib/pocketbase';
import Link from 'next/link';

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    loadPost();
    loadLikes();
  }, [id]);

  const loadPost = async () => {
    try {
      const record = await pb.collection('posts').getOne<Post>(id, {
        expand: 'author',
      });
      setPost(record);
      setTitle(record.title);
      setContent(record.content);
    } catch (error) {
      console.error('Error loading post:', error);
    }
  };

  const loadLikes = async () => {
    try {
      // Anzahl Likes
      const likes = await pb.collection('likes').getList(1, 1, {
        filter: `post="${id}"`,
      });
      setLikesCount(likes.totalItems);

      // Hat User geliked?
      const userId = pb.authStore.model?.id;
      if (userId) {
        const userLikes = await pb.collection('likes').getList(1, 1, {
          filter: `user="${userId}" && post="${id}"`,
        });
        setIsLiked(userLikes.items.length > 0);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const toggleLike = async () => {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return;

      if (isLiked) {
        // Unlike
        const likes = await pb.collection('likes').getList(1, 1, {
          filter: `user="${userId}" && post="${id}"`,
        });
        if (likes.items.length > 0) {
          await pb.collection('likes').delete(likes.items[0].id);
          setIsLiked(false);
          setLikesCount(prev => prev - 1);
        }
      } else {
        // Like
        await pb.collection('likes').create({
          user: userId,
          post: id,
        });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Inhalt</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border rounded-lg h-64 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Speichern
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
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
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Zurück zur Übersicht
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white p-8 rounded-xl shadow-sm">
          
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {post.expand?.author?.name?.[0]?.toUpperCase() || 
               post.expand?.author?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold">
                {post.expand?.author?.name || post.expand?.author?.email || 'Unbekannt'}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(post.created).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
          <div className="prose max-w-none whitespace-pre-wrap text-gray-700 mb-8">
            {post.content}
          </div>

          {/* Like Button */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                isLiked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg 
                className="w-6 h-6" 
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          {/* Edit/Delete Buttons (nur für Author) */}
          {isAuthor && (
            <div className="mt-8 flex gap-4 pt-6 border-t">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                ✏️ Bearbeiten
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                🗑️ Löschen
              </button>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}