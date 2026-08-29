import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { GroupSusu, Collector, Transaction, GroupMember, PaymentMethod } from '../../types/index.ts';
import { StorageService, getUpcomingSunday } from '../../services/storageService.ts';
import { 
  Users, 
  Plus, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Phone, 
  Store, 
  Coins, 
  X,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Check,
  Smartphone,
  Banknote,
  Search,
  Filter,
  Receipt,
  HelpCircle,
  Scissors
} from 'lucide-react';

interface GroupSusuManagerProps {
  groups: GroupSusu[];
  collectors?: Collector[];
  currencySymbol?: string;
  onGroupCreated: (group: GroupSusu) => void;
  onPayoutSuccess: (tx: Transaction) => void;
}

export const GroupSusuManager: React.FC<GroupSusuManagerProps> = ({
  groups,
  collectors = [],
  currencySymbol = 'GH₵',
  onGroupCreated,
  onPayoutSuccess,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DAILY' | 'WEEKLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [disbursingGroup, setDisbursingGroup] = useState<GroupSusu | null>(null);
  const [disbursingMember, setDisbursingMember] = useState<GroupMember | null>(null);
  const [disbursalMethod, setDisbursalMethod] = useState<PaymentMethod>('CASH');
  const [momoPhone, setMomoPhone] = useState('');
  const [momoRef, setMomoRef] = useState('');
  const [disbursalNotes, setDisbursalNotes] = useState('');
  const [isProcessingDisbursal, setIsProcessingDisbursal] = useState(false);

  // Form State for Creation
  const [name, setName] = useState('');
  const [cashoutType, setCashoutType] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [collectorId, setCollectorId] = useState(collectors[0]?.id || '');
  const [slotAmount, setSlotAmount] = useState<number>(100);
  const [memberCount, setMemberCount] = useState<number>(6);
  const [cashoutScheduleLabel, setCashoutScheduleLabel] = useState('Daily Cashout • 4:30 PM Market Tally');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<{ fullName: string; phone: string; stall: string }[]>([
    { fullName: 'Mercy Agyei', phone: '+233 24 111 2222', stall: 'Fish Shed Lane 1' },
    { fullName: 'Akua Donkor', phone: '+233 24 222 3333', stall: 'Fish Shed Lane 2' },
    { fullName: 'Eunice Mensah', phone: '+233 24 333 4444', stall: 'Fish Shed Lane 3' },
    { fullName: 'Vida Osei', phone: '+233 24 444 5555', stall: 'Fish Shed Lane 4' },
    { fullName: 'Gladys Owusu', phone: '+233 24 555 6666', stall: 'Fish Shed Lane 5' },
    { fullName: 'Beatrice Appiah', phone: '+233 24 666 7777', stall: 'Fish Shed Lane 6' },
  ]);
  const [error, setError] = useState('');

  // Handle cashout type switch in modal
  const handleCashoutTypeChange = (type: 'DAILY' | 'WEEKLY') => {
    setCashoutType(type);
    if (type === 'DAILY') {
      setSlotAmount(100);
      setCashoutScheduleLabel('Daily Cashout • 4:30 PM Market Tally');
    } else {
      setSlotAmount(500);
      setCashoutScheduleLabel('Weekly Cashout • Ends Every Sunday');
    }
  };

  // Handle member count dynamic resizing
  const updateMemberCount = (count: number) => {
    const newCount = Math.max(2, Math.min(20, count));
    setMemberCount(newCount);
    const newMembers = [...members];
    while (newMembers.length < newCount) {
      const idx = newMembers.length + 1;
      newMembers.push({
        fullName: `Member ${idx}`,
        phone: '+233 24 000 0000',
        stall: `Stall Slot ${idx}`,
      });
    }
    setMembers(newMembers.slice(0, newCount));
  };

  const handleMemberChange = (index: number, field: 'fullName' | 'phone' | 'stall', val: string) => {
    const updated = [...members];
    updated[index][field] = val;
    setMembers(updated);
  };

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const gType = g.cashoutType || (g.frequency === 'DAILY' ? 'DAILY' : 'WEEKLY');
      if (activeFilter !== 'ALL' && gType !== activeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(q);
        const matchesCode = g.code.toLowerCase().includes(q);
        const matchesCollector = g.assignedCollectorName.toLowerCase().includes(q);
        const matchesMember = g.members.some((m) => m.fullName.toLowerCase().includes(q) || m.stallOrBusiness.toLowerCase().includes(q));
        return matchesName || matchesCode || matchesCollector || matchesMember;
      }
      return true;
    });
  }, [groups, activeFilter, searchQuery]);

  // Statistics
  const dailyGroups = useMemo(() => groups.filter((g) => (g.cashoutType || g.frequency) === 'DAILY'), [groups]);
  const weeklyGroups = useMemo(() => groups.filter((g) => (g.cashoutType || g.frequency) === 'WEEKLY'), [groups]);
  
  const dailyPotTotal = useMemo(() => dailyGroups.reduce((sum, g) => sum + g.potSizePerTurn, 0), [dailyGroups]);
  const weeklyPotTotal = useMemo(() => weeklyGroups.reduce((sum, g) => sum + g.potSizePerTurn, 0), [weeklyGroups]);
  const totalActiveSlots = useMemo(() => groups.reduce((sum, g) => sum + g.totalSlots, 0), [groups]);

  // Handle Form Submit
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a group name');
      return;
    }
    if (members.some((m) => !m.fullName.trim())) {
      setError('All group members must have names');
      return;
    }

    try {
      const today = new Date();
      const startDateStr = today.toISOString().split('T')[0];
      
      const newGroup = StorageService.createGroupSusu({
        name: name.trim(),
        assignedCollectorId: collectorId || collectors[0]?.id || 'col-1',
        cashoutType,
        slotContributionAmount: Number(slotAmount),
        cashoutScheduleLabel: cashoutScheduleLabel.trim(),
        startDate: startDateStr,
        description: description.trim() || undefined,
        members: members.map((m, idx) => {
          let expectedDateStr: string;
          if (cashoutType === 'DAILY') {
            const expectedDate = new Date();
            expectedDate.setDate(today.getDate() + idx);
            expectedDateStr = expectedDate.toISOString().split('T')[0];
          } else {
            // Weekly cashout ends on Sundays
            expectedDateStr = getUpcomingSunday(today, idx);
          }

          return {
            fullName: m.fullName.trim(),
            phone: m.phone.trim(),
            stallOrBusiness: m.stall.trim(),
            payoutTurnOrder: idx + 1,
            payoutDateExpected: expectedDateStr,
          };
        }),
      });

      onGroupCreated(newGroup);
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to create Group Susu');
    }
  };

  // Open Disbursal Modal
  const handleOpenDisburseModal = (group: GroupSusu) => {
    const beneficiary = group.members.find((m) => m.payoutTurnOrder === group.currentRound) || group.members.find((m) => !m.payoutReceived);
    if (!beneficiary) {
      alert('All rotation turns have already been disbursed for this group!');
      return;
    }
    setDisbursingGroup(group);
    setDisbursingMember(beneficiary);
    setDisbursalMethod('CASH');
    setMomoPhone(beneficiary.phone || '');
    setMomoRef('');
    setDisbursalNotes('');
  };

  // Confirm Disbursal
  const handleConfirmDisbursal = () => {
    if (!disbursingGroup || !disbursingMember) return;
    setIsProcessingDisbursal(true);

    try {
      const tx = StorageService.disburseGroupJackpot(
        disbursingGroup.id,
        disbursingMember.id,
        disbursalMethod,
        disbursalMethod === 'MOBILE_MONEY' ? momoRef || `MM-${Date.now().toString().slice(-6)}` : undefined,
        disbursalNotes || undefined
      );

      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#38bdf8', '#f59e0b'],
        });
      } catch (e) {}

      onPayoutSuccess(tx);
      setDisbursingGroup(null);
      setDisbursingMember(null);
    } catch (err: any) {
      alert(err.message || 'Failed to disburse cashout');
    } finally {
      setIsProcessingDisbursal(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <RotateCw className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900">Group Susu Management (Rotating Savings Circles)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            <strong>Daily Cashout</strong> & <strong>Weekly Cashout</strong> (ends on Sundays). <em>1 Contributed Amount is deducted from each cashout pot as banker fee.</em>
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Create New Group Susu
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Total Group Pools</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {groups.length} Groups
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {totalActiveSlots} total registered member slots
          </p>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span className="text-[11px] uppercase font-bold text-amber-900">Daily Cashout Pools</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {dailyGroups.length} Groups
              </span>
            </div>
            <p className="text-2xl font-black text-amber-700 font-mono mt-1">
              {currencySymbol} {dailyPotTotal.toLocaleString()}
            </p>
            <p className="text-[10px] text-amber-800 font-medium mt-1">
              Gross Daily Pots (Less 1 daily contribution fee)
            </p>
          </div>
        </div>

        <div className="bg-white border border-sky-200/80 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-sky-50 rounded-bl-full -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span className="text-[11px] uppercase font-bold text-sky-900">Weekly Cashout Pools</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                {weeklyGroups.length} Groups
              </span>
            </div>
            <p className="text-2xl font-black text-sky-700 font-mono mt-1">
              {currencySymbol} {weeklyPotTotal.toLocaleString()}
            </p>
            <p className="text-[10px] text-sky-800 font-medium mt-1">
              Ends on Sundays (Less 1 weekly contribution fee)
            </p>
          </div>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Cashout Completion</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {groups.filter((g) => g.status === 'COMPLETED').length} / {groups.length || 0} Cycles
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {groups.filter((g) => g.status === 'ACTIVE').length} active rotations in flight
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Daily vs Weekly Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Groups ({groups.length})
            </button>

            <button
              onClick={() => setActiveFilter('DAILY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeFilter === 'DAILY'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              ⚡ Daily Cashout ({dailyGroups.length})
            </button>

            <button
              onClick={() => setActiveFilter('WEEKLY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeFilter === 'WEEKLY'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              📅 Weekly Cashout (Ends Sundays) ({weeklyGroups.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search group, member, market stall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Operating Rules Explainer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800">Ghanaian Group Susu Operating Rules:</span>
            <p>
              <strong>Daily Cashout:</strong> Rapid daily rotation for market sellers. 1 daily contribution amount is deducted as banker commission.
              <span className="mx-2 text-slate-300">|</span>
              <strong>Weekly Cashout:</strong> Concludes and disburses every <strong>Sunday</strong>. 1 weekly contribution amount is deducted as banker commission.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State when no groups exist */}
      {filteredGroups.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
            <RotateCw className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No Group Susu Circles Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create your first <strong>Daily Cashout</strong> or <strong>Weekly Cashout (Ends on Sundays)</strong> rotational pool with automated 1-contribution banker deduction.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Create First Group Susu
          </button>
        </div>
      )}

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.map((group) => {
          const isDaily = (group.cashoutType || group.frequency) === 'DAILY';
          const currentBeneficiary = group.members.find((m) => m.payoutTurnOrder === group.currentRound);
          const completedTurns = group.members.filter((m) => m.payoutReceived).length;
          const completionPercentage = Math.round((completedTurns / group.totalSlots) * 100);
          
          // Deduction calculation: 1 contributed amount is deducted
          const grossPot = group.potSizePerTurn;
          const feeDeduction = group.slotContributionAmount;
          const netDisbursed = Math.max(0, grossPot - feeDeduction);

          return (
            <div
              key={group.id}
              className={`bg-white border rounded-2xl p-6 space-y-5 shadow-2xs hover:shadow-xs transition-all relative ${
                isDaily ? 'border-amber-200/90' : 'border-sky-200/90'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {group.code}
                    </span>
                    
                    {isDaily ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black inline-flex items-center gap-1 uppercase tracking-wider">
                        <Zap className="w-3 h-3 fill-amber-500 text-amber-600" />
                        Daily Cashout
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-black inline-flex items-center gap-1 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-sky-600" />
                        Weekly Cashout (Ends Sunday)
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">{group.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned Banker: <strong className="text-slate-800">{group.assignedCollectorName}</strong>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold font-mono block">
                    Turn {group.currentRound} of {group.totalSlots}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {completionPercentage}% Disbursed
                  </span>
                </div>
              </div>

              {/* Pot & Contribution Box with 1-Contribution Deduction Breakdown */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {isDaily ? '⚡ Gross Daily Pot' : '📅 Gross Weekly Pot'}
                    </span>
                    <span className={`text-lg font-black font-mono ${isDaily ? 'text-amber-700' : 'text-sky-700'}`}>
                      {currencySymbol} {grossPot.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {group.totalSlots} slots × {currencySymbol}{feeDeduction.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">1 Slot Contribution</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {currencySymbol} {feeDeduction.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      {isDaily ? 'per member daily' : 'per member weekly'}
                    </span>
                  </div>
                </div>

                {/* Net Beneficiary Payout Highlight */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <Scissors className="w-3.5 h-3.5 text-amber-600" />
                    <span>Less 1 Contributed Amount Fee:</span>
                    <span className="text-rose-600 font-mono font-bold">-{currencySymbol} {feeDeduction.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-bold uppercase">Net Cashout Disbursed</span>
                    <span className="text-base font-extrabold text-emerald-700 font-mono">
                      {currencySymbol} {netDisbursed.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cashout Schedule Badge */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span><strong>Schedule:</strong> {group.cashoutScheduleLabel || (isDaily ? 'Daily Cashout • 4:30 PM' : 'Weekly Cashout • Ends Every Sunday')}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-500 ${isDaily ? 'bg-amber-500' : 'bg-sky-600'}`}
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Next Turn Beneficiary Highlight */}
              {currentBeneficiary ? (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDaily ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      isDaily ? 'text-amber-900' : 'text-emerald-900'
                    }`}>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {isDaily ? `Turn #${group.currentRound} Daily Cashout Recipient:` : `Turn #${group.currentRound} Weekly Cashout Recipient (Ends Sunday):`}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      Expected: <strong>{currentBeneficiary.payoutDateExpected}</strong>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{currentBeneficiary.fullName}</h4>
                      <p className="text-xs text-slate-600">{currentBeneficiary.stallOrBusiness} • {currentBeneficiary.phone}</p>
                    </div>

                    <button
                      onClick={() => handleOpenDisburseModal(group)}
                      className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 shrink-0 ${
                        isDaily 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      Disburse Net Cashout ({currencySymbol}{netDisbursed.toLocaleString()})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-600 font-medium">
                  🎉 All {group.totalSlots} rotation rounds completed successfully!
                </div>
              )}

              {/* Members Rotation Order Timeline */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-700">Rotation Schedule & Member Slots</span>
                  <span className="font-medium">{completedTurns} / {group.totalSlots} Disbursed</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 max-h-48 overflow-y-auto">
                  {group.members.map((member) => {
                    const isCurrent = member.payoutTurnOrder === group.currentRound && !member.payoutReceived;
                    return (
                      <div
                        key={member.id}
                        className={`p-2.5 flex items-center justify-between text-xs ${
                          isCurrent
                            ? isDaily ? 'bg-amber-100/70 font-semibold' : 'bg-emerald-100/70 font-semibold'
                            : member.payoutReceived
                            ? 'bg-slate-100/50 text-slate-400'
                            : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              member.payoutReceived
                                ? 'bg-emerald-100 text-emerald-700'
                                : isCurrent
                                ? isDaily ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {member.payoutTurnOrder}
                          </span>
                          <div>
                            <span className={member.payoutReceived ? 'text-slate-400 line-through' : 'text-slate-900 font-medium'}>
                              {member.fullName}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-2">({member.stallOrBusiness})</span>
                          </div>
                        </div>

                        <div>
                          {member.payoutReceived ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              Disbursed ({member.payoutMethod || 'Cash'})
                            </span>
                          ) : isCurrent ? (
                            <span className={`text-[10px] font-bold animate-pulse ${
                              isDaily ? 'text-amber-800' : 'text-emerald-800'
                            }`}>
                              ● Next Due ({member.payoutDateExpected})
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              Due: {member.payoutDateExpected}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Disburse Cashout */}
      {disbursingGroup && disbursingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  disbursingGroup.cashoutType === 'DAILY' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Disburse {disbursingGroup.cashoutType === 'DAILY' ? 'Daily' : 'Weekly'} Cashout
                  </h2>
                  <p className="text-xs text-slate-500">{disbursingGroup.name} (Round {disbursingMember.payoutTurnOrder} of {disbursingGroup.totalSlots})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDisbursingGroup(null);
                  setDisbursingMember(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Recipient & Amount Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Designated Recipient</span>
                    <h3 className="text-base font-black text-slate-900">{disbursingMember.fullName}</h3>
                    <p className="text-xs text-slate-600">{disbursingMember.stallOrBusiness} • {disbursingMember.phone}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold font-mono">
                    Turn #{disbursingMember.payoutTurnOrder}
                  </span>
                </div>

                {/* Calculation Breakdown */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Cashout Pool ({disbursingGroup.totalSlots} slots):</span>
                    <span className="font-mono font-bold text-slate-900">{currencySymbol} {disbursingGroup.potSizePerTurn.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-amber-800 font-semibold bg-amber-50/70 px-2 py-1 rounded border border-amber-200/60">
                    <span>Less 1 Contributed Amount (Banker Commission):</span>
                    <span className="font-mono font-bold text-rose-600">- {currencySymbol} {disbursingGroup.slotContributionAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span className="text-emerald-900">Net Cashout Disbursed to Member:</span>
                    <span className="text-xl text-emerald-700 font-mono">
                      {currencySymbol} {(disbursingGroup.potSizePerTurn - disbursingGroup.slotContributionAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Payment Disbursal Channel <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDisbursalMethod('CASH')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      disbursalMethod === 'CASH'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs block">Physical Cash</span>
                      <span className="text-[10px] text-slate-500">Instant Handover</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisbursalMethod('MOBILE_MONEY')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      disbursalMethod === 'MOBILE_MONEY'
                        ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-sky-600" />
                    <div>
                      <span className="text-xs block">Mobile Money (MoMo)</span>
                      <span className="text-[10px] text-slate-500">MTN / Telecel MoMo</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* MoMo Specific Fields */}
              {disbursalMethod === 'MOBILE_MONEY' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-sky-50/60 rounded-xl border border-sky-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Recipient MoMo Phone Number
                    </label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="+233 24 000 0000"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Network Transaction Ref
                    </label>
                    <input
                      type="text"
                      value={momoRef}
                      onChange={(e) => setMomoRef(e.target.value)}
                      placeholder="e.g. MTN-99882211"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-600 shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Disbursal Note / Witness (Optional)
                </label>
                <input
                  type="text"
                  value={disbursalNotes}
                  onChange={(e) => setDisbursalNotes(e.target.value)}
                  placeholder={`e.g. Disbursed by ${disbursingGroup.assignedCollectorName}`}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                />
              </div>

              {/* Verification summary */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Official Cashout Receipt Ready:</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Advancing to Round #{disbursingMember.payoutTurnOrder + 1}. 1 Contributed amount (GH₵ {disbursingGroup.slotContributionAmount}) is retained as banker reserve, and GH₵ {(disbursingGroup.potSizePerTurn - disbursingGroup.slotContributionAmount).toLocaleString()} is disbursed.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDisbursingGroup(null);
                    setDisbursingMember(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingDisbursal}
                  onClick={handleConfirmDisbursal}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  {isProcessingDisbursal ? 'Processing...' : `Confirm & Pay ${currencySymbol} ${(disbursingGroup.potSizePerTurn - disbursingGroup.slotContributionAmount).toLocaleString()} (Net)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Group Susu */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Create New Group Susu</h2>
                  <p className="text-xs text-slate-500">Configure Rotating Circle with Daily or Weekly Cashout</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Cashout Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Select Cashout Frequency Model <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => handleCashoutTypeChange('DAILY')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      cashoutType === 'DAILY'
                        ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                          <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
                        </span>
                        <span className="text-sm font-black text-slate-900">Daily Cashout</span>
                      </div>
                      <input
                        type="radio"
                        name="cashoutModel"
                        checked={cashoutType === 'DAILY'}
                        onChange={() => handleCashoutTypeChange('DAILY')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                      Members contribute daily. 1 member takes home daily pot (less 1 daily contribution fee).
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                      Fast 1-day turnover • Best for market traders
                    </span>
                  </div>

                  <div
                    onClick={() => handleCashoutTypeChange('WEEKLY')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      cashoutType === 'WEEKLY'
                        ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-sky-100 text-sky-800">
                          <Calendar className="w-4 h-4 text-sky-600" />
                        </span>
                        <span className="text-sm font-black text-slate-900">Weekly Cashout (Ends Sundays)</span>
                      </div>
                      <input
                        type="radio"
                        name="cashoutModel"
                        checked={cashoutType === 'WEEKLY'}
                        onChange={() => handleCashoutTypeChange('WEEKLY')}
                        className="text-sky-600 focus:ring-sky-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                      Members contribute weekly. 1 member receives weekly pot every <strong>Sunday</strong> (less 1 weekly contribution fee).
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded">
                      Disbursed on Sundays • Best for wholesale merchants
                    </span>
                  </div>
                </div>
              </div>

              {/* Group Name & Schedule Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Group Susu Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={cashoutType === 'DAILY' ? 'e.g. Makola Fresh Fish Daily Cashout Circle' : 'e.g. Kejetia Auto Parts Weekly Cashout Circle'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cashout Schedule Label
                  </label>
                  <input
                    type="text"
                    required
                    value={cashoutScheduleLabel}
                    onChange={(e) => setCashoutScheduleLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Slot Contribution & Members Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {cashoutType === 'DAILY' ? 'Daily Contribution per Slot' : 'Weekly Contribution per Slot'} ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={slotAmount}
                    onChange={(e) => setSlotAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Member Slots
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={memberCount}
                    onChange={(e) => updateMemberCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Calculated Pot Banner with Deduction Rule */}
              <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                cashoutType === 'DAILY'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-sky-50 border-sky-200 text-sky-900'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold block">
                      Gross {cashoutType === 'DAILY' ? 'Daily' : 'Weekly'} Pot ({memberCount} slots × {currencySymbol}{slotAmount}):
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {cashoutType === 'DAILY' 
                        ? `Full rotation will cycle through all ${memberCount} members in ${memberCount} days.` 
                        : `Full rotation will cycle through all ${memberCount} members on consecutive Sundays (${memberCount} weeks).`}
                    </span>
                  </div>
                  <span className="text-xl font-black font-mono">
                    {currencySymbol} {(slotAmount * memberCount).toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between font-bold">
                  <span className="text-slate-700">Net Disbursed per Turn (Less 1 Contributed Amount):</span>
                  <span className="text-base text-emerald-700 font-mono">
                    {currencySymbol} {((memberCount - 1) * slotAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Members Designation Table */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Designate Member Cashout Rotation Order
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {cashoutType === 'WEEKLY' ? 'Scheduled on consecutive Sundays' : 'Scheduled on consecutive days'}
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {members.map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Member Full Name"
                        value={m.fullName}
                        onChange={(e) => handleMemberChange(idx, 'fullName', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                      />
                      <input
                        type="text"
                        placeholder="Stall / Business"
                        value={m.stall}
                        onChange={(e) => handleMemberChange(idx, 'stall', e.target.value)}
                        className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={m.phone}
                        onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                        className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Launch {cashoutType === 'DAILY' ? 'Daily' : 'Weekly'} Cashout Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
