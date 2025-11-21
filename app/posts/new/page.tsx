'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pb, Post } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = pb.authStore.isValid;
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        await loadPosts();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loadPosts = async () => {
    try {
      const records = await pb.collection('posts').getList<Post>(1, 50, {
        sort: '-created',
        expand: 'author',
      });
      setPosts(records.items);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      if (error.status === 403 || error.status === 401) {
        pb.authStore.clear();
        setIsLoggedIn(false);
      }
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/auth');
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    );
  }

  // Nicht eingeloggt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
          <h1 className="text-4xl font-bold mb-4">Willkommen zum Blog</h1>
          <p className="text-gray-600 mb-8">Melde dich an um Beiträge zu sehen</p>
          <Link href="/auth" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
            Anmelden
          </Link>
        </div>
      </div>
    );
  }

  // Blog
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mein Blog</h1>
          <div className="flex gap-3">
            <Link href="/posts/new" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              + Neuer Beitrag
            </Link>
            <button onClick={handleLogout} className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white p-12 rounded-2xl shadow-sm">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Noch keine Beiträge</h2>
              <p className="text-gray-500 mb-6">Erstelle deinen ersten Blogpost!</p>
              <Link href="/posts/new" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Ersten Beitrag erstellen
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link href={`/posts/${post.id}`} key={post.id}>
                <article className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border cursor-pointer">
                  <h2 className="text-2xl font-bold mb-2 hover:text-blue-600">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm mb-3">
                    {new Date(post.created).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-700 line-clamp-3">
                    {post.content}
                  </p>
                  <span className="text-blue-600 text-sm font-medium mt-3 inline-block">
                    Weiterlesen →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}