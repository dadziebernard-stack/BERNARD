import { Collector, Saver, Transaction, GroupSusu, DailyReconciliation, AuditLog, PassbookDay, Region, DistrictBranch } from '../types/index.ts';

// Ghanaian Regional Administrative Hubs
export const INITIAL_REGIONS: Region[] = [
  {
    id: 'reg-gar',
    name: 'Greater Accra Region',
    code: 'GAR',
    headquarters: 'Accra',
    regionalManagerName: 'Bernard',
    contactPhone: '+233 24 000 0000',
    contactEmail: 'accra.region@susu.gh',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
  {
    id: 'reg-ash',
    name: 'Ashanti Region',
    code: 'ASH',
    headquarters: 'Kumasi',
    regionalManagerName: 'Regional Directorate',
    contactPhone: '+233 32 200 0000',
    contactEmail: 'ashanti.region@susu.gh',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
  {
    id: 'reg-wr',
    name: 'Western Region',
    code: 'WR',
    headquarters: 'Sekondi-Takoradi',
    regionalManagerName: 'Regional Directorate',
    contactPhone: '+233 31 200 0000',
    contactEmail: 'western.region@susu.gh',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
  {
    id: 'reg-cr',
    name: 'Central Region',
    code: 'CR',
    headquarters: 'Cape Coast',
    regionalManagerName: 'Regional Directorate',
    contactPhone: '+233 33 200 0000',
    contactEmail: 'central.region@susu.gh',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
  {
    id: 'reg-er',
    name: 'Eastern Region',
    code: 'ER',
    headquarters: 'Koforidua',
    regionalManagerName: 'Regional Directorate',
    contactPhone: '+233 34 200 0000',
    contactEmail: 'eastern.region@susu.gh',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
  {
    id: 'reg-nr',
    name: 'Northern Region',
    code: 'NR',
    headquarters: 'Tamale',
    regionalManagerName: 'Regional Directorate',
    contactPhone: '+233 37 200 0000',
    contactEmail: 'northern.region@susu.gh',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
  {
    id: 'reg-vr',
    name: 'Volta Region',
    code: 'VR',
    headquarters: 'Ho',
    regionalManagerName: 'Regional Directorate',
    contactPhone: '+233 36 200 0000',
    contactEmail: 'volta.region@susu.gh',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
  },
];

// District & Municipal Branches
export const INITIAL_BRANCHES: DistrictBranch[] = [
  {
    id: 'br-makola',
    regionId: 'reg-gar',
    regionName: 'Greater Accra Region',
    name: 'Makola District Branch',
    code: 'ACC-MK-01',
    district: 'Accra Metropolitan Assembly (AMA)',
    locationAddress: 'Makola Shopping Mall, Commercial Block B, Accra',
    branchManagerName: 'Bernard',
    phone: '+233 24 000 0000',
    email: 'makola@susu.gh',
    operatingAreas: ['Makola Market', 'Okaishie', 'Cow Lane', 'Tudu', 'Kantanto'],
    status: 'ACTIVE',
    createdAt: '2026-01-10',
  },
  {
    id: 'br-tema',
    regionId: 'reg-gar',
    regionName: 'Greater Accra Region',
    name: 'Tema Community 1 Branch',
    code: 'TMA-C1-01',
    district: 'Tema Metropolitan Assembly',
    locationAddress: 'Tema Community 1 Central Market Lane, Tema',
    branchManagerName: 'Operations Lead',
    phone: '+233 30 320 0000',
    email: 'tema@susu.gh',
    operatingAreas: ['Community 1 Market', 'Tema Harbour Enclave', 'Site 2', 'Site 7'],
    status: 'ACTIVE',
    createdAt: '2026-01-15',
  },
  {
    id: 'br-kejetia',
    regionId: 'reg-ash',
    regionName: 'Ashanti Region',
    name: 'Kejetia Central Branch',
    code: 'KUM-KJ-01',
    district: 'Kumasi Metropolitan Assembly (KMA)',
    locationAddress: 'Kejetia New Market Terminal, Gate 4, Kumasi',
    branchManagerName: 'Operations Lead',
    phone: '+233 32 201 1111',
    email: 'kejetia@susu.gh',
    operatingAreas: ['Kejetia Market', 'Adum Commercial Area', 'Central Market', 'Asafo'],
    status: 'ACTIVE',
    createdAt: '2026-01-20',
  },
  {
    id: 'br-kasoa',
    regionId: 'reg-cr',
    regionName: 'Central Region',
    name: 'Kasoa Main District Branch',
    code: 'CAS-KS-01',
    district: 'Awutu Senya East Municipal Assembly',
    locationAddress: 'Kasoa New Market Road, Opposite Commercial Bank, Kasoa',
    branchManagerName: 'Operations Lead',
    phone: '+233 20 800 0000',
    email: 'kasoa@susu.gh',
    operatingAreas: ['Kasoa New Market', 'Old Timber Market', 'Ofaakor Road', 'Bawjiase Junction'],
    status: 'ACTIVE',
    createdAt: '2026-02-01',
  },
  {
    id: 'br-takoradi',
    regionId: 'reg-wr',
    regionName: 'Western Region',
    name: 'Takoradi Market Circle Branch',
    code: 'TKR-MC-01',
    district: 'Sekondi-Takoradi Metropolitan Assembly (STMA)',
    locationAddress: 'Market Circle Commercial Lane, Takoradi',
    branchManagerName: 'Operations Lead',
    phone: '+233 31 202 2222',
    email: 'takoradi@susu.gh',
    operatingAreas: ['Market Circle', 'Kojokrom', 'Effiakuma Market', 'Harbour Commercial Zone'],
    status: 'ACTIVE',
    createdAt: '2026-02-05',
  },
];

// Central Sole Operator Profile (Bernard)
export const INITIAL_COLLECTORS: Collector[] = [
  {
    id: 'col-admin',
    name: 'Bernard (Operator)',
    collectorCode: 'OPERATOR-01',
    phone: '+233 24 000 0000',
    email: 'bendazgroup@gmail.com',
    assignedRoute: 'Central Market & Direct Route',
    todayCollectedCash: 0,
    todayCollectedMoMo: 0,
    todayTarget: 10000,
    cashInHand: 0,
    totalCommissionEarned: 0,
    commissionRate: 3.3, // 1-day contribution deduction per 31-day cycle
    activeSaversCount: 0,
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

// Helper to generate a blank or stamped 31-day passbook
export function generatePassbook(dailyAmount: number, daysPaid: number = 0, startDateStr: string = new Date().toISOString().split('T')[0], collectorId: string = 'col-admin', collectorName: string = 'Bernard'): PassbookDay[] {
  const days: PassbookDay[] = [];
  const start = new Date(startDateStr);

  for (let i = 1; i <= 31; i++) {
    const isPaid = i <= daysPaid;
    const stampDate = new Date(start);
    stampDate.setDate(start.getDate() + (i - 1));
    const dateFormatted = stampDate.toISOString().split('T')[0];

    days.push({
      dayNumber: i,
      amount: dailyAmount,
      isPaid,
      date: isPaid ? dateFormatted : undefined,
      transactionRef: isPaid ? `TX-${dateFormatted.replace(/-/g, '')}-${1000 + i}` : undefined,
      stampedByCollectorId: isPaid ? collectorId : undefined,
      stampedByCollectorName: isPaid ? collectorName : undefined,
      isFeeDay: i === 1, // Traditional Susu 1st day is banker commission
    });
  }

  return days;
}

// 100% Clean initial state - all dummy records cleared
export const INITIAL_SAVERS: Saver[] = [];
export const INITIAL_GROUP_SUSUS: GroupSusu[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_RECONCILIATIONS: DailyReconciliation[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

