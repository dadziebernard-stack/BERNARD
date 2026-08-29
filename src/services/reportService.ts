import { Transaction, Collector, Saver, DailyReconciliation, GroupSusu } from '../types/index.ts';

export interface CollectorDailyReport {
  date: string;
  collector: Collector;
  totalCashCollected: number;
  totalMoMoCollected: number;
  totalCollections: number;
  totalPayouts: number;
  netCashToHandOver: number;
  commissionEarnedToday: number;
  saversStampedCount: number;
  totalTransactionsCount: number;
  targetAchievementRate: number; // percentage
  transactions: Transaction[];
  saversList: Saver[];
}

export interface AdminConsolidatedReport {
  date: string;
  totalActiveSavers: number;
  totalActiveCollectors: number;
  totalDailyCollectionsAllBranches: number;
  totalDailyCash: number;
  totalDailyMoMo: number;
  totalDailyPayouts: number;
  totalVaultReserves: number;
  totalCommissionPool: number;
  totalGroupPotVolume: number;
  topCollectors: {
    collectorId: string;
    name: string;
    collectedToday: number;
    activeSavers: number;
  }[];
  recentAuditsCount: number;
  pendingReconciliationsCount: number;
}

export const ReportService = {
  // Generate Collector Daily Report for a specific date
  generateCollectorDailyReport(
    collector: Collector,
    transactions: Transaction[],
    savers: Saver[],
    dateStr: string = new Date().toISOString().split('T')[0]
  ): CollectorDailyReport {
    const collectorTx = transactions.filter(
      (tx) => tx.collectorId === collector.id && tx.timestamp.startsWith(dateStr)
    );

    const depositTx = collectorTx.filter((tx) => tx.type === 'DAILY_CONTRIBUTION');
    const payoutTx = collectorTx.filter((tx) => tx.type === 'WITHDRAWAL_PAYOUT');

    const totalCashCollected = depositTx
      .filter((tx) => tx.paymentMethod === 'CASH')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalMoMoCollected = depositTx
      .filter((tx) => tx.paymentMethod === 'MOBILE_MONEY' || tx.paymentMethod === 'BANK_TRANSFER')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalCollections = totalCashCollected + totalMoMoCollected;
    const totalPayouts = payoutTx.reduce((sum, tx) => sum + (tx.netPayout || tx.amount), 0);
    const netCashToHandOver = Math.max(0, totalCashCollected - totalPayouts);
    const commissionEarnedToday = totalCollections * (collector.commissionRate / 100);

    const uniqueSaverIds = new Set(depositTx.map((tx) => tx.saverId).filter(Boolean));
    const targetAchievementRate = collector.todayTarget > 0 
      ? Math.min(100, Math.round((totalCollections / collector.todayTarget) * 100)) 
      : 100;

    const assignedSavers = savers.filter((s) => s.collectorId === collector.id);

    return {
      date: dateStr,
      collector,
      totalCashCollected,
      totalMoMoCollected,
      totalCollections,
      totalPayouts,
      netCashToHandOver,
      commissionEarnedToday,
      saversStampedCount: uniqueSaverIds.size,
      totalTransactionsCount: collectorTx.length,
      targetAchievementRate,
      transactions: collectorTx,
      saversList: assignedSavers,
    };
  },

  // Generate Admin Consolidated Report
  generateAdminConsolidatedReport(
    collectors: Collector[],
    savers: Saver[],
    groups: GroupSusu[],
    transactions: Transaction[],
    reconciliations: DailyReconciliation[],
    dateStr: string = new Date().toISOString().split('T')[0]
  ): AdminConsolidatedReport {
    const todayTx = transactions.filter((tx) => tx.timestamp.startsWith(dateStr));
    const depositTx = todayTx.filter((tx) => tx.type === 'DAILY_CONTRIBUTION');
    const payoutTx = todayTx.filter((tx) => tx.type === 'WITHDRAWAL_PAYOUT' || tx.type === 'GROUP_ROTATION_PAYOUT');

    const totalDailyCash = depositTx
      .filter((tx) => tx.paymentMethod === 'CASH')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalDailyMoMo = depositTx
      .filter((tx) => tx.paymentMethod === 'MOBILE_MONEY' || tx.paymentMethod === 'BANK_TRANSFER')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalDailyCollectionsAllBranches = totalDailyCash + totalDailyMoMo;
    const totalDailyPayouts = payoutTx.reduce((sum, tx) => sum + (tx.netPayout || tx.amount), 0);
    const totalVaultReserves = collectors.reduce((sum, c) => sum + c.cashInHand, 0);
    const totalCommissionPool = collectors.reduce((sum, c) => sum + c.totalCommissionEarned, 0);
    const totalGroupPotVolume = groups.reduce((sum, g) => sum + (g.potSizePerTurn * g.totalSlots), 0);

    const topCollectors = [...collectors]
      .sort((a, b) => (b.todayCollectedCash + b.todayCollectedMoMo) - (a.todayCollectedCash + a.todayCollectedMoMo))
      .slice(0, 5)
      .map((c) => ({
        collectorId: c.id,
        name: c.name,
        collectedToday: c.todayCollectedCash + c.todayCollectedMoMo,
        activeSavers: c.activeSaversCount,
      }));

    const pendingReconciliationsCount = reconciliations.filter(
      (r) => r.status === 'PENDING' || r.status === 'DISCREPANCY_FLAGGED'
    ).length;

    return {
      date: dateStr,
      totalActiveSavers: savers.length,
      totalActiveCollectors: collectors.length,
      totalDailyCollectionsAllBranches,
      totalDailyCash,
      totalDailyMoMo,
      totalDailyPayouts,
      totalVaultReserves,
      totalCommissionPool,
      totalGroupPotVolume,
      topCollectors,
      recentAuditsCount: 24,
      pendingReconciliationsCount,
    };
  },

  // Export transactions to CSV
  exportTransactionsToCSV(transactions: Transaction[]): void {
    const headers = [
      'Reference Number',
      'Timestamp',
      'Type',
      'Saver Name',
      'Account Number',
      'Amount (GHS)',
      'Payment Method',
      'Collector Name',
      'Status',
      'Notes',
    ];

    const rows = transactions.map((tx) => [
      `"${tx.referenceNumber}"`,
      `"${tx.timestamp}"`,
      `"${tx.type}"`,
      `"${tx.saverName || ''}"`,
      `"${tx.saverAccountNumber || ''}"`,
      tx.amount,
      `"${tx.paymentMethod}"`,
      `"${tx.collectorName}"`,
      `"${tx.status}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Susu_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export Savers list to CSV
  exportSaversToCSV(savers: Saver[]): void {
    const headers = [
      'Account Number',
      'Full Name',
      'Nickname / Stall',
      'Phone',
      'Assigned Collector',
      'Daily Target (GHS)',
      'Current Cycle',
      'Days Paid (of 31)',
      'Current Savings (GHS)',
      'Total All-Time (GHS)',
      'Status',
      'Last Deposit Date',
    ];

    const rows = savers.map((s) => [
      `"${s.accountNumber}"`,
      `"${s.fullName}"`,
      `"${s.nicknameOrStall}"`,
      `"${s.phone}"`,
      `"${s.collectorName}"`,
      s.dailyContribution,
      s.currentCycle,
      s.passbook.filter((p) => p.isPaid).length,
      s.currentSavings,
      s.totalAllTimeSavings,
      `"${s.status}"`,
      `"${s.lastDepositDate || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Susu_Savers_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
