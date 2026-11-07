'use client';
import React from 'react';
import { ShieldCheck, BarChart3, Calendar } from 'lucide-react';

export default function ExecutiveTab({ financialReports, roadmapTasks, setActiveTab }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-950 text-white p-6 border border-slate-800 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-[#ccff00] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> GOS Project Control Tower & Executive Summary
          </div>
          <h2 className="text-xl font-extrabold mt-1">Cruscotto di Controllo Finanziario & Operativo</h2>
        </div>
        <button onClick={() => setActiveTab('business_plan')} className="bg-[#ccff00] text-slate-950 px-4 py-2 text-xs font-extrabold uppercase cursor-pointer">
          Apri Modulo Finanziario →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-300 p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Fatturato Totale (5 Anni)</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">€ {Math.round(financialReports.fatturatoTotale5Anni).toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white border border-slate-300 p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">EBITDA Medio (5 Anni)</span>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono">€ {Math.round(financialReports.ebitdaMedio5Anni).toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white border border-slate-300 p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">NPV di Progetto</span>
          <p className="text-2xl font-extrabold text-sky-700 font-mono">€ {Math.round(financialReports.kpis.npv).toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white border border-slate-300 p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">IRR (Tasso Interno)</span>
          <p className="text-2xl font-extrabold text-indigo-600 font-mono">{(financialReports.kpis.irr * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
