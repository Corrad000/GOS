'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { ShieldCheck, Check, Send, Clock, HelpCircle } from 'lucide-react';

export default function ClienteQuestionarioPage() {
  const params = useParams();
  const aziendaId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ azienda: any; forms: any[]; domande: any[] } | null>(null);
  const [clientAnswers, setClientAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (aziendaId) {
      fetchQuestionarioData(aziendaId);
    }
  }, [aziendaId]);

  const fetchQuestionarioData = async (id: string) => {
    try {
      setLoading(true);

      // 1. Carica Anagrafica Azienda
      const { data: azData, error: azErr } = await supabase
        .from('gos_aziende')
        .select('*')
        .eq('id', id)
        .single();
      if (azErr) throw azErr;

      // 2. Carica i Moduli assegnati dall'Advisor a questa Azienda
      const { data: formData, error: formErr } = await supabase
        .from('gos_forms')
        .select('*')
        .eq('azienda_id', id);
      if (formErr) throw formErr;

      // 3. Carica le Domande dei Moduli Assegnati
      let domData: any[] = [];
      if (formData && formData.length > 0) {
        const formIds = formData.map((f) => f.id);
        const { data: dData, error: dErr } = await supabase
          .from('gos_domande')
          .select('*')
          .in('form_id', formIds)
          .order('ordine', { ascending: true });
        if (!dErr) domData = dData || [];
      }

      // 4. Carica eventuali risposte preesistenti gia compilate
      const { data: respData } = await supabase
        .from('gos_risposte_clienti')
        .select('*')
        .eq('azienda_id', id);

      if (respData && respData.length > 0) {
        const existingMap: { [key: string]: string } = {};
        respData.forEach((r: any) => {
          existingMap[r.domanda_id] = r.valore_risposta;
        });
        setClientAnswers(existingMap);
      }

      setData({
        azienda: azData,
        forms: formData || [],
        domande: domData,
      });
    } catch (err: any) {
      console.error('Errore caricamento dati cliente:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aziendaId || !data) return;

    try {
      setSubmitting(true);
      
      const payload = Object.keys(clientAnswers).map((domandaId) => ({
        azienda_id: aziendaId,
        domanda_id: domandaId,
        valore_risposta: clientAnswers[domandaId],
        updated_at: new Date().toISOString(),
      }));

      if (payload.length > 0) {
        const { error } = await supabase
          .from('gos_risposte_clienti')
          .upsert(payload, { onConflict: 'azienda_id,domanda_id' });

        if (error) throw error;
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      alert('Errore salvataggio risposte: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center font-sans">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Caricamento moduli di valutazione Glaring GOS...</p>
      </div>
    );
  }

  if (!data || !data.azienda) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center font-sans">
        <div className="bg-white border border-slate-300 p-8 max-w-md text-center">
          <h2 className="text-lg font-bold text-red-600">Link Non Valido o Scaduto</h2>
          <p className="text-xs text-slate-500 mt-2">Impossibile trovare l'azienda associata a questo questionario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
      <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S-White_Green.png" 
              alt="Glaring Logo" 
              className="h-14 w-auto object-contain" 
            />
            <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">GOS 1.0 — Portale Cliente</span>
          </div>
        </div>
      </header>

      <main className="p-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          {submittedSuccess ? (
            <div className="bg-white border border-slate-300 p-12 text-center space-y-4">
              <div className="inline-flex p-4 bg-emerald-100 text-emerald-800 rounded-full mb-2">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Risposte Registrate con Successo!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Le informazioni per <strong>{data.azienda.ragione_sociale}</strong> sono state sincronizzate con il cruscotto degli advisor Glaring LLP.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAnswers} className="space-y-8">
              <div className="bg-white border border-slate-300 p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-wider uppercase">
                  <ShieldCheck className="w-4 h-4" /> Sessione Riservata & Configurazione Su Misura
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {data.azienda.ragione_sociale}
                </h1>
                <p className="text-slate-500 text-xs flex items-center gap-4">
                  <span>Settore: <strong className="text-slate-700">{data.azienda.settore || 'Generale'}</strong></span>
                  <span>Paese: <strong className="text-slate-700">{data.azienda.paese || 'Italia'}</strong></span>
                </p>
                <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                  Di seguito trovi i moduli di analisi selezionati dal tuo Advisor. Rispondi ai parametri richiesti per aggiornare la tua scheda aziendale in tempo reale.
                </p>
              </div>

              <div className="space-y-6">
                {data.forms.length === 0 ? (
                  <div className="bg-white border border-slate-300 p-12 text-center text-slate-500">
                    Nessun modulo di valutazione attualmente assegnato a questa azienda.
                  </div>
                ) : (
                  data.forms.map((form) => {
                    const formDomande = data.domande.filter((d) => d.form_id === form.id);
                    return (
                      <div key={form.id} className="bg-white border border-slate-300 p-6 space-y-4">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">{form.titolo}</h3>
                          <p className="text-xs text-slate-500 mt-1">{form.descrizione || 'Modulo diagnostico aziendale.'}</p>
                        </div>

                        <div className="border-t border-slate-300 pt-4">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-indigo-600" /> Parametri Richiesti — {formDomande.length} totali
                          </h4>
                          {formDomande.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Nessun parametro in questo modulo.</p>
                          ) : (
                            <div className="space-y-4">
                              {formDomande.map((dom, idx) => (
                                <div key={dom.id} className="text-xs bg-[#F5F5F5] p-4 border border-slate-300 space-y-2">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5">#{idx + 1}</span>
                                    <span className="text-slate-900 font-bold flex-1">{dom.testo_domanda}</span>
                                    <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 font-semibold">
                                      {dom.categoria || 'Generale'}
                                    </span>
                                  </div>
                                  <div className="pt-2">
                                    <input
                                      type="text"
                                      required
                                      placeholder="Inserisci risposta / riscontro..."
                                      value={clientAnswers[dom.id] || ''}
                                      onChange={(e) => setClientAnswers({ ...clientAnswers, [dom.id]: e.target.value })}
                                      className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {data.forms.length > 0 && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-slate-950 hover:bg-slate-900 text-[#ccff00] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Invio in corso...' : 'Invia Risposte a GOS'} <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </main>

      <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-xs font-bold">
          <span>GOS 1.0 — Strategic & Operation Advisors Infrastructure</span>
          <span>Glaring LLP © 2026</span>
        </div>
      </footer>
    </div>
  );
}
