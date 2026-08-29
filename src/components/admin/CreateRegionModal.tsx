import React, { useState } from 'react';
import { StorageService } from '../../services/storageService.ts';
import { Region } from '../../types/index.ts';
import { Globe, X, MapPin, Phone, Mail, User, ShieldCheck } from 'lucide-react';

interface CreateRegionModalProps {
  initialRegion?: Region | null;
  onClose: () => void;
  onSuccess: (region: Region) => void;
}

export const CreateRegionModal: React.FC<CreateRegionModalProps> = ({
  initialRegion,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(initialRegion?.name || '');
  const [code, setCode] = useState(initialRegion?.code || '');
  const [headquarters, setHeadquarters] = useState(initialRegion?.headquarters || '');
  const [regionalManagerName, setRegionalManagerName] = useState(initialRegion?.regionalManagerName || '');
  const [contactPhone, setContactPhone] = useState(initialRegion?.contactPhone || '+233 ');
  const [contactEmail, setContactEmail] = useState(initialRegion?.contactEmail || '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialRegion?.status || 'ACTIVE');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the Region Name (e.g., Greater Accra Region)');
      return;
    }
    if (!code.trim()) {
      setError('Please enter a Region Code (e.g., GAR, ASH, WR)');
      return;
    }
    if (!headquarters.trim()) {
      setError('Please enter Regional Headquarters City (e.g., Accra, Kumasi)');
      return;
    }

    try {
      if (initialRegion) {
        const updated = StorageService.updateRegion(initialRegion.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          headquarters: headquarters.trim(),
          regionalManagerName: regionalManagerName.trim() || 'Regional Officer',
          contactPhone: contactPhone.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          status,
        });
        if (updated) {
          onSuccess(updated);
          onClose();
        }
      } else {
        const created = StorageService.addRegion({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          headquarters: headquarters.trim(),
          regionalManagerName: regionalManagerName.trim() || 'Regional Officer',
          contactPhone: contactPhone.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          status,
        });
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save region');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialRegion ? 'Edit Regional Hub' : 'Create Regional Administrative Hub'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure Ghana regional territory & supervisory jurisdiction
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

          {/* Region Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Region Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Greater Accra Region, Ashanti Region"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Region Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. GAR, ASH"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Regional HQ */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Headquarters City / Capital <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Accra, Kumasi, Sekondi-Takoradi, Tamale"
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Regional Manager */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Regional Lead / Supervisory Officer
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Bernard (Regional Lead)"
                value={regionalManagerName}
                onChange={(e) => setRegionalManagerName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+233 24 000 0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="accra.region@susu.gh"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Operational Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Operational Status</label>
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
                Active Hub
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
                Inactive / Planned
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
              {initialRegion ? 'Update Region' : 'Save Region'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
