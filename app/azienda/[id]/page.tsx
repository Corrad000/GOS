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

import ExecutiveTab from '@/components/tabs/ExecutiveTab';
import QuestionariTab from '@/components/tabs/QuestionariTab';
import BusinessPlanTab from '@/components/tabs/BusinessPlanTab';
import CronoprogrammaTab from '@/components/tabs/CronoprogrammaTab';
import RuoliGovernanceTab from '@/components/tabs/RuoliGovernanceTab';
import { useFinancialEngine } from '@/components/FinancialEngine';
import { generateClientReport } from '@/lib/pdfGenerator';

export default function AziendaCruscottoPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [aziendaId, setAziendaId] = useState<string | null>(null);
  const [selectedAzienda, setSelectedAzienda] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin');

  const [activeTab, setActiveTab] = useState<'executive' | 'questionari' | 'business_plan' | 'cronoprogramma' | 'ruoli'>('executive');
  const [bpSubTab, setBpSubTab] = useState<'input' | 'ce' | 'sp' | 'cashflow' | 'debito' | 'indexes'>('input');

  const [beginningBalance, setBeginningBalance] = useState({ y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 });
  const [prodotti, setProdotti] = useState([
    { id: 1, nome: 'Prodotto 1', q: { y1: 1000, y2: 1200, y3: 1500, y4: 1800, y5: 2000 }, prezzo: { y1: 100, y2: 100, y3: 110, y4: 110, y5: 120 }, costo: { y1: 40, y2: 40, y3: 45, y4: 45, y5: 50 } }
  ]);
  const [costiProduzioneExtra, setCostiProduzioneExtra] = useState([{ id: 1, voce: 'Costi generali', y1: 10000, y2: 11000, y3: 12000, y4: 13000, y5: 14000 }]);
  const [personale, setPersonale] = useState([{ id: 1, voce: 'Team operativo', y1: 50000, y2: 55000, y3: 60000, y4: 65000, y5: 70000 }]);
  const [altriCosti, setAltriCosti] = useState([{ id: 1, voce: 'OPEX', y1: 15000, y2: 16000, y3: 17000, y4: 18000, y5: 19000 }]);
  const [capex, setCapex] = useState([{ id: 1, voce: 'Investimenti impianti', y1: 40000, y2: 10000, y3: 5000, y4: 5000, y5: 5000 }]);
  const [finanziamenti, setFinanziamenti] = useState([{ id: 1, banca: 'Banca Partner', importo: 50000, tasso: 0.05, durata: 5 }]);

  const [aliquotaFiscale, setAliquotaFiscale] = useState<number>(0.24);
  const [wacc, setWacc] = useState<number>(0.09);

  const financialReports = useFinancialEngine(
    prodotti, costiProduzioneExtra, personale, altriCosti, capex, finanziamenti, beginningBalance, aliquotaFiscale, wacc
  );

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, ruolo: 'Senior Executive Partner', nome: 'Corrado', cognome: 'Pinna', email: 'support@glaring.world', paese: 'Italia', societa: 'Glaring LLP' },
    { id: 2, ruolo: 'Operations & Financial Lead', nome: 'Advisor', cognome: 'Glaring', email: 'advisor@glaring.world', paese: 'Regno Unito', societa: 'Glaring LLP' }
  ]);

  const [roadmapTasks, setRoadmapTasks] = useState([
    { 
      id: 1, fase: 'Fase 1', codice: '1.1', task: 'Audit dei processi e analisi dati iniziali', owner: 'Team GOS', 
      inizio: '2026-03-01', fine: '2026-03-10', giorni: 10, budget: 5000, reale: 4800, stato: 'Completato', subtasks: [] 
    }
  ]);

  const [forms, setForms] = useState<any[]>([]);
  const [domande, setDomande] = useState<any[]>([]);
  const [risposteClienti, setRisposteClienti] = useState<any[]>([]);
  const [openFormsState, setOpenFormsState] = useState<{ [key: string]: boolean }>({});
  const [savingFinancials, setSavingFinancials] = useState(false);

  useEffect(() => {
    if (pathname) {
      const parts = pathname.split('/');
      const id = parts[parts.length - 1];
      if (id && id !== 'azienda') {
        setAziendaId(id);
        fetchAziendaDati(id);
      }
    }
  }, [pathname]);

  const fetchAziendaDati = async (id: string) => {
    try {
      setLoading(true);
      const { data: azData, error: azErr } = await supabase.from('gos_aziende').select('*').eq('id', id).single();
      if (azErr) throw azErr;
      setSelectedAzienda(azData);

      if (azData?.business_plan_data?.inputs) {
        const inp = azData.business_plan_data.inputs;
        if (inp.prodotti) setProdotti(inp.prodotti);
        if (inp.costiProduzioneExtra) setCostiProduzioneExtra(inp.costiProduzioneExtra);
        if (inp.personale) setPersonale(inp.personale);
        if (inp.altriCosti) setAltriCosti(inp.altriCosti);
        if (inp.capex) setCapex(inp.capex);
        if (inp.finanziamenti) setFinanziamenti(inp.finanziamenti);
        if (inp.beginningBalance) setBeginningBalance(inp.beginningBalance);
      }

      const { data: formData } = await supabase.from('gos_forms').select('*').eq('azienda_id', id);
      setForms(formData || []);
      if (formData && formData.length > 0) {
        const formIds = formData.map(f => f.id);
        const { data: domData } = await supabase.from('gos_domande').select('*').in('form_id', formIds);
        setDomande(domData || []);
      }
      const { data: respData } = await supabase.from('gos_risposte_clienti').select('*').eq('azienda_id', id);
      setRisposteClienti(respData || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFinancialsToSupabase = async () => {
    if (!selectedAzienda) return;
    try {
      setSavingFinancials(true);
      const { error } = await supabase.from('gos_aziende').update({
        business_plan_data: { financialReports, inputs: { prodotti, costiProduzioneExtra, personale, altriCosti, capex, finanziamenti, beginningBalance } },
        updated_at: new Date().toISOString()
      }).eq('id', selectedAzienda.id);
      if (error) throw error;
      alert('Salvato con successo su Supabase!');
    } catch (err: any) {
      alert('Errore: ' + err.message);
    } finally {
      setSavingFinancials(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-xs font-bold">Caricamento cruscotto azienda...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
      <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 bg-slate-900 text-white border border-slate-700 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">GOS 1.0 — Cruscotto Azienda: {selectedAzienda?.ragione_sociale}</span>
          </div>
        </div>
      </header>

      <main className="p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex justify-between items-center bg-white border border-slate-300 p-6">
            <div>
              <h1 className="text-2xl font-extrabold">{selectedAzienda?.ragione_sociale}</h1>
              <p className="text-xs text-slate-500 mt-1">Settore: {selectedAzienda?.settore || 'Generale'} • Paese: {selectedAzienda?.paese || 'Italia'}</p>
            </div>
            <button
              onClick={() => {
                const baseUrl = window.location.origin;
                navigator.clipboard.writeText(`${baseUrl}/cliente/${selectedAzienda?.id}`);
                alert('Link questionario cliente copiato!');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" /> Copia Link Questionario Cliente
            </button>
          </div>

          {/* NAVIGAZIONE TAB PRINCIPALI */}
          <div className="flex border-b border-slate-300 gap-8 bg-white px-6 pt-4">
            <button onClick={() => setActiveTab('executive')} className={`pb-3 text-xs font-bold uppercase border-b-2 cursor-pointer ${activeTab === 'executive' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}>1. Executive Dashboard</button>
            <button onClick={() => setActiveTab('questionari')} className={`pb-3 text-xs font-bold uppercase border-b-2 cursor-pointer ${activeTab === 'questionari' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}>2. Questionari ({forms.length})</button>
            <button onClick={() => setActiveTab('business_plan')} className={`pb-3 text-xs font-bold uppercase border-b-2 cursor-pointer ${activeTab === 'business_plan' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}>3. Business Plan Engine</button>
            <button onClick={() => setActiveTab('cronoprogramma')} className={`pb-3 text-xs font-bold uppercase border-b-2 cursor-pointer ${activeTab === 'cronoprogramma' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}>4. Cronoprogramma</button>
            <button onClick={() => setActiveTab('ruoli')} className={`pb-3 text-xs font-bold uppercase border-b-2 cursor-pointer ${activeTab === 'ruoli' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400'}`}>5. Organigramma</button>
          </div>

          {/* CONTENUTO TAB */}
          <div className="pt-2">
            {activeTab === 'executive' && <ExecutiveTab financialReports={financialReports} roadmapTasks={roadmapTasks} setActiveTab={setActiveTab} />}
            {activeTab === 'questionari' && <QuestionariTab forms={forms} domande={domande} risposteClienti={risposteClienti} openFormsState={openFormsState} setOpenFormsState={setOpenFormsState} userRole={userRole} handleDeleteForm={() => {}} onGenerateReport={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, { email: 'admin' }, '00:00', financialReports, undefined, 'questionari', teamMembers)} />}
            {activeTab === 'business_plan' && <BusinessPlanTab bpSubTab={bpSubTab} setBpSubTab={setBpSubTab} beginningBalance={beginningBalance} setBeginningBalance={setBeginningBalance} prodotti={prodotti} setProdotti={setProdotti} costiProduzioneExtra={costiProduzioneExtra} setCostiProduzioneExtra={setCostiProduzioneExtra} personale={personale} setPersonale={setPersonale} altriCosti={altriCosti} setAltriCosti={setAltriCosti} capex={capex} setCapex={setCapex} finanziamenti={finanziamenti} setFinanziamenti={setFinanziamenti} financialReports={financialReports} handleSaveFinancialsToSupabase={handleSaveFinancialsToSupabase} savingFinancials={savingFinancials} onGeneratePdfSection={(sec: string) => generateClientReport(selectedAzienda, forms, domande, risposteClienti, { email: 'admin' }, '00:00', financialReports, undefined, sec, teamMembers)} />}
            {activeTab === 'cronoprogramma' && <CronoprogrammaTab roadmapTasks={roadmapTasks} projectTimelineSummary={{ minInizio: '2026-03-01', maxFine: '2026-03-31', totalGiorni: 30 }} userRole={userRole} setShowModalTask={() => {}} handleOpenEditTask={() => {}} handleDeleteRoadmapTask={() => {}} onGenerateReport={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, { email: 'admin' }, '00:00', financialReports, undefined, 'cronoprogramma', teamMembers)} />}
            {activeTab === 'ruoli' && <RuoliGovernanceTab teamMembers={teamMembers} userRole={userRole} setShowModalTeam={() => {}} handleOpenEditTeamMember={() => {}} handleDeleteTeamMember={() => {}} onGenerateReport={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, { email: 'admin' }, '00:00', financialReports, undefined, 'ruoli', teamMembers)} />}
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
