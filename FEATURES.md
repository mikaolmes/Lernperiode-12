# Mini Blog Platform - Feature Documentation

## Overview
This is a mini blog platform built with Next.js, TypeScript, Tailwind CSS, and PocketBase for the backend.

## Implemented Features

### 1. ✅ User Authentication
- **Login/Register Page** (`/auth`)
  - Email and password authentication
  - User registration with validation
  - Error handling with German language messages
  - Automatic redirect to home page after successful login

### 2. ✅ Post Creation
- **Create Post Page** (`/posts/new`)
  - Form to create new blog posts with title and content
  - Title field with 200 character limit
  - Content textarea with minimum 10 characters requirement
  - Character count display
  - Authentication check (only logged-in users can create posts)
  - Success/error feedback
  - Automatic redirect to home page after successful creation

### 3. ✅ View Posts Feed
- **Home Page** (`/`)
  - Display all published posts in reverse chronological order
  - Shows post title, content preview, author info, and creation date
  - Author avatar with initial letter
  - Like button with count
  - Click on post to view full content
  - Empty state with call-to-action when no posts exist

### 4. ✅ Like Posts Functionality
- **Like/Unlike Posts**
  - Like button on both feed and post detail pages
  - Real-time like count updates
  - Visual feedback (red heart when liked, gray when not liked)
  - Prevents page navigation when clicking like button on feed
  - Stores likes in PocketBase database
  - Users can like/unlike posts multiple times

### 5. ✅ Post Detail Page
- **View Single Post** (`/posts/[id]`)
  - Full post content display
  - Author information with avatar
  - Like/unlike functionality
  - Edit and delete buttons (only for post author)
  - Edit mode with inline form
  - Delete confirmation dialog

### 6. ✅ Settings/Profile Page
- **User Settings** (`/settings`)
  - Two tabs: Profile and Liked Posts
  - **Profile Tab:**
    - Display and edit user display name
    - Show email address (read-only)
    - Avatar with user initial
    - Success/error feedback on save
  - **Liked Posts Tab:**
    - View all posts liked by the user
    - Click on post to view full content
    - Remove like functionality
    - Empty state with call-to-action

### 7. ✅ Navigation
- **Header Navigation**
  - Logo/home link
  - Create new post button
  - Settings button
  - Logout button
  - Responsive design

## Technical Implementation

### Frontend Stack
- **Next.js 16.0.3** with App Router
- **React 19.2.0** with TypeScript
- **Tailwind CSS 4** for styling
- **lucide-react** for icons

### Backend Integration
- **PocketBase** as backend (running on `http://127.0.0.1:8090`)
- Real-time authentication with PocketBase Auth
- Collections:
  - `users` - User accounts
  - `posts` - Blog posts with author reference
  - `likes` - Like records with user and post references

### Database Schema

#### Posts Collection
```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  author: string; // user ID
  created: string;
  updated: string;
  expand?: {
    author?: User;
  };
}
```

#### Likes Collection
```typescript
interface Like {
  id: string;
  user: string; // user ID
  post: string; // post ID
  created: string;
}
```

#### Users Collection
```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
}
```

## Code Quality

### Linting & Type Safety
- ✅ ESLint configured with Next.js and TypeScript rules
- ✅ All TypeScript errors resolved
- ✅ Proper error handling with type guards
- ✅ React Hooks best practices (useCallback, proper dependencies)

### Performance Optimizations
- ✅ Static page generation where possible
- ✅ Optimized re-renders with useCallback
- ✅ Efficient API calls with proper caching
- ✅ Loading states for better UX

## User Experience

### German Language Support
All user-facing text is in German:
- "Anmelden" (Login)
- "Registrieren" (Register)
- "Neuer Beitrag" (New Post)
- "Einstellungen" (Settings)
- "Gefällt mir" (Like)
- Error messages in German

### Responsive Design
- Mobile-friendly layout
- Touch-friendly buttons and links
- Responsive grid for posts
- Optimized for various screen sizes

### Loading & Error States
- Loading spinners for async operations
- Error messages with clear feedback
- Success confirmations
- Empty states with helpful CTAs

## Setup Instructions

### Prerequisites
1. Node.js 20+ installed
2. PocketBase installed and running on port 8090

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### PocketBase Setup
1. Download PocketBase from https://pocketbase.io/
2. Start PocketBase: `./pocketbase serve`
3. Access admin panel at http://127.0.0.1:8090/_/
4. Create required collections:
   - `users` (auto-created by PocketBase)
   - `posts` with fields: title (text), content (text), author (relation to users)
   - `likes` with fields: user (relation to users), post (relation to posts)

## Future Enhancements (Not Implemented)
- Comments on posts
- User profiles page
- Search functionality
- Tags/categories
- Rich text editor
- Image uploads
- Notifications
- Follow/unfollow users
- Post drafts
- Pagination or infinite scroll (currently loads first 50)
