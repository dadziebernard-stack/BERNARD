import React, { useState, useMemo } from 'react';
import { Saver, Transaction } from '../../types/index.ts';
import { 
  Users, 
  Search, 
  Plus, 
  Coins, 
  Store, 
  Phone, 
  CheckCircle2, 
  ChevronRight, 
  Award,
  Sparkles,
  Calendar,
  Filter,
  ArrowUpRight,
  Building2
} from 'lucide-react';

interface SaversDirectoryProps {
  savers: Saver[];
  currencySymbol?: string;
  onOpenRecordDeposit: (saver?: Saver) => void;
  onOpenNewSaverModal: () => void;
  onSelectSaver: (saver: Saver) => void;
  onQuickStamp: (saver: Saver) => void;
}

export const SaversDirectory: React.FC<SaversDirectoryProps> = ({
  savers,
  currencySymbol = 'GH₵',
  onOpenRecordDeposit,
  onOpenNewSaverModal,
  onSelectSaver,
  onQuickStamp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNPAID_TODAY' | 'PAID_TODAY' | 'MATURE'>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];

  // Savers stats
  const saversPaidToday = useMemo(() => {
    return savers.filter((s) => s.lastDepositDate === todayStr);
  }, [savers, todayStr]);

  const saversUnpaidToday = useMemo(() => {
    return savers.filter((s) => s.lastDepositDate !== todayStr && s.status !== 'COMPLETED');
  }, [savers, todayStr]);

  const matureSavers = useMemo(() => {
    return savers.filter((s) => s.passbook.filter((p) => p.isPaid).length >= s.totalCycleDays);
  }, [savers]);

  // Filtered list
  const filteredSavers = useMemo(() => {
    return savers.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        s.fullName.toLowerCase().includes(q) ||
        s.nicknameOrStall.toLowerCase().includes(q) ||
        s.accountNumber.toLowerCase().includes(q) ||
        s.phone.includes(q);

      if (!matchesSearch) return false;

      if (filterMode === 'UNPAID_TODAY') return s.lastDepositDate !== todayStr && s.status !== 'COMPLETED';
      if (filterMode === 'PAID_TODAY') return s.lastDepositDate === todayStr;
      if (filterMode === 'MATURE') return s.passbook.filter((p) => p.isPaid).length >= s.totalCycleDays;

      return true;
    });
  }, [savers, searchQuery, filterMode, todayStr]);

  const totalVaultSavings = useMemo(() => {
    return savers.reduce((sum, s) => sum + s.currentSavings, 0);
  }, [savers]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Central Client Registry
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Savers & 31-Day Passbooks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage daily micro-savings clients, stamp daily contributions, and disburse mature cycle payouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onOpenRecordDeposit()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <Coins className="w-4 h-4" />
            + Record Deposit
          </button>
          <button
            onClick={onOpenNewSaverModal}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            + Open Saver Account
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFilterMode('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'ALL'
              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Savers</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{savers.length}</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">
            {currencySymbol} {totalVaultSavings.toLocaleString()} in savings
          </p>
        </div>

        <div 
          onClick={() => setFilterMode('UNPAID_TODAY')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'UNPAID_TODAY'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase">Pending Today</p>
          <p className="text-2xl font-black text-amber-700 font-mono mt-0.5">{saversUnpaidToday.length}</p>
          <p className="text-[10px] text-amber-700 font-semibold mt-1">Yet to contribute today</p>
        </div>

        <div 
          onClick={() => setFilterMode('PAID_TODAY')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'PAID_TODAY'
              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase">Paid Today</p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{saversPaidToday.length}</p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">Stamped & up to date</p>
        </div>

        <div 
          onClick={() => setFilterMode('MATURE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'MATURE'
              ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase">Mature (31 Days)</p>
          <p className="text-2xl font-black text-purple-700 font-mono mt-0.5">{matureSavers.length}</p>
          <p className="text-[10px] text-purple-700 font-semibold mt-1">Ready for cycle payout</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, stall, phone, account #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2 shrink-0">Filter:</span>
          {(['ALL', 'UNPAID_TODAY', 'PAID_TODAY', 'MATURE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                filterMode === mode
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode === 'ALL' && `All (${savers.length})`}
              {mode === 'UNPAID_TODAY' && `Pending (${saversUnpaidToday.length})`}
              {mode === 'PAID_TODAY' && `Paid (${saversPaidToday.length})`}
              {mode === 'MATURE' && `Mature (${matureSavers.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Savers Grid / Empty State */}
      {filteredSavers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSavers.map((saver) => {
            const paidDays = saver.passbook.filter((p) => p.isPaid).length;
            const progressPercent = Math.min(100, Math.round((paidDays / saver.totalCycleDays) * 100));
            const isPaidToday = saver.lastDepositDate === todayStr;
            const isMature = paidDays >= saver.totalCycleDays;

            return (
              <div
                key={saver.id}
                className={`bg-white border rounded-2xl p-5 space-y-4 hover:shadow-md transition-all ${
                  isMature
                    ? 'border-purple-300 ring-2 ring-purple-500/10'
                    : isPaidToday
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Identity */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm">
                      {saver.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{saver.fullName}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Store className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{saver.nicknameOrStall}</span>
                      </div>
                      {saver.branchName && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                          <Building2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="line-clamp-1">{saver.branchName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {saver.accountNumber}
                  </span>
                </div>

                {/* Plan & Savings Numbers */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Daily Rate</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {currencySymbol} {saver.dailyContribution}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Accumulated</span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">
                      {currencySymbol} {saver.currentSavings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 31-Day Passbook Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Cycle {saver.currentCycle}: {paidDays} / {saver.totalCycleDays} days
                    </span>
                    <span className="font-mono font-bold text-slate-800">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isMature ? 'bg-purple-600' : isPaidToday ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between pt-1">
                  {isMature ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      <Sparkles className="w-3 h-3" />
                      Mature • Ready for Payout
                    </span>
                  ) : isPaidToday ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid Today
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Pending Today's Stamp
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {saver.phone}
                  </span>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onQuickStamp(saver)}
                    disabled={isMature}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isMature
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    + Stamp Day
                  </button>

                  <button
                    onClick={() => onSelectSaver(saver)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    Passbook
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? 'No matching savers found' : 'No Savers Registered Yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery
                ? `No savers match the query "${searchQuery}". Try a different name, stall, or account number.`
                : 'Get started by creating your first client account for daily passbook savings.'}
            </p>
          </div>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={onOpenNewSaverModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Open First Saver Account
            </button>
          )}
        </div>
      )}
    </div>
  );
};
