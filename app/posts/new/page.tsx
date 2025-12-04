'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!pb.authStore.isValid) {
      router.push('/auth');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const userId = pb.authStore.model?.id;
      if (!userId) {
        throw new Error('Nicht angemeldet');
      }

      await pb.collection('posts').create({
        title: title.trim(),
        content: content.trim(),
        author: userId,
      });

      // Redirect to home page after successful creation
      router.push('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Fehler beim Erstellen des Beitrags. Bitte versuche es erneut.');
      setIsSubmitting(false);
    }
  };

  if (!pb.authStore.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold mb-6">Neuen Beitrag erstellen</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Gib deinem Beitrag einen aussagekräftigen Titel"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                maxLength={200}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/200 Zeichen
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Inhalt *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Teile deine Gedanken und Ideen..."
                className="w-full p-3 border rounded-lg h-64 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                required
                minLength={10}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mindestens 10 Zeichen erforderlich
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim() || content.trim().length < 10}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Erstellt...
                  </span>
                ) : (
                  '✓ Beitrag veröffentlichen'
                )}
              </button>
              
              <Link
                href="/"
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition inline-block text-center"
              >
                Abbrechen
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}