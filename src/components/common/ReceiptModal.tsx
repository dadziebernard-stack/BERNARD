import React, { useRef } from 'react';
import { Transaction, Saver } from '../../types/index.ts';
import { Printer, Share2, CheckCircle2, X, ShieldCheck, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  saver?: Saver | null;
  currencySymbol?: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  saver,
  currencySymbol = 'GHS ₵',
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*SUSU COLLECTOR RECEIPT*\n` +
      `Ref: ${transaction.referenceNumber}\n` +
      `Date: ${new Date(transaction.timestamp).toLocaleString()}\n` +
      `Saver: ${transaction.saverName || saver?.fullName} (${transaction.saverAccountNumber || saver?.accountNumber})\n` +
      `Amount: ${currencySymbol} ${transaction.amount.toLocaleString()}\n` +
      `Type: ${transaction.type.replace(/_/g, ' ')}\n` +
      `Stamped: ${transaction.stampedDays?.join(', ') || 'N/A'}\n` +
      `Collector: ${transaction.collectorName} (${transaction.collectorCode})\n` +
      `Branch: ${transaction.branchName}\n` +
      `Current Balance: ${currencySymbol} ${(saver?.currentSavings || transaction.amount).toLocaleString()}\n` +
      `_Thank you for saving with Susu Collector!_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in no-print-bg">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-sm font-bold text-slate-800">Digital Susu Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Area */}
        <div className="p-6 overflow-y-auto printable-receipt bg-white text-slate-900 font-mono text-xs selection:bg-slate-200">
          <div ref={receiptRef} className="space-y-4">
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-base font-extrabold tracking-wider uppercase text-slate-900">SUSU COLLECTOR</h2>
              <p className="text-[11px] font-medium text-slate-600">Daily Micro-Savings & Oversight</p>
              <p className="text-[10px] text-slate-500">{transaction.branchName}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] font-semibold text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                VERIFIED TRANSACTION
              </div>
            </div>

            {/* Reference & Time */}
            <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div>
                <span className="text-slate-500 block text-[10px]">TX REF:</span>
                <span className="font-bold text-slate-800">{transaction.referenceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">DATE / TIME:</span>
                <span className="text-slate-700">{new Date(transaction.timestamp).toLocaleDateString()} {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Saver Info */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Saver:</span>
                <span className="font-bold text-slate-900">{transaction.saverName || saver?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account No:</span>
                <span className="font-bold text-slate-800">{transaction.saverAccountNumber || saver?.accountNumber}</span>
              </div>
              {saver?.nicknameOrStall && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Stall/Location:</span>
                  <span className="text-slate-700">{saver.nicknameOrStall}</span>
                </div>
              )}
            </div>

            {/* Deposit / Payout Details */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3 text-[11px]">
              <div className="flex justify-between items-center text-sm font-bold pt-1">
                <span className="text-slate-800">
                  {transaction.type === 'DAILY_CONTRIBUTION'
                    ? 'AMOUNT COLLECTED:'
                    : transaction.type === 'WITHDRAWAL_PAYOUT'
                    ? 'CYCLE PAYOUT AMOUNT:'
                    : 'PAYOUT AMOUNT:'}
                </span>
                <span className="text-base text-emerald-700">
                  {currencySymbol} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {transaction.commissionDeducted !== undefined && transaction.commissionDeducted > 0 && (
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>Susu Management Fee (1 Day):</span>
                  <span>- {currencySymbol} {transaction.commissionDeducted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {transaction.netPayout !== undefined && transaction.netPayout > 0 && (
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Net Disbursed to Saver:</span>
                  <span>{currencySymbol} {transaction.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Payment Channel:</span>
                <span className="font-semibold text-slate-800">{transaction.paymentMethod}</span>
              </div>

              {transaction.momoReference && (
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>MoMo Ref:</span>
                  <span>{transaction.momoReference}</span>
                </div>
              )}

              {transaction.stampedDays && transaction.stampedDays.length > 0 && (
                <div className="flex justify-between text-slate-700 pt-1">
                  <span>Passbook Days Stamped:</span>
                  <span className="font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                    Day(s) {transaction.stampedDays.join(', ')} of 31
                  </span>
                </div>
              )}
            </div>

            {/* Saver Savings Balance Summary */}
            {saver && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] space-y-1">
                <div className="flex justify-between text-emerald-950 font-bold">
                  <span>Current Cycle Balance:</span>
                  <span>{currencySymbol} {saver.currentSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-800">
                  <span>Cycle Target (31 Days):</span>
                  <span>{currencySymbol} {saver.cycleTargetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (saver.currentSavings / saver.cycleTargetAmount) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Collector & Officer info */}
            <div className="text-[10px] text-slate-600 space-y-0.5 pt-1">
              <div className="flex justify-between">
                <span>Field Banker:</span>
                <span className="font-semibold text-slate-800">{transaction.collectorName} ({transaction.collectorCode})</span>
              </div>
              {transaction.notes && (
                <p className="italic text-slate-500 pt-1">Note: {transaction.notes}</p>
              )}
            </div>

            {/* Footer QR Code and instructions */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-2">
              <div className="flex justify-center">
                <div className="p-1.5 border border-slate-300 rounded bg-white inline-block">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
              </div>
              <p className="text-[9px] text-slate-500 uppercase tracking-tight">
                Authentic electronic passbook entry. Keep this receipt safe.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Screen Only) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 no-print">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            {copied ? 'Copied to Clipboard!' : 'Copy for SMS / WhatsApp'}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
};
