import React, { useState } from 'react';
import { StorageService } from '../../services/storageService.ts';
import { DistrictBranch, Region } from '../../types/index.ts';
import { Building2, X, MapPin, Phone, Mail, User, ShieldCheck, Tag, Plus } from 'lucide-react';

interface CreateBranchModalProps {
  regions: Region[];
  initialBranch?: DistrictBranch | null;
  defaultRegionId?: string;
  onClose: () => void;
  onSuccess: (branch: DistrictBranch) => void;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  regions,
  initialBranch,
  defaultRegionId,
  onClose,
  onSuccess,
}) => {
  const [regionId, setRegionId] = useState(
    initialBranch?.regionId || defaultRegionId || (regions.length > 0 ? regions[0].id : '')
  );
  const [name, setName] = useState(initialBranch?.name || '');
  const [code, setCode] = useState(initialBranch?.code || '');
  const [district, setDistrict] = useState(initialBranch?.district || '');
  const [locationAddress, setLocationAddress] = useState(initialBranch?.locationAddress || '');
  const [branchManagerName, setBranchManagerName] = useState(initialBranch?.branchManagerName || '');
  const [phone, setPhone] = useState(initialBranch?.phone || '+233 ');
  const [email, setEmail] = useState(initialBranch?.email || '');
  const [operatingAreasInput, setOperatingAreasInput] = useState(
    initialBranch?.operatingAreas ? initialBranch.operatingAreas.join(', ') : ''
  );
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialBranch?.status || 'ACTIVE');
  const [error, setError] = useState('');

  const handleRegionChange = (newRegionId: string) => {
    setRegionId(newRegionId);
    if (!initialBranch && !code) {
      const selectedReg = regions.find((r) => r.id === newRegionId);
      if (selectedReg) {
        setCode(`${selectedReg.code}-BR-${Math.floor(10 + Math.random() * 90)}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionId) {
      setError('Please select a parent Region');
      return;
    }
    if (!name.trim()) {
      setError('Please enter Branch Name (e.g., Makola District Branch)');
      return;
    }
    if (!district.trim()) {
      setError('Please enter District / Municipal Assembly name');
      return;
    }
    if (!locationAddress.trim()) {
      setError('Please enter the Physical Office or Market location address');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      setError('Please enter a valid contact phone number');
      return;
    }

    const operatingAreas = operatingAreasInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (initialBranch) {
        const selectedReg = regions.find((r) => r.id === regionId);
        const updated = StorageService.updateBranch(initialBranch.id, {
          regionId,
          regionName: selectedReg ? selectedReg.name : initialBranch.regionName,
          name: name.trim(),
          code: code.trim().toUpperCase() || initialBranch.code,
          district: district.trim(),
          locationAddress: locationAddress.trim(),
          branchManagerName: branchManagerName.trim() || 'Branch Manager',
          phone: phone.trim(),
          email: email.trim() || undefined,
          operatingAreas,
          status,
        });
        if (updated) {
          onSuccess(updated);
          onClose();
        }
      } else {
        const created = StorageService.addBranch({
          regionId,
          name: name.trim(),
          code: code.trim().toUpperCase() || undefined,
          district: district.trim(),
          locationAddress: locationAddress.trim(),
          branchManagerName: branchManagerName.trim() || 'Branch Manager',
          phone: phone.trim(),
          email: email.trim() || undefined,
          operatingAreas,
          status,
        });
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save branch');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialBranch ? 'Edit District Branch' : 'Create New District Branch'}
              </h2>
              <p className="text-xs text-slate-500">
                Set up a municipal or local market branch under a Regional Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Region Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Parent Administrative Region <span className="text-rose-500">*</span>
            </label>
            <select
              value={regionId}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.code}) — HQ: {reg.headquarters}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                District Branch Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Makola District Branch, Kejetia Market Branch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Branch Code</label>
              <input
                type="text"
                placeholder="e.g. ACC-MK-01"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* District / Assembly */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              District / Municipal / Metropolitan Assembly <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Accra Metropolitan Assembly (AMA), Kumasi Metro (KMA)"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Office Physical Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Physical Location / Office Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Makola Shopping Mall, Commercial Block B, Accra"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Branch Manager & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Branch Manager / Lead</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Bernard"
                  value={branchManagerName}
                  onChange={(e) => setBranchManagerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+233 24 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Official Branch Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="branch.makola@susu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Operating Areas / Market Routes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Operating Market Routes & Zones (comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Makola Market, Okaishie, Cow Lane, Kantamanto"
                value={operatingAreasInput}
                onChange={(e) => setOperatingAreasInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Helps organize client passbooks and daily field rounds by market zones.
            </p>
          </div>

          {/* Operational Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Branch Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Active Branch
              </button>
              <button
                type="button"
                onClick={() => setStatus('INACTIVE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  status === 'INACTIVE'
                    ? 'bg-slate-200 border-slate-400 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Inactive / Suspended
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {initialBranch ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
