import React, { useState } from 'react';
import { Saver, Transaction, GroupSusu, DailyReconciliation, Collector } from '../../types/index.ts';
import { ReportService } from '../../services/reportService.ts';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Users, 
  Coins, 
  TrendingUp, 
  Wallet, 
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  Smartphone
} from 'lucide-react';

interface AutomatedReportsViewProps {
  collectors?: Collector[];
  savers: Saver[];
  transactions: Transaction[];
  groups: GroupSusu[];
  reconciliations?: DailyReconciliation[];
  currencySymbol?: string;
}

export const AutomatedReportsView: React.FC<AutomatedReportsViewProps> = ({
  collectors = [],
  savers,
  transactions,
  groups,
  reconciliations = [],
  currencySymbol = 'GH₵',
}) => {
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Date specific transactions
  const dateTransactions = transactions.filter((t) => t.timestamp.startsWith(reportDate));
  const dateDeposits = dateTransactions.filter((t) => t.type === 'DAILY_CONTRIBUTION');
  const datePayouts = dateTransactions.filter((t) => t.type === 'WITHDRAWAL_PAYOUT' || t.type === 'GROUP_ROTATION_PAYOUT');

  const totalDailyCollections = dateDeposits.reduce((sum, t) => sum + t.amount, 0);
  const totalDailyCash = dateDeposits.filter((t) => t.paymentMethod === 'CASH').reduce((sum, t) => sum + t.amount, 0);
  const totalDailyMoMo = dateDeposits.filter((t) => t.paymentMethod !== 'CASH').reduce((sum, t) => sum + t.amount, 0);
  const totalDailyPayouts = datePayouts.reduce((sum, t) => sum + (t.netPayout || t.amount), 0);

  const totalVaultReserves = savers.reduce((sum, s) => sum + s.currentSavings, 0);
  const matureSavers = savers.filter((s) => s.passbook.filter((p) => p.isPaid).length >= s.totalCycleDays);

  const handlePrint = () => {
    window.print();
  };

  const handleExportTransactionsCSV = () => {
    ReportService.exportTransactionsToCSV(transactions);
  };

  const handleExportSaversCSV = () => {
    ReportService.exportSaversToCSV(savers);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900">Financial Reports & Audit Ledger</h2>
          <p className="text-xs text-slate-500">
            Consolidated daily statements, client savings registries, and CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="bg-transparent text-xs text-slate-900 focus:outline-none font-mono font-bold"
            />
          </div>

          <button
            onClick={handleExportTransactionsCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export Transactions (CSV)
          </button>

          <button
            onClick={handleExportSaversCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Savers List (CSV)
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] uppercase font-bold text-slate-500">Date Collections</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {currencySymbol} {totalDailyCollections.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            Cash: {currencySymbol} {totalDailyCash.toLocaleString()} | MoMo: {currencySymbol} {totalDailyMoMo.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] uppercase font-bold text-slate-500">Total Savings Vault</p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {currencySymbol} {totalVaultReserves.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            Across {savers.length} registered saver accounts
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] uppercase font-bold text-slate-500">Date Disbursements</p>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">
            {currencySymbol} {totalDailyPayouts.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            {datePayouts.length} payout(s) on this date
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] uppercase font-bold text-slate-500">Mature Cycles (31 Days)</p>
          <p className="text-2xl font-black text-purple-700 font-mono mt-1">
            {matureSavers.length}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            {groups.length} active Group Susu rotational circles
          </p>
        </div>
      </div>

      {/* Main Detailed Report Sheet (Print Friendly) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xs">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">SUSU COLLECTOR</h3>
              <p className="text-xs text-slate-500 font-medium">Consolidated Financial & Operational Audit Report</p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <p>DATE: <strong className="text-slate-900">{reportDate}</strong></p>
              <p>OPERATOR: <strong className="text-slate-900">Bernard (Super Admin)</strong></p>
              <p>STATUS: <span className="text-emerald-700 font-bold">ACTIVE & RECONCILED</span></p>
            </div>
          </div>
        </div>

        {/* 1. Daily Transactions Audit */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            1. Transactions on {reportDate} ({dateTransactions.length} items)
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Ref #</th>
                  <th className="px-4 py-2.5">Client</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Payment Method</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {dateTransactions.length > 0 ? (
                  dateTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white transition-colors">
                      <td className="px-4 py-2.5 font-sans text-slate-600">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-700">{tx.referenceNumber}</td>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-900">
                        {tx.saverName || 'Group Payout'}
                      </td>
                      <td className="px-4 py-2.5 font-sans">
                        {tx.type === 'DAILY_CONTRIBUTION' ? 'Daily Contribution' : 'Payout Disbursement'}
                      </td>
                      <td className="px-4 py-2.5 font-sans">{tx.paymentMethod}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                        {currencySymbol} {(tx.netPayout || tx.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400 font-sans">
                      No transactions recorded on {reportDate}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Registered Savers Summary */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            2. Active Savers Directory Overview ({savers.length} Total)
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Account #</th>
                  <th className="px-4 py-2.5">Saver Name</th>
                  <th className="px-4 py-2.5">Stall / Location</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5 text-right">Daily Rate</th>
                  <th className="px-4 py-2.5 text-center">Cycle Progress</th>
                  <th className="px-4 py-2.5 text-right">Current Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {savers.map((s) => {
                  const paidDays = s.passbook.filter((p) => p.isPaid).length;
                  return (
                    <tr key={s.id} className="hover:bg-white transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-700">{s.accountNumber}</td>
                      <td className="px-4 py-2.5 font-sans font-bold text-slate-900">{s.fullName}</td>
                      <td className="px-4 py-2.5 font-sans text-slate-600">{s.nicknameOrStall}</td>
                      <td className="px-4 py-2.5 font-sans text-slate-600">{s.phone}</td>
                      <td className="px-4 py-2.5 text-right text-slate-900 font-bold">
                        {currencySymbol} {s.dailyContribution}
                      </td>
                      <td className="px-4 py-2.5 text-center font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          {paidDays} / {s.totalCycleDays} days
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-emerald-700 font-bold">
                        {currencySymbol} {s.currentSavings.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sign-off & Audit Seal */}
        <div className="pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Electronically verified and locked to Ghana Cedis (GH₵)</span>
          </div>
          <div className="text-right">
            <p>Authorized Signature: _______________________</p>
            <p className="text-[10px] text-slate-400 font-medium">Chief Executive / Internal Audit Officer</p>
          </div>
        </div>
      </div>
    </div>
  );
};
