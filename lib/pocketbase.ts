import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  created: string;
  updated: string;
  expand?: {
    author?: User;
  };
}

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
}

export interface Like {
  id: string;
  user: string;
  post: string;
  created: string;
}

// Helper: Post liken
export async function likePost(postId: string): Promise<void> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('Not authenticated');

  await pb.collection('likes').create({
    user: userId,
    post: postId,
  });
}

// Helper: Like entfernen
export async function unlikePost(postId: string): Promise<void> {
  const userId = pb.authStore.model?.id;
  if (!userId) throw new Error('Not authenticated');

  // Finde den Like-Record
  const likes = await pb.collection('likes').getList(1, 1, {
    filter: `user="${userId}" && post="${postId}"`,
  });

  if (likes.items.length > 0) {
    await pb.collection('likes').delete(likes.items[0].id);
  }
}

// Helper: Prüfen ob User einen Post geliked hat
export async function hasLikedPost(postId: string): Promise<boolean> {
  const userId = pb.authStore.model?.id;
  if (!userId) return false;

  const likes = await pb.collection('likes').getList(1, 1, {
    filter: `user="${userId}" && post="${postId}"`,
  });

  return likes.items.length > 0;
}

// Helper: Anzahl Likes für einen Post
export async function getPostLikesCount(postId: string): Promise<number> {
  const likes = await pb.collection('likes').getList(1, 1, {
    filter: `post="${postId}"`,
  });

  return likes.totalItems;
}