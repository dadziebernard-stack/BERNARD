import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storageService.ts';
import { Saver, Collector, PaymentMethod, Transaction } from '../../types/index.ts';
import { Coins, X, Search, Check, Smartphone, Banknote, Building2, User, ArrowRight } from 'lucide-react';

interface RecordDepositModalProps {
  savers: Saver[];
  preSelectedSaver?: Saver | null;
  activeCollector?: Collector | null;
  currencySymbol?: string;
  onClose: () => void;
  onSuccess: (transaction: Transaction, updatedSaver: Saver) => void;
}

export const RecordDepositModal: React.FC<RecordDepositModalProps> = ({
  savers,
  preSelectedSaver,
  activeCollector,
  currencySymbol = 'GH₵',
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSaver, setSelectedSaver] = useState<Saver | null>(preSelectedSaver || null);
  const [daysCount, setDaysCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [momoReference, setMomoReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preSelectedSaver) {
      setSelectedSaver(preSelectedSaver);
    }
  }, [preSelectedSaver]);

  // Filtered savers for search dropdown
  const filteredSavers = savers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.nicknameOrStall.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.accountNumber.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const dailyRate = selectedSaver?.dailyContribution || 50;
  const totalDepositAmount = dailyRate * daysCount;
  const currentPaidDays = selectedSaver?.passbook.filter((p) => p.isPaid).length || 0;
  const remainingDaysInCycle = (selectedSaver?.totalCycleDays || 31) - currentPaidDays;

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaver) {
      setError('Please select a saver account');
      return;
    }
    if (daysCount <= 0) {
      setError('Please choose at least 1 day to stamp');
      return;
    }
    if (daysCount > remainingDaysInCycle) {
      setError(`Cannot stamp more than ${remainingDaysInCycle} remaining days in this cycle`);
      return;
    }
    if (paymentMethod === 'MOBILE_MONEY' && !momoReference.trim()) {
      setError('Please enter the Mobile Money transaction reference / SMS ID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const collectorId = activeCollector?.id || selectedSaver.collectorId;
      const result = StorageService.recordDeposit({
        saverId: selectedSaver.id,
        numberOfDaysToStamp: daysCount,
        paymentMethod,
        collectorId,
        notes: notes.trim() || undefined,
        momoReference: momoReference.trim() || undefined,
      });

      // Fire celebratory micro-confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#047857', '#34d399', '#f59e0b'],
        });
      } catch (e) {
        // Safe fallback
      }

      onSuccess(result.transaction, result.updatedSaver);
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record Daily Contribution</h2>
              <p className="text-xs text-slate-500">Stamp passbook & generate instant digital receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleDeposit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* 1. Saver Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Saver
            </label>

            {!selectedSaver ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by Name, Stall (e.g. 4B), Phone or Account #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs transition-colors"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {filteredSavers.length > 0 ? (
                    filteredSavers.map((saver) => {
                      const paid = saver.passbook.filter((p) => p.isPaid).length;
                      return (
                        <div
                          key={saver.id}
                          onClick={() => setSelectedSaver(saver)}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                              {saver.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{saver.fullName}</p>
                              <p className="text-[11px] text-slate-500">{saver.nicknameOrStall} • {saver.accountNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-700">{currencySymbol} {saver.dailyContribution}/day</p>
                            <p className="text-[10px] text-slate-500">Day {paid} of {saver.totalCycleDays}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No savers found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Selected Saver Card */
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-300 rounded-xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-sm">
                    {selectedSaver.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{selectedSaver.fullName}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-semibold">
                        {selectedSaver.accountNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{selectedSaver.nicknameOrStall}</p>
                    <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                      Progress: {currentPaidDays} of {selectedSaver.totalCycleDays} days paid ({currencySymbol} {selectedSaver.currentSavings} saved)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSaver(null)}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* 2. Days Count to Stamp */}
          {selectedSaver && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Number of Days to Stamp
              </label>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={num > remainingDaysInCycle}
                    onClick={() => setDaysCount(num)}
                    className={`py-2 px-1 text-center rounded-xl font-bold text-xs border transition-all ${
                      daysCount === num
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : num > remainingDaysInCycle
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    +{num} {num === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>

              {/* Passbook Visual Stamp Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Next Stamps to be Applied:</span>
                  <span className="font-bold text-emerald-700">
                    Day(s) {Array.from({ length: daysCount }, (_, i) => currentPaidDays + i + 1).join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: Math.min(31, selectedSaver.totalCycleDays) }, (_, i) => {
                    const dayNum = i + 1;
                    const isAlreadyPaid = dayNum <= currentPaidDays;
                    const isNewStamp = dayNum > currentPaidDays && dayNum <= currentPaidDays + daysCount;
                    return (
                      <span
                        key={dayNum}
                        className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${
                          isAlreadyPaid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isNewStamp
                            ? 'bg-amber-400 text-slate-900 font-extrabold ring-2 ring-amber-500 shadow-2xs'
                            : 'bg-white text-slate-400 border border-slate-200'
                        }`}
                      >
                        {dayNum}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. Payment Method */}
          {selectedSaver && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Physical Cash
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MOBILE_MONEY')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    paymentMethod === 'MOBILE_MONEY'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  Mobile Money
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-600" />
                  Bank Transfer
                </button>
              </div>

              {paymentMethod === 'MOBILE_MONEY' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MoMo Transaction ID / Reference <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MM-MTN-88492019"
                    value={momoReference}
                    onChange={(e) => setMomoReference(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* Deposit Summary & Action */}
          {selectedSaver && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                <span>Calculation ({daysCount} day(s) × {currencySymbol}{dailyRate}):</span>
                <span className="font-mono text-slate-800 font-bold">{currencySymbol} {totalDepositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 border-t border-emerald-200 pt-2">
                <span>Total Amount to Collect:</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {currencySymbol} {totalDepositAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSaver || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 ${
                !selectedSaver || isSubmitting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
              }`}
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : `Confirm & Issue Receipt (${currencySymbol} ${totalDepositAmount})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
