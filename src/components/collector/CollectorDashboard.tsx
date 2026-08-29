import React, { useState, useMemo } from 'react';
import { Collector, Saver, Transaction } from '../../types/index.ts';
import { StatCard } from '../common/StatCard.tsx';
import { 
  Coins, 
  Banknote, 
  Smartphone, 
  UserCheck, 
  Search, 
  Plus, 
  CheckCircle2, 
  Store, 
  Phone, 
  Flame, 
  ChevronRight,
  TrendingUp,
  Award,
  Filter
} from 'lucide-react';

interface CollectorDashboardProps {
  collector: Collector;
  savers: Saver[];
  currencySymbol?: string;
  onOpenRecordDeposit: (preSelectedSaver?: Saver) => void;
  onOpenNewSaverModal: () => void;
  onSelectSaver: (saver: Saver) => void;
  onQuickStamp: (saver: Saver) => void;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({
  collector,
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

  // Savers assigned to this collector
  const mySavers = useMemo(() => {
    return savers.filter((s) => s.collectorId === collector.id);
  }, [savers, collector.id]);

  // Savers who have deposited today
  const saversPaidToday = useMemo(() => {
    return mySavers.filter((s) => s.lastDepositDate === todayStr);
  }, [mySavers, todayStr]);

  const saversUnpaidToday = useMemo(() => {
    return mySavers.filter((s) => s.lastDepositDate !== todayStr && s.status !== 'COMPLETED');
  }, [mySavers, todayStr]);

  const matureSavers = useMemo(() => {
    return mySavers.filter((s) => s.passbook.filter((p) => p.isPaid).length >= s.totalCycleDays);
  }, [mySavers]);

  // Filtered list
  const filteredSavers = useMemo(() => {
    return mySavers.filter((s) => {
      // Search matching
      const matchesSearch =
        searchQuery === '' ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nicknameOrStall.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (filterMode === 'UNPAID_TODAY') return s.lastDepositDate !== todayStr && s.status !== 'COMPLETED';
      if (filterMode === 'PAID_TODAY') return s.lastDepositDate === todayStr;
      if (filterMode === 'MATURE') return s.passbook.filter((p) => p.isPaid).length >= s.totalCycleDays;

      return true;
    });
  }, [mySavers, searchQuery, filterMode, todayStr]);

  const totalCollectedToday = collector.todayCollectedCash + collector.todayCollectedMoMo;
  const targetPercent = collector.todayTarget > 0 
    ? Math.min(100, Math.round((totalCollectedToday / collector.todayTarget) * 100)) 
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Route & Officer Greeting Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-extrabold text-lg shadow-2xs">
            {collector.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">{collector.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                {collector.collectorCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              On Field Route: <strong className="text-slate-800">{collector.assignedRoute}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewSaverModal}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            + New Saver
          </button>
          <button
            onClick={() => onOpenRecordDeposit()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
          >
            <Coins className="w-4 h-4" />
            Record Deposit
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Total Collections"
          value={`${currencySymbol} ${totalCollectedToday.toLocaleString()}`}
          subtitle={`Target: ${currencySymbol} ${collector.todayTarget.toLocaleString()} (${targetPercent}%)`}
          icon={Coins}
          iconColor="text-emerald-600"
          badge={{
            text: `${targetPercent}% of Daily Target`,
            type: targetPercent >= 100 ? 'success' : 'warning',
          }}
        />

        <StatCard
          title="Physical Cash in Hand"
          value={`${currencySymbol} ${collector.cashInHand.toLocaleString()}`}
          subtitle="Cash to handover today"
          icon={Banknote}
          iconColor="text-amber-600"
          badge={{
            text: 'Physical Cash',
            type: 'warning',
          }}
        />

        <StatCard
          title="Mobile Money Collected"
          value={`${currencySymbol} ${collector.todayCollectedMoMo.toLocaleString()}`}
          subtitle="Direct digital transfers"
          icon={Smartphone}
          iconColor="text-sky-600"
          badge={{
            text: 'Direct Digital',
            type: 'info',
          }}
        />

        <StatCard
          title="Savers Stamped Today"
          value={`${saversPaidToday.length} / ${mySavers.length}`}
          subtitle={`${saversUnpaidToday.length} savers pending collection`}
          icon={UserCheck}
          iconColor="text-emerald-600"
          badge={{
            text: `${Math.round((saversPaidToday.length / (mySavers.length || 1)) * 100)}% Coverage`,
            type: 'success',
          }}
        />
      </div>

      {/* Main Section: Route Savers Directory & Instant Stamp Pad */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Route Savers & Passbooks</h3>
            <p className="text-xs text-slate-500">
              Manage client 31-day cards, record fast contributions, and trigger payouts
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'ALL' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({mySavers.length})
            </button>
            <button
              onClick={() => setFilterMode('UNPAID_TODAY')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'UNPAID_TODAY' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid ({saversUnpaidToday.length})
            </button>
            <button
              onClick={() => setFilterMode('PAID_TODAY')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'PAID_TODAY' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid Today ({saversPaidToday.length})
            </button>
            <button
              onClick={() => setFilterMode('MATURE')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'MATURE' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ready for Payout ({matureSavers.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search savers by name, stall number, account number, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Saver Cards Grid */}
        {filteredSavers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {filteredSavers.map((saver) => {
              const paidDays = saver.passbook.filter((p) => p.isPaid).length;
              const isPaidToday = saver.lastDepositDate === todayStr;
              const isMature = paidDays >= saver.totalCycleDays;

              return (
                <div
                  key={saver.id}
                  className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isPaidToday
                      ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      : isMature
                      ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-emerald-400 shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Account & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700">
                          {saver.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{saver.fullName}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{saver.accountNumber}</span>
                        </div>
                      </div>

                      {isPaidToday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Paid Today
                        </span>
                      ) : isMature ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold animate-pulse">
                          <Award className="w-3 h-3 text-amber-600" /> 31/31 Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          Unpaid Today
                        </span>
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{saver.nicknameOrStall}</span>
                        </span>
                        <span className="font-mono text-emerald-700 font-bold">
                          {currencySymbol}{saver.dailyContribution}/day
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Savings so far:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {currencySymbol}{saver.currentSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Micro Passbook Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Day {paidDays} of {saver.totalCycleDays}</span>
                        <span>{Math.round((paidDays / saver.totalCycleDays) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isMature ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (paidDays / saver.totalCycleDays) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectSaver(saver)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      Passbook
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    {!isMature ? (
                      <button
                        onClick={() => onQuickStamp(saver)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        Stamp +{currencySymbol}{saver.dailyContribution}
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectSaver(saver)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Disburse Payout
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center border border-slate-200 rounded-xl space-y-2 bg-slate-50">
            <p className="text-sm font-semibold text-slate-700">No savers found</p>
            <p className="text-xs text-slate-500">Try adjusting your search or register a new saver account.</p>
          </div>
        )}
      </div>
    </div>
  );
};
