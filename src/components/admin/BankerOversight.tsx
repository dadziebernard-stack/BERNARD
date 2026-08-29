import React, { useState } from 'react';
import { Collector, Transaction, Saver, DailyReconciliation } from '../../types/index.ts';
import { StorageService } from '../../services/storageService.ts';
import { 
  ShieldCheck, 
  Banknote, 
  Smartphone, 
  Coins, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Search, 
  Filter, 
  Receipt,
  User,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

interface BankerOversightProps {
  collectors: Collector[];
  transactions: Transaction[];
  savers: Saver[];
  reconciliations: DailyReconciliation[];
  currencySymbol?: string;
  onViewReceipt: (transaction: Transaction) => void;
  onReconciliationVerified: () => void;
}

export const BankerOversight: React.FC<BankerOversightProps> = ({
  collectors,
  transactions,
  savers,
  reconciliations,
  currencySymbol = 'GH₵',
  onViewReceipt,
  onReconciliationVerified,
}) => {
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('ALL');
  const [searchTx, setSearchTx] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'live-stream' | 'reconciliations' | 'banker-risk'>('live-stream');

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedCollectorId !== 'ALL' && tx.collectorId !== selectedCollectorId) return false;
    if (searchTx.trim()) {
      const q = searchTx.toLowerCase();
      const matchSaver = tx.saverName?.toLowerCase().includes(q) || tx.saverAccountNumber?.toLowerCase().includes(q);
      const matchRef = tx.referenceNumber.toLowerCase().includes(q);
      const matchCol = tx.collectorName.toLowerCase().includes(q);
      if (!matchSaver && !matchRef && !matchCol) return false;
    }
    return true;
  });

  // Verify a pending daily reconciliation
  const handleVerifyReconciliation = (recId: string, status: 'VERIFIED' | 'DISCREPANCY_FLAGGED') => {
    StorageService.verifyReconciliation(recId, 'Bernard (Super Admin)', status === 'DISCREPANCY_FLAGGED' ? 'DISCREPANCY_FLAGGED' : 'RECONCILED');
    onReconciliationVerified();
  };

  const totalHeldCashInField = collectors.reduce((sum, c) => sum + c.cashInHand, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h2 className="text-xl font-black text-slate-900">Banker Oversight & Live Ledger Audit</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance over mobile bankers, real-time ledger entries, cash-in-hand safety, and end-of-day reconciliations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs shadow-2xs">
            <Banknote className="w-4 h-4 text-amber-600" />
            <span className="text-slate-700 font-medium">Total Field Cash in Hand:</span>
            <span className="font-mono font-black text-amber-800">
              {currencySymbol} {totalHeldCashInField.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('live-stream')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'live-stream'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Live Transaction Feed ({filteredTransactions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('reconciliations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'reconciliations'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          End-of-Day Handover Reconciliations ({reconciliations.length})
        </button>

        <button
          onClick={() => setActiveSubTab('banker-risk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'banker-risk'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Banker Liquidity & Performance ({collectors.length})
        </button>
      </div>

      {/* TAB 1: LIVE TRANSACTIONS STREAM */}
      {activeSubTab === 'live-stream' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Filter by Field Banker</label>
              <select
                value={selectedCollectorId}
                onChange={(e) => setSelectedCollectorId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium shadow-2xs"
              >
                <option value="ALL">All Field Bankers ({collectors.length})</option>
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.collectorCode}) - Route: {c.assignedRoute}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Search Record</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Tx Ref, Saver Name, Stall..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Timestamp / Ref</th>
                    <th className="px-4 py-3">Saver Account</th>
                    <th className="px-4 py-3">Field Banker</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No transactions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono">
                          <span className="font-bold text-slate-900 block">{tx.referenceNumber}</span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {new Date(tx.timestamp).toLocaleString()}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{tx.saverName || 'Group Susu'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{tx.saverAccountNumber}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800 block">{tx.collectorName}</span>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold">{tx.collectorCode}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.paymentMethod === 'CASH'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            {tx.paymentMethod === 'CASH' ? <Banknote className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            {tx.paymentMethod}
                          </span>
                          {tx.momoReference && (
                            <span className="block text-[9px] text-slate-500 font-mono mt-0.5">{tx.momoReference}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-mono">
                          <span className="font-black text-slate-900 text-sm">
                            {tx.type === 'DAILY_CONTRIBUTION' ? '+' : '-'} {currencySymbol} {tx.amount.toLocaleString()}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onViewReceipt(tx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1 transition-colors border border-slate-200"
                          >
                            <Receipt className="w-3 h-3" />
                            Slip
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECONCILIATIONS MATRIX */}
      {activeSubTab === 'reconciliations' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Cash Handover Reconciliations</h3>
              <p className="text-xs text-slate-500">
                Compare expected physical cash collected on routes against cash handed over by mobile collectors
              </p>
            </div>

            {reconciliations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No daily reconciliations submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                {reconciliations.map((rec) => {
                  const hasDiscrepancy = rec.discrepancy !== 0;
                  return (
                    <div key={rec.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{rec.collectorName}</span>
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                            {rec.collectorId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          Date: {rec.date} • Transactions: {rec.totalTransactionsCount} • MoMo: {currencySymbol} {rec.totalMoMoCollected.toLocaleString()}
                        </p>
                        {rec.notes && <p className="text-[11px] text-slate-600 italic">"{rec.notes}"</p>}
                      </div>

                      {/* Financial Comparison */}
                      <div className="flex items-center gap-6 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-medium">Expected Cash</span>
                          <span className="font-bold text-slate-800">
                            {currencySymbol} {rec.netCashExpected.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-medium">Actual Handover</span>
                          <span className="font-bold text-emerald-700">
                            {currencySymbol} {rec.actualCashHandedOver.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-medium">Discrepancy</span>
                          <span className={`font-bold ${hasDiscrepancy ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {hasDiscrepancy ? (rec.discrepancy > 0 ? '+' : '') : ''}
                            {currencySymbol} {rec.discrepancy.toLocaleString()}
                          </span>
                        </div>

                        {/* Status / Actions */}
                        <div className="pl-4 border-l border-slate-200">
                          {rec.status === 'RECONCILED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Reconciled & Verified
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVerifyReconciliation(rec.id, 'VERIFIED')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1 font-sans shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve Handover
                              </button>
                              <button
                                onClick={() => handleVerifyReconciliation(rec.id, 'DISCREPANCY_FLAGGED')}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all font-sans"
                              >
                                Flag Discrepancy
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BANKER RISK & PERFORMANCE */}
      {activeSubTab === 'banker-risk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collectors.map((c) => {
            const assignedSavers = savers.filter((s) => s.collectorId === c.id);
            const totalCollectedToday = c.todayCollectedCash + c.todayCollectedMoMo;
            const targetPct = c.todayTarget > 0 ? Math.round((totalCollectedToday / c.todayTarget) * 100) : 100;

            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {c.collectorCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{c.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Route: {c.assignedRoute}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Physical Cash in Hand:</span>
                  <p className="text-xl font-black text-amber-700 font-mono">
                    {currencySymbol} {c.cashInHand.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Collected today on route</p>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Today's Target ({currencySymbol}{c.todayTarget.toLocaleString()}):</span>
                    <span className="font-bold text-emerald-700">{targetPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, targetPct)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600 font-medium">
                  <span>{assignedSavers.length} Savers on route</span>
                  <span>Commission: <strong className="text-emerald-700 font-mono font-bold">{currencySymbol}{c.totalCommissionEarned.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
