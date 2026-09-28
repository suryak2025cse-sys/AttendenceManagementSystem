import React from 'react';
import { School, Bell, Calendar, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
              Smart School Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Attendance & Automated Parent Notification
            </p>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{today}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Meta WhatsApp Gateway Ready</span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800">Admin Portal</p>
              <p className="text-[11px] text-slate-500">School Staff</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
