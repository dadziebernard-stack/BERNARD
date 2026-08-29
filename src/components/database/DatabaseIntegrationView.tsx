import React, { useState } from 'react';
import { POSTGRESQL_DDL_SCHEMA } from '../../services/postgresSchema.ts';
import { FIRESTORE_BLUEPRINT_CONFIG, FIRESTORE_RULES_SPEC } from '../../services/firestoreBlueprint.ts';
import { 
  Database, 
  Flame, 
  Layers, 
  Copy, 
  Check, 
  Code2, 
  ShieldCheck, 
  Server, 
  HardDrive,
  Cpu
} from 'lucide-react';

export const DatabaseIntegrationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'postgres' | 'firestore' | 'rules'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900">Hybrid Cloud Storage & Database Architecture</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dual-engine persistence powering Susu Collector: PostgreSQL for relational ledger audit trails + Firestore for real-time offline field sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
            Hybrid Ready: Postgres + Firestore
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          System Architecture
        </button>

        <button
          onClick={() => setActiveTab('postgres')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'postgres'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          PostgreSQL DDL & Schema
        </button>

        <button
          onClick={() => setActiveTab('firestore')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'firestore'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Firestore Blueprint & JSON
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Security Rules (firestore.rules)
        </button>
      </div>

      {/* Tab 1: Architecture Overview */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">PostgreSQL (Cloud SQL) Engine</h3>
                <p className="text-xs text-slate-500">ACID Relational Financial Ledger & Reporting</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              PostgreSQL serves as the immutable source of truth for all cross-branch transactions, vault balances, daily cashier reconciliations, and regulatory compliance reports.
            </p>

            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Strict foreign keys across branches, collectors, and savers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Indexed historical queries for rapid monthly and annual audits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Drizzle ORM typed schema ready for server-side endpoints</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Google Cloud Firestore</h3>
                <p className="text-xs text-slate-500">Real-Time Mobile Collector Synchronization</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Firestore enables offline caching for field bankers walking market lanes with spotty connectivity. Updates seamlessly push in real-time to the executive dashboard as soon as network returns.
            </p>

            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-time WebSocket listener on <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded font-mono">/transactions</code></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Offline local persistence with automatic stamp synchronization</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Role-based Firestore security rules preventing unauthorized writes</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: PostgreSQL Schema */}
      {activeTab === 'postgres' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">PostgreSQL 15+ DDL & Schema Migration Script</h3>
              <p className="text-xs text-slate-500">Production SQL statements with constraints and indexes</p>
            </div>
            <button
              onClick={() => handleCopy(POSTGRESQL_DDL_SCHEMA, 'postgres')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'postgres' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedKey === 'postgres' ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-[500px]">
            {POSTGRESQL_DDL_SCHEMA}
          </pre>
        </div>
      )}

      {/* Tab 3: Firestore Blueprint */}
      {activeTab === 'firestore' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Firestore Collections Blueprint (JSON)</h3>
              <p className="text-xs text-slate-500">Structured document models for collections</p>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(FIRESTORE_BLUEPRINT_CONFIG, null, 2), 'firestore')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'firestore' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedKey === 'firestore' ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 overflow-x-auto max-h-[500px]">
            {JSON.stringify(FIRESTORE_BLUEPRINT_CONFIG, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 4: Security Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">firestore.rules Specification</h3>
              <p className="text-xs text-slate-500">Granular role-based access rules for Collectors and Admin</p>
            </div>
            <button
              onClick={() => handleCopy(FIRESTORE_RULES_SPEC, 'rules')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === 'rules' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedKey === 'rules' ? 'Copied!' : 'Copy Rules'}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-sky-400 overflow-x-auto max-h-[500px]">
            {FIRESTORE_RULES_SPEC}
          </pre>
        </div>
      )}
    </div>
  );
};
