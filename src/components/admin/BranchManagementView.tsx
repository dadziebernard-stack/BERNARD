import React, { useState } from 'react';
import { Region, DistrictBranch, Saver } from '../../types/index.ts';
import { StorageService } from '../../services/storageService.ts';
import { CreateRegionModal } from './CreateRegionModal.tsx';
import { CreateBranchModal } from './CreateBranchModal.tsx';
import { 
  Globe, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Store,
  Tag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface BranchManagementViewProps {
  savers?: Saver[];
  onSelectSaver?: (saver: Saver) => void;
}

export const BranchManagementView: React.FC<BranchManagementViewProps> = ({
  savers = [],
  onSelectSaver,
}) => {
  const [regions, setRegions] = useState<Region[]>(() => StorageService.getRegions());
  const [branches, setBranches] = useState<DistrictBranch[]>(() => StorageService.getBranches());
  
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'regions'>('branches');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateRegionOpen, setIsCreateRegionOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);

  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<DistrictBranch | null>(null);
  const [branchDefaultRegionId, setBranchDefaultRegionId] = useState<string | undefined>(undefined);

  const refreshData = () => {
    setRegions(StorageService.getRegions());
    setBranches(StorageService.getBranches());
  };

  // Delete Branch
  const handleDeleteBranch = (branch: DistrictBranch) => {
    if (window.confirm(`Are you sure you want to delete branch "${branch.name}"?`)) {
      StorageService.deleteBranch(branch.id);
      refreshData();
    }
  };

  // Delete Region
  const handleDeleteRegion = (region: Region) => {
    const attachedBranches = branches.filter((b) => b.regionId === region.id);
    if (attachedBranches.length > 0) {
      alert(`Cannot delete "${region.name}" because it currently has ${attachedBranches.length} active district branch(es). Please delete or reassign the branches first.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete regional hub "${region.name}"?`)) {
      StorageService.deleteRegion(region.id);
      refreshData();
    }
  };

  // Filtered branches
  const filteredBranches = branches.filter((b) => {
    const matchesRegion = selectedRegionFilter === 'ALL' || b.regionId === selectedRegionFilter;
    const matchesSearch = 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.branchManagerName && b.branchManagerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.operatingAreas && b.operatingAreas.some((area) => area.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesRegion && matchesSearch;
  });

  // Filtered regions
  const filteredRegions = regions.filter((r) => {
    return (
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.headquarters.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.regionalManagerName && r.regionalManagerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate statistics
  const totalRegionsCount = regions.length;
  const totalBranchesCount = branches.length;
  const activeBranchesCount = branches.filter((b) => b.status === 'ACTIVE').length;
  const totalRoutesCount = branches.reduce((sum, b) => sum + (b.operatingAreas?.length || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Administrative Zoning & Jurisdiction
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Regional & District Branches</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure regional directorates, municipal assemblies, market branch offices, and operational coverage routes across Ghana.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingRegion(null);
              setIsCreateRegionOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            + Add Regional Hub
          </button>

          <button
            onClick={() => {
              setEditingBranch(null);
              setBranchDefaultRegionId(undefined);
              setIsCreateBranchOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Building2 className="w-4 h-4" />
            + Create District Branch
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Regional Hubs</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-2">{totalRegionsCount}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Administrative zones in Ghana</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">District Branches</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-2">{totalBranchesCount}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            {activeBranchesCount} active operational branch offices
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Market Coverage Zones</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 font-mono mt-2">{totalRoutesCount}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Key market lanes & daily routes</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500">Supervisory Head</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-black text-slate-900 font-mono mt-2">Bernard (Super Admin)</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Central Oversight & Direct Operations</p>
        </div>
      </div>

      {/* Sub-Tabs & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Sub Tab Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
            <button
              onClick={() => setActiveSubTab('branches')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                activeSubTab === 'branches'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              District Branches ({branches.length})
            </button>
            <button
              onClick={() => setActiveSubTab('regions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                activeSubTab === 'regions'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Regional Hubs ({regions.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeSubTab === 'branches' ? 'Search branches, markets, manager...' : 'Search regions, HQ...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Region Filter Pills (Only on Branches Tab) */}
        {activeSubTab === 'branches' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Region:
            </span>
            <button
              onClick={() => setSelectedRegionFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                selectedRegionFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Regions ({branches.length})
            </button>
            {regions.map((reg) => {
              const count = branches.filter((b) => b.regionId === reg.id).length;
              return (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegionFilter(reg.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors inline-flex items-center gap-1 ${
                    selectedRegionFilter === reg.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{reg.name}</span>
                  <span className="opacity-75 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB CONTENT: DISTRICT BRANCHES */}
      {activeSubTab === 'branches' && (
        <div className="space-y-4">
          {filteredBranches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No District Branches Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm || selectedRegionFilter !== 'ALL'
                  ? 'No branches match your filter criteria. Try adjusting the search terms.'
                  : 'Get started by creating your first district market branch office.'}
              </p>
              <button
                onClick={() => {
                  setEditingBranch(null);
                  setIsCreateBranchOpen(true);
                }}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Branch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBranches.map((branch) => {
                const branchSavers = savers.filter((s) => s.branchId === branch.id);
                return (
                  <div
                    key={branch.id}
                    className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
                            {branch.code}
                          </span>
                          <h3 className="text-sm font-black text-slate-900 pt-1 leading-tight">
                            {branch.name}
                          </h3>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            branch.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {branch.status}
                        </span>
                      </div>

                      {/* Region & District Info */}
                      <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{branch.regionName}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-700">{branch.district}</p>
                            <p className="text-[11px] text-slate-400">{branch.locationAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700">{branch.phone}</span>
                        </div>

                        {branch.branchManagerName && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Manager:</span>
                            <span className="font-semibold text-slate-800">{branch.branchManagerName}</span>
                          </div>
                        )}
                      </div>

                      {/* Operating Areas / Tags */}
                      {branch.operatingAreas && branch.operatingAreas.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Coverage Zones
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {branch.operatingAreas.map((area, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-bold text-slate-500">
                        {branchSavers.length} registered saver(s)
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBranch(branch);
                            setIsCreateBranchOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Branch"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REGIONAL ADMINISTRATIVE HUBS */}
      {activeSubTab === 'regions' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Ghana Regional Directorates</h3>
                <p className="text-xs text-slate-500">Supervisory hubs and administrative capitals</p>
              </div>
              <button
                onClick={() => {
                  setEditingRegion(null);
                  setIsCreateRegionOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Region
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Region Name</th>
                    <th className="px-4 py-3">Capital / HQ City</th>
                    <th className="px-4 py-3">Supervisory Lead</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-center">District Branches</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRegions.map((region) => {
                    const attachedBranches = branches.filter((b) => b.regionId === region.id);
                    return (
                      <tr key={region.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          {region.code}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {region.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {region.headquarters}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {region.regionalManagerName || 'Bernard'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {region.contactPhone || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {attachedBranches.length} branch(es)
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              region.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {region.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingBranch(null);
                                setBranchDefaultRegionId(region.id);
                                setIsCreateBranchOpen(true);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                              title="Add Branch under this Region"
                            >
                              + Branch
                            </button>
                            <button
                              onClick={() => {
                                setEditingRegion(region);
                                setIsCreateRegionOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit Region"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRegion(region)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Region"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create / Edit Region */}
      {isCreateRegionOpen && (
        <CreateRegionModal
          initialRegion={editingRegion}
          onClose={() => {
            setIsCreateRegionOpen(false);
            setEditingRegion(null);
          }}
          onSuccess={() => {
            refreshData();
          }}
        />
      )}

      {/* MODAL: Create / Edit Branch */}
      {isCreateBranchOpen && (
        <CreateBranchModal
          regions={regions}
          initialBranch={editingBranch}
          defaultRegionId={branchDefaultRegionId}
          onClose={() => {
            setIsCreateBranchOpen(false);
            setEditingBranch(null);
            setBranchDefaultRegionId(undefined);
          }}
          onSuccess={() => {
            refreshData();
          }}
        />
      )}
    </div>
  );
};
