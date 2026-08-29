import React, { useState, useMemo } from 'react';
import { Transaction, Saver } from '../../types/index.ts';
import { 
  Coins, 
  Banknote, 
  Smartphone, 
  Receipt, 
  Calendar, 
  Printer, 
  Download, 
  CheckCircle2,
  TrendingUp,
  Search,
  Building2
} from 'lucide-react';

interface DailyTallyViewProps {
  transactions: Transaction[];
  savers: Saver[];
  currencySymbol?: string;
  onViewReceipt: (transaction: Transaction) => void;
}

export const DailyTallyView: React.FC<DailyTallyViewProps> = ({
  transactions,
  savers,
  currencySymbol = 'GH₵',
  onViewReceipt,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'CASH' | 'MOBILE_MONEY'>('ALL');

  // Filter transactions for selected date
  const dateTransactions = useMemo(() => {
    return transactions.filter((t) => t.timestamp.startsWith(selectedDate));
  }, [transactions, selectedDate]);

  // Daily totals
  const deposits = useMemo(() => {
    return dateTransactions.filter((t) => t.type === 'DAILY_CONTRIBUTION');
  }, [dateTransactions]);

  const payouts = useMemo(() => {
    return dateTransactions.filter((t) => t.type === 'WITHDRAWAL_PAYOUT' || t.type === 'GROUP_ROTATION_PAYOUT');
  }, [dateTransactions]);

  const totalCashCollected = useMemo(() => {
    return deposits
      .filter((t) => t.paymentMethod === 'CASH')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [deposits]);

  const totalMoMoCollected = useMemo(() => {
    return deposits
      .filter((t) => t.paymentMethod === 'MOBILE_MONEY' || t.paymentMethod === 'BANK_TRANSFER')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [deposits]);

  const totalCollected = totalCashCollected + totalMoMoCollected;

  const totalDisbursed = useMemo(() => {
    return payouts.reduce((sum, t) => sum + (t.netPayout || t.amount), 0);
  }, [payouts]);

  const netCashInHand = Math.max(0, totalCashCollected - totalDisbursed);

  // Stamped unique savers
  const uniqueSaversCount = useMemo(() => {
    const ids = new Set(deposits.map((d) => d.saverId).filter(Boolean));
    return ids.size;
  }, [deposits]);

  // Filtered transactions table
  const filteredList = useMemo(() => {
    return dateTransactions.filter((t) => {
      if (methodFilter === 'CASH' && t.paymentMethod !== 'CASH') return false;
      if (methodFilter === 'MOBILE_MONEY' && t.paymentMethod !== 'MOBILE_MONEY' && t.paymentMethod !== 'BANK_TRANSFER') return false;

      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase().trim();
      return (
        (t.saverName && t.saverName.toLowerCase().includes(q)) ||
        (t.referenceNumber && t.referenceNumber.toLowerCase().includes(q)) ||
        (t.momoReference && t.momoReference.toLowerCase().includes(q)) ||
        (t.saverAccountNumber && t.saverAccountNumber.toLowerCase().includes(q))
      );
    });
  }, [dateTransactions, searchFilter, methodFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Daily Operations Ledger
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Daily Cash & Collection Tally</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical cash counts, Mobile Money reconciliations, and daily transactions summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-900 focus:outline-none font-mono font-bold"
            />
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Daily Sheet
          </button>
        </div>
      </div>

      {/* Daily Numbers KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Collected</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-2">
            {currencySymbol} {totalCollected.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">
            {deposits.length} deposit transactions ({uniqueSaversCount} unique savers)
          </p>
        </div>

        {/* Physical Cash */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Physical Cash</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono mt-2">
            {currencySymbol} {totalCashCollected.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            Physical currency received today
          </p>
        </div>

        {/* Mobile Money */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Mobile Money / Bank</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-700 font-mono mt-2">
            {currencySymbol} {totalMoMoCollected.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            MTN / Telecel / AT / Bank transfers
          </p>
        </div>

        {/* Cycle Payouts Disbursed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Disbursed Today</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 font-mono mt-2">
            {currencySymbol} {totalDisbursed.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            {payouts.length} mature payout(s) completed
          </p>
        </div>
      </div>

      {/* Transactions Detail List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Transactions Ledger</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredList.length} transaction(s) for {selectedDate}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tx, client, ref..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setMethodFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  methodFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setMethodFilter('CASH')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  methodFilter === 'CASH' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Cash
              </button>
              <button
                onClick={() => setMethodFilter('MOBILE_MONEY')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  methodFilter === 'MOBILE_MONEY' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                MoMo
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Client / Saver</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center no-print">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((tx) => {
                  const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const isDeposit = tx.type === 'DAILY_CONTRIBUTION';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors font-mono">
                      <td className="px-4 py-3 font-sans text-slate-500">{timeStr}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{tx.referenceNumber}</td>
                      <td className="px-4 py-3 font-sans">
                        <p className="font-bold text-slate-900">{tx.saverName || 'Group Payout'}</p>
                        {tx.saverAccountNumber && (
                          <p className="text-[10px] text-slate-400 font-mono">{tx.saverAccountNumber}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        {isDeposit ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Daily Contribution
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Payout Disbursement
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          {tx.paymentMethod === 'CASH' && <Banknote className="w-3 h-3 text-emerald-600" />}
                          {tx.paymentMethod === 'MOBILE_MONEY' && <Smartphone className="w-3 h-3 text-sky-600" />}
                          {tx.paymentMethod === 'BANK_TRANSFER' && <Building2 className="w-3 h-3 text-slate-600" />}
                          {tx.paymentMethod}
                        </span>
                        {tx.momoReference && (
                          <span className="block text-[10px] text-slate-400 font-mono">{tx.momoReference}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className={isDeposit ? 'text-emerald-700' : 'text-purple-700'}>
                          {isDeposit ? '+' : '-'}{currencySymbol} {(tx.netPayout || tx.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-sans font-semibold transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400 font-sans">
                    No transactions recorded on {selectedDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
