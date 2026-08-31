export type UserRole = 'ADMIN' | 'FIELD_COLLECTOR' | 'COLLECTOR';

export type AuthLevel = 'SUPER_ADMIN' | 'REGIONAL_BRANCH' | 'DISTRICT_BRANCH';

export interface AuthSession {
  level: AuthLevel;
  userId: string;
  userName: string;
  userRole: UserRole;
  regionId?: string;
  regionName?: string;
  regionCode?: string;
  branchId?: string;
  branchName?: string;
  branchCode?: string;
  district?: string;
  loggedInAt: string;
}

export interface Region {
  id: string;
  name: string; // e.g. "Greater Accra Region", "Ashanti Region"
  code: string; // e.g. "GAR", "ASH", "WR", "CR", "ER", "NR", "VR"
  headquarters: string; // e.g. "Accra", "Kumasi", "Sekondi-Takoradi"
  regionalManagerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface DistrictBranch {
  id: string;
  regionId: string;
  regionName: string;
  name: string; // e.g. "Makola District Branch", "Kejetia Central Branch"
  code: string; // e.g. "ACC-MK-01", "KUM-KJ-02"
  district: string; // e.g. "Accra Metropolitan", "Kumasi Metropolitan"
  locationAddress: string; // e.g. "Makola Shopping Mall, Commercial Block B"
  branchManagerName?: string;
  phone: string;
  email?: string;
  operatingAreas?: string[]; // e.g. ["Makola Market", "Okaishie", "Tudu"]
  status: 'ACTIVE' | 'INACTIVE';
  dailyCollectionGoal?: number; // Configurable daily collection target in GH₵ (e.g. 5,000)
  createdAt: string;
}

export interface Collector {
  id: string;
  name: string;
  collectorCode: string; // e.g. COL-ACC-101
  phone: string;
  email?: string;
  assignedRoute: string; // e.g. Makola Market Lane 3, Kejetia Zone B
  todayCollectedCash: number;
  todayCollectedMoMo: number;
  todayTarget: number;
  cashInHand: number;
  totalCommissionEarned: number;
  commissionRate: number; // e.g. 3.3% or fixed 1 day deposit rule
  activeSaversCount: number;
  status: 'ACTIVE' | 'ON_DUTY' | 'OFF_DUTY' | 'SUSPENDED';
  avatarUrl?: string;
}

export type SusuCycleType = 'DAILY_31' | 'DAILY_30' | 'WEEKLY_12' | 'FLEXIBLE';

export interface PassbookDay {
  dayNumber: number; // 1 to 31
  date?: string; // YYYY-MM-DD when stamped
  amount: number;
  isPaid: boolean;
  transactionRef?: string;
  stampedByCollectorId?: string;
  stampedByCollectorName?: string;
  isFeeDay?: boolean; // Traditional Susu day 1 is banker fee
}

export interface Saver {
  id: string;
  accountNumber: string; // e.g. SAV-2026-0041
  fullName: string;
  nicknameOrStall: string; // e.g. "Mama Tina / Stall 4B"
  phone: string;
  nationalId?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  avatarUrl?: string;
  collectorId: string;
  collectorName: string;
  branchId?: string;
  branchName?: string;
  regionName?: string;
  dailyContribution: number; // e.g. 50 GHS / 20 GHS
  cycleType: SusuCycleType;
  totalCycleDays: number; // 31
  currentCycle: number; // Cycle 1, Cycle 2, etc.
  cycleStartDate: string;
  cycleTargetAmount: number; // dailyContribution * totalCycleDays
  currentSavings: number; // total accumulated in current cycle
  totalAllTimeSavings: number;
  passbook: PassbookDay[];
  status: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'DORMANT';
  registeredAt: string;
  lastDepositDate?: string;
  note?: string;
}

export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
export type TransactionType = 'DAILY_CONTRIBUTION' | 'WITHDRAWAL_PAYOUT' | 'GROUP_ROTATION_PAYOUT' | 'COMMISSION_PAYOUT' | 'VAULT_HANDOVER';

export interface Transaction {
  id: string;
  referenceNumber: string; // e.g. TX-20260828-8941
  type: TransactionType;
  saverId?: string;
  saverName?: string;
  saverAccountNumber?: string;
  groupId?: string;
  groupName?: string;
  branchId?: string;
  branchName?: string;
  collectorId: string;
  collectorName: string;
  collectorCode: string;
  amount: number;
  commissionDeducted?: number;
  netPayout?: number;
  paymentMethod: PaymentMethod;
  stampedDays?: number[]; // e.g. [14, 15] if paying 2 days at once
  passbookDayNumber?: number;
  timestamp: string;
  reconciled: boolean;
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'REJECTED';
  receiptUrl?: string;
  notes?: string;
  momoReference?: string;
}

export type GroupCashoutType = 'DAILY' | 'WEEKLY';

export interface GroupMember {
  id: string;
  fullName: string;
  phone: string;
  stallOrBusiness: string;
  payoutTurnOrder: number; // 1, 2, 3...
  payoutDateExpected: string;
  payoutReceived: boolean;
  payoutTransactionRef?: string;
  payoutMethod?: PaymentMethod;
  payoutDisbursedAt?: string;
  totalContributedSoFar: number;
  status: 'UP_TO_DATE' | 'LATE' | 'DEFAULTED';
}

export interface GroupSusu {
  id: string;
  name: string;
  code: string; // e.g. GRP-ACC-09
  assignedCollectorId: string;
  assignedCollectorName: string;
  cashoutType: GroupCashoutType; // 'DAILY' for Daily Cashout, 'WEEKLY' for Weekly Cashout
  potSizePerTurn: number; // total cashout received per turn e.g. 5,000
  slotContributionAmount: number; // per member per frequency e.g. 500
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // for backwards compatibility
  cashoutScheduleLabel?: string; // e.g. "Every Day at 4:30 PM" or "Every Sunday"
  dailyContributionPerMember?: number; // daily quota if applicable
  totalSlots: number; // e.g. 10 members
  currentRound: number; // Round 3 of 10
  startDate: string;
  endDate: string;
  members: GroupMember[];
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING_START';
  description?: string;
}

export interface DailyReconciliation {
  id: string;
  date: string; // YYYY-MM-DD
  collectorId: string;
  collectorName: string;
  totalCashCollected: number;
  totalMoMoCollected: number;
  totalTransactionsCount: number;
  totalPayoutsGiven: number;
  netCashExpected: number;
  actualCashHandedOver: number;
  discrepancy: number; // actual - expected
  status: 'PENDING' | 'RECONCILED' | 'DISCREPANCY_FLAGGED';
  verifiedByAdminName?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}
