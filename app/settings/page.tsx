'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pb, Post, User } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'liked'>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/auth');
      return;
    }

    loadUserData();
    loadLikedPosts();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = pb.authStore.model as unknown as User;
      setUser(currentUser);
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      setIsLoading(false);
    }
  };

  const loadLikedPosts = async () => {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return;

      // Hole alle Likes des Users
      const likes = await pb.collection('likes').getList(1, 50, {
        filter: `user="${userId}"`,
        expand: 'post,post.author',
      });

      // Extrahiere die Posts
      const posts = likes.items
        .filter(like => like.expand?.post)
        .map(like => like.expand!.post as Post);

      setLikedPosts(posts);
    } catch (error) {
      console.error('Error loading liked posts:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await pb.collection('users').update(user!.id, {
        name: name.trim() || undefined,
      });

      setMessage('Profil erfolgreich aktualisiert! ✅');
      
      // Aktualisiere lokalen State
      const updatedUser = { ...user!, name: name.trim() };
      setUser(updatedUser);
      
      // Aktualisiere AuthStore (merge mit vorhandenem model damit collectionId/collectionName erhalten bleiben)
      const currentModel = pb.authStore.model as Record<string, any> | undefined;
      if (currentModel) {
        pb.authStore.save(pb.authStore.token, { ...currentModel, ...updatedUser } as any);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage('Fehler beim Speichern: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsSaving(false);
    }
  };

  const removeLike = async (postId: string) => {
    try {
      const userId = pb.authStore.model?.id;
      const likes = await pb.collection('likes').getList(1, 1, {
        filter: `user="${userId}" && post="${postId}"`,
      });

      if (likes.items.length > 0) {
        await pb.collection('likes').delete(likes.items[0].id);
        setLikedPosts(likedPosts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error removing like:', error);
    }
  };

  if (isLoading) {
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
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold hover:text-blue-600">
            ← Zurück
          </Link>
          <h1 className="text-2xl font-bold">Einstellungen</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👤 Profil bearbeiten
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'liked'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ❤️ Gelikte Beiträge ({likedPosts.length})
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes('✅') 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{name || 'Kein Name gesetzt'}</h3>
                    <p className="text-gray-500 text-sm">{email}</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Anzeigename
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Max Mustermann"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dieser Name wird bei deinen Beiträgen angezeigt
                  </p>
                </div>

                {/* E-Mail (readonly) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    E-Mail kann nicht geändert werden
                  </p>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSaving ? 'Speichert...' : 'Änderungen speichern'}
                </button>
              </form>
            </div>
          )}

          {/* Liked Posts Tab */}
          {activeTab === 'liked' && (
            <div className="p-6">
              {likedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Noch keine gelikten Beiträge</h3>
                  <p className="text-gray-500 mb-4">Like Beiträge um sie hier zu sehen</p>
                  <Link href="/" className="text-blue-600 hover:underline">
                    Zur Startseite
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {likedPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                      <div className="flex justify-between items-start">
                        <Link href={`/posts/${post.id}`} className="flex-1">
                          <h3 className="font-bold text-lg mb-2 hover:text-blue-600">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {post.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.created).toLocaleDateString('de-DE')}
                          </p>
                        </Link>
                        
                        <button
                          onClick={() => removeLike(post.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Like entfernen"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}