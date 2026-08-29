import React, { useState } from 'react';
import { Collector, Transaction, Saver } from '../../types/index.ts';
import { ReportService } from '../../services/reportService.ts';
import { StorageService } from '../../services/storageService.ts';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Banknote, 
  Smartphone, 
  Coins, 
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';

interface CollectorReportsProps {
  collector: Collector;
  transactions: Transaction[];
  savers: Saver[];
  currencySymbol?: string;
}

export const CollectorReports: React.FC<CollectorReportsProps> = ({
  collector,
  transactions,
  savers,
  currencySymbol = 'GH₵',
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actualCashHandover, setActualCashHandover] = useState<number>(collector.cashInHand);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverSuccess, setHandoverSuccess] = useState(false);
  const [handoverError, setHandoverError] = useState('');

  const report = ReportService.generateCollectorDailyReport(
    collector,
    transactions,
    savers,
    selectedDate
  );

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      StorageService.submitReconciliation(collector.id, actualCashHandover, handoverNotes);
      setHandoverSuccess(true);
      setHandoverError('');
      setTimeout(() => setHandoverSuccess(false), 5000);
    } catch (err: any) {
      setHandoverError(err.message || 'Failed to submit reconciliation');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    ReportService.exportTransactionsToCSV(report.transactions);
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Daily Tally & Collector Reports</h2>
          <p className="text-xs text-slate-500">
            Real-time daily collection ledger, commissions, and reconciliation for {collector.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
          />

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Tally Sheet
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-500">Total Collected Today</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-1">
                {currencySymbol} {report.totalCollections.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Target: {currencySymbol} {collector.todayTarget.toLocaleString()} ({report.targetAchievementRate}%)
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-500">Physical Cash in Hand</p>
              <h3 className="text-2xl font-black text-amber-600 font-mono mt-1">
                {currencySymbol} {collector.cashInHand.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Ready for handover</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-500">Digital / Mobile Money</p>
              <h3 className="text-2xl font-black text-sky-600 font-mono mt-1">
                {currencySymbol} {report.totalMoMoCollected.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Direct to company account</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-500">Collector Commission</p>
              <h3 className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {currencySymbol} {report.commissionEarnedToday.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                All-time: {currencySymbol} {collector.totalCommissionEarned.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Tally Sheet and End-of-Day Handover */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tally Sheet Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daily Field Tally Sheet ({selectedDate})</h3>
                <p className="text-xs text-slate-500">
                  {report.saversStampedCount} Savers stamped • {report.totalTransactionsCount} total entries
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-semibold">
                Route: {collector.assignedRoute}
              </span>
            </div>

            {report.transactions.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {report.transactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type === 'DAILY_CONTRIBUTION'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tx.type === 'DAILY_CONTRIBUTION' ? 'STAMP' : 'PAYOUT'}
                        </span>
                        <span className="font-bold text-slate-900">{tx.saverName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({tx.saverAccountNumber})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {tx.notes || (tx.stampedDays ? `Day(s) ${tx.stampedDays.join(', ')} of 31 stamped` : 'Deposit recorded')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Channel: {tx.paymentMethod} {tx.momoReference && `[${tx.momoReference}]`}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <p className="font-extrabold text-slate-900 text-sm">
                        {tx.type === 'DAILY_CONTRIBUTION' ? '+' : '-'} {currencySymbol} {tx.amount.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-sans font-bold">
                        Ref: {tx.referenceNumber.slice(-8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-xl bg-slate-50">
                No collections recorded yet for {selectedDate}.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: End of Day Cash Handover & Reconciliation */}
        <div className="space-y-4 no-print">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Banknote className="w-4 h-4 text-emerald-600" />
              Cash-in-Hand Handover
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              At the close of field duty, count your physical cash and submit your daily handover for reconciliation.
            </p>

            {handoverSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Handover submitted successfully! Reconciliation record updated.</span>
              </div>
            )}

            {handoverError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{handoverError}</span>
              </div>
            )}

            <form onSubmit={handleHandoverSubmit} className="space-y-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Expected Cash in Hand:</span>
                <p className="text-xl font-black text-slate-900 font-mono">
                  {currencySymbol} {collector.cashInHand.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">Calculated from completed cash stamps</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Actual Physical Cash Handed Over ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={actualCashHandover}
                  onChange={(e) => setActualCashHandover(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              {actualCashHandover !== collector.cashInHand && (
                <div className={`p-2.5 rounded-xl border text-xs font-semibold ${
                  actualCashHandover < collector.cashInHand
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  Variance / Discrepancy: {currencySymbol} {(actualCashHandover - collector.cashInHand).toLocaleString()}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Handover Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handed over evening cash to Admin."
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none shadow-2xs"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={collector.cashInHand === 0 && actualCashHandover === 0}
                className={`w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                  collector.cashInHand === 0 && actualCashHandover === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Handover & Reconcile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
