'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pb, Post } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

interface PostWithLikes extends Post {
  likesCount: number;
  isLiked: boolean;
}

export default function Home() {
  const [posts, setPosts] = useState<PostWithLikes[]>([]);
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

      // Likes für jeden Post laden
      const postsWithLikes = await Promise.all(
        records.items.map(async (post) => {
          const [likesCount, isLiked] = await Promise.all([
            getPostLikesCount(post.id),
            hasLikedPost(post.id),
          ]);
          return { ...post, likesCount, isLiked };
        })
      );

      setPosts(postsWithLikes);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      if (error.status === 403 || error.status === 401) {
        pb.authStore.clear();
        setIsLoggedIn(false);
      }
    }
  };

  const getPostLikesCount = async (postId: string): Promise<number> => {
    try {
      const likes = await pb.collection('likes').getList(1, 1, {
        filter: `post="${postId}"`,
      });
      return likes.totalItems;
    } catch {
      return 0;
    }
  };

  const hasLikedPost = async (postId: string): Promise<boolean> => {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return false;

      const likes = await pb.collection('likes').getList(1, 1, {
        filter: `user="${userId}" && post="${postId}"`,
      });
      return likes.items.length > 0;
    } catch {
      return false;
    }
  };

  const toggleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Verhindert Navigation zum Post
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        // Unlike
        const userId = pb.authStore.model?.id;
        const likes = await pb.collection('likes').getList(1, 1, {
          filter: `user="${userId}" && post="${postId}"`,
        });
        if (likes.items.length > 0) {
          await pb.collection('likes').delete(likes.items[0].id);
        }

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, isLiked: false, likesCount: p.likesCount - 1 }
            : p
        ));
      } else {
        // Like
        await pb.collection('likes').create({
          user: pb.authStore.model?.id,
          post: postId,
        });

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, isLiked: true, likesCount: p.likesCount + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/auth');
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold hover:text-blue-600">
            Mein Blog
          </Link>
          <div className="flex gap-3">
            <Link href="/settings" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Einstellungen
            </Link>
            <Link href="/posts/new" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              + Neuer Beitrag
            </Link>
            <button onClick={handleLogout} className="bg-red-100 text-red-600 px-5 py-2 rounded-lg hover:bg-red-200">
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
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.expand?.author?.name?.[0]?.toUpperCase() || 
                       post.expand?.author?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {post.expand?.author?.name || post.expand?.author?.email || 'Unbekannt'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h2 className="text-2xl font-bold mb-2 hover:text-blue-600">
                    {post.title}
                  </h2>
                  <p className="text-gray-700 line-clamp-3 mb-4">
                    {post.content}
                  </p>

                  {/* Like Button */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <button
                      onClick={(e) => toggleLike(post.id, e)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        post.isLiked 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill={post.isLiked ? 'currentColor' : 'none'}
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="font-medium">{post.likesCount}</span>
                    </button>
                    
                    <span className="text-blue-600 text-sm font-medium">
                      Weiterlesen →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}