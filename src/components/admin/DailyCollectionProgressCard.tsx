import React, { useState, useEffect } from 'react';
import { Saver, Transaction, DistrictBranch, AuthSession } from '../../types/index.ts';
import { StorageService } from '../../services/storageService.ts';
import { 
  Target, 
  TrendingUp, 
  Coins, 
  Banknote, 
  Smartphone, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Save, 
  X, 
  ChevronDown, 
  Award, 
  Zap, 
  Users, 
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';

interface DailyCollectionProgressCardProps {
  savers: Saver[];
  transactions: Transaction[];
  branches?: DistrictBranch[];
  currencySymbol?: string;
  authSession?: AuthSession | null;
  onNavigateTab?: (tab: string) => void;
}

export const DailyCollectionProgressCard: React.FC<DailyCollectionProgressCardProps> = ({
  savers,
  transactions,
  branches: initialBranches,
  currencySymbol = 'GH₵',
  authSession,
  onNavigateTab,
}) => {
  const [branches, setBranches] = useState<DistrictBranch[]>(() => {
    return initialBranches && initialBranches.length > 0
      ? initialBranches
      : StorageService.getBranches();
  });

  // Default selected branch: If user is logged in as DISTRICT_BRANCH, default to their branch
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (authSession?.level === 'DISTRICT_BRANCH' && authSession.branchId) {
      return authSession.branchId;
    }
    return 'ALL';
  });

  // Goal configuration state
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>('');
  const [activeGoal, setActiveGoal] = useState<number>(() => {
    return selectedBranchId === 'ALL'
      ? StorageService.getOverallDailyGoal()
      : StorageService.getBranchDailyGoal(selectedBranchId);
  });
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Sync branches on storage update
  useEffect(() => {
    const update = () => {
      const freshBranches = StorageService.getBranches();
      setBranches(freshBranches);
      if (selectedBranchId === 'ALL') {
        setActiveGoal(StorageService.getOverallDailyGoal());
      } else {
        setActiveGoal(StorageService.getBranchDailyGoal(selectedBranchId));
      }
    };
    const unsub = StorageService.subscribe(update);
    return () => unsub();
  }, [selectedBranchId]);

  // Update active goal when selectedBranchId changes
  useEffect(() => {
    if (selectedBranchId === 'ALL') {
      const goal = StorageService.getOverallDailyGoal();
      setActiveGoal(goal);
      setGoalInput(goal.toString());
    } else {
      const goal = StorageService.getBranchDailyGoal(selectedBranchId);
      setActiveGoal(goal);
      setGoalInput(goal.toString());
    }
    setIsEditingGoal(false);
  }, [selectedBranchId]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to map saver branch IDs for transactions without explicit branchId
  const saverBranchMap = React.useMemo(() => {
    const map = new Map<string, string>();
    savers.forEach((s) => {
      if (s.branchId) map.set(s.id, s.branchId);
    });
    return map;
  }, [savers]);

  // Filter today's contribution transactions for selected branch
  const todayTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      if (!t.timestamp.startsWith(todayStr) || t.type !== 'DAILY_CONTRIBUTION') {
        return false;
      }
      if (selectedBranchId === 'ALL') return true;

      // Match branch
      const txBranchId = t.branchId || (t.saverId ? saverBranchMap.get(t.saverId) : undefined);
      return txBranchId === selectedBranchId;
    });
  }, [transactions, todayStr, selectedBranchId, saverBranchMap]);

  // Filter savers for selected branch
  const branchSavers = React.useMemo(() => {
    if (selectedBranchId === 'ALL') return savers;
    return savers.filter((s) => s.branchId === selectedBranchId);
  }, [savers, selectedBranchId]);

  const saversPaidToday = React.useMemo(() => {
    return branchSavers.filter((s) => s.lastDepositDate === todayStr);
  }, [branchSavers, todayStr]);

  // Aggregate collected amounts
  const totalCollectedToday = React.useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const cashCollectedToday = React.useMemo(() => {
    return todayTransactions
      .filter((t) => t.paymentMethod === 'CASH')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const momoCollectedToday = React.useMemo(() => {
    return todayTransactions
      .filter((t) => t.paymentMethod === 'MOBILE_MONEY' || t.paymentMethod === 'BANK_TRANSFER')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  // Progress Calculations
  const percentageAchieved = activeGoal > 0 ? (totalCollectedToday / activeGoal) * 100 : 0;
  const clampedPercentage = Math.min(percentageAchieved, 100);
  const remainingAmount = Math.max(0, activeGoal - totalCollectedToday);
  const isGoalReached = totalCollectedToday >= activeGoal && activeGoal > 0;
  const surplusAmount = Math.max(0, totalCollectedToday - activeGoal);

  // Cash vs MoMo ratio of collected
  const cashRatio = totalCollectedToday > 0 ? (cashCollectedToday / totalCollectedToday) * 100 : 0;
  const momoRatio = totalCollectedToday > 0 ? (momoCollectedToday / totalCollectedToday) * 100 : 0;

  // Selected Branch Object
  const selectedBranchObj = branches.find((b) => b.id === selectedBranchId);

  // Handle Goal Save
  const handleSaveGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(goalInput);
    if (isNaN(parsed) || parsed < 50) {
      alert('Please enter a valid daily collection goal of at least GH₵ 50');
      return;
    }

    if (selectedBranchId === 'ALL') {
      StorageService.setOverallDailyGoal(parsed);
      setActiveGoal(parsed);
      setShowNotification(`Updated Combined Network Goal to ${currencySymbol} ${parsed.toLocaleString()}`);
    } else {
      StorageService.setBranchDailyGoal(selectedBranchId, parsed);
      setActiveGoal(parsed);
      setShowNotification(`Updated ${selectedBranchObj?.name || 'Branch'} Goal to ${currencySymbol} ${parsed.toLocaleString()}`);
    }

    setIsEditingGoal(false);
    setTimeout(() => setShowNotification(null), 3500);
  };

  const handlePresetGoal = (amount: number) => {
    setGoalInput(amount.toString());
  };

  // Status & Pace classification
  let paceStatus = {
    label: 'Morning Kickoff',
    color: 'text-sky-700 bg-sky-50 border-sky-200',
    description: 'Collections underway across morning market sessions',
  };

  if (isGoalReached) {
    paceStatus = {
      label: 'Goal Achieved 🎉',
      color: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      description: surplusAmount > 0 ? `Exceeded target by ${currencySymbol} ${surplusAmount.toLocaleString()}` : '100% Target Met',
    };
  } else if (percentageAchieved >= 75) {
    paceStatus = {
      label: 'Strong Pace 🚀',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'On track to meet or exceed full daily quota',
    };
  } else if (percentageAchieved >= 40) {
    paceStatus = {
      label: 'Steady Progress ⚡',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Midday collection round actively pacing',
    };
  } else if (percentageAchieved > 0) {
    paceStatus = {
      label: 'In Progress ⏳',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      description: 'Early collections recorded today',
    };
  } else {
    paceStatus = {
      label: 'Awaiting Contributions',
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      description: 'No deposits recorded yet for this branch today',
    };
  }

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden transition-all">
      {/* Toast Notification */}
      {showNotification && (
        <div className="bg-emerald-800 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fade-in border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{showNotification}</span>
          </div>
          <button onClick={() => setShowNotification(null)} className="text-emerald-200 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar with Branch Selector and Goal Configuration */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-2xs shrink-0 mt-0.5">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">Daily Collection Progress</h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${paceStatus.color}`}>
                  {paceStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Current daily contributions tracked against configurable branch target quotas
              </p>
            </div>
          </div>

          {/* Branch Dropdown & Goal Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:self-center">
            {/* Branch Selector */}
            <div className="relative">
              <select
                id="daily-progress-branch-select"
                aria-label="Filter Progress by Branch"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="appearance-none pl-8 pr-8 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Branches (Network Combined)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Configure Goal Toggle */}
            <button
              onClick={() => {
                setGoalInput(activeGoal.toString());
                setIsEditingGoal(!isEditingGoal);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs ${
                isEditingGoal
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 hover:border-slate-400'
              }`}
              title="Configure Daily Branch Goal"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEditingGoal ? 'Close Config' : 'Configure Goal'}</span>
            </button>
          </div>
        </div>

        {/* Goal Configuration Drawer / Inline Editor */}
        {isEditingGoal && (
          <form
            onSubmit={handleSaveGoal}
            className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-xl animate-fade-in space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-950">
                  Set Daily Target for {selectedBranchId === 'ALL' ? 'Combined Enterprise Network' : (selectedBranchObj?.name || 'Selected Branch')}
                </span>
              </div>
              <span className="text-[11px] text-amber-800 font-mono">
                Active Goal: {currencySymbol} {activeGoal.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Input */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full pl-12 pr-4 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono shadow-2xs"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-amber-900/80 mr-1">Presets:</span>
                {[3000, 5000, 7500, 10000, 15000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetGoal(preset)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors ${
                      goalInput === preset.toString()
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white hover:bg-amber-100/60 text-amber-900 border-amber-300'
                    }`}
                  >
                    {preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 md:pt-0">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Target
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Main Visualization Body */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT / CENTER: Circular Progress Dial & Primary Totals (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-6 justify-center lg:justify-start">
          {/* Circular SVG Gauge */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  isGoalReached
                    ? 'stroke-emerald-500'
                    : percentageAchieved >= 50
                    ? 'stroke-emerald-600'
                    : percentageAchieved >= 25
                    ? 'stroke-amber-500'
                    : 'stroke-sky-500'
                }`}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Dial Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                {percentageAchieved.toFixed(1)}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                of Goal
              </span>
            </div>
          </div>

          {/* Goal vs Collected Metric Totals */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Collected Today
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-emerald-700">{currencySymbol}</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
                  {totalCollectedToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Daily Goal Target</span>
                <span className="font-mono font-bold text-slate-700">
                  {currencySymbol} {activeGoal.toLocaleString()}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200"></div>

              <div>
                <span className="text-slate-400 text-[11px] block">
                  {isGoalReached ? 'Surplus Amount' : 'Remaining to Goal'}
                </span>
                <span className={`font-mono font-bold ${isGoalReached ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isGoalReached
                    ? `+${currencySymbol} ${surplusAmount.toLocaleString()}`
                    : `${currencySymbol} ${remainingAmount.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Quick Context Caption */}
            <p className="text-[11px] text-slate-500 max-w-xs">
              {paceStatus.description}
            </p>
          </div>
        </div>

        {/* RIGHT: Linear Progress Breakdown & Channel Distribution (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4 lg:border-l lg:border-slate-100 lg:pl-6">
          {/* Multi-segment Linear Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Collection Progress Timeline
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500">
                {todayTransactions.length} transaction(s) stamped today
              </span>
            </div>

            {/* Progress Track */}
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex relative shadow-inner p-0.5 border border-slate-200">
              {/* Physical Cash Segment */}
              <div
                style={{ width: `${clampedPercentage * (cashRatio / 100)}%` }}
                className="h-full bg-amber-500 transition-all duration-700 rounded-l-full"
                title={`Physical Cash: ${currencySymbol} ${cashCollectedToday.toLocaleString()}`}
              />
              {/* MoMo Segment */}
              <div
                style={{ width: `${clampedPercentage * (momoRatio / 100)}%` }}
                className="h-full bg-emerald-600 transition-all duration-700 rounded-r-full"
                title={`Mobile Money: ${currencySymbol} ${momoCollectedToday.toLocaleString()}`}
              />
            </div>

            {/* Milestone Markers */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
              <span className={percentageAchieved >= 0 ? 'text-slate-700 font-bold' : ''}>0%</span>
              <span className={percentageAchieved >= 25 ? 'text-amber-700 font-bold' : ''}>25%</span>
              <span className={percentageAchieved >= 50 ? 'text-amber-700 font-bold' : ''}>50% (Midway)</span>
              <span className={percentageAchieved >= 75 ? 'text-emerald-700 font-bold' : ''}>75%</span>
              <span className={percentageAchieved >= 100 ? 'text-emerald-700 font-bold' : ''}>100% Target</span>
            </div>
          </div>

          {/* Channels & Savers Participation Matrix (2-col grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Physical Cash Box */}
            <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-amber-600" />
                  Physical Cash Handover
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  {cashRatio.toFixed(0)}% of total
                </span>
              </div>
              <p className="text-base font-black font-mono text-slate-900">
                {currencySymbol} {cashCollectedToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-500">
                Direct vault & field cash collected
              </p>
            </div>

            {/* Mobile Money / Transfer Box */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  Mobile Money & Bank
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  {momoRatio.toFixed(0)}% of total
                </span>
              </div>
              <p className="text-base font-black font-mono text-slate-900">
                {currencySymbol} {momoCollectedToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-500">
                MTN MoMo, Telecel Cash & AT Money
              </p>
            </div>
          </div>

          {/* Savers Participation Counter & Quick Branch Highlights */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>{saversPaidToday.length}</strong> of <strong>{branchSavers.length}</strong> registered branch clients contributed today
              </span>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('branches')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 shrink-0"
              >
                Manage All Branch Targets
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER: Quick Comparison Chips for other District Branches */}
      <div className="bg-slate-50/80 border-t border-slate-200 px-5 py-3 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Branch Quotas:
        </span>
        <div className="flex items-center gap-2 flex-nowrap">
          <button
            onClick={() => setSelectedBranchId('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border ${
              selectedBranchId === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            All Branches (Total: {currencySymbol} {StorageService.getOverallDailyGoal().toLocaleString()})
          </button>

          {branches.map((b) => {
            const bGoal = b.dailyCollectionGoal || StorageService.getBranchDailyGoal(b.id);
            // Calculate today's collection for this specific branch
            const bCollected = transactions
              .filter((t) => {
                if (!t.timestamp.startsWith(todayStr) || t.type !== 'DAILY_CONTRIBUTION') return false;
                const txBId = t.branchId || (t.saverId ? saverBranchMap.get(t.saverId) : undefined);
                return txBId === b.id;
              })
              .reduce((sum, t) => sum + t.amount, 0);

            const bPct = bGoal > 0 ? (bCollected / bGoal) * 100 : 0;
            const isSelected = selectedBranchId === b.id;

            return (
              <button
                key={b.id}
                onClick={() => setSelectedBranchId(b.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{b.name.replace(' District Branch', '').replace(' Branch', '')}:</span>
                <span className="font-mono font-bold">
                  {bPct.toFixed(0)}%
                </span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {currencySymbol} {bGoal.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
