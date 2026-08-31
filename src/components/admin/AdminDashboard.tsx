import React from 'react';
import { Collector, Saver, Transaction, GroupSusu, DailyReconciliation, AuthSession } from '../../types/index.ts';
import { StatCard } from '../common/StatCard.tsx';
import { DailyCollectionProgressCard } from './DailyCollectionProgressCard.tsx';
import { 
  Coins, 
  Users, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  Layers, 
  Activity, 
  AlertTriangle,
  Plus,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  Banknote,
  Smartphone,
  ChevronRight,
  Store,
  Building2,
  Globe
} from 'lucide-react';

interface AdminDashboardProps {
  collectors?: Collector[];
  savers: Saver[];
  transactions: Transaction[];
  groups: GroupSusu[];
  reconciliations?: DailyReconciliation[];
  currencySymbol?: string;
  authSession?: AuthSession | null;
  onNavigateTab: (tab: string) => void;
  onOpenNewSaverModal?: () => void;
  onOpenNewGroupModal: () => void;
  onSelectSaver?: (saver: Saver) => void;
  onViewReceipt: (transaction: Transaction) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  collectors = [],
  savers,
  transactions,
  groups,
  reconciliations = [],
  currencySymbol = 'GH₵',
  authSession,
  onNavigateTab,
  onOpenNewSaverModal,
  onOpenNewGroupModal,
  onSelectSaver,
  onViewReceipt,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate totals
  const totalAllTimeSavings = savers.reduce((sum, s) => sum + s.currentSavings, 0);

  const todayTransactions = transactions.filter((t) => t.timestamp.startsWith(todayStr));
  const todayDeposits = todayTransactions.filter((t) => t.type === 'DAILY_CONTRIBUTION');
  
  const todayCollections = todayDeposits.reduce((sum, t) => sum + t.amount, 0);
  const todayCash = todayDeposits
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayMoMo = todayDeposits
    .filter((t) => t.paymentMethod === 'MOBILE_MONEY' || t.paymentMethod === 'BANK_TRANSFER')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayPayouts = todayTransactions
    .filter((t) => t.type === 'WITHDRAWAL_PAYOUT' || t.type === 'GROUP_ROTATION_PAYOUT')
    .reduce((sum, t) => sum + (t.netPayout || t.amount), 0);

