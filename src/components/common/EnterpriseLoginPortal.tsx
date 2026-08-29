import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Globe, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';
import { StorageService } from '../../services/storageService.ts';
import { AuthSession, Region, DistrictBranch } from '../../types/index.ts';

interface EnterpriseLoginPortalProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const EnterpriseLoginPortal: React.FC<EnterpriseLoginPortalProps> = ({
  onLoginSuccess,
}) => {
  const regions = StorageService.getRegions();
  const branches = StorageService.getBranches();

  // Active Login Tier
  const [activeTier, setActiveTier] = useState<'ADMIN' | 'REGIONAL' | 'DISTRICT'>('ADMIN');

  // Super Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Regional Branch Form State
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    regions.length > 0 ? regions[0].id : ''
  );
  const [regionalOfficerName, setRegionalOfficerName] = useState('');
  const [regionalPin, setRegionalPin] = useState('');

  // District Branch Form State
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches.length > 0 ? branches[0].id : ''
  );
  const [districtOperatorName, setDistrictOperatorName] = useState('');
  const [districtPin, setDistrictPin] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Super Admin submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = StorageService.loginSuperAdmin(adminUsername, adminPassword);
      setIsLoading(false);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setError(res.message || 'Invalid Super Admin credentials');
      }
    }, 350);
  };

  // Regional Branch submit
  const handleRegionalSubmit = (e?: React.FormEvent, directRegionId?: string) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    const regId = directRegionId || selectedRegionId;
    setTimeout(() => {
      const res = StorageService.loginRegionalBranch(regId, regionalOfficerName, regionalPin);
      setIsLoading(false);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setError(res.message || 'Failed to authenticate regional directorate');
      }
    }, 350);
  };

  // District Branch submit
  const handleDistrictSubmit = (e?: React.FormEvent, directBranchId?: string) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    const brId = directBranchId || selectedBranchId;
    setTimeout(() => {
      const res = StorageService.loginDistrictBranch(brId, districtOperatorName, districtPin);
      setIsLoading(false);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setError(res.message || 'Failed to authenticate district branch');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decor Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Main Brand Title Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-400 text-xs font-bold tracking-wide shadow-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            GHANA SUSU ENTERPRISE • AUTHENTICATION GATE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Secure Micro-Finance Terminal
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Please authenticate as <strong className="text-slate-200">Super Admin</strong>, a <strong className="text-slate-200">Regional Directorate</strong>, or a <strong className="text-slate-200">District Branch</strong> before operations begin.
          </p>
        </div>

        {/* Multi-Tier Login Container */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Tier Selector Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-700/80 bg-slate-900/60 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTier('ADMIN');
                setError('');
              }}
              className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTier === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTier('REGIONAL');
                setError('');
              }}
              className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTier === 'REGIONAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Regional Hub</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTier('DISTRICT');
                setError('');
              }}
              className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTier === 'DISTRICT'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>District Branch</span>
            </button>
          </div>

          {/* Form Content Area */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* TIER 1: SUPER ADMIN */}
            {activeTier === 'ADMIN' && (
              <form onSubmit={handleAdminSubmit} className="space-y-5">
                <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-300">Executive Vault & Central Command</p>
                    <p className="text-amber-200/70 text-[11px]">Full nationwide control, regional management, database & reports</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Super Admin Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Enter Super Admin username"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-amber-600/20 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Authenticating Super Admin...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authenticate as Super Admin</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TIER 2: REGIONAL BRANCH DIRECTORATE */}
            {activeTier === 'REGIONAL' && (
              <form onSubmit={(e) => handleRegionalSubmit(e)} className="space-y-5">
                <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-300">Regional Directorate Operations</p>
                    <p className="text-emerald-200/70 text-[11px]">Regional supervisory oversight, district branch coordination</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Select Administrative Region <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedRegionId}
                        onChange={(e) => setSelectedRegionId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      >
                        {regions.map((reg) => (
                          <option key={reg.id} value={reg.id} className="bg-slate-900 text-white">
                            {reg.name} ({reg.code}) — HQ: {reg.headquarters}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Officer / Supervisor Name
                      </label>
                      <input
                        type="text"
                        value={regionalOfficerName}
                        onChange={(e) => setRegionalOfficerName(e.target.value)}
                        placeholder="Enter supervisor name"
                        className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Regional Access PIN
                      </label>
                      <input
                        type="password"
                        value={regionalPin}
                        onChange={(e) => setRegionalPin(e.target.value)}
                        placeholder="Enter PIN"
                        className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Selectors for Regions */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Select Administrative Region:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {regions.slice(0, 6).map((reg) => (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => setSelectedRegionId(reg.id)}
                        className={`p-2 rounded-xl border text-left transition-all group ${
                          selectedRegionId === reg.id
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold truncate">
                          {reg.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {reg.code} • {reg.headquarters}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/20 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Connecting to Regional Directorate...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authenticate Regional Directorate</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TIER 3: DISTRICT BRANCH */}
            {activeTier === 'DISTRICT' && (
              <form onSubmit={(e) => handleDistrictSubmit(e)} className="space-y-5">
                <div className="flex items-center gap-3 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-indigo-300">District Branch & Market Operations</p>
                    <p className="text-indigo-200/70 text-[11px]">Field bankers, client passbooks, daily cash collection & registration</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Select District Branch <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        {branches.map((br) => (
                          <option key={br.id} value={br.id} className="bg-slate-900 text-white">
                            {br.name} ({br.code}) — {br.regionName} ({br.district})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Operator / Banker Name
                      </label>
                      <input
                        type="text"
                        value={districtOperatorName}
                        onChange={(e) => setDistrictOperatorName(e.target.value)}
                        placeholder="Enter operator / banker name"
                        className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Branch Access PIN
                      </label>
                      <input
                        type="password"
                        value={districtPin}
                        onChange={(e) => setDistrictPin(e.target.value)}
                        placeholder="Enter PIN"
                        className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Selectors for Branches */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Select District Branch:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {branches.slice(0, 4).map((br) => (
                      <button
                        key={br.id}
                        type="button"
                        onClick={() => setSelectedBranchId(br.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all group flex items-center justify-between ${
                          selectedBranchId === br.id
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold truncate">
                            {br.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {br.regionName} • <span className="font-mono text-indigo-400">{br.code}</span>
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Opening District Branch Terminal...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authenticate District Branch</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="text-center space-y-1 text-xs text-slate-500">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
            Encrypted Session • Multi-Tier Role Governance • Ghana Susu Protocol
          </p>
        </div>
      </div>
    </div>
  );
};
