'use client';
import React from 'react';
import { Plus, Trash2, Save, Eye, FileText, Building2, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function BusinessPlanTab({
  bpSubTab, setBpSubTab, beginningBalance, setBeginningBalance, prodotti, setProdotti,
  costiProduzioneExtra, setCostiProduzioneExtra, personale, setPersonale, altriCosti, setAltriCosti,
  capex, setCapex, finanziamenti, setFinanziamenti, financialReports, handleSaveFinancialsToSupabase, savingFinancials, onGeneratePdfSection
}: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-300 p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <button onClick={() => setBpSubTab('input')} className={`px-4 py-2 text-xs font-bold uppercase ${bpSubTab === 'input' ? 'bg-slate-950 text-[#ccff00]' : 'bg-slate-100 text-slate-700'}`}>Scheda INPUT</button>
          <button onClick={() => setBpSubTab('ce')} className={`px-4 py-2 text-xs font-bold uppercase ${bpSubTab === 'ce' ? 'bg-slate-950 text-[#ccff00]' : 'bg-slate-100 text-slate-700'}`}>Conto Economico (CE)</button>
          <button onClick={() => setBpSubTab('sp')} className={`px-4 py-2 text-xs font-bold uppercase ${bpSubTab === 'sp' ? 'bg-slate-950 text-[#ccff00]' : 'bg-slate-100 text-slate-700'}`}>Stato Patrimoniale (SP)</button>
          <button onClick={() => setBpSubTab('cashflow')} className={`px-4 py-2 text-xs font-bold uppercase ${bpSubTab === 'cashflow' ? 'bg-slate-950 text-[#ccff00]' : 'bg-slate-100 text-slate-700'}`}>Cash Flow</button>
          <button onClick={() => setBpSubTab('debito')} className={`px-4 py-2 text-xs font-bold uppercase ${bpSubTab === 'debito' ? 'bg-slate-950 text-[#ccff00]' : 'bg-slate-100 text-slate-700'}`}>Piano Debito</button>
          <button onClick={() => setBpSubTab('indexes')} className={`px-4 py-2 text-xs font-bold uppercase ${bpSubTab === 'indexes' ? 'bg-slate-950 text-[#ccff00]' : 'bg-slate-100 text-slate-700'}`}>KPI & Indici</button>
        </div>
        <button onClick={handleSaveFinancialsToSupabase} disabled={savingFinancials} className="text-xs bg-slate-950 text-[#ccff00] font-bold px-5 py-2.5 flex items-center gap-1.5 cursor-pointer">
          <Save className="w-4 h-4" /> {savingFinancials ? 'Salvataggio...' : 'Salva su Supabase'}
        </button>
      </div>

      {bpSubTab === 'input' && (
        <div className="bg-white border border-slate-300 p-6 space-y-4">
          <h3 className="text-sm font-extrabold uppercase">BEGINNING BALANCE | CASH ON HAND ($)</h3>
          <div className="grid grid-cols-5 gap-3 text-xs">
            {(['y1','y2','y3','y4','y5'] as const).map((yk, idx) => (
              <div key={yk} className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Anno {idx + 1}</label>
                <input type="number" value={beginningBalance[yk]} onChange={(e) => setBeginningBalance({ ...beginningBalance, [yk]: Number(e.target.value) })} className="w-full px-2 py-1.5 border border-slate-300 font-mono font-bold text-right text-xs" />
              </div>
            ))}
          </div>
        </div>
      )}

      {bpSubTab === 'ce' && (
        <div className="bg-white border border-slate-300 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold uppercase">Conto Economico Proiettato</h3>
            <button onClick={() => onGeneratePdfSection('ce')} className="text-xs bg-indigo-600 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 cursor-pointer">
              <Eye className="w-3.5 h-3.5" /> PDF Sezione CE
            </button>
          </div>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-white font-extrabold uppercase">
                <th className="py-3 px-4 font-sans">Voce Economica (€)</th>
                <th className="py-3 px-4 text-right">Anno 1</th><th className="py-3 px-4 text-right">Anno 2</th><th className="py-3 px-4 text-right">Anno 3</th><th className="py-3 px-4 text-right">Anno 4</th><th className="py-3 px-4 text-right">Anno 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {financialReports.contoEconomico.map((r: any) => (
                <tr key={r.anno}>
                  <td className="py-2.5 px-4 font-sans font-bold">Anno {r.anno} - Ricavi & Utili</td>
                  <td className="py-2.5 px-4 text-right">€ {Math.round(r.ricavi).toLocaleString('it-IT')}</td>
                  <td className="py-2.5 px-4 text-right">€ {Math.round(r.ebitda).toLocaleString('it-IT')}</td>
                  <td className="py-2.5 px-4 text-right">€ {Math.round(r.ebit).toLocaleString('it-IT')}</td>
                  <td className="py-2.5 px-4 text-right">€ {Math.round(r.imposte).toLocaleString('it-IT')}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-700">€ {Math.round(r.utileNetto).toLocaleString('it-IT')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
