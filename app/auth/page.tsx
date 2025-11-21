'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        await pb.collection('users').authWithPassword(email, password);
        router.push('/');
      } else {
        // REGISTRIERUNG
        
        // Validierung
        if (password !== passwordConfirm) {
          setError('Die Passwörter stimmen nicht überein!');
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Das Passwort muss mindestens 8 Zeichen lang sein!');
          setIsLoading(false);
          return;
        }

        // Benutzer erstellen
        await pb.collection('users').create({
          email: email,
          password: password,
          passwordConfirm: passwordConfirm,
        });

        // Automatisch einloggen
        await pb.collection('users').authWithPassword(email, password);
        router.push('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Bessere Fehlermeldungen
      if (err.status === 400) {
        if (err.data?.data?.email) {
          setError('Diese E-Mail-Adresse wird bereits verwendet!');
        } else if (err.data?.data?.password) {
          setError('Das Passwort ist ungültig!');
        } else if (isLogin) {
          setError('Falsche E-Mail-Adresse oder Passwort!');
        } else {
          setError('Registrierung fehlgeschlagen. Bitte überprüfe deine Eingaben.');
        }
      } else if (err.status === 0) {
        setError('Verbindung zum Server fehlgeschlagen. Stelle sicher, dass PocketBase läuft!');
      } else {
        setError('Ein Fehler ist aufgetreten: ' + (err.message || 'Unbekannter Fehler'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Willkommen zurück!' : 'Account erstellen'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Melde dich an um fortzufahren' : 'Erstelle einen neuen Account'}
          </p>
        </div>

        {/* Fehlermeldung */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Formular */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* E-Mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              placeholder="max@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              minLength={8}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Mindestens 8 Zeichen
              </p>
            )}
          </div>

          {/* Passwort bestätigen (nur Registrierung) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passwort bestätigen
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                minLength={8}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Lädt...
              </span>
            ) : (
              isLogin ? 'Anmelden' : 'Registrieren'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setPasswordConfirm('');
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isLogin ? (
              <>Noch kein Account? <span className="underline">Registrieren</span></>
            ) : (
              <>Bereits registriert? <span className="underline">Anmelden</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}