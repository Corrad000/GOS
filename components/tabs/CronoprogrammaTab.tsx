'use client';
import React from 'react';
import { Calendar, Plus, Edit2, Trash2, Eye } from 'lucide-react';

export default function CronoprogrammaTab({ roadmapTasks, projectTimelineSummary, userRole, setShowModalTask, handleOpenEditTask, handleDeleteRoadmapTask, onGenerateReport }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-300 p-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Cronoprogramma & Roadmap Operativa (PMO)</h3>
          <p className="text-xs text-slate-500">Periodo: {projectTimelineSummary.minInizio} → {projectTimelineSummary.maxFine}</p>
        </div>
        <button onClick={onGenerateReport} className="text-xs bg-indigo-600 text-white font-bold px-4 py-2.5 flex items-center gap-1.5 cursor-pointer">
          <Eye className="w-4 h-4" /> Report PDF Cronoprogramma
        </button>
      </div>
      <div className="bg-white border border-slate-300 p-6">
        <p className="text-xs text-slate-600">Gestione task operativi e scadenze di progetto.</p>
      </div>
    </div>
  );
}
