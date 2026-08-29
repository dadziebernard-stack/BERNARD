import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService.ts';
import { Collector, Saver, DistrictBranch } from '../../types/index.ts';
import { UserPlus, X, Store, Phone, Shield, Coins, Calendar, Building2, Sparkles, Hash, RotateCcw } from 'lucide-react';

interface SaverRegistrationModalProps {
  collectors?: Collector[];
  defaultCollectorId?: string;
  currencySymbol?: string;
  onClose: () => void;
  onSuccess: (newSaver: Saver) => void;
}

export const SaverRegistrationModal: React.FC<SaverRegistrationModalProps> = ({
  currencySymbol = 'GH₵',
  onClose,
  onSuccess,
}) => {
  const branches = StorageService.getBranches();
  const activeSession = StorageService.getActiveSession();
  
  // Default to active session branch if available, else first branch
  const initialBranchId = activeSession?.branchId || (branches.length > 0 ? branches[0].id : '');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId);

  // Manual or Auto Account Number
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [nicknameOrStall, setNicknameOrStall] = useState('');
  const [phone, setPhone] = useState('+233 ');
  const [nationalId, setNationalId] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [dailyContribution, setDailyContribution] = useState<number>(50);
  const [cycleType, setCycleType] = useState<'DAILY_31' | 'DAILY_30' | 'WEEKLY_12'>('DAILY_31');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Auto-generate suggested account number
  const handleAutoGenerateId = () => {
    const generated = StorageService.generateSuggestedAccountNumber(selectedBranchId);
    setAccountNumber(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter saver full name');
      return;
    }
    if (!nicknameOrStall.trim()) {
      setError('Please enter market stall number or nickname');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }
    if (dailyContribution <= 0) {
      setError('Daily contribution must be greater than 0');
      return;
    }

    const selectedBranch = branches.find((b) => b.id === selectedBranchId);

    try {
      const newSaver = StorageService.createSaver({
        accountNumber: accountNumber.trim() || undefined,
        fullName: fullName.trim(),
        nicknameOrStall: nicknameOrStall.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim() || undefined,
        nextOfKinName: nextOfKinName.trim() || undefined,
        nextOfKinPhone: nextOfKinPhone.trim() || undefined,
        collectorId: 'col-admin',
        branchId: selectedBranch ? selectedBranch.id : undefined,
        branchName: selectedBranch ? selectedBranch.name : undefined,
        regionName: selectedBranch ? selectedBranch.regionName : undefined,
        dailyContribution: Number(dailyContribution),
        cycleType,
        note: note.trim() || undefined,
      });

      onSuccess(newSaver);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create saver account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Saver Account</h2>
              <p className="text-xs text-slate-500">Register new client for daily micro-savings cycle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Section: Account Number (Manual or Auto-Generated) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                Account Number
                <span className="text-[11px] font-normal text-slate-500">(Optional / Manual ID)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoGenerateId}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Auto-Generate
                </button>
                {accountNumber && (
                  <button
                    type="button"
                    onClick={() => setAccountNumber('')}
                    className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 rounded hover:bg-slate-200 inline-flex items-center gap-0.5"
                    title="Clear to auto-generate on submit"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                placeholder="Leave blank for system auto-generation (e.g. SAV-2026-1049)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              💡 {accountNumber ? (
                <span className="text-emerald-700 font-semibold">Custom account number set: {accountNumber}</span>
              ) : (
                <span>Leave empty and the system will automatically assign a unique account code on submit.</span>
              )}
            </p>
          </div>

          {/* Section: Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Identity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theresa Mensah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stall / Shop Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stall 4B Fabric Lane"
                    value={nicknameOrStall}
                    onChange={(e) => setNicknameOrStall(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+233 24 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  National ID (Ghana Card / NIN)
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. GHA-789012345-1"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: District Branch & Jurisdiction */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              District Branch & Region
            </h4>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Assigned District Branch <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                >
                  {branches.length === 0 ? (
                    <option value="">No branches registered yet</option>
                  ) : (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code}) — {b.regionName} ({b.district})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Determines the regional territory and branch office managing this account.
              </p>
            </div>
          </div>

          {/* Section: Susu Plan & Daily Rate */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Savings Plan & Contribution</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daily Contribution ({currencySymbol}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={dailyContribution}
                    onChange={(e) => setDailyContribution(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cycle Type
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={cycleType}
                    onChange={(e) => setCycleType(e.target.value as any)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  >
                    <option value="DAILY_31">31-Day Standard Monthly Susu</option>
                    <option value="DAILY_30">30-Day Monthly Susu</option>
                    <option value="WEEKLY_12">12-Week Quarterly Plan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Target Calculation Preview */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Total 31-Day Cycle Target:</span>
              <span className="font-black text-emerald-800 text-sm">
                {currencySymbol} {(dailyContribution * (cycleType === 'WEEKLY_12' ? 12 : 31)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Section: Next of Kin */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Next of Kin (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Next of Kin Name</label>
                <input
                  type="text"
                  placeholder="e.g. Daniel Mensah (Son)"
                  value={nextOfKinName}
                  onChange={(e) => setNextOfKinName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Next of Kin Phone</label>
                <input
                  type="tel"
                  placeholder="+233 20 000 0000"
                  value={nextOfKinPhone}
                  onChange={(e) => setNextOfKinPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Trade Details</label>
              <textarea
                rows={2}
                placeholder="e.g. Sells Dutch wax prints on Lane 3, saves daily morning."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none shadow-2xs"
              ></textarea>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Open Saver Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

