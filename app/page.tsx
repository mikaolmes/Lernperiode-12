'use client';

import { useEffect, useState } from 'react';
import { pb, Post, likePost, dislikePost, removeInteraction, getUserInteractions, getPostStats } from '@/lib/pocketbase';

// Kleines Interface für die Stats pro Post
interface PostStats {
    likes: number;
    dislikes: number;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [myDislikes, setMyDislikes] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<Record<string, PostStats>>({});
  const currentUserId = pb.authStore.model?.id;

  // Daten laden
  useEffect(() => {
    const loadData = async () => {
        // 1. Alle Posts laden
        const postsResult = await pb.collection('posts').getList<Post>(1, 50, {
            sort: '-created',
            expand: 'author',
        });

        // 2. Interaktionen des Users laden (wenn eingeloggt)
        let ignoredIds = new Set<string>();
        if (currentUserId) {
            const interactions = await getUserInteractions(currentUserId);
            setMyLikes(interactions.likedPostIds);
            setMyDislikes(interactions.dislikedPostIds);
            ignoredIds = interactions.dislikedPostIds;
        }

        // 3. Posts filtern (Dislikes ausblenden)
        const visiblePosts = postsResult.items.filter(p => !ignoredIds.has(p.id));
        setPosts(visiblePosts);

        // 4. Statistiken für sichtbare Posts laden
        const statsMap: Record<string, PostStats> = {};
        await Promise.all(visiblePosts.map(async (p) => {
            const s = await getPostStats(p.id);
            statsMap[p.id] = s;
        }));
        setStats(statsMap);
    };

    loadData();
  }, [currentUserId]);

  // Handler für Buttons
  const handleVote = async (postId: string, type: 'like' | 'dislike') => {
    if (!currentUserId) return alert("Bitte einloggen.");

    // Optimistisches Update (UI sofort ändern)
    const oldLikes = new Set(myLikes);
    const oldDislikes = new Set(myDislikes);
    const oldStats = { ...stats };

    try {
        if (type === 'like') {
            if (myLikes.has(postId)) {
                await removeInteraction(postId); // Like entfernen
                myLikes.delete(postId);
            } else {
                await likePost(postId);
                myLikes.add(postId);
                myDislikes.delete(postId); // Dislike entfernen falls vorhanden
            }
        } else {
            if (myDislikes.has(postId)) {
                await removeInteraction(postId); // Dislike entfernen
                myDislikes.delete(postId);
            } else {
                await dislikePost(postId);
                myDislikes.add(postId);
                myLikes.delete(postId); // Like entfernen falls vorhanden
            }
        }
        
        // State updaten
        setMyLikes(new Set(myLikes));
        setMyDislikes(new Set(myDislikes));
        // Stats neu laden für Exaktheit
        const newStats = await getPostStats(postId);
        setStats(prev => ({ ...prev, [postId]: newStats }));

    } catch (e) {
        // Rollback bei Fehler
        setMyLikes(oldLikes);
        setMyDislikes(oldDislikes);
        setStats(oldStats);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Neueste Beiträge</h1>
      
      {posts.map((post) => {
        const postStat = stats[post.id] || { likes: 0, dislikes: 0 };
        const isAuthor = currentUserId === post.author;
        
        // Soll die Statistik angezeigt werden?
        // JA, wenn: (hide_stats ist FALSE) ODER (Ich bin der Autor)
        const showStats = !post.hide_stats || isAuthor;

        return (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-slate-800">{post.title}</h2>
                {post.hide_stats && isAuthor && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Stats versteckt</span>}
            </div>
            
            <p className="text-sm text-slate-500 mb-4">
                Von <span className="font-medium text-slate-700">{post.expand?.author?.username || 'Unbekannt'}</span>
            </p>
            <p className="text-slate-700 mb-6 whitespace-pre-wrap leading-relaxed">{post.text}</p>
            
            <div className="flex items-center gap-2 border-t pt-4">
                {/* LIKE BUTTON */}
                <button
                    onClick={() => handleVote(post.id, 'like')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        myLikes.has(post.id) ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {myLikes.has(post.id) ? '❤️' : '🤍'}
                    {showStats && <span>{postStat.likes}</span>}
                </button>

                {/* DISLIKE BUTTON */}
                <button
                    onClick={() => handleVote(post.id, 'dislike')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        myDislikes.has(post.id) ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {myDislikes.has(post.id) ? '👎' : '👎'}
                    {showStats && <span>{postStat.dislikes}</span>}
                </button>
            </div>
            </div>
        );
      })}
    </div>
  );
}