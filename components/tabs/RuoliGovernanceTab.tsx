'use client';
import React from 'react';
import { UserCheck, Plus, Edit2, Trash2, Eye } from 'lucide-react';

export default function RuoliGovernanceTab({ teamMembers, userRole, setShowModalTeam, handleOpenEditTeamMember, handleDeleteTeamMember, onGenerateReport }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-300 p-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Organigramma & Risorse (Governance)</h3>
          <p className="text-xs text-slate-500">Gestione completa delle risorse umane e referenti.</p>
        </div>
        <button onClick={onGenerateReport} className="text-xs bg-indigo-600 text-white font-bold px-4 py-2.5 flex items-center gap-1.5 cursor-pointer">
          <Eye className="w-4 h-4" /> Report PDF Organigramma
        </button>
      </div>
      <div className="bg-white border border-slate-300 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-900 text-white font-extrabold uppercase">
            <tr>
              <th className="py-3 px-5">Ruolo & Posizione</th>
              <th className="py-3 px-5">Nome e Cognome</th>
              <th className="py-3 px-5">Società</th>
              <th className="py-3 px-5">Paese</th>
              <th className="py-3 px-5">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {teamMembers.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="py-4 px-5 font-extrabold">{m.ruolo}</td>
                <td className="py-4 px-5 font-black text-indigo-700">{m.nome} {m.cognome}</td>
                <td className="py-4 px-5">{m.societa}</td>
                <td className="py-4 px-5">{m.paese}</td>
                <td className="py-4 px-5 font-mono">{m.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
