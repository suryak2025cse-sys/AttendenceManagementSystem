import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  CreditCard,
  Building2,
  ReceiptText,
  BarChart3,
  Smartphone
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/students/add', label: 'Add Student', icon: UserPlus },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/fees', label: 'Fees & Invoices', icon: CreditCard },
  { path: '/vendors', label: 'Vendors', icon: Building2 },
  { path: '/expenses', label: 'Expenses', icon: ReceiptText },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Feature Highlights Card */}
        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Smartphone className="w-4 h-4" />
            <span>WhatsApp Automation</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Marking <span className="text-amber-400 font-medium">ABSENT</span> triggers instant parent WhatsApp notifications via Meta Cloud API.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-300">
          School Management v1.0
        </p>
        <p className="text-[10px] text-slate-300">
          Spring Boot + MySQL + React
        </p>
      </div>
    </aside>
  );
}
