import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService.ts';
import { 
  UserRole, 
  Collector, 
  Saver, 
  Transaction, 
  GroupSusu, 
  DailyReconciliation,
  AuthSession 
} from './types/index.ts';

// UI Components
import { Navbar } from './components/common/Navbar.tsx';
import { EnterpriseLoginPortal } from './components/common/EnterpriseLoginPortal.tsx';
import { ReceiptModal } from './components/common/ReceiptModal.tsx';
import { SaversDirectory } from './components/admin/SaversDirectory.tsx';
import { DailyTallyView } from './components/admin/DailyTallyView.tsx';
import { RecordDepositModal } from './components/collector/RecordDepositModal.tsx';
import { SaverRegistrationModal } from './components/collector/SaverRegistrationModal.tsx';
import { SaverDetailModal } from './components/collector/SaverDetailModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { GroupSusuManager } from './components/admin/GroupSusuManager.tsx';
import { AutomatedReportsView } from './components/admin/AutomatedReportsView.tsx';
import { BranchManagementView } from './components/admin/BranchManagementView.tsx';
import { DatabaseIntegrationView } from './components/database/DatabaseIntegrationView.tsx';
import { Globe, Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function App() {
  // Authentication & Session State
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    return StorageService.getActiveSession();
  });

  // App Data State
  const [savers, setSavers] = useState<Saver[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<GroupSusu[]>([]);
  const [reconciliations, setReconciliations] = useState<DailyReconciliation[]>([]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('admin-dashboard');
  const currencySymbol = 'GH₵';

  // Modals State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [preSelectedSaverForDeposit, setPreSelectedSaverForDeposit] = useState<Saver | null>(null);
  const [isNewSaverModalOpen, setIsNewSaverModalOpen] = useState(false);
  const [selectedSaverForDetail, setSelectedSaverForDetail] = useState<Saver | null>(null);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [activeReceiptSaver, setActiveReceiptSaver] = useState<Saver | null>(null);

  // Load and subscribe to storage
  const refreshData = () => {
    setSavers(StorageService.getSavers());
    setTransactions(StorageService.getTransactions());
    setGroups(StorageService.getGroups());
    setReconciliations(StorageService.getReconciliations());
    setAuthSession(StorageService.getActiveSession());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = StorageService.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  // Handle Login
  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    refreshData();
    // Default appropriate landing tab per role
    if (session.level === 'DISTRICT_BRANCH') {
      setActiveTab('savers');
    } else if (session.level === 'REGIONAL_BRANCH') {
      setActiveTab('branches');
    } else {
      setActiveTab('admin-dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    StorageService.logout();
    setAuthSession(null);
  };

  // Clear all dummy entries
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data and start with a fresh slate?')) {
      StorageService.clearAllData();
      refreshData();
    }
  };

  // Quick 1-click Stamp from cards
  const handleQuickStamp = (saver: Saver) => {
    setPreSelectedSaverForDeposit(saver);
    setIsDepositModalOpen(true);
  };

  // Deposit Success Handler
  const handleDepositSuccess = (transaction: Transaction, updatedSaver: Saver) => {
    setIsDepositModalOpen(false);
    setPreSelectedSaverForDeposit(null);
    refreshData();
    setActiveReceiptTx(transaction);
    setActiveReceiptSaver(updatedSaver);

    // If detail modal was open, refresh selected saver
    if (selectedSaverForDetail && selectedSaverForDetail.id === updatedSaver.id) {
      setSelectedSaverForDetail(updatedSaver);
    }
  };

  // Payout Success Handler
  const handlePayoutSuccess = (transaction: Transaction, updatedSaver: Saver) => {
    refreshData();
    setActiveReceiptTx(transaction);
    setActiveReceiptSaver(updatedSaver);
    if (selectedSaverForDetail && selectedSaverForDetail.id === updatedSaver.id) {
      setSelectedSaverForDetail(updatedSaver);
    }
  };

  // Group Payout Success
  const handleGroupPayoutSuccess = (transaction: Transaction) => {
    refreshData();
    setActiveReceiptTx(transaction);
    setActiveReceiptSaver(null);
  };

  // REQUIRE LOGIN BEFORE WORK CAN START
  if (!authSession) {
    return <EnterpriseLoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        currencySymbol={currencySymbol}
        authSession={authSession}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        onOpenRecordDeposit={() => {
          setPreSelectedSaverForDeposit(null);
          setIsDepositModalOpen(true);
        }}
        onOpenNewSaver={() => setIsNewSaverModalOpen(true)}
        onClearAllData={handleClearAllData}
      />

      {/* Active Branch / Regional Context Banner */}
      {authSession.level === 'REGIONAL_BRANCH' && (
        <div className="bg-emerald-800 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-700">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-300" />
              <span>
                <strong>{authSession.regionName} Regional Directorate:</strong> Logged in as supervisory officer <span className="text-white font-bold font-mono">{authSession.userName}</span> ({authSession.regionCode}).
              </span>
            </div>
            <button
              onClick={() => setActiveTab('branches')}
              className="text-emerald-200 hover:text-white underline font-semibold text-[11px] shrink-0"
            >
              View Regional Districts & Branches →
            </button>
          </div>
        </div>
      )}

      {authSession.level === 'DISTRICT_BRANCH' && (
        <div className="bg-indigo-900 text-indigo-100 text-xs py-2 px-4 border-b border-indigo-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-300" />
              <span>
                <strong>{authSession.branchName} Terminal:</strong> Operating on active passbooks for district territory.
              </span>
            </div>
            <button
              onClick={() => setIsNewSaverModalOpen(true)}
              className="px-2 py-0.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-[11px] shrink-0"
            >
              + Register Branch Client
            </button>
          </div>
        </div>
      )}

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'admin-dashboard' && (
          <AdminDashboard
            savers={savers}
            transactions={transactions}
            groups={groups}
            reconciliations={reconciliations}
            currencySymbol={currencySymbol}
            authSession={authSession}
            onNavigateTab={setActiveTab}
            onOpenNewSaverModal={() => setIsNewSaverModalOpen(true)}
            onOpenNewGroupModal={() => setActiveTab('groups')}
            onSelectSaver={(saver) => setSelectedSaverForDetail(saver)}
            onViewReceipt={(tx) => {
              const s = savers.find((x) => x.id === tx.saverId);
              setActiveReceiptTx(tx);
              setActiveReceiptSaver(s || null);
            }}
          />
        )}

        {/* TAB 2: SAVERS DIRECTORY & PASSBOOKS */}
        {activeTab === 'savers' && (
          <SaversDirectory
            savers={savers}
            currencySymbol={currencySymbol}
            onOpenRecordDeposit={(saver) => {
              setPreSelectedSaverForDeposit(saver || null);
              setIsDepositModalOpen(true);
            }}
            onOpenNewSaverModal={() => setIsNewSaverModalOpen(true)}
            onSelectSaver={(saver) => setSelectedSaverForDetail(saver)}
            onQuickStamp={handleQuickStamp}
          />
        )}

        {/* TAB 3: GROUP SUSU (ROSCA) */}
        {activeTab === 'groups' && (
          <GroupSusuManager
            groups={groups}
            currencySymbol={currencySymbol}
            onGroupCreated={() => refreshData()}
            onPayoutSuccess={handleGroupPayoutSuccess}
          />
        )}

        {/* TAB 4: DAILY CASH & TALLY */}
        {activeTab === 'daily-tally' && (
          <DailyTallyView
            transactions={transactions}
            savers={savers}
            currencySymbol={currencySymbol}
            onViewReceipt={(tx) => {
              const s = savers.find((x) => x.id === tx.saverId);
              setActiveReceiptTx(tx);
              setActiveReceiptSaver(s || null);
            }}
          />
        )}

        {/* TAB 5: FINANCIAL REPORTS & STATEMENTS */}
        {activeTab === 'reports' && (
          <AutomatedReportsView
            savers={savers}
            transactions={transactions}
            groups={groups}
            reconciliations={reconciliations}
            currencySymbol={currencySymbol}
          />
        )}

        {/* TAB 6: REGIONAL & DISTRICT BRANCHES */}
        {activeTab === 'branches' && (
          <BranchManagementView
            savers={savers}
            onSelectSaver={(saver) => setSelectedSaverForDetail(saver)}
          />
        )}

        {/* TAB 7: DATABASE & CLOUD STORAGE */}
        {activeTab === 'database' && (
          <DatabaseIntegrationView />
        )}
      </main>

      {/* MODAL: Record Daily Contribution */}
      {isDepositModalOpen && (
        <RecordDepositModal
          savers={savers}
          preSelectedSaver={preSelectedSaverForDeposit}
          currencySymbol={currencySymbol}
          onClose={() => {
            setIsDepositModalOpen(false);
            setPreSelectedSaverForDeposit(null);
          }}
          onSuccess={handleDepositSuccess}
        />
      )}

      {/* MODAL: Create New Saver Account */}
      {isNewSaverModalOpen && (
        <SaverRegistrationModal
          currencySymbol={currencySymbol}
          onClose={() => setIsNewSaverModalOpen(false)}
          onSuccess={(newSaver) => {
            refreshData();
            setSelectedSaverForDetail(newSaver);
          }}
        />
      )}

      {/* MODAL: Saver 31-Day Passbook & Details */}
      {selectedSaverForDetail && (
        <SaverDetailModal
          saver={selectedSaverForDetail}
          currencySymbol={currencySymbol}
          onClose={() => setSelectedSaverForDetail(null)}
          onStampFast={(saver) => {
            setPreSelectedSaverForDeposit(saver);
            setIsDepositModalOpen(true);
          }}
          onPayoutSuccess={handlePayoutSuccess}
          onViewReceipt={(tx) => {
            setActiveReceiptTx(tx);
            setActiveReceiptSaver(selectedSaverForDetail);
          }}
        />
      )}

      {/* MODAL: Digital & Thermal Receipt Slip */}
      {activeReceiptTx && (
        <ReceiptModal
          transaction={activeReceiptTx}
          saver={activeReceiptSaver}
          currencySymbol={currencySymbol}
          onClose={() => {
            setActiveReceiptTx(null);
            setActiveReceiptSaver(null);
          }}
        />
      )}

      {/* Footer Bar */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 no-print text-center text-xs text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Susu Collector — Ghana Micro-Savings Platform (GH₵)</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Session: {authSession.userName} ({authSession.level})
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ghana Cedis (GH₵)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

