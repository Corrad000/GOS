'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

function ClientPreviewContent() {
  const params = useParams();
  const aziendaId = params?.id;

  const [azienda, setAzienda] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [domande, setDomande] = useState<any[]>([]);
  const [risposte, setRisposte] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!aziendaId) return;

    const fetchClientData = async () => {
      try {
        setLoading(true);

        // Carica dati azienda
        const { data: azData } = await supabase
          .from('gos_aziende')
          .select('*')
          .eq('id', aziendaId)
          .single();

        setAzienda(azData);

        // Carica moduli assegnati
        const { data: formData } = await supabase
          .from('gos_forms')
          .select('*')
          .eq('azienda_id', aziendaId);

        setForms(formData || []);

        if (formData && formData.length > 0) {
          const formIds = formData.map(f => f.id);
          const { data: domData } = await supabase
            .from('gos_domande')
            .select('*')
            .in('form_id', formIds)
            .order('ordine', { ascending: true });

          setDomande(domData || []);
        }
      } catch (err) {
        console.error('Errore caricamento anteprima:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [aziendaId]);

  const handleInputChange = (domandaId: string, value: string) => {
    setRisposte(prev => ({ ...prev, [domandaId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Caricamento anteprima cliente...</div>;
  }

  if (!azienda) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Azienda non trovata.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Portale Cliente */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> GOS 1.0 — Portale Compilazione Cliente
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
              Modalità Anteprima
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{azienda.ragione_sociale}</h1>
            <p className="text-xs text-slate-500 mt-1">Settore: {azienda.settore || 'Generale'} — Paese: {azienda.paese || 'Italia'}</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center space-y-4 shadow-xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold text-emerald-900">Compilazione Simulata Inviata con Successo!</h2>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Questa è un'anteprima: le risposte inserite sono state registrate temporaneamente nella sessione e servono a verificare l'esperienza del cliente.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Modifica risposte
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {forms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                Nessun modulo diagnostico assegnato a questa azienda da compilare.
              </div>
            ) : (
              forms.map((form) => {
                const formDomande = domande.filter(d => d.form_id === form.id);
                return (
                  <div key={form.id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" /> {form.titolo}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">{form.descrizione || 'Compila i parametri richiesti per la valutazione.'}</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      {formDomande.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nessuna domanda presente in questo modulo.</p>
                      ) : (
                        formDomande.map((dom, idx) => (
                          <div key={dom.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">
                              <span className="text-indigo-600 mr-2">#{idx + 1}</span> {dom.testo_domanda}
                            </label>
                            <input
                              type="text"
                              placeholder="Inserisci la risposta o il valore..."
                              value={risposte[dom.id] || ''}
                              onChange={(e) => handleInputChange(dom.id, e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                            <span className="text-[10px] text-slate-400 block text-right">Categoria: {dom.categoria || 'Generale'}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {forms.length > 0 && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Invia Compilazione Test
                </button>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}

export default function ClientPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Caricamento anteprima...</div>}>
      <ClientPreviewContent />
    </Suspense>
  );
}
