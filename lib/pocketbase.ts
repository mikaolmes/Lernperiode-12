import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');
// Verhindert, dass PocketBase Anfragen abbricht, wenn eine neue gestartet wird (wichtig für useEffect)
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
  hide_stats: boolean;
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
    // Token refresh, damit der neue Name sofort im AuthStore landet
    await pb.collection('users').authRefresh();
}

// === LIKES & DISLIKES ===

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

export async function likePost(postId: string) {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error("Login required");
    
    // Gegenteilige Interaktion entfernen, falls vorhanden
    const dislikes = await pb.collection('dislikes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"`});
    if (dislikes.items.length > 0) await pb.collection('dislikes').delete(dislikes.items[0].id);
    
    await pb.collection('likes').create({ user: userId, post: postId });
}

export async function dislikePost(postId: string) {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error("Login required");

    // Gegenteilige Interaktion entfernen, falls vorhanden
    const likes = await pb.collection('likes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"`});
    if (likes.items.length > 0) await pb.collection('likes').delete(likes.items[0].id);

    await pb.collection('dislikes').create({ user: userId, post: postId });
}

export async function removeInteraction(postId: string) {
    const userId = pb.authStore.model?.id;
    if (!userId) return;
    
    const [likes, dislikes] = await Promise.all([
        pb.collection('likes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"` }),
        pb.collection('dislikes').getList(1, 1, { filter: `user="${userId}" && post="${postId}"` })
    ]);

    if (likes.items.length > 0) await pb.collection('likes').delete(likes.items[0].id);
    if (dislikes.items.length > 0) await pb.collection('dislikes').delete(dislikes.items[0].id);
}

export async function getPostStats(postId: string) {
    const [likes, dislikes] = await Promise.all([
        pb.collection('likes').getList(1, 1, { filter: `post="${postId}"` }),
        pb.collection('dislikes').getList(1, 1, { filter: `post="${postId}"` }),
    ]);
    return { likes: likes.totalItems, dislikes: dislikes.totalItems };
}

export async function getPost(id: string): Promise<Post> {
    return await pb.collection('posts').getOne<Post>(id, {
        expand: 'author'
    });
}

export async function deletePost(id: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error("Nicht eingeloggt");
    await pb.collection('posts').delete(id);
}

export async function updatePost(id: string, data: { title: string; text: string; hide_stats: boolean }): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error("Nicht eingeloggt");
    await pb.collection('posts').update(id, data);
}