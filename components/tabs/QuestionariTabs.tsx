'use client';
import React from 'react';
import { FileText, Trash2, ChevronDown, ChevronRight, HelpCircle, Eye } from 'lucide-react';

export default function QuestionariTab({ forms, domande, risposteClienti, openFormsState, setOpenFormsState, userRole, handleDeleteForm, onGenerateReport }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-300 p-4">
        <span className="text-xs font-bold text-slate-700 uppercase">Sezione Questionari & Risposte Clienti</span>
        <button onClick={onGenerateReport} className="text-xs bg-indigo-600 text-white font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer">
          <Eye className="w-4 h-4" /> Report PDF Sezione Questionari
        </button>
      </div>
      <div className="space-y-4">
        {forms.length === 0 ? (
          <div className="bg-white border border-slate-300 p-12 text-center text-slate-500">Nessun questionario associato.</div>
        ) : (
          forms.map((form: any) => (
            <div key={form.id} className="bg-white border border-slate-300 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">{form.titolo}</h3>
              <p className="text-xs text-slate-500">{form.descrizione}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
