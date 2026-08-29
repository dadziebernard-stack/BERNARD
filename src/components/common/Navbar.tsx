import React from 'react';
import { 
  Coins, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  Database, 
  FileText, 
  Plus, 
  UserPlus, 
  Activity,
  Layers,
  Lock,
  Unlock,
  BookOpen,
  Receipt,
  Globe,
  Building2,
  LogOut
} from 'lucide-react';
import { AuthSession } from '../../types/index.ts';

interface NavbarProps {
  activeTab: string;
  currencySymbol: string;
  authSession: AuthSession | null;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenRecordDeposit: () => void;
  onOpenNewSaver: () => void;
  onClearAllData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  currencySymbol = 'GH₵',
  authSession,
  onSelectTab,
  onLogout,
  onOpenRecordDeposit,
  onOpenNewSaver,
  onClearAllData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <div 
            onClick={() => onSelectTab('admin-dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/15">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Coins className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 uppercase font-mono">
                  SUSU COLLECTOR
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  GHANA (GH₵)
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                Daily Micro-Savings & Group Susu Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectTab('admin-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'admin-dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onSelectTab('savers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'savers'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Savers & Passbooks
            </button>
            <button
              onClick={() => onSelectTab('groups')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'groups'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Group Susu (ROSCA)
            </button>
            <button
              onClick={() => onSelectTab('daily-tally')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'daily-tally'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Daily Cash & Tally
            </button>
            <button
              onClick={() => onSelectTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => onSelectTab('branches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'branches'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Branches & Regions
            </button>
            <button
              onClick={() => onSelectTab('database')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'database'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Database
            </button>
          </nav>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2">
            {/* Ghana Cedis Currency Fixed Badge */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 font-mono shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>GH₵ (Ghana Cedis)</span>
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={onOpenNewSaver}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">+ New Saver</span>
              <span className="sm:hidden">+ Saver</span>
            </button>

            <button
              onClick={onOpenRecordDeposit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>+ Deposit</span>
            </button>

            {/* Active Session Tier Badge & Logout */}
            {authSession ? (
              <div className="flex items-center gap-1.5">
                {authSession.level === 'SUPER_ADMIN' && (
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-mono text-[11px]">Super Admin: Bernard</span>
                  </div>
                )}
                {authSession.level === 'REGIONAL_BRANCH' && (
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] truncate max-w-[140px]">{authSession.regionName} ({authSession.regionCode})</span>
                  </div>
                )}
                {authSession.level === 'DISTRICT_BRANCH' && (
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px] truncate max-w-[140px]">{authSession.branchName}</span>
                  </div>
                )}

                <button
                  onClick={onLogout}
                  title="Switch Branch / Logout Session"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-300 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Switch / Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100">
          <button
            onClick={() => onSelectTab('admin-dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'admin-dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('savers')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'savers' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Savers
          </button>
          <button
            onClick={() => onSelectTab('groups')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'groups' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Group Susu
          </button>
          <button
            onClick={() => onSelectTab('daily-tally')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'daily-tally' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Daily Tally
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => onSelectTab('branches')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'branches' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Branches
          </button>
          <button
            onClick={() => onSelectTab('database')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              activeTab === 'database' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Database
          </button>
        </div>
      </div>
    </header>
  );
};

