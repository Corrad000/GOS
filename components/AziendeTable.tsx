'use client';
import React from 'react';
import { Edit3, Trash2, Copy, Check, ArrowRight, Search } from 'lucide-react';

interface AziendeTableProps {
  aziende: any[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  userRole: string;
  copiedLinkId: string | null;
  onEdit: (az: any) => void;
  onDelete: (id: string) => void;
  onCopyLink: (id: string) => void;
  onOpenDashboard: (id: string) => void;
}

export default function AziendeTable({
  aziende,
  searchTerm,
  setSearchTerm,
  userRole,
  copiedLinkId,
  onEdit,
  onDelete,
  onCopyLink,
  onOpenDashboard,
}: AziendeTableProps) {
  return (
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
            {aziende.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                  Nessuna azienda cliente trovata.
                </td>
              </tr>
            ) : (
              aziende.map((az) => (
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
                            onClick={() => onEdit(az)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Modifica
                          </button>
                          <button
                            onClick={() => onDelete(az.id)}
                            className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-300 transition-colors cursor-pointer"
                            title="Elimina Azienda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onCopyLink(az.id)}
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
                        onClick={() => onOpenDashboard(az.id)}
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
  );
}
