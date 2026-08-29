import React from 'react';
import { UserRole, Collector } from '../../types/index.ts';
import { Shield, User, Check, ChevronDown, Lock } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  currentUserId: string;
  collectors: Collector[];
  isSuperAdminAuthenticated?: boolean;
  onSwitchUser: (role: UserRole, userId: string) => void;
  onRequestAdminLogin?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  currentUserId,
  collectors,
  isSuperAdminAuthenticated = true,
  onSwitchUser,
  onRequestAdminLogin,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Profiles list: Super Admin Bernard & Field Mobile Bankers
  const profiles = [
    {
      id: 'admin-1',
      role: 'ADMIN' as UserRole,
      title: 'Bernard (Super Admin)',
      username: 'bernard',
      subtitle: 'Executive Oversight & System Administration',
      icon: Shield,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      requiresAuth: true,
    },
    ...collectors.map((c) => ({
      id: c.id,
      role: 'COLLECTOR' as UserRole,
      title: `${c.name} (${c.collectorCode})`,
      username: c.collectorCode,
      subtitle: `Field Banker • Route: ${c.assignedRoute}`,
      icon: User,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      requiresAuth: false,
    })),
  ];

  const currentProfile = profiles.find((p) => p.id === currentUserId) || profiles[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all text-left shadow-2xs"
      >
        <div className={`p-1.5 rounded-lg border ${currentProfile.iconColor}`}>
          <currentProfile.icon className="w-3.5 h-3.5" />
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-slate-800 leading-tight">{currentProfile.title}</p>
          <p className="text-[10px] text-slate-500">{currentProfile.subtitle}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-2 divide-y divide-slate-100 animate-fade-in">
            <div className="px-3.5 py-2 bg-slate-50/80">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Switch Operational Persona
              </p>
              <p className="text-[11px] text-slate-600">
                Super Admin (Bernard) or Field Mobile Bankers
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {profiles.map((p) => {
                const isSelected = p.id === currentUserId;
                const IconComponent = p.icon;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (p.role === 'ADMIN' && !isSuperAdminAuthenticated && onRequestAdminLogin) {
                        setIsOpen(false);
                        onRequestAdminLogin();
                        return;
                      }
                      onSwitchUser(p.role, p.id);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${p.iconColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {p.title}
                          </p>
                          {p.role === 'ADMIN' && (
                            <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                              bernard
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{p.subtitle}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