  const saversPaidToday = savers.filter((s) => s.lastDepositDate === todayStr);
  const matureSavers = savers.filter((s) => s.passbook.filter((p) => p.isPaid).length >= s.totalCycleDays);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Executive Management & Operations
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Susu & Savings Hub</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Central administration for client daily passbooks, 31-day cycle payouts, and Group Susu (ROSCA) rotations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenNewSaverModal && (
            <button
              onClick={onOpenNewSaverModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              + Open Saver Account
            </button>
          )}
          <button
            onClick={() => onNavigateTab('savers')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            Savers Directory
          </button>
          <button
            onClick={() => onNavigateTab('branches')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            Branches & Regions
          </button>
          <button
            onClick={onOpenNewGroupModal}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Layers className="w-4 h-4 text-sky-600" />
            + New Group Susu
          </button>
          <button
            onClick={() => onNavigateTab('daily-tally')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Coins className="w-4 h-4" />
            Daily Cash & Tally
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Savings Balance"
          value={`${currencySymbol} ${totalAllTimeSavings.toLocaleString()}`}
          subtitle={`Across ${savers.length} individual 31-day passbooks`}
          icon={Wallet}
          iconColor="text-emerald-600"
          badge={{
            text: `${matureSavers.length} Mature Cycles`,
            type: matureSavers.length > 0 ? 'warning' : 'success',
          }}
          onClick={() => onNavigateTab('savers')}
        />

        <StatCard
          title="Today's Collections"
          value={`${currencySymbol} ${todayCollections.toLocaleString()}`}
          subtitle={`${todayTransactions.length} transaction(s) stamped today`}
          icon={Coins}
          iconColor="text-emerald-600"
          badge={{
            text: `${saversPaidToday.length} Savers Paid`,
            type: 'info',
          }}
          onClick={() => onNavigateTab('daily-tally')}
        />

        <StatCard
          title="Today's Physical Cash"
          value={`${currencySymbol} ${todayCash.toLocaleString()}`}
          subtitle={`MoMo: ${currencySymbol} ${todayMoMo.toLocaleString()}`}
          icon={Banknote}
          iconColor="text-amber-600"
          badge={{
            text: `Disbursed: ${currencySymbol} ${todayPayouts.toLocaleString()}`,
            type: 'neutral',
          }}
          onClick={() => onNavigateTab('daily-tally')}
        />

        <StatCard
          title="Group Susu Pools"
          value={groups.length}
          subtitle={`Rotational daily & weekly savings`}
          icon={Layers}
          iconColor="text-sky-600"
          badge={{
            text: `${savers.length} Total Savers`,
            type: 'neutral',
          }}
          onClick={() => onNavigateTab('groups')}
        />
      </div>

      {/* Primary Feature: Daily Collection Progress vs Configurable Branch Goal */}
      <DailyCollectionProgressCard
        savers={savers}
        transactions={transactions}
        currencySymbol={currencySymbol}
        authSession={authSession}
        onNavigateTab={onNavigateTab}
      />

      {/* Main Grid: Savers List & Group Susu Circles & Live Transaction Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savers & Group Susu (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Savers Roster Highlight */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Savers & 31-Day Passbooks</h3>
                <p className="text-xs text-slate-500">Recent client accounts and savings progress</p>
              </div>
              <button
                onClick={() => onNavigateTab('savers')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                View All Savers
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {savers.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No savers registered yet.</p>
                {onOpenNewSaverModal && (
                  <button
                    onClick={onOpenNewSaverModal}
                    className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    + Open First Saver Account
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {savers.slice(0, 4).map((saver) => {
                  const paidDays = saver.passbook.filter((p) => p.isPaid).length;
                  const isMature = paidDays >= saver.totalCycleDays;

                  return (
                    <div
                      key={saver.id}
                      onClick={() => onSelectSaver && onSelectSaver(saver)}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 hover:border-emerald-300 hover:bg-white cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{saver.fullName}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Store className="w-3 h-3 text-slate-400" />
                            {saver.nicknameOrStall}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                          {saver.accountNumber}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 font-medium">
                        <span className="text-slate-500">Accumulated:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {currencySymbol} {saver.currentSavings.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Cycle {saver.currentCycle}: {paidDays}/{saver.totalCycleDays} days</span>
                        {isMature ? (
                          <span className="text-purple-700 font-bold">Mature • Ready</span>
                        ) : saver.lastDepositDate === todayStr ? (
                          <span className="text-emerald-700 font-bold">Paid Today</span>
                        ) : (
                          <span className="text-amber-700 font-bold">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group Susu Highlights */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Group Susu Circles</h3>
                <p className="text-xs text-slate-500">Daily Cashout & Sunday Weekly Cashout rotational savings</p>
              </div>
              <button
                onClick={() => onNavigateTab('groups')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                View All Groups
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-xs text-slate-500">No active Group Susu circles yet.</p>
                <button
                  onClick={onOpenNewGroupModal}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
                >
                  + Create First Group Susu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groups.map((group) => {
                  const nextMember = group.members.find((m) => m.payoutTurnOrder === group.currentRound);
                  return (
                    <div key={group.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{group.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">Code: {group.code}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                          Turn {group.currentRound}/{group.totalSlots}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600">Total Pot / Turn:</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {currencySymbol} {group.potSizePerTurn.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{group.cashoutScheduleLabel}</span>
                      </div>

                      {nextMember && (
                        <p className="text-[10px] text-slate-700 bg-white p-1.5 rounded-lg border border-slate-200">
                          Next Cashout: <strong className="text-slate-900">{nextMember.fullName}</strong> ({nextMember.stallOrBusiness})
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Real-time Live Transaction Feed */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">Live Transactions</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Real-Time</span>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No transactions recorded yet. Deposits will appear here instantly.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[500px] overflow-y-auto">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => onViewReceipt(tx)}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[140px]">{tx.saverName || 'Group Payout'}</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {tx.type === 'DAILY_CONTRIBUTION' ? '+' : '-'} {currencySymbol} {tx.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono">{tx.paymentMethod}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span className="font-mono text-[9px] text-slate-400">{tx.referenceNumber}</span>
                      <span className="text-emerald-700 hover:underline font-bold">View Slip →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('daily-tally')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center border border-slate-200"
              >
                View Full Daily Cash & Tally
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
