'lib/login/page.tsx'
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, User, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Campi form
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Stati interfaccia
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === 'register') {
        if (password !== confirmPassword) {
          setErrorMessage('Le password non coincidono.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('La password deve contenere almeno 6 caratteri.');
          setLoading(false);
          return;
        }

        // 1. Registrazione utente su Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (signUpError) throw signUpError;

        // 2. Assegnazione ruolo a monte (support@glaring.world -> admin, altri -> user)
        const assignedRole = cleanEmail === 'support@glaring.world' ? 'admin' : 'user';

        if (data.user) {
          const { error: profileError } = await supabase.from('gos_profiles').insert([
            {
              id: data.user.id,
              email: cleanEmail,
              nome: nome.trim(),
              cognome: cognome.trim(),
              ruolo: assignedRole,
            },
          ]);

          if (profileError) console.error('Errore inserimento profilo:', profileError.message);
        }

        setSuccessMessage(
          'Registrazione completata! Ti abbiamo inviato una mail di conferma. Clicca sul link per attivare il tuo account.'
        );
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');

      } else if (authMode === 'forgot') {
        // Recupero Password
        if (!cleanEmail) {
          setErrorMessage('Inserisci il tuo indirizzo email.');
          setLoading(false);
          return;
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/login`,
        });

        if (resetError) throw resetError;

        setSuccessMessage('Ti abbiamo inviato un’email con le istruzioni per reimpostare la password.');

      } else {
        // Login Esistente
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInError) throw signInError;

        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message === 'Invalid login credentials'
          ? 'Credenziali errate o email non ancora confermata.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Intestazione Brand GOS */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Glaring Operating System</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            {authMode === 'register' && 'Creazione Account Operativo'}
            {authMode === 'login' && 'Accesso Riservato GOS 1.0'}
            {authMode === 'forgot' && 'Recupero Credenziali d’Accesso'}
          </p>
        </div>

        {/* Banner Messaggi */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2.5 text-emerald-400 text-xs leading-relaxed">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nome *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Mario"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Cognome *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={cognome}
                    onChange={(e) => setCognome(e.target.value)}
                    placeholder="Rossi"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@glaring.world"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password *</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Password dimenticata?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Conferma Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow-lg transition-colors cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Elaborazione...' : 
              authMode === 'register' ? 'Registrati' : 
              authMode === 'forgot' ? 'Invia Link di Recupero' : 'Accedi al GOS'}
          </button>
        </form>

        {/* Toggle Navigazione */}
        <div className="text-center pt-2 border-t border-slate-700/60 space-y-2">
          {authMode === 'forgot' ? (
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Torna al Login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              {authMode === 'login'
                ? 'Non hai un account? Registrati ora'
                : 'Hai già un account? Effettua il Login'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
