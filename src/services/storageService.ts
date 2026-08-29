import { 
  Collector, 
  Saver, 
  Transaction, 
  GroupSusu, 
  DailyReconciliation, 
  AuditLog, 
  PaymentMethod,
  PassbookDay,
  UserRole,
  AuthLevel,
  AuthSession,
  Region,
  DistrictBranch
} from '../types/index.ts';
import { 
  INITIAL_COLLECTORS, 
  INITIAL_SAVERS, 
  INITIAL_GROUP_SUSUS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_RECONCILIATIONS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_REGIONS,
  INITIAL_BRANCHES,
  generatePassbook
} from './mockData.ts';

const STORAGE_KEYS = {
  COLLECTORS: 'susu_gh_collectors_v3',
  SAVERS: 'susu_gh_savers_v3',
  GROUP_SUSUS: 'susu_gh_group_susus_v3',
  TRANSACTIONS: 'susu_gh_transactions_v3',
  RECONCILIATIONS: 'susu_gh_reconciliations_v3',
  AUDIT_LOGS: 'susu_gh_audit_logs_v3',
  REGIONS: 'susu_gh_regions_v3',
  BRANCHES: 'susu_gh_branches_v3',
  ACTIVE_ROLE: 'susu_gh_active_role_v3',
  ACTIVE_USER_ID: 'susu_gh_active_user_id_v3',
  SUPER_ADMIN_AUTH: 'susu_gh_super_admin_auth_v3',
  AUTH_SESSION: 'susu_gh_auth_session_v3',
  CLEAN_INITIALIZED: 'susu_gh_clean_slate_initialized_v3',
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Listener callback error', e);
    }
  });
}

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Local Storage Helpers
function loadData<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error loading key ${key}`, e);
    return defaultVal;
  }
}

function saveData<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    notifyListeners();
  } catch (e) {
    console.error(`Error saving key ${key}`, e);
  }
}

// Helper to get upcoming Sunday date string
export function getUpcomingSunday(fromDate: Date = new Date(), weeksOffset: number = 0): string {
  const date = new Date(fromDate);
  const day = date.getDay(); // 0 is Sunday
  const daysUntilSunday = day === 0 ? 0 : (7 - day);
  date.setDate(date.getDate() + daysUntilSunday + (weeksOffset * 7));
  return date.toISOString().split('T')[0];
}

// Ensure clean slate on initial run
function checkAndInitializeCleanSlate() {
  const initialized = localStorage.getItem(STORAGE_KEYS.CLEAN_INITIALIZED);
  if (!initialized) {
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(INITIAL_COLLECTORS));
    localStorage.setItem(STORAGE_KEYS.SAVERS, JSON.stringify(INITIAL_SAVERS));
    localStorage.setItem(STORAGE_KEYS.GROUP_SUSUS, JSON.stringify(INITIAL_GROUP_SUSUS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.RECONCILIATIONS, JSON.stringify(INITIAL_RECONCILIATIONS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.REGIONS, JSON.stringify(INITIAL_REGIONS));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem(STORAGE_KEYS.CLEAN_INITIALIZED, 'true');
  } else {
    // If regions or branches are not yet created in existing store, populate them
    if (!localStorage.getItem(STORAGE_KEYS.REGIONS)) {
      localStorage.setItem(STORAGE_KEYS.REGIONS, JSON.stringify(INITIAL_REGIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    }
  }
}

// Run initialization
if (typeof window !== 'undefined') {
  checkAndInitializeCleanSlate();
}

// Storage API
export const StorageService = {
  // Event subscription
  subscribe(listener: Listener) {
    return subscribeToStore(listener);
  },

  // Currency: Strictly locked to Ghana Cedis
  getCurrencySymbol(): string {
    return 'GH₵';
  },

  // Active Session Management (Admin, Regional Branch, District Branch)
  getActiveSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setActiveSession(session: AuthSession | null): void {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
      if (session.level === 'SUPER_ADMIN') {
        localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'ADMIN');
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, session.userId);
      } else if (session.level === 'REGIONAL_BRANCH') {
        localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_AUTH, 'false');
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'ADMIN');
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, session.userId);
      } else {
        localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_AUTH, 'false');
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'COLLECTOR');
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, session.userId);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      localStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN_AUTH);
    }
    notifyListeners();
  },

  loginSuperAdmin(username: string, password: string): { success: boolean; session?: AuthSession; message?: string } {
    const isValid = this.validateSuperAdminCredentials(username, password);
    if (!isValid) {
      return { success: false, message: 'Invalid Super Admin credentials. Please check your username and password.' };
    }

    const session: AuthSession = {
      level: 'SUPER_ADMIN',
      userId: 'admin-1',
      userName: 'Bernard (Super Admin)',
      userRole: 'ADMIN',
      loggedInAt: new Date().toISOString(),
    };

    this.setActiveSession(session);

    this.addAuditLog({
      actorId: session.userId,
      actorName: session.userName,
      actorRole: 'ADMIN',
      action: 'LOGIN_SUPER_ADMIN',
      details: 'Super Admin Bernard authenticated into executive nationwide console',
    });

    return { success: true, session };
  },

  loginRegionalBranch(regionId: string, officerName?: string, pin: string = '1234'): { success: boolean; session?: AuthSession; message?: string } {
    const region = this.getRegionById(regionId);
    if (!region) {
      return { success: false, message: 'Selected administrative region was not found.' };
    }

    const name = officerName?.trim() || region.regionalManagerName || `${region.name} Directorate`;
    const session: AuthSession = {
      level: 'REGIONAL_BRANCH',
      userId: `reg-lead-${region.code.toLowerCase()}`,
      userName: `${name} (${region.code})`,
      userRole: 'ADMIN',
      regionId: region.id,
      regionName: region.name,
      regionCode: region.code,
      loggedInAt: new Date().toISOString(),
    };

    this.setActiveSession(session);

    this.addAuditLog({
      actorId: session.userId,
      actorName: session.userName,
      actorRole: 'ADMIN',
      action: 'LOGIN_REGIONAL_DIRECTORATE',
      details: `Regional Branch Officer logged into ${region.name} (${region.code}) operations console`,
    });

    return { success: true, session };
  },

  loginDistrictBranch(branchId: string, operatorName?: string, pin: string = '1234'): { success: boolean; session?: AuthSession; message?: string } {
    const branch = this.getBranchById(branchId);
    if (!branch) {
      return { success: false, message: 'Selected district branch was not found.' };
    }

    const name = operatorName?.trim() || branch.branchManagerName || branch.name;
    const session: AuthSession = {
      level: 'DISTRICT_BRANCH',
      userId: `br-op-${branch.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      userName: `${name} (${branch.code})`,
      userRole: 'COLLECTOR',
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      regionId: branch.regionId,
      regionName: branch.regionName,
      district: branch.district,
      loggedInAt: new Date().toISOString(),
    };

    this.setActiveSession(session);

    this.addAuditLog({
      actorId: session.userId,
      actorName: session.userName,
      actorRole: 'COLLECTOR',
      action: 'LOGIN_DISTRICT_BRANCH',
      details: `District Branch Operator logged into ${branch.name} (${branch.code}) field console`,
    });

    return { success: true, session };
  },

  logout(): void {
    const session = this.getActiveSession();
    if (session) {
      this.addAuditLog({
        actorId: session.userId,
        actorName: session.userName,
        actorRole: session.userRole,
        action: 'LOGOUT',
        details: `Logged out session for ${session.userName}`,
      });
    }
    this.setActiveSession(null);
  },

  // Super Admin Authentication Legacy compatibility
  isSuperAdminAuthenticated(): boolean {
    const session = this.getActiveSession();
    return session?.level === 'SUPER_ADMIN';
  },

  setSuperAdminAuthenticated(auth: boolean): void {
    if (auth) {
      this.loginSuperAdmin('bernard', 'bendaz');
    } else {
      this.logout();
    }
  },

  validateSuperAdminCredentials(username: string, password: string): boolean {
    const validUser = 'bernard';
    const validPass = 'bendaz';
    return (
      (username.trim().toLowerCase() === validUser || username.trim().toLowerCase() === 'bendazgroup@gmail.com') &&
      password === validPass
    );
  },

  // Active Role and User Context
  getActiveRole(): UserRole {
    const session = this.getActiveSession();
    if (session) return session.userRole;
    return (localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as UserRole) || 'ADMIN';
  },

  setActiveRole(role: UserRole): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    notifyListeners();
  },

  getActiveUserId(): string {
    const session = this.getActiveSession();
    if (session) return session.userId;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'admin-1';
  },

  setActiveUserId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
    notifyListeners();
  },

  // Collectors (Field Mobile Bankers)
  getCollectors(): Collector[] {
    return loadData<Collector[]>(STORAGE_KEYS.COLLECTORS, INITIAL_COLLECTORS);
  },

  getCollectorById(id: string): Collector | undefined {
    return this.getCollectors().find((c) => c.id === id);
  },

  addCollector(newCollectorData: {
    name: string;
    collectorCode?: string;
    phone: string;
    email?: string;
    assignedRoute: string;
    todayTarget?: number;
    commissionRate?: number;
    status?: 'ACTIVE' | 'ON_DUTY';
  }): Collector {
    const collectors = this.getCollectors();
    const id = `col-${Date.now()}`;
    const code = newCollectorData.collectorCode || `COL-GH-${Math.floor(100 + collectors.length + 1)}`;
    const newCollector: Collector = {
      id,
      name: newCollectorData.name,
      collectorCode: code,
      phone: newCollectorData.phone,
      email: newCollectorData.email,
      assignedRoute: newCollectorData.assignedRoute,
      todayCollectedCash: 0,
      todayCollectedMoMo: 0,
      todayTarget: newCollectorData.todayTarget || 5000,
      cashInHand: 0,
      totalCommissionEarned: 0,
      commissionRate: newCollectorData.commissionRate || 3.3,
      activeSaversCount: 0,
      status: newCollectorData.status || 'ON_DUTY',
    };
    collectors.push(newCollector);
    saveData(STORAGE_KEYS.COLLECTORS, collectors);

    this.addAuditLog({
      actorId: this.getActiveUserId(),
      actorName: 'Bernard (Super Admin)',
      actorRole: this.getActiveRole(),
      action: 'ONBOARD_COLLECTOR',
      details: `Onboarded field mobile banker: ${newCollector.name} (${newCollector.collectorCode}) for route ${newCollector.assignedRoute}`,
    });

    return newCollector;
  },

  // Savers
  getSavers(): Saver[] {
    return loadData<Saver[]>(STORAGE_KEYS.SAVERS, INITIAL_SAVERS);
  },

  getSaverById(id: string): Saver | undefined {
    return this.getSavers().find((s) => s.id === id);
  },

  getSaversByCollector(collectorId: string): Saver[] {
    return this.getSavers().filter((s) => s.collectorId === collectorId);
  },

  // Helper to generate a suggested unique account number
  generateSuggestedAccountNumber(branchId?: string): string {
    const savers = this.getSavers();
    let prefix = 'SAV';
    if (branchId) {
      const branch = this.getBranchById(branchId);
      if (branch?.code) {
        // e.g. ACC-MK-01 -> MK or ACC-MK
        const parts = branch.code.split('-');
        if (parts.length >= 2) {
          prefix = parts[1] || parts[0];
        } else {
          prefix = branch.code.replace(/[^A-Z0-9]/g, '');
        }
      }
    }
    const year = new Date().getFullYear();
    const seq = 1000 + savers.length + 1;
    return `${prefix.toUpperCase()}-${year}-${seq}`;
  },

  registerSaver(saverData: {
    accountNumber?: string;
    fullName: string;
    nicknameOrStall: string;
    phone: string;
    nationalId?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    collectorId: string;
    branchId?: string;
    branchName?: string;
    regionName?: string;
    dailyContribution: number;
    cycleType?: 'DAILY_31';
    startDate?: string;
    note?: string;
  }): Saver {
    const savers = this.getSavers();
    const collector = this.getCollectorById(saverData.collectorId);
    let branchName = saverData.branchName;
    let regionName = saverData.regionName;

    if (saverData.branchId && !branchName) {
      const br = this.getBranchById(saverData.branchId);
      if (br) {
        branchName = br.name;
        regionName = br.regionName;
      }
    }
    
    const id = `saver-${Date.now()}`;
    const dateStr = saverData.startDate || new Date().toISOString().split('T')[0];
    
    // Account number handling: User-specified manual account number OR auto-generated
    let finalAccountNumber = saverData.accountNumber?.trim().toUpperCase();
    if (!finalAccountNumber) {
      finalAccountNumber = this.generateSuggestedAccountNumber(saverData.branchId);
    } else {
      // Check if account number already exists, and if so ensure unique differentiator
      const exists = savers.some((s) => s.accountNumber === finalAccountNumber);
      if (exists) {
        finalAccountNumber = `${finalAccountNumber}-${Math.floor(10 + Math.random() * 89)}`;
      }
    }

    const dailyContribution = saverData.dailyContribution;
    const totalCycleDays = 31;
    const cycleTargetAmount = dailyContribution * totalCycleDays;

    const newSaver: Saver = {
      id,
      accountNumber: finalAccountNumber,
      fullName: saverData.fullName,
      nicknameOrStall: saverData.nicknameOrStall,
      phone: saverData.phone,
      nationalId: saverData.nationalId,
      nextOfKinName: saverData.nextOfKinName,
      nextOfKinPhone: saverData.nextOfKinPhone,
      collectorId: saverData.collectorId,
      collectorName: collector?.name || 'Collector',
      branchId: saverData.branchId,
      branchName,
      regionName,
      dailyContribution,
      cycleType: saverData.cycleType || 'DAILY_31',
      totalCycleDays,
      currentCycle: 1,
      cycleStartDate: dateStr,
      cycleTargetAmount,
      currentSavings: 0,
      totalAllTimeSavings: 0,
      passbook: generatePassbook(dailyContribution, 0, dateStr, collector?.id, collector?.name),
      status: 'ACTIVE',
      registeredAt: dateStr,
      note: saverData.note,
    };

    savers.unshift(newSaver);
    saveData(STORAGE_KEYS.SAVERS, savers);

    // Update collector count
    if (collector) {
      const collectors = this.getCollectors();
      const cIdx = collectors.findIndex((c) => c.id === collector.id);
      if (cIdx !== -1) {
        collectors[cIdx].activeSaversCount += 1;
        saveData(STORAGE_KEYS.COLLECTORS, collectors);
      }
    }

    this.addAuditLog({
      actorId: this.getActiveUserId(),
      actorName: collector?.name || 'Mobile Banker',
      actorRole: this.getActiveRole(),
      action: 'REGISTER_SAVER',
      details: `Registered new saver: ${newSaver.fullName} (Account: ${newSaver.accountNumber}) at ${branchName || 'Central Branch'} with daily contribution of GH₵ ${newSaver.dailyContribution}`,
    });

    return newSaver;
  },

  createSaver(data: any): Saver {
    return this.registerSaver(data);
  },

  // Record Deposit & Stamp Passbook
  recordDeposit(params: {
    saverId: string;
    collectorId: string;
    numberOfDaysToStamp: number;
    paymentMethod: PaymentMethod;
    momoReference?: string;
    notes?: string;
  }): { transaction: Transaction; updatedSaver: Saver } {
    const savers = this.getSavers();
    const saverIndex = savers.findIndex((s) => s.id === params.saverId);
    if (saverIndex === -1) throw new Error('Saver not found');

    const saver = { ...savers[saverIndex] };
    const collector = this.getCollectorById(params.collectorId);
    if (!collector) throw new Error('Collector not found');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const daysToStampCount = Math.max(1, params.numberOfDaysToStamp);
    const depositAmount = saver.dailyContribution * daysToStampCount;

    // Identify which days in the 31-day passbook to stamp
    const stampedDayNumbers: number[] = [];
    let countStamped = 0;
    const updatedPassbook = saver.passbook.map((day) => {
      if (!day.isPaid && countStamped < daysToStampCount) {
        countStamped++;
        stampedDayNumbers.push(day.dayNumber);
        return {
          ...day,
          isPaid: true,
          date: dateStr,
          transactionRef: `TX-${dateStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
          stampedByCollectorId: collector.id,
          stampedByCollectorName: collector.name,
        };
      }
      return day;
    });

    if (stampedDayNumbers.length === 0) {
      throw new Error('This passbook is already fully completed (31/31 days stamped)!');
    }

    // Update Saver balances
    saver.passbook = updatedPassbook;
    saver.currentSavings += depositAmount;
    saver.totalAllTimeSavings += depositAmount;
    saver.lastDepositDate = dateStr;

    // If 31 days reached, mark completed
    const allPaid = saver.passbook.every((d) => d.isPaid);
    if (allPaid) {
      saver.status = 'COMPLETED';
    }

    savers[saverIndex] = saver;
    saveData(STORAGE_KEYS.SAVERS, savers);

    // Create Transaction Record
    const txRef = `TX-${dateStr.replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      referenceNumber: txRef,
      type: 'DAILY_CONTRIBUTION',
      saverId: saver.id,
      saverName: saver.fullName,
      saverAccountNumber: saver.accountNumber,
      collectorId: collector.id,
      collectorName: collector.name,
      collectorCode: collector.collectorCode,
      amount: depositAmount,
      paymentMethod: params.paymentMethod,
      momoReference: params.momoReference,
      stampedDays: stampedDayNumbers,
      passbookDayNumber: stampedDayNumbers[stampedDayNumbers.length - 1],
      timestamp: now.toISOString(),
      reconciled: true,
      status: 'COMPLETED',
      notes: params.notes || `Stamped ${stampedDayNumbers.length} day(s) in passbook (Days ${stampedDayNumbers.join(', ')})`,
    };

    const transactions = this.getTransactions();
    transactions.unshift(transaction);
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

    // Update Collector Daily Tallies
    const collectors = this.getCollectors();
    const collectorIndex = collectors.findIndex((c) => c.id === collector.id);
    if (collectorIndex !== -1) {
      if (params.paymentMethod === 'CASH') {
        collectors[collectorIndex].todayCollectedCash += depositAmount;
        collectors[collectorIndex].cashInHand += depositAmount;
      } else {
        collectors[collectorIndex].todayCollectedMoMo += depositAmount;
      }
      saveData(STORAGE_KEYS.COLLECTORS, collectors);
    }

    this.addAuditLog({
      actorId: collector.id,
      actorName: collector.name,
      actorRole: 'FIELD_COLLECTOR',
      action: 'RECORD_DEPOSIT',
      details: `Collected GH₵ ${depositAmount} (${params.paymentMethod}) for ${saver.fullName} (Days ${stampedDayNumbers.join(', ')})`,
    });

    return { transaction, updatedSaver: saver };
  },

  recordContribution(params: {
    saverId: string;
    collectorId: string;
    numberOfDaysToStamp: number;
    paymentMethod: PaymentMethod;
    momoReference?: string;
    notes?: string;
  }): { transaction: Transaction; updatedSaver: Saver } {
    return this.recordDeposit(params);
  },

  // Payout / Withdrawal (31-day cycle payout with 1-day banker fee deducted)
  disburseCyclePayout(saverId: string, collectorId: string, paymentMethod: PaymentMethod = 'CASH', momoRef?: string): { transaction: Transaction; updatedSaver: Saver } {
    const savers = this.getSavers();
    const sIdx = savers.findIndex((s) => s.id === saverId);
    if (sIdx === -1) throw new Error('Saver not found');

    const saver = { ...savers[sIdx] };
    const collector = this.getCollectorById(collectorId) || this.getCollectors()[0];
    const totalAccumulated = saver.currentSavings;
    
    // Traditional Ghanaian Susu Banker rule: 1 daily contribution deducted as fee
    const feeDeduction = saver.dailyContribution;
    const netPayout = Math.max(0, totalAccumulated - feeDeduction);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const txRef = `TX-PAYOUT-${dateStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Reset saver for next cycle
    const nextCycle = saver.currentCycle + 1;
    saver.currentCycle = nextCycle;
    saver.currentSavings = 0;
    saver.cycleStartDate = dateStr;
    saver.status = 'ACTIVE';
    saver.passbook = generatePassbook(saver.dailyContribution, 0, dateStr, collector.id, collector.name);

    savers[sIdx] = saver;
    saveData(STORAGE_KEYS.SAVERS, savers);

    // Create Payout Transaction
    const transaction: Transaction = {
      id: `tx-pay-${Date.now()}`,
      referenceNumber: txRef,
      type: 'WITHDRAWAL_PAYOUT',
      saverId: saver.id,
      saverName: saver.fullName,
      saverAccountNumber: saver.accountNumber,
      collectorId: collector.id,
      collectorName: collector.name,
      collectorCode: collector.collectorCode,
      amount: totalAccumulated,
      commissionDeducted: feeDeduction,
      netPayout,
      paymentMethod,
      momoReference: momoRef,
      timestamp: now.toISOString(),
      reconciled: true,
      status: 'COMPLETED',
      notes: `Cycle #${saver.currentCycle - 1} Payout. Gross: GH₵ ${totalAccumulated}, 1-Day Susu Fee: GH₵ ${feeDeduction}, Net Paid: GH₵ ${netPayout}`,
    };

    const transactions = this.getTransactions();
    transactions.unshift(transaction);
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

    this.addAuditLog({
      actorId: collector.id,
      actorName: collector.name,
      actorRole: 'FIELD_COLLECTOR',
      action: 'CYCLE_PAYOUT',
      details: `Disbursed mature Susu cycle payout of GH₵ ${netPayout} to ${saver.fullName} (Banker commission deducted: GH₵ ${feeDeduction})`,
    });

    return { transaction, updatedSaver: saver };
  },

  processPayout(saverId: string, collectorId: string, paymentMethod: PaymentMethod = 'CASH', momoRef?: string): { transaction: Transaction; updatedSaver: Saver } {
    return this.disburseCyclePayout(saverId, collectorId, paymentMethod, momoRef);
  },

  // Group Susu
  getGroupSusus(): GroupSusu[] {
    return loadData<GroupSusu[]>(STORAGE_KEYS.GROUP_SUSUS, INITIAL_GROUP_SUSUS);
  },

  getGroups(): GroupSusu[] {
    return this.getGroupSusus();
  },

  getGroupById(id: string): GroupSusu | undefined {
    return this.getGroupSusus().find((g) => g.id === id);
  },

  createGroupSusu(groupData: {
    name: string;
    assignedCollectorId: string;
    cashoutType: 'DAILY' | 'WEEKLY';
    slotContributionAmount: number;
    cashoutScheduleLabel?: string;
    startDate: string;
    description?: string;
    members: {
      fullName: string;
      phone: string;
      stallOrBusiness: string;
      payoutTurnOrder: number;
      payoutDateExpected?: string;
    }[];
  }): GroupSusu {
    const groups = this.getGroupSusus();
    const collector = this.getCollectorById(groupData.assignedCollectorId);

    const id = `grp-${Date.now()}`;
    const code = `GRP-GH-${groupData.cashoutType === 'DAILY' ? 'D' : 'W'}${Math.floor(10 + groups.length + 1)}`;
    const potSize = groupData.slotContributionAmount * groupData.members.length;
    
    // Weekly Cashouts end on Sundays
    const defaultScheduleLabel = groupData.cashoutType === 'DAILY'
      ? 'Daily Cashout • 4:30 PM Market Tally'
      : 'Weekly Cashout • Ends Every Sunday';

    // Calculate expected payout dates
    const startDateObj = new Date(groupData.startDate || new Date());
    const mappedMembers = groupData.members.map((m, idx) => {
      let expectedDateStr = m.payoutDateExpected;
      if (!expectedDateStr) {
        if (groupData.cashoutType === 'DAILY') {
          const d = new Date(startDateObj);
          d.setDate(d.getDate() + idx);
          expectedDateStr = d.toISOString().split('T')[0];
        } else {
          // Weekly cashout ends on Sundays
          expectedDateStr = getUpcomingSunday(startDateObj, idx);
        }
      }

      return {
        id: `gm-${Date.now()}-${idx}`,
        fullName: m.fullName,
        phone: m.phone,
        stallOrBusiness: m.stallOrBusiness,
        payoutTurnOrder: m.payoutTurnOrder,
        payoutDateExpected: expectedDateStr,
        payoutReceived: false,
        totalContributedSoFar: 0,
        status: 'UP_TO_DATE' as const,
      };
    });

    const finalEndDate = mappedMembers[mappedMembers.length - 1]?.payoutDateExpected || groupData.startDate;

    const newGroup: GroupSusu = {
      id,
      name: groupData.name,
      code,
      assignedCollectorId: groupData.assignedCollectorId,
      assignedCollectorName: collector?.name || 'Collector',
      cashoutType: groupData.cashoutType,
      potSizePerTurn: potSize,
      slotContributionAmount: groupData.slotContributionAmount,
      frequency: groupData.cashoutType === 'DAILY' ? 'DAILY' : 'WEEKLY',
      cashoutScheduleLabel: groupData.cashoutScheduleLabel || defaultScheduleLabel,
      dailyContributionPerMember: groupData.slotContributionAmount,
      totalSlots: groupData.members.length,
      currentRound: 1,
      startDate: groupData.startDate,
      endDate: finalEndDate,
      description: groupData.description,
      status: 'ACTIVE',
      members: mappedMembers,
    };

    groups.unshift(newGroup);
    saveData(STORAGE_KEYS.GROUP_SUSUS, groups);

    this.addAuditLog({
      actorId: this.getActiveUserId(),
      actorName: 'Bernard (Super Admin)',
      actorRole: 'ADMIN',
      action: 'CREATE_GROUP_SUSU',
      details: `Created ${newGroup.cashoutType} Cashout Group: ${newGroup.name} (${newGroup.code}) with ${newGroup.totalSlots} slots at GH₵ ${newGroup.slotContributionAmount}. (1 Contributed Amount deducted per turn)`,
    });

    return newGroup;
  },

  // Disburse Group Cashout (Deducting 1 Contributed Amount for both Daily and Weekly cashouts)
  disburseGroupJackpot(
    groupId: string,
    memberId: string,
    paymentMethod: PaymentMethod = 'CASH',
    momoReference?: string,
    customNotes?: string
  ): Transaction {
    const groups = this.getGroupSusus();
    const gIdx = groups.findIndex((g) => g.id === groupId);
    if (gIdx === -1) throw new Error('Group not found');

    const group = { ...groups[gIdx] };
    const mIdx = group.members.findIndex((m) => m.id === memberId);
    if (mIdx === -1) throw new Error('Member not found');

    const member = { ...group.members[mIdx] };
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const txRef = `TX-${group.cashoutType === 'DAILY' ? 'D-CASHOUT' : 'W-CASHOUT'}-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Rule: One contributed amount is deducted from both daily and weekly cashout
    const grossPot = group.potSizePerTurn;
    const deductedBankerFee = group.slotContributionAmount; // 1 contributed amount
    const netPayout = Math.max(0, grossPot - deductedBankerFee);

    member.payoutReceived = true;
    member.payoutTransactionRef = txRef;
    member.payoutMethod = paymentMethod;
    member.payoutDisbursedAt = now.toISOString();
    group.members[mIdx] = member;
    group.currentRound = Math.min(group.totalSlots, group.currentRound + 1);

    if (group.members.every((m) => m.payoutReceived)) {
      group.status = 'COMPLETED';
    }

    groups[gIdx] = group;
    saveData(STORAGE_KEYS.GROUP_SUSUS, groups);

    // Create Transaction
    const transaction: Transaction = {
      id: `tx-grp-${Date.now()}`,
      referenceNumber: txRef,
      type: 'GROUP_ROTATION_PAYOUT',
      groupId: group.id,
      groupName: group.name,
      saverName: member.fullName,
      collectorId: group.assignedCollectorId,
      collectorName: group.assignedCollectorName,
      collectorCode: 'GRP-COL',
      amount: grossPot,
      commissionDeducted: deductedBankerFee,
      netPayout,
      paymentMethod,
      momoReference,
      timestamp: now.toISOString(),
      reconciled: true,
      status: 'COMPLETED',
      notes: customNotes || `${group.cashoutType === 'DAILY' ? 'Daily' : 'Weekly'} Cashout Turn #${member.payoutTurnOrder} Disbursed to ${member.fullName} (${member.stallOrBusiness}). Gross Pot: GH₵ ${grossPot}, Less 1 Contributed Amount Fee: GH₵ ${deductedBankerFee}, Net Paid: GH₵ ${netPayout} via ${paymentMethod}`,
    };

    const transactions = this.getTransactions();
    transactions.unshift(transaction);
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions);

    this.addAuditLog({
      actorId: this.getActiveUserId(),
      actorName: 'Bernard (Super Admin)',
      actorRole: this.getActiveRole(),
      action: 'DISBURSE_GROUP_JACKPOT',
      details: `Disbursed ${group.cashoutType} Cashout: Gross GH₵ ${grossPot} less 1 contribution (GH₵ ${deductedBankerFee}) -> Net GH₵ ${netPayout} to ${member.fullName} (Turn #${member.payoutTurnOrder})`,
    });

    return transaction;
  },

  // Transactions
  getTransactions(): Transaction[] {
    return loadData<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },

  // Reconciliations
  getReconciliations(): DailyReconciliation[] {
    return loadData<DailyReconciliation[]>(STORAGE_KEYS.RECONCILIATIONS, INITIAL_RECONCILIATIONS);
  },

  submitReconciliation(collectorId: string, actualCash: number, notes?: string): DailyReconciliation {
    const collector = this.getCollectorById(collectorId);
    if (!collector) throw new Error('Collector not found');

    const expectedCash = collector.cashInHand;
    const discrepancy = actualCash - expectedCash;
    const todayStr = new Date().toISOString().split('T')[0];

    const reconciliations = this.getReconciliations();
    const newRec: DailyReconciliation = {
      id: `rec-${Date.now()}`,
      date: todayStr,
      collectorId: collector.id,
      collectorName: collector.name,
      totalCashCollected: collector.todayCollectedCash,
      totalMoMoCollected: collector.todayCollectedMoMo,
      totalTransactionsCount: this.getTransactions().filter(
        (t) => t.collectorId === collectorId && t.timestamp.startsWith(todayStr)
      ).length,
      totalPayoutsGiven: 0,
      netCashExpected: expectedCash,
      actualCashHandedOver: actualCash,
      discrepancy,
      status: discrepancy === 0 ? 'RECONCILED' : 'DISCREPANCY_FLAGGED',
      notes,
    };

    reconciliations.unshift(newRec);
    saveData(STORAGE_KEYS.RECONCILIATIONS, reconciliations);

    // Reset collector cash in hand after vault handover
    collector.cashInHand = 0;
    const collectors = this.getCollectors();
    const cIdx = collectors.findIndex((c) => c.id === collector.id);
    if (cIdx !== -1) {
      collectors[cIdx] = collector;
      saveData(STORAGE_KEYS.COLLECTORS, collectors);
    }

    this.addAuditLog({
      actorId: collector.id,
      actorName: collector.name,
      actorRole: 'FIELD_COLLECTOR',
      action: 'SUBMIT_DAILY_RECONCILIATION',
      details: `Collector submitted cash handover of GH₵ ${actualCash} (Expected: GH₵ ${expectedCash}, Discrepancy: GH₵ ${discrepancy})`,
    });

    return newRec;
  },

  verifyReconciliation(recId: string, adminName: string, statusOverride?: 'RECONCILED' | 'VERIFIED' | 'DISCREPANCY_FLAGGED'): void {
    const reconciliations = this.getReconciliations();
    const idx = reconciliations.findIndex((r) => r.id === recId);
    if (idx !== -1) {
      reconciliations[idx].status = statusOverride === 'DISCREPANCY_FLAGGED' ? 'DISCREPANCY_FLAGGED' : 'RECONCILED';
      reconciliations[idx].verifiedByAdminName = adminName;
      reconciliations[idx].verifiedAt = new Date().toISOString();
      saveData(STORAGE_KEYS.RECONCILIATIONS, reconciliations);

      this.addAuditLog({
        actorId: this.getActiveUserId(),
        actorName: adminName,
        actorRole: 'ADMIN',
        action: 'VERIFY_RECONCILIATION',
        details: `Admin verified daily reconciliation #${recId} for ${reconciliations[idx].collectorName} (Status: ${reconciliations[idx].status})`,
      });
    }
  },

  // Regional Administrative Hubs
  getRegions(): Region[] {
    return loadData<Region[]>(STORAGE_KEYS.REGIONS, INITIAL_REGIONS);
  },

  getRegionById(id: string): Region | undefined {
    return this.getRegions().find((r) => r.id === id);
  },

  addRegion(regionData: {
    name: string;
    code: string;
    headquarters: string;
    regionalManagerName?: string;
    contactPhone?: string;
    contactEmail?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Region {
    const regions = this.getRegions();
    const id = `reg-${Date.now()}`;
    const newRegion: Region = {
      id,
      name: regionData.name.trim(),
      code: regionData.code.trim().toUpperCase(),
      headquarters: regionData.headquarters.trim(),
      regionalManagerName: regionData.regionalManagerName?.trim() || 'Regional Officer',
      contactPhone: regionData.contactPhone?.trim(),
      contactEmail: regionData.contactEmail?.trim(),
      status: regionData.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    regions.push(newRegion);
    saveData(STORAGE_KEYS.REGIONS, regions);

    this.addAuditLog({
      actorId: this.getActiveUserId(),
      actorName: 'Bernard (Super Admin)',
      actorRole: 'ADMIN',
      action: 'CREATE_REGION',
      details: `Created new regional administrative hub: ${newRegion.name} (${newRegion.code}) with headquarters in ${newRegion.headquarters}`,
    });

    return newRegion;
  },

  updateRegion(id: string, updates: Partial<Region>): Region | undefined {
    const regions = this.getRegions();
    const idx = regions.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    regions[idx] = { ...regions[idx], ...updates };
    saveData(STORAGE_KEYS.REGIONS, regions);
    return regions[idx];
  },

  deleteRegion(id: string): boolean {
    const regions = this.getRegions();
    const filtered = regions.filter((r) => r.id !== id);
    if (filtered.length === regions.length) return false;
    saveData(STORAGE_KEYS.REGIONS, filtered);
    return true;
  },

  // District & Municipal Branches
  getBranches(): DistrictBranch[] {
    return loadData<DistrictBranch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  },

  getBranchById(id: string): DistrictBranch | undefined {
    return this.getBranches().find((b) => b.id === id);
  },

  getBranchesByRegion(regionId: string): DistrictBranch[] {
    return this.getBranches().filter((b) => b.regionId === regionId);
  },

  addBranch(branchData: {
    regionId: string;
    name: string;
    code?: string;
    district: string;
    locationAddress: string;
    branchManagerName?: string;
    phone: string;
    email?: string;
    operatingAreas?: string[];
    status?: 'ACTIVE' | 'INACTIVE';
  }): DistrictBranch {
    const branches = this.getBranches();
    const region = this.getRegionById(branchData.regionId);
    const id = `br-${Date.now()}`;
    const code = branchData.code?.trim().toUpperCase() || `BR-${Math.floor(100 + branches.length + 1)}`;

    const newBranch: DistrictBranch = {
      id,
      regionId: branchData.regionId,
      regionName: region ? region.name : 'Central Region',
      name: branchData.name.trim(),
      code,
      district: branchData.district.trim(),
      locationAddress: branchData.locationAddress.trim(),
      branchManagerName: branchData.branchManagerName?.trim() || 'Branch Manager',
      phone: branchData.phone.trim(),
      email: branchData.email?.trim(),
      operatingAreas: branchData.operatingAreas || [],
      status: branchData.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    branches.push(newBranch);
    saveData(STORAGE_KEYS.BRANCHES, branches);

    this.addAuditLog({
      actorId: this.getActiveUserId(),
      actorName: 'Bernard (Super Admin)',
      actorRole: 'ADMIN',
      action: 'CREATE_DISTRICT_BRANCH',
      details: `Created district branch: ${newBranch.name} (${newBranch.code}) under ${newBranch.regionName} (${newBranch.district})`,
    });

    return newBranch;
  },

  updateBranch(id: string, updates: Partial<DistrictBranch>): DistrictBranch | undefined {
    const branches = this.getBranches();
    const idx = branches.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    branches[idx] = { ...branches[idx], ...updates };
    saveData(STORAGE_KEYS.BRANCHES, branches);
    return branches[idx];
  },

  deleteBranch(id: string): boolean {
    const branches = this.getBranches();
    const filtered = branches.filter((b) => b.id !== id);
    if (filtered.length === branches.length) return false;
    saveData(STORAGE_KEYS.BRANCHES, filtered);
    return true;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return loadData<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    saveData(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Clear all dummy entries and reset to 100% clean slate
  clearAllData(): void {
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(INITIAL_COLLECTORS));
    localStorage.setItem(STORAGE_KEYS.SAVERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GROUP_SUSUS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECONCILIATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    notifyListeners();
  },

  resetToDefault(): void {
    this.clearAllData();
  },
};
