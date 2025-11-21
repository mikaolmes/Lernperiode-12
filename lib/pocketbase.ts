import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://localhost:8090');

export interface Post {
    id : string;
    title : string;
    content : string;
    author : string;
    created : string;
    updated : string;
}

export interface User {
    id: string;
    email: string;
    username?: string;
}