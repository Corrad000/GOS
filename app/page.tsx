'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building2, Users, ShieldCheck, Database, ArrowRight, Plus, ArrowLeft, 
  FileText, HelpCircle, Trash2, Edit2, Check, X, Library, Download, 
  BarChart3, Globe, LogOut, Clock, Calendar, PieChart, 
  TrendingUp, Award, Layers, AlertCircle, DollarSign, Percent, Briefcase, 
  ArrowUp, ArrowDown, Lock, Mail, Eye, Copy, Send, ChevronDown, ChevronRight,
  TrendingDown, CheckCircle2, UserCheck, RefreshCw, Save, LayoutDashboard
} from 'lucide-react';

import GOSHeader from '@/components/GOSHeader';
import ExecutiveTab from '@/components/tabs/ExecutiveTab';
import QuestionariTab from '@/components/tabs/QuestionariTab';
import BusinessPlanTab from '@/components/tabs/BusinessPlanTab';
import CronoprogrammaTab from '@/components/tabs/CronoprogrammaTab';
import RuoliGovernanceTab from '@/components/tabs/RuoliGovernanceTab';
import { generateClientReport } from '@/lib/pdfGenerator';

export default function GOSDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [currentUserProfile, setCurrentUserProfile] = useState<{ nome?: string; cognome?: string; email?: string; ruolo?: string } | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  const [currentView, setCurrentView] = useState<'aziende' | 'master' | 'utenti'>('aziende');
  const [activeTab, setActiveTab] = useState<'executive' | 'questionari' | 'business_plan' | 'cronoprogramma' | 'ruoli'>('executive');
  const [bpSubTab, setBpSubTab] = useState<'input' | 'ce' | 'sp' | 'cashflow' | 'debito' | 'indexes'>('input');

  const [beginningBalance, setBeginningBalance] = useState({ y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 });

  const [prodotti, setProdotti] = useState([
    { id: 1, nome: '', q: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }, prezzo: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }, costo: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 } },
  ]);
  const [costiProduzioneExtra, setCostiProduzioneExtra] = useState([{ id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const [personale, setPersonale] = useState([{ id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const [altriCosti, setAltriCosti] = useState([{ id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const [capex, setCapex] = useState([{ id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const [finanziamenti, setFinanziamenti] = useState([{ id: 1, banca: '', importo: 0, tasso: 0, durata: 5 }]);

  const [aliquotaFiscale, setAliquotaFiscale] = useState<number>(0.24);
  const [wacc, setWacc] = useState<number>(0.09);

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, ruolo: 'Senior Executive Partner', nome: 'Corrado', cognome: 'Pinna', email: 'support@glaring.world', paese: 'Italia', societa: 'Glaring LLP' },
    { id: 2, ruolo: 'Operations & Financial Lead', nome: 'Advisor', cognome: 'Glaring', email: 'advisor@glaring.world', paese: 'Regno Unito', societa: 'Glaring LLP' },
  ]);

  const [roadmapTasks, setRoadmapTasks] = useState([
    { 
      id: 1, fase: 'Fase 1', codice: '1.1', task: 'Audit dei processi e analisi dati iniziali', owner: 'Team GOS', 
      inizio: '2026-03-01', fine: '2026-03-10', giorni: 10, budget: 5000, reale: 4800, stato: 'Completato', subtasks: [] 
    }
  ]);

  const [aziende, setAziende] = useState<any[]>([]);
  const [masterForms, setMasterForms] = useState<any[]>([]);
  const [masterDomande, setMasterDomande] = useState<any[]>([]);
  const [glaringUsers, setGlaringUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAzienda, setSelectedAzienda] = useState<any | null>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [domande, setDomande] = useState<any[]>([]);
  const [risposteClienti, setRisposteClienti] = useState<any[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [reportPreviewHtml, setReportPreviewHtml] = useState<string | null>(null);

  const [showModalAzienda, setShowModalAzienda] = useState(false);
  const [editingAziendaId, setEditingAziendaId] = useState<string | null>(null);
  const [ragioneSociale, setRagioneSociale] = useState('');
  const [settore, setSettore] = useState('');
  const [paese, setPaese] = useState('Italia');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) setSessionStartTime(Date.now());
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchInitialData();
    }
  }, [session]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: azData } = await supabase.from('gos_aziende').select('*').order('created_at', { ascending: false });
      setAziende(azData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: emailLogin.trim(), password: passwordLogin });
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Credenziali non valide.');
    } finally {
      setLoggingIn(false);
    }
  };

  const loadAziendaDetails = async (azienda: any) => {
    setSelectedAzienda(azienda);
    // Reindirizza direttamente alla pagina dedicata dell'advisor M01
    router.push(`/azienda/${azienda.id}`);
  };

  if (authLoading) return <div className="p-12 text-center">Caricamento GOS...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
        <form onSubmit={handleLoginSubmit} className="bg-white border border-slate-300 p-8 max-w-md w-full space-y-4">
          <h2 className="text-xl font-bold">Accesso GOS 1.0</h2>
          {loginError && <p className="text-red-600 text-xs">{loginError}</p>}
          <input type="email" required placeholder="Email" value={emailLogin} onChange={e => setEmailLogin(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-xs" />
          <input type="password" required placeholder="Password" value={passwordLogin} onChange={e => setPasswordLogin(e.target.value)} className="w-full px-3 py-2 border border-slate-300 text-xs" />
          <button type="submit" className="w-full py-2.5 bg-slate-950 text-[#ccff00] text-xs font-bold uppercase">Accedi</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
      <GOSHeader 
        userDisplayName="Admin GOS" 
        userRole={userRole} 
        currentDateTime={currentDateTime} 
        elapsedTime={elapsedTime} 
        onLogout={() => supabase.auth.signOut()} 
      />

      <main className="p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border border-slate-300 p-6 flex justify-between items-center">
            <h1 className="text-xl font-extrabold text-slate-900">Portafoglio Aziende Clienti</h1>
            <button onClick={() => router.push('/azienda/nuova')} className="bg-slate-950 text-[#ccff00] px-4 py-2 text-xs font-bold uppercase">
              + Nuova Azienda
            </button>
          </div>

          <div className="bg-white border border-slate-300 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                <tr>
                  <th className="py-3 px-6">ID Azienda</th>
                  <th className="py-3 px-6">Ragione Sociale</th>
                  <th className="py-3 px-6">Settore</th>
                  <th className="py-3 px-6">Paese</th>
                  <th className="py-3 px-6 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {aziende.map(az => (
                  <tr key={az.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-500">{az.id.substring(0, 8)}...</td>
                    <td className="py-4 px-6 font-bold">{az.ragione_sociale}</td>
                    <td className="py-4 px-6">{az.settore || 'Generale'}</td>
                    <td className="py-4 px-6">{az.paese || 'Italia'}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => router.push(`/azienda/${az.id}`)} className="px-4 py-1.5 bg-slate-950 text-[#ccff00] font-bold">
                        Apri Cruscotto M01 <ArrowRight className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-[#ccff00] text-slate-950 p-4 text-xs font-bold flex justify-between">
        <span>GOS 1.0 Platform</span>
        <span>Glaring LLP © 2026</span>
      </footer>
    </div>
  );
}
