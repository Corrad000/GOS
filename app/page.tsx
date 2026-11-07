'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ArrowRight,
  Search
} from 'lucide-react';

export default function DashboardGOS() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'advisor' | 'equity_partner'>('admin');
  const [aziende, setAziende] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModalAzienda, setShowModalAzienda] = useState(false);
  const [editingAziendaId, setEditingAziendaId] = useState<string | null>(null);
  const [ragioneSociale, setRagioneSociale] = useState('');
  const [settore, setSettore] = useState('');
  const [paese, setPaese] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: azData, error: azErr } = await supabase
        .from('gos_aziende')
        .select('*')
        .order('created_at', { ascending: false });

      if (azErr) throw azErr;
      setAziende(azData || []);
    } catch (err: any) {
      console.error('Errore caricamento GOS:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAzienda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!ragioneSociale.trim()) return;

    try {
      setSaving(true);
      if (editingAziendaId) {
        const { error } = await supabase
          .from('gos_aziende')
          .update({
            ragione_sociale: ragioneSociale.trim(),
            settore: settore.trim() || 'Generale',
            paese: paese.trim() || 'Italia',
          })
          .eq('id', editingAziendaId);
        if (error) throw error;
      } else {
        const { data: newAz, error: azError } = await supabase
          .from('gos_aziende')
          .insert([{
            ragione_sociale: ragioneSociale.trim(),
            settore: settore.trim() || 'Generale',
            paese: paese.trim() || 'Italia',
            stato: 'active',
          }])
          .select()
          .single();

        if (azError) throw azError;

        if (newAz) {
          const { data: masterM01 } = await supabase
            .from('gos_master_forms')
            .select('id, titolo, descrizione')
            .eq('codice', 'M01')
            .maybeSingle();

          if (masterM01) {
            const { data: newForm, error: formErr } = await supabase
              .from('gos_forms')
              .insert([{
                azienda_id: newAz.id,
                titolo: masterM01.titolo,
                descrizione: masterM01.descrizione,
              }])
              .select()
              .single();

            if (!formErr && newForm) {
              const { data: masterDomandeList } = await supabase
                .from('gos_master_domande')
                .select('*')
                .eq('master_form_id', masterM01.id);

              if (masterDomandeList && masterDomandeList.length > 0) {
                const clonedDomande = masterDomandeList.map((md) => ({
                  form_id: newForm.id,
                  testo_domanda: md.testo_domanda,
                  categoria: md.categoria || 'Anagrafica',
                  ordine: md.ordine || 0,
                }));
                await supabase.from('gos_domande').insert(clonedDomande);
              }
            }
          }
        }
      }

      setRagioneSociale('');
      setSettore('');
      setPaese('');
      setEditingAziendaId(null);
      setShowModalAzienda(false);
      fetchInitialData();
    } catch (err: any) {
      alert('Errore salvataggio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (az: any) => {
    setEditingAziendaId(az.id);
    setRagioneSociale(az.ragione_sociale || '');
    setSettore(az.settore || '');
    setPaese(az.paese || '');
    setShowModalAzienda(true);
  };

  const handleDeleteAzienda = async (id: string) => {
    if (userRole !== 'admin') return;
    if (!confirm('Eliminare questa azienda e tutti i dati associati?')) return;

    try {
      const { error } = await supabase.from('gos_aziende').delete().eq('id', id);
      if (error) throw error;
      fetchInitialData();
    } catch (err: any) {
      alert('Errore eliminazione: ' + err.message);
    }
  };

  const copyClienteLink = (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/cliente/${id}`);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2500);
  };

  const filteredAziende = aziende.filter((az) =>
    az.ragione_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    az.settore?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    az.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center font-sans">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Caricamento GOS 1.0...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
      {/* Header GOS */}
      <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S-White_Green.png" 
              alt="Glaring Logo" 
              className="h-12 w-auto object-contain" 
            />
            <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">GOS 1.0 — Strategic Operations Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 border border-slate-800">
              Ruolo: <strong className="text-white uppercase">{userRole}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white border border-slate-300 p-6">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Portafoglio Aziende Cliente</h1>
              <p className="text-xs text-slate-500 mt-1">Gestione anagrafiche, questionari diagnostici e cruscotti interni.</p>
            </div>
            
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setEditingAziendaId(null);
                  setRagioneSociale('');
                  setSettore('');
                  setPaese('Italia');
                  setShowModalAzienda(true);
                }}
                className="bg-slate-950 hover:bg-slate-900 text-[#ccff00] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nuova Azienda
              </button>
            )}
          </div>

          {/* Tabella Aziende Clienti */}
          <div className="bg-white border border-slate-300 overflow-hidden shadow-sm">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                ELENCO AZIENDE CLIENTI
              </span>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtra azienda o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#F5F5F5] border border-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-950 w-60"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Aggiornato in tempo reale</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-slate-300 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    <th className="py-3.5 px-6">ID Azienda</th>
                    <th className="py-3.5 px-6">Ragione Sociale</th>
                    <th className="py-3.5 px-6">Settore</th>
                    <th className="py-3.5 px-6">Paese</th>
                    <th className="py-3.5 px-6">Stato</th>
                    <th className="py-3.5 px-6 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-900">
                  {filteredAziende.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                        Nessuna azienda cliente trovata.
                      </td>
                    </tr>
                  ) : (
                    filteredAziende.map((az) => (
                      <tr key={az.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200 rounded font-bold">
                            {az.id ? az.id.substring(0, 8) + '...' : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-slate-900">
                          {az.ragione_sociale}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {az.settore || 'Generale'}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {az.paese || 'Italia'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider">
                            {az.stato || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {userRole === 'admin' && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(az)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Modifica
                                </button>
                                <button
                                  onClick={() => handleDeleteAzienda(az.id)}
                                  className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-300 transition-colors cursor-pointer"
                                  title="Elimina Azienda"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => copyClienteLink(az.id)}
                              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {copiedLinkId === az.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" /> Copiato!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copia Link
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => router.push(`/azienda/${az.id}`)}
                              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-[#ccff00] text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Apri Cruscotto <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modale Creazione / Modifica Azienda */}
      {showModalAzienda && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 p-8 max-w-md w-full space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
              {editingAziendaId ? 'Modifica Anagrafica Azienda' : 'Nuova Azienda Cliente'}
            </h3>

            <form onSubmit={handleSaveAzienda} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ragione Sociale *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Acme S.p.A."
                  value={ragioneSociale}
                  onChange={(e) => setRagioneSociale(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F5] border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Settore / Industry</label>
                <input
                  type="text"
                  placeholder="Es. Manifatturiero, Tech, Logistics..."
                  value={settore}
                  onChange={(e) => setSettore(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F5] border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paese di Operatività</label>
                <input
                  type="text"
                  placeholder="Es. Italia, UAE, Uzbekistan..."
                  value={paese}
                  onChange={(e) => setPaese(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F5] border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModalAzienda(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold uppercase cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-slate-950 hover:bg-slate-900 text-[#ccff00] font-extrabold uppercase disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Salvataggio...' : 'Conferma e Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer GOS */}
      <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold">
          <span>GOS 1.0 — Strategic Operations Platform</span>
          <span>Glaring LLP © 2026</span>
        </div>
      </footer>
    </div>
  );
}
