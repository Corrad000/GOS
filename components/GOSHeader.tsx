'use client';
import React from 'react';

export default function GOSHeader({ userRole }: { userRole: string }) {
  return (
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
  );
}
