/**
 * Firestore Database Blueprint & Schema Architecture
 * For real-time document synchronization, collector offline sync, and security rules
 */

export const FIRESTORE_BLUEPRINT_CONFIG = {
  entities: {
    Branch: {
      title: "Branch",
      description: "Regional branch office with vault balance and assigned collectors",
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        code: { type: "string" },
        region: { type: "string" },
        managerName: { type: "string" },
        vaultBalance: { type: "number" },
        vaultLimit: { type: "number" },
        activeCollectorsCount: { type: "number" },
        totalSaversCount: { type: "number" }
      },
      required: ["name", "code", "region", "managerName"]
    },
    Collector: {
      title: "Collector",
      description: "Mobile banker or field collector assigned to market routes",
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        collectorCode: { type: "string" },
        phone: { type: "string" },
        branchId: { type: "string" },
        assignedRoute: { type: "string" },
        cashInHand: { type: "number" },
        todayCollectedCash: { type: "number" },
        todayCollectedMoMo: { type: "number" },
        commissionRate: { type: "number" }
      },
      required: ["name", "collectorCode", "branchId", "phone"]
    },
    Saver: {
      title: "Saver",
      description: "Individual Susu saver record with daily target and 31-day passbook",
      type: "object",
      properties: {
        id: { type: "string" },
        accountNumber: { type: "string" },
        fullName: { type: "string" },
        nicknameOrStall: { type: "string" },
        phone: { type: "string" },
        branchId: { type: "string" },
        collectorId: { type: "string" },
        dailyContribution: { type: "number" },
        currentSavings: { type: "number" },
        totalCycleDays: { type: "number" },
        status: { type: "string", enum: ["ACTIVE", "COMPLETED", "WITHDRAWN"] }
      },
      required: ["accountNumber", "fullName", "branchId", "collectorId", "dailyContribution"]
    },
    Transaction: {
      title: "Transaction",
      description: "Daily contribution or payout ledger entry",
      type: "object",
      properties: {
        id: { type: "string" },
        referenceNumber: { type: "string" },
        type: { type: "string", enum: ["DAILY_CONTRIBUTION", "WITHDRAWAL_PAYOUT", "GROUP_ROTATION_PAYOUT"] },
        saverId: { type: "string" },
        collectorId: { type: "string" },
        branchId: { type: "string" },
        amount: { type: "number" },
        paymentMethod: { type: "string", enum: ["CASH", "MOBILE_MONEY", "BANK_TRANSFER"] },
        timestamp: { type: "string" }
      },
      required: ["referenceNumber", "type", "collectorId", "branchId", "amount", "paymentMethod"]
    },
    GroupSusu: {
      title: "GroupSusu",
      description: "Rotational Susu (ROSCA) scheme with slot assignments and rotation order",
      type: "object",
      properties: {
        id: { type: "string" },
        code: { type: "string" },
        name: { type: "string" },
        branchId: { type: "string" },
        assignedCollectorId: { type: "string" },
        potSizePerTurn: { type: "number" },
        slotContributionAmount: { type: "number" },
        currentRound: { type: "number" },
        totalSlots: { type: "number" }
      },
      required: ["code", "name", "branchId", "potSizePerTurn", "slotContributionAmount", "totalSlots"]
    }
  },
  firestore: {
    "/branches/{branchId}": {
      schema: "Branch",
      description: "All regional branch hubs and vault ledgers"
    },
    "/collectors/{collectorId}": {
      schema: "Collector",
      description: "Field bankers and mobile collector profiles"
    },
    "/savers/{saverId}": {
      schema: "Saver",
      description: "Individual savers and 31-day passbooks"
    },
    "/transactions/{transactionId}": {
      schema: "Transaction",
      description: "Immutable transaction records for all deposits and payouts"
    },
    "/groupSusus/{groupId}": {
      schema: "GroupSusu",
      description: "Rotational Susu / ROSCA group accounts"
    },
    "/reconciliations/{reconciliationId}": {
      schema: "Reconciliation",
      description: "End of day banker cash handovers and vault reconciliation"
    },
    "/auditLogs/{logId}": {
      schema: "AuditLog",
      description: "Administrative and operational audit trail"
    }
  }
};

export const FIRESTORE_RULES_SPEC = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    function isCollector() {
      return isSignedIn() && exists(/databases/$(database)/documents/collectors/$(request.auth.uid));
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Branches
    match /branches/{branchId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // Collectors
    match /collectors/{collectorId} {
      allow read: if isSignedIn();
      allow write: if isAdmin() || (isCollector() && request.auth.uid == collectorId);
    }

    // Savers
    match /savers/{saverId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn() && (isAdmin() || isCollector());
      allow delete: if isAdmin();
    }

    // Transactions (Append-Only ledger for integrity)
    match /transactions/{transactionId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isAdmin() || isCollector());
      allow update, delete: if isAdmin();
    }

    // Group Susus
    match /groupSusus/{groupId} {
      allow read: if isSignedIn();
      allow write: if isAdmin() || isCollector();
    }

    // Reconciliations
    match /reconciliations/{recId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
    }

    // Audit logs
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
      allow update, delete: if false; // Immutable audit log
    }
  }
}
`;
