import React from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Plus,
  Globe,
} from 'lucide-react';
import { CurrencyCode, Language, NavSection, ThemeMode } from '../types/simpi';
import { TRANSLATIONS } from '../i18n/translations';

interface TopBarProps {
  activeSection: NavSection;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currency: CurrencyCode;
  onChangeCurrency: (curr: CurrencyCode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onOpenNewCase: () => void;
  onOpenMobileNav: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  language,
  onChangeLanguage,
  theme,
  onToggleTheme,
  currency,
  onChangeCurrency,
  searchQuery,
  onSearchChange,
  unreadNotifications,
  onOpenNotifications,
  onOpenNewCase,
  onOpenMobileNav,
}) => {
  const t = TRANSLATIONS[language];

  const sectionLabels: Record<NavSection, string> = {
    dashboard: t.nav.dashboard,
    gis: t.nav.gis,
    funeral: t.nav.funeral,
    inventory: t.nav.inventory,
    finance: t.nav.finance,
    directory: t.nav.directory,
    security: t.nav.security,
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4 no-print">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline whitespace-nowrap">
            SIMPI
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100 truncate">
            {sectionLabels[activeSection]}
          </span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.actions.searchPlaceholder}
          className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg px-2 h-9 bg-slate-50 dark:bg-slate-800">
          <Globe className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value as Language)}
            className="text-xs font-medium bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="id" className="bg-white dark:bg-slate-900">ID</option>
            <option value="en" className="bg-white dark:bg-slate-900">EN</option>
            <option value="ar" className="bg-white dark:bg-slate-900">AR</option>
          </select>
        </div>

        <select
          aria-label="Currency"
          value={currency}
          onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
          className="hidden xl:block h-9 px-2.5 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
          <option value="SGD">SGD</option>
          <option value="MYR">MYR</option>
          <option value="SAR">SAR</option>
        </select>

        <button
          type="button"
          onClick={onToggleTheme}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative h-9 px-2.5 flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="font-mono text-xs tabular-nums">{unreadNotifications}</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewCase}
          className="h-9 px-3.5 flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t.actions.newCase}</span>
        </button>
      </div>
    </header>
  );
};
