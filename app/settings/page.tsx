'use client';

import { useEffect, useState } from 'react';
import { pb, LikeItem, updateUsername } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<LikeItem[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [msg, setMsg] = useState('');
  const user = pb.authStore.model;

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/auth');
      return;
    }
    setNewUsername(pb.authStore.model?.username || '');

    // Likes laden
    pb.collection('likes').getList<LikeItem>(1, 50, {
      filter: `user="${pb.authStore.model?.id}"`,
      expand: 'post',
      sort: '-created'
    }).then((res) => {
      setLikedItems(res.items);
    });
  }, [router]);

  const handleSaveName = async () => {
    try {
        await updateUsername(newUsername);
        setMsg('Name erfolgreich geändert!');
        // Seite neu laden nach 1 Sekunde damit NavBar sich updated
        setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
        setMsg('Fehler: Name vergeben oder nicht erlaubt.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profil Bereich */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Mein Profil</h1>
        
        <div className="space-y-4 max-w-sm">
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">E-Mail (nicht änderbar)</label>
                <input disabled value={user.email} className="w-full bg-slate-100 border p-2 rounded text-slate-500"/>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Benutzername</label>
                <div className="flex gap-2">
                    <input 
                        value={newUsername} 
                        onChange={e => setNewUsername(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        onClick={handleSaveName}
                        className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
                    >
                        Speichern
                    </button>
                </div>
                {msg && <p className="text-sm mt-2 text-blue-600">{msg}</p>}
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-800">Beiträge, die dir gefallen</h2>
        <div className="space-y-4">
            {likedItems.length === 0 && <p className="text-slate-500 italic">Du hast noch keine Beiträge geliked.</p>}
            
            {likedItems.map((item) => (
            item.expand?.post && (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition">
                    <h3 className="font-bold text-lg text-slate-800">{item.expand.post.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{item.expand.post.text}</p>
                </div>
            )
            ))}
        </div>
      </div>
    </div>
  );
}