/**
 * PostgreSQL / Cloud SQL Schema definitions & DDL scripts for Susu Collector
 * Fully typed with Drizzle ORM standards
 */

export const POSTGRESQL_DDL_SCHEMA = `-- ==========================================================
-- SUSU COLLECTOR RELATIONAL DATABASE SCHEMA (PostgreSQL 15+)
-- High-concurrency Micro-Savings & Branch Oversight Engine
-- ==========================================================

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    region VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(32) NOT NULL,
    manager_name VARCHAR(255) NOT NULL,
    vault_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (vault_balance >= 0),
    vault_limit NUMERIC(14, 2) DEFAULT 100000.00,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Collectors / Mobile Bankers Table
CREATE TABLE IF NOT EXISTS collectors (
    id VARCHAR(64) PRIMARY KEY,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE RESTRICT,
    collector_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    assigned_route TEXT NOT NULL,
    commission_rate NUMERIC(5, 2) DEFAULT 3.30,
    cash_in_hand NUMERIC(12, 2) DEFAULT 0.00,
    total_commission_earned NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'ON_DUTY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Savers (Individual Micro-Savings Accounts) Table
CREATE TABLE IF NOT EXISTS savers (
    id VARCHAR(64) PRIMARY KEY,
    account_number VARCHAR(32) UNIQUE NOT NULL,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE RESTRICT,
    collector_id VARCHAR(64) REFERENCES collectors(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    nickname_or_stall VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    national_id VARCHAR(64),
    next_of_kin_name VARCHAR(255),
    next_of_kin_phone VARCHAR(32),
    daily_contribution NUMERIC(12, 2) NOT NULL CHECK (daily_contribution > 0),
    cycle_type VARCHAR(32) DEFAULT 'DAILY_31',
    total_cycle_days INT DEFAULT 31,
    current_cycle INT DEFAULT 1,
    cycle_start_date DATE NOT NULL,
    cycle_target_amount NUMERIC(12, 2) NOT NULL,
    current_savings NUMERIC(12, 2) DEFAULT 0.00,
    total_all_time_savings NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Passbook Stamp Records Table
CREATE TABLE IF NOT EXISTS passbook_stamps (
    id SERIAL PRIMARY KEY,
    saver_id VARCHAR(64) REFERENCES savers(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 31),
    amount NUMERIC(12, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    date_stamped DATE,
    transaction_ref VARCHAR(64),
    collector_id VARCHAR(64) REFERENCES collectors(id),
    is_fee_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_saver_day UNIQUE(saver_id, day_number)
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    reference_number VARCHAR(64) UNIQUE NOT NULL,
    type VARCHAR(64) NOT NULL, -- DAILY_CONTRIBUTION, WITHDRAWAL_PAYOUT, GROUP_ROTATION_PAYOUT
    saver_id VARCHAR(64) REFERENCES savers(id) ON DELETE SET NULL,
    group_id VARCHAR(64),
    collector_id VARCHAR(64) REFERENCES collectors(id) ON DELETE SET NULL,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL,
    commission_deducted NUMERIC(12, 2) DEFAULT 0.00,
    net_payout NUMERIC(12, 2),
    payment_method VARCHAR(32) NOT NULL, -- CASH, MOBILE_MONEY, BANK_TRANSFER
    passbook_day_number INT,
    reconciled BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) DEFAULT 'COMPLETED',
    notes TEXT,
    momo_reference VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Rotational Group Susu (ROSCA / Tontine) Table
CREATE TABLE IF NOT EXISTS group_susus (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE RESTRICT,
    collector_id VARCHAR(64) REFERENCES collectors(id) ON DELETE RESTRICT,
    pot_size_per_turn NUMERIC(14, 2) NOT NULL,
    slot_contribution_amount NUMERIC(12, 2) NOT NULL,
    frequency VARCHAR(32) DEFAULT 'WEEKLY',
    total_slots INT NOT NULL,
    current_round INT DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Group Susu Members Table
CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR(64) PRIMARY KEY,
    group_id VARCHAR(64) REFERENCES group_susus(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    stall_or_business VARCHAR(255) NOT NULL,
    payout_turn_order INT NOT NULL,
    payout_date_expected DATE NOT NULL,
    payout_received BOOLEAN DEFAULT FALSE,
    payout_transaction_ref VARCHAR(64),
    total_contributed NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'UP_TO_DATE'
);

-- 8. Daily Reconciliations (Cashier Vault Handover) Table
CREATE TABLE IF NOT EXISTS daily_reconciliations (
    id VARCHAR(64) PRIMARY KEY,
    reconciliation_date DATE NOT NULL,
    collector_id VARCHAR(64) REFERENCES collectors(id) ON DELETE RESTRICT,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE RESTRICT,
    total_cash_collected NUMERIC(12, 2) NOT NULL,
    total_momo_collected NUMERIC(12, 2) NOT NULL,
    total_tx_count INT NOT NULL,
    expected_cash NUMERIC(12, 2) NOT NULL,
    actual_cash_handed_over NUMERIC(12, 2) NOT NULL,
    discrepancy NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    verified_by_admin VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 9. Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    branch_id VARCHAR(64),
    ip_address VARCHAR(45)
);

-- Indexes for lightning fast queries
CREATE INDEX idx_savers_collector ON savers(collector_id);
CREATE INDEX idx_savers_branch ON savers(branch_id);
CREATE INDEX idx_transactions_collector_date ON transactions(collector_id, timestamp);
CREATE INDEX idx_transactions_branch_date ON transactions(branch_id, timestamp);
`;
