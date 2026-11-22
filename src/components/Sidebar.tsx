import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  HeartHandshake,
  Package,
  Wallet,
  Users,
  ShieldCheck,
  X,
  Lock,
} from 'lucide-react';
import { Language, NavSection } from '../types/simpi';
import { TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  language: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  lowStockCount: number;
  activeCasesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  language,
  mobileOpen,
  onCloseMobile,
  lowStockCount,
  activeCasesCount,
}) => {
  const t = TRANSLATIONS[language];

  const items: Array<{
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'gis', label: t.nav.gis, icon: MapPin },
    { id: 'funeral', label: t.nav.funeral, icon: HeartHandshake, count: activeCasesCount },
    { id: 'inventory', label: t.nav.inventory, icon: Package, count: lowStockCount },
    { id: 'finance', label: t.nav.finance, icon: Wallet },
    { id: 'directory', label: t.nav.directory, icon: Users },
    { id: 'security', label: t.nav.security, icon: ShieldCheck },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white font-display font-bold text-sm">
              S
            </div>
            <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap truncate">
              {t.brandShort}
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Main navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/avatar_admin_director_1795079102336.jpg"
            alt="Ir. Ahmad Fauzan, M.M."
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-lg object-cover bg-slate-200 dark:bg-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              Ir. Ahmad Fauzan
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Super Admin · Pusat
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          <Lock className="h-3 w-3 shrink-0 text-emerald-700 dark:text-emerald-400" />
          <span>{t.securityNote}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 no-print">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{content}</div>
        </div>
      )}
    </>
  );
};
