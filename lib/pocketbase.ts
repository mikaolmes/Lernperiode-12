import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  text: string;
  author: string;
  hide_stats: boolean; // Neu: Stats verstecken
  created: string;
  updated: string;
  expand?: {
    author?: User;
  };
}

export interface LikeItem {
  id: string;
  post: string;
  user: string;
  expand?: {
    post: Post;
  };
}

// === USER ===
export async function updateUsername(newUsername: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error("Nicht eingeloggt");
    await pb.collection('users').update(userId, { username: newUsername });
    // Token refresh, damit der neue Name sofort überall sichtbar ist
    await pb.collection('users').authRefresh();
}

// === LIKES & DISLIKES ===

// Checken was der User geliked/disliked hat (gibt Liste der Post-IDs zurück)
export async function getUserInteractions(userId: string) {
    const [likes, dislikes] = await Promise.all([
        pb.collection('likes').getFullList({ filter: `user="${userId}"` }),
        pb.collection('dislikes').getFullList({ filter: `user="${userId}"` }),
    ]);
    return {
        likedPostIds: new Set(likes.map(l => l.post)),
        dislikedPostIds: new Set(dislikes.map(d => d.post))
    };
}

// Post Liken
export async function likePost(postId: string) {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error("Login required");
    // Erst schauen ob schon disliked, wenn ja, dislike entfernen
    const dislikes = await pb.collection('dislikes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"`});
    if (dislikes.items.length > 0) await pb.collection('dislikes').delete(dislikes.items[0].id);
    
    // Dann like erstellen
    await pb.collection('likes').create({ user: userId, post: postId });
}

// Post Disliken
export async function dislikePost(postId: string) {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error("Login required");
    // Erst schauen ob schon geliked, wenn ja, like entfernen
    const likes = await pb.collection('likes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"`});
    if (likes.items.length > 0) await pb.collection('likes').delete(likes.items[0].id);

    // Dann dislike erstellen
    await pb.collection('dislikes').create({ user: userId, post: postId });
}

// Like oder Dislike entfernen (Neutral)
export async function removeInteraction(postId: string) {
    const userId = pb.authStore.model?.id;
    if (!userId) return;
    
    // Wir suchen in beiden Tabellen und löschen was wir finden
    const [likes, dislikes] = await Promise.all([
        pb.collection('likes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"` }),
        pb.collection('dislikes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"` })
    ]);

    if (likes.items.length > 0) await pb.collection('likes').delete(likes.items[0].id);
    if (dislikes.items.length > 0) await pb.collection('dislikes').delete(dislikes.items[0].id);
}

// Stats für einen Post holen (Anzahl Likes/Dislikes)
export async function getPostStats(postId: string) {
    const [likes, dislikes] = await Promise.all([
        pb.collection('likes').getList(1, 1, { filter: `post="${postId}"` }),
        pb.collection('dislikes').getList(1, 1, { filter: `post="${postId}"` }),
    ]);
    return { likes: likes.totalItems, dislikes: dislikes.totalItems };
}