import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Saver, Collector, Transaction, PaymentMethod } from '../../types/index.ts';
import { StorageService } from '../../services/storageService.ts';
import { 
  X, 
  Coins, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Store, 
  ArrowUpRight, 
  Receipt, 
  ShieldCheck, 
  Sparkles,
  Printer,
  FileSpreadsheet,
  Building2,
  Globe
} from 'lucide-react';

interface SaverDetailModalProps {
  saver: Saver;
  activeCollector?: Collector | null;
  currencySymbol?: string;
  onClose: () => void;
  onStampFast: (saver: Saver) => void;
  onPayoutSuccess: (transaction: Transaction, updatedSaver: Saver) => void;
  onViewReceipt: (transaction: Transaction) => void;
}

export const SaverDetailModal: React.FC<SaverDetailModalProps> = ({
  saver,
  activeCollector,
  currencySymbol = 'GH₵',
  onClose,
  onStampFast,
  onPayoutSuccess,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'passbook' | 'history' | 'payout'>('passbook');
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('CASH');
  const [customCommission, setCustomCommission] = useState<number>(saver.dailyContribution);
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  const paidDaysCount = saver.passbook.filter((p) => p.isPaid).length;
  const isCycleCompleted = paidDaysCount >= saver.totalCycleDays;
  const grossSavings = saver.currentSavings;
  const netPayoutAmount = Math.max(0, grossSavings - customCommission);

  // Transactions related to this saver
  const saverTransactions = StorageService.getTransactions().filter((t) => t.saverId === saver.id);

  const handleProcessPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (grossSavings <= 0) {
      setPayoutError('Saver has no accumulated savings to disburse');
      return;
    }

    setIsProcessingPayout(true);
    setPayoutError('');

    try {
      const collectorId = activeCollector?.id || saver.collectorId;
      const result = StorageService.disburseCyclePayout(
        saver.id,
        collectorId,
        payoutMethod
      );

      // Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      onPayoutSuccess(result.transaction, result.updatedSaver);
    } catch (err: any) {
      setPayoutError(err.message || 'Payout failed');
      setIsProcessingPayout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Profile Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-xl shadow-xs">
                {saver.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">{saver.fullName}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-300">
                    {saver.accountNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      saver.status === 'COMPLETED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {saver.status === 'COMPLETED' ? 'Cycle Mature / Ready for Payout' : 'Active Cycle ' + saver.currentCycle}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 mt-1.5 flex-wrap font-medium">
                  <span className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    {saver.nicknameOrStall}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {saver.phone}
                  </span>
                  {saver.branchName && (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      {saver.branchName} {saver.regionName ? `(${saver.regionName})` : ''}
                    </span>
                  )}
                  <span className="text-emerald-700 font-bold">
                    {currencySymbol} {saver.dailyContribution} / day
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-200">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-500">Current Cycle Balance</p>
              <p className="text-lg font-black text-emerald-700 font-mono">
                {currencySymbol} {saver.currentSavings.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">Target: {currencySymbol} {saver.cycleTargetAmount.toLocaleString()}</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-500">Stamps Completed</p>
              <p className="text-lg font-black text-slate-900">
                {paidDaysCount} <span className="text-xs text-slate-500 font-normal">/ {saver.totalCycleDays} days</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-bold">
                {Math.round((paidDaysCount / saver.totalCycleDays) * 100)}% cycle progress
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-500">All-Time Savings</p>
              <p className="text-lg font-black text-slate-800 font-mono">
                {currencySymbol} {saver.totalAllTimeSavings.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">Registered: {saver.registeredAt}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2">
            <button
              onClick={() => setActiveTab('passbook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'passbook'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              31-Day Passbook Card
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Transaction Ledger ({saverTransactions.length})
            </button>

            <button
              onClick={() => setActiveTab('payout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'payout'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              Cycle Payout / Withdrawal
            </button>
          </div>
        </div>

        {/* Tab 1: 31-Day Passbook Card */}
        {activeTab === 'passbook' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Digital Passbook Card</h3>
                <p className="text-xs text-slate-500">
                  Each cell represents 1 day's deposit ({currencySymbol}{saver.dailyContribution})
                </p>
              </div>

              {!isCycleCompleted && (
                <button
                  onClick={() => onStampFast(saver)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Stamp Today (+{currencySymbol}{saver.dailyContribution})
                </button>
              )}
            </div>

            {/* 31 Day Grid (Microfinance Stamp Card Layout) */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2">
              {saver.passbook.map((day) => (
                <div
                  key={day.dayNumber}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[72px] ${
                    day.isPaid
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold font-mono">Day {day.dayNumber}</span>
                    {day.isPaid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    )}
                  </div>

                  <p className={`text-xs font-black font-mono my-0.5 ${day.isPaid ? 'text-emerald-800' : 'text-slate-400'}`}>
                    {currencySymbol}{day.amount}
                  </p>

                  <div className="text-[9px] text-slate-500 font-medium truncate w-full">
                    {day.isPaid ? day.date || 'Paid' : 'Unpaid'}
                  </div>
                </div>
              ))}
            </div>

            {/* Traditional Susu Commission Explainer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Traditional Susu Payout Rule</p>
                <p className="text-[11px] text-slate-600">
                  Upon completion of 31 days ({currencySymbol}{saver.cycleTargetAmount.toLocaleString()}), Day 1's deposit ({currencySymbol}{saver.dailyContribution}) is earned as the collector management fee, and the saver is disbursed {currencySymbol}{(saver.cycleTargetAmount - saver.dailyContribution).toLocaleString()}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Transaction History */}
        {activeTab === 'history' && (
          <div className="p-6 overflow-y-auto space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Deposit & Payout Ledger</h3>

            {saverTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {saverTransactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type === 'DAILY_CONTRIBUTION'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tx.type === 'DAILY_CONTRIBUTION' ? 'CONTRIBUTION' : 'PAYOUT'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">{tx.referenceNumber}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{tx.notes || 'Transaction completed'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {new Date(tx.timestamp).toLocaleString()} • {tx.paymentMethod} • {tx.collectorName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 font-mono">
                        {tx.type === 'DAILY_CONTRIBUTION' ? '+' : '-'} {currencySymbol} {tx.amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-bold"
                      >
                        <Receipt className="w-3 h-3" />
                        View Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-xl bg-slate-50">
                No transactions recorded yet for this saver.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payout / Withdrawal */}
        {activeTab === 'payout' && (
          <form onSubmit={handleProcessPayout} className="p-6 overflow-y-auto space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <Sparkles className="w-4 h-4" />
                Cycle Maturity & Withdrawal Calculator
              </div>
              <p className="text-slate-600 text-[11px]">
                Disburse saved funds to the saver. The system automatically computes the Susu management commission (defaulting to 1 day's contribution).
              </p>
            </div>

            {payoutError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {payoutError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Gross Savings in Cycle:</span>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {currencySymbol} {grossSavings.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Paid: {paidDaysCount} of {saver.totalCycleDays} days</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Susu Commission Fee ({currencySymbol}):
                </label>
                <input
                  type="number"
                  min="0"
                  max={grossSavings}
                  value={customCommission}
                  onChange={(e) => setCustomCommission(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">Standard: 1 day fee ({currencySymbol}{saver.dailyContribution})</p>
              </div>
            </div>

            {/* Net Payout Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs text-slate-600 font-medium">Net Amount to Hand to Saver:</span>
                <p className="text-2xl font-black text-emerald-800 font-mono">
                  {currencySymbol} {netPayoutAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-600">
                <p>New cycle will start</p>
                <p className="font-bold text-slate-900">Cycle {saver.currentCycle + 1}</p>
              </div>
            </div>

            {/* Payout Channel */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payout Disbursement Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayoutMethod(method)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                      payoutMethod === method
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {method.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payout Notes</label>
              <input
                type="text"
                placeholder="e.g. Disbursed cash in full at Makola Stall 4B, signed physical passbook"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="submit"
                disabled={grossSavings <= 0 || isProcessingPayout}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 ${
                  grossSavings <= 0 || isProcessingPayout
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                {isProcessingPayout ? 'Processing...' : `Disburse Payout (${currencySymbol} ${netPayoutAmount.toLocaleString()})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
