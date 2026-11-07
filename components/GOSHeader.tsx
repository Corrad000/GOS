'use client';
import React from 'react';
import { Calendar, Clock, LogOut } from 'lucide-react';

interface GOSHeaderProps {
  userDisplayName: string;
  userRole: string;
  currentDateTime: string;
  elapsedTime: string;
  onLogout: () => void;
}

export default function GOSHeader({
  userDisplayName,
  userRole,
  currentDateTime,
  elapsedTime,
  onLogout,
}: GOSHeaderProps) {
  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-4">
          <div className="h-14 px-3.5 flex items-center justify-center">
            <img 
              src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S-White_Green.png" 
              alt="Glaring Logo" 
              className="h-16 max-h-28 w-auto object-contain" 
            />
          </div>
          <div>
            <p className="font-extrabold text-sm text-white tracking-wide">{userDisplayName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[#ccff00] font-bold text-[10px] uppercase tracking-wider">Sessione Attiva</span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-800 text-slate-300">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-[#ccff00]" />
              <span>{currentDateTime}</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-[#ccff00]" />
              <span>Permanenza: <strong className="text-[#ccff00] font-mono">{elapsedTime}</strong></span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 transition-colors cursor-pointer font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
