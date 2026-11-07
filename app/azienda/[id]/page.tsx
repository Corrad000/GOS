'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2, ShieldCheck, FileText } from 'lucide-react';

export default function SchedaAnagraficaAziendaPage() {
  const params = useParams();
  const router = useRouter();
  const aziendaId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [azienda, setAzienda] = useState<any>(null);
  const [m01Form, setM01Form] = useState<any>(null);
  const [domande, setDomande] = useState<any[]>([]);
  const [risposte, setRisposte] = useState<{ [key: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (aziendaId) {
      fetchAnagraficaData(aziendaId);
    }
  }, [aziendaId]);

  const fetchAnagraficaData = async (id: string) => {
    try {
      setLoading(true);

      // 1. Carica Anagrafica Base Azienda
      const { data: azData, error: azErr } = await supabase
        .from('gos_aziende')
        .select('*')
        .eq('id', id)
        .single();
      if (azErr) throw azErr;
      setAzienda(azData);

      // 2. Carica il Modulo M01 specifico per questa Azienda
      const { data: formData } = await supabase
        .from('gos_forms')
        .select('*')
        .eq('azienda_id', id)
        .ilike('titolo', '%Anagrafica%')
        .maybeSingle();

      if (formData) {
        setM01Form(formData);

        // 3. Carica Domande collegate al modulo M01
        const { data: domData, error: domErr } = await supabase
          .from('gos_domande')
          .select('*')
          .eq('form_id', formData.id)
          .order('ordine', { ascending: true });

        if (!domErr && domData) {
          setDomande(domData);
        }
      }

      // 4. Carica Risposte già registrate per l'Azienda
      const { data: respData } = await supabase
        .from('gos_risposte_clienti')
        .select('*')
        .eq('azienda_id', id);

      if (respData && respData.length > 0) {
        const respMap: { [key: string]: string } = {};
        respData.forEach((r: any) => {
          respMap[r.domanda_id] = r.valore_risposta;
        });
        setRisposte(respMap);
      }
    } catch (err: any) {
      console.error('Errore caricamento anagrafica:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnagrafica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aziendaId) return;

    try {
      setSaving(true);
      setSaveSuccess(false);

      // 1. Aggiorna Dati Primari Tabella Azienda
      const { error: azUpdErr } = await supabase
        .from('gos_aziende')
        .update({
          ragione_sociale: azienda.ragione_sociale,
          settore: azienda.settore,
          paese: azienda.paese,
        })
        .eq('id', aziendaId);

      if (azUpdErr) throw azUpdErr;

      // 2. Upsert Risposte per i Campi M01
      const payload = Object.keys(risposte)
        .filter((domId) => risposte[domId] !== undefined)
        .map((domId) => ({
          azienda_id: aziendaId,
          domanda_id: domId,
          valore_risposta: risposte[domId].trim(),
          updated_at: new Date().toISOString(),
        }));

      if (payload.length > 0) {
        const { error: respErr } = await supabase
          .from('gos_risposte_clienti')
          .upsert(payload, { onConflict: 'azienda_id,domanda_id' });

        if (respErr) throw respErr;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Errore durante il salvataggio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center font-sans">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Caricamento Anagrafica M01...</p>
      </div>
    );
  }

  if (!azienda) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center font-sans">
        <div className="bg-white border border-slate-300 p-8 max-w-md text-center">
          <h2 className="text-lg font-bold text-red-600">Azienda Non Trovata</h2>
          <button 
            onClick={() => router.push('/')} 
            className="mt-4 px-4 py-2 bg-slate-950 text-white text-xs font-bold uppercase"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
      {/* Header Advisor GOS */}
      <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Torna alla Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">GOS 1.0 — Controllo Anagrafica M01 (Advisor)</span>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{azienda.ragione_sociale}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-6">
          <form onSubmit={handleSaveAnagrafica} className="space-y-6">
            
            {/* Box Intestazione */}
            <div className="bg-white border border-slate-300 p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs tracking-wider uppercase">
                  <Building2 className="w-4 h-4" /> Modulo Master M01 — Struttura Societaria & Legal
                </div>
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 border border-emerald-200">
                    ✓ Modifiche Salvate con Successo
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {azienda.ragione_sociale}
              </h1>
            </div>

            {/* Sezione 1: Dati Primari */}
            <div className="bg-white border border-slate-300 p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> 1. Dati Generali Azienda
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ragione Sociale</label>
                  <input
                    type="text"
                    value={azienda.ragione_sociale || ''}
                    onChange={(e) => setAzienda({ ...azienda, ragione_sociale: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F5F5F5] border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Settore / Industry</label>
                  <input
                    type="text"
                    value={azienda.settore || ''}
                    onChange={(e) => setAzienda({ ...azienda, settore: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F5F5F5] border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paese di Operatività</label>
                  <input
                    type="text"
                    value={azienda.paese || ''}
                    onChange={(e) => setAzienda({ ...azienda, paese: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F5F5F5] border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                  />
                </div>
              </div>
            </div>

            {/* Sezione 2: Domande del Modulo M01 */}
            <div className="bg-white border border-slate-300 p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" /> 2. Parametri Societari (Modulo M01)
              </h3>

              {domande.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">
                  Nessun parametro specifico M01 attualmente collegato a questa azienda.
                </p>
              ) : (
                <div className="space-y-4">
                  {domande.map((dom, idx) => (
                    <div key={dom.id} className="text-xs bg-[#F5F5F5] p-4 border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5">#{idx + 1}</span>
                        <span className="text-slate-900 font-bold flex-1">{dom.testo_domanda}</span>
                        <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 font-semibold">
                          {dom.categoria || 'Anagrafica'}
                        </span>
                      </div>
                      <div className="pt-2">
                        <input
                          type="text"
                          placeholder="Inserisci dato societario..."
                          value={risposte[dom.id] || ''}
                          onChange={(e) => setRisposte({ ...risposte, [dom.id]: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pulsante Salvataggio */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-950 hover:bg-slate-900 text-[#ccff00] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Salvataggio...' : 'Salva Scheda Anagrafica'} <Save className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-xs font-bold">
          <span>GOS 1.0 — Scheda Anagrafica M01 (Vista Riservata Advisor)</span>
          <span>Glaring LLP © 2026</span>
        </div>
      </footer>
    </div>
  );
}
