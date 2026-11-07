'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Import dei componenti modulari
import GOSHeader from '@/components/GOSHeader';
import AziendeTable from '@/components/AziendeTable';
import AziendaModal from '@/components/AziendaModal';

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

        // Auto-assegnazione Modulo M01 alla creazione
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
      <GOSHeader userRole={userRole} />

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
                className="bg-slate-950 hover:bg-slate-900 text-[#ccff00] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
              >
                + Nuova Azienda
              </button>
            )}
          </div>

          <AziendeTable
            aziende={filteredAziende}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            userRole={userRole}
            copiedLinkId={copiedLinkId}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteAzienda}
            onCopyLink={copyClienteLink}
            onOpenDashboard={(id) => router.push(`/azienda/${id}`)}
          />
        </div>
      </main>

      <AziendaModal
        isOpen={showModalAzienda}
        isEditing={!!editingAziendaId}
        ragioneSociale={ragioneSociale}
        setRagioneSociale={setRagioneSociale}
        settore={settore}
        setSettore={setSettore}
        paese={paese}
        setPaese={setPaese}
        saving={saving}
        onClose={() => setShowModalAzienda(false)}
        onSubmit={handleSaveAzienda}
      />

      <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold">
          <span>GOS 1.0 — Strategic Operations Platform</span>
          <span>Glaring LLP © 2026</span>
        </div>
      </footer>
    </div>
  );
}
