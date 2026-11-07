'use client';
import React from 'react';

interface AziendaModalProps {
  isOpen: boolean;
  isEditing: boolean;
  ragioneSociale: string;
  setRagioneSociale: (val: string) => void;
  settore: string;
  setSettore: (val: string) => void;
  paese: string;
  setPaese: (val: string) => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AziendaModal({
  isOpen,
  isEditing,
  ragioneSociale,
  setRagioneSociale,
  settore,
  setSettore,
  paese,
  setPaese,
  saving,
  onClose,
  onSubmit,
}: AziendaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-300 p-8 max-w-md w-full space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
          {isEditing ? 'Modifica Anagrafica Azienda' : 'Nuova Azienda Cliente'}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
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
              onClick={onClose}
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
  );
}
