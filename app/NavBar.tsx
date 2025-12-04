'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useState, useEffect } from 'react';

export default function NavBar() {
  const router = useRouter();
  // Wir starten mit 'false', damit der Server und Client sich einig sind (verhindert Hydration Error)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 1. SOFORT beim Laden prüfen (Client-Side)
    setIsLoggedIn(pb.authStore.isValid);
    setUsername(pb.authStore.model?.username || '');

    // 2. Auf Änderungen hören (Login/Logout)
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setIsLoggedIn(pb.authStore.isValid);
      setUsername(model?.username || '');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    pb.authStore.clear(); // Löscht den Token
    setIsLoggedIn(false);
    setUsername('');
    router.push('/auth'); // Zurück zum Login
    router.refresh(); // Erzwingt ein Neuladen der Route
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight hover:opacity-80 transition">
          BLOG<span className="text-slate-800">APP</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Wir prüfen hier explizit auf isLoggedIn */}
          {isLoggedIn ? (
            <>
              <span className="hidden md:block text-slate-500 text-sm">
                Hi, <span className="font-semibold text-slate-700">{username}</span>
              </span>
              
              <Link href="/posts/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm hover:shadow text-sm">
                + Beitrag
              </Link>
              
              <Link href="/settings" className="text-slate-600 hover:text-blue-600 font-medium transition text-sm">
                Einstellungen
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="text-slate-400 hover:text-red-500 font-medium transition text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth" className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition shadow-sm">
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}