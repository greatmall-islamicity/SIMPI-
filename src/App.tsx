import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import {
  CurrencyCode,
  FinancialTransaction,
  FuneralCase,
  KpiTargets,
  Language,
  LayoutDensity,
  NavSection,
  NotificationLog,
  RitualStage,
  SimpiDataSnapshot,
  ThemeMode,
} from './types/simpi';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardOverview } from './components/DashboardOverview';
import { BurialGisModule } from './components/BurialGisModule';
import { FuneralRitualModule } from './components/FuneralRitualModule';
import { InventoryModule } from './components/InventoryModule';
import { FinanceModule } from './components/FinanceModule';
import { FamilyDirectoryModule } from './components/FamilyDirectoryModule';
import { SecurityApiModule } from './components/SecurityApiModule';
import { EmergencyChatWidget } from './components/EmergencyChatWidget';
import { NewRegistrationModal } from './components/NewRegistrationModal';

export default function App() {
  const [data, setData] = useState<SimpiDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [language, setLanguage] = useState<Language>('id');
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [density, setDensity] = useState<LayoutDensity>('comfortable');
  const [searchQuery, setSearchQuery] = useState('');

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newCaseModalOpen, setNewCaseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/snapshot');
      if (!res.ok) throw new Error('Gagal memuat data operasional SIMPI.');
      const snapshot = (await res.json()) as SimpiDataSnapshot;
      setData(snapshot);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  const handleReservePlot = async (
    plotId: string,
    payload: { familyContact: string; deceasedName: string; paymentMethod: FinancialTransaction['paymentMethod'] }
  ) => {
    const res = await fetch(`/api/v1/plots/${plotId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast('Kavling makam GIS berhasil dipesan & notifikasi WhatsApp terkirim.');
    }
  };

  const handleCreateCase = async (
    payload: Partial<FuneralCase> & {
      paymentMethod?: FinancialTransaction['paymentMethod'];
      currencyPaid?: CurrencyCode;
    }
  ) => {
    const res = await fetch('/api/v1/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast('Registrasi jenazah tersimpan & notifikasi keluarga otomatis terkirim.');
    }
  };

  const handleAdvanceStage = async (
    caseId: string,
    nextStage: RitualStage,
    notifyChannel: NotificationLog['channel'] = 'WhatsApp'
  ) => {
    const res = await fetch(`/api/v1/cases/${caseId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: nextStage, notifyChannel }),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast(`Tahap prosesi diperbarui & notifikasi ${notifyChannel} terkirim ke wali keluarga.`);
    }
  };

  const handleRestock = async (itemId: string, quantity: number) => {
    const res = await fetch(`/api/v1/inventory/${itemId}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast(`Pengadaan +${quantity} unit berhasil dicatat di inventaris & buku kas.`);
    }
  };

  const handleCreateTransaction = async (payload: Partial<FinancialTransaction>) => {
    const res = await fetch('/api/v1/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast('Pembayaran digital terverifikasi & tercatat di laporan keuangan.');
    }
  };

  const handleSendNotification = async (payload: Partial<NotificationLog>) => {
    const res = await fetch('/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast(`Notifikasi ${payload.channel || 'WhatsApp'} berhasil dikirim.`);
    }
  };

  const handleToggleUserSecurity = async (
    userId: string,
    patch: { twoFactorEnabled?: boolean; biometricEnrolled?: boolean }
  ) => {
    const res = await fetch(`/api/v1/users/${userId}/security`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast('Konfigurasi keamanan akun staf diperbarui.');
    }
  };

  const handleCreateApiKey = async (name: string, scope: string) => {
    const res = await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, scope }),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast('Kunci API interoperabilitas baru berhasil diterbitkan.');
    }
  };

  const handleSendChat = async (text: string, urgent?: boolean) => {
    const res = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, senderName: 'Keluarga / Petugas', urgent }),
    });
    if (res.ok) {
      await fetchSnapshot();
    }
  };

  const handleUpdateKpiTargets = async (next: Omit<KpiTargets, 'updatedAt'>) => {
    const res = await fetch('/api/v1/kpi-targets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    if (res.ok) {
      await fetchSnapshot();
      showToast('Target KPI bulanan berhasil disimpan & grafik perbandingan diperbarui.');
    }
  };

  const handleAuditExport = async (payload: {
    module: string;
    format: 'PDF' | 'CSV';
    reportId: string;
    recordCount: number;
    filters: string;
  }) => {
    showToast(`Laporan ${payload.format} (${payload.module}) berhasil diunduh · Audit ID ${payload.reportId}`);
    try {
      const res = await fetch('/api/v1/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchSnapshot();
      }
    } catch {
      // Non-blocking audit telemetry
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-3">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            Gagal Memuat Platform SIMPI
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
          <button
            type="button"
            onClick={fetchSnapshot}
            className="h-9 px-4 rounded-lg bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
          >
            Muat Ulang Data
          </button>
        </div>
      </div>
    );
  }

  const lowStockCount = data.inventory.filter((i) => i.stock <= i.minThreshold).length;
  const activeCasesCount = data.cases.filter((c) => c.stage !== RitualStage.COMPLETED).length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        language={language}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        lowStockCount={lowStockCount}
        activeCasesCount={activeCasesCount}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeSection={activeSection}
          language={language}
          onChangeLanguage={setLanguage}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          currency={currency}
          onChangeCurrency={setCurrency}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadNotifications={data.notifications.length}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenNewCase={() => setNewCaseModalOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className={`flex-1 ${density === 'compact' ? 'p-4 lg:p-5' : 'p-5 lg:p-8'} max-w-[1440px] w-full mx-auto`}>
          {activeSection === 'dashboard' && (
            <DashboardOverview
              data={data}
              language={language}
              currency={currency}
              searchQuery={searchQuery}
              onNavigate={setActiveSection}
              onAdvanceStage={(id, stage) => handleAdvanceStage(id, stage)}
              onUpdateKpiTargets={handleUpdateKpiTargets}
            />
          )}

          {activeSection === 'gis' && (
            <BurialGisModule
              plots={data.plots}
              currency={currency}
              searchQuery={searchQuery}
              onReservePlot={handleReservePlot}
              onAuditExport={handleAuditExport}
            />
          )}

          {activeSection === 'funeral' && (
            <FuneralRitualModule
              cases={data.cases}
              currency={currency}
              onAdvanceStage={handleAdvanceStage}
            />
          )}

          {activeSection === 'inventory' && (
            <InventoryModule
              inventory={data.inventory}
              currency={currency}
              searchQuery={searchQuery}
              onRestock={handleRestock}
              onAuditExport={handleAuditExport}
            />
          )}

          {activeSection === 'finance' && (
            <FinanceModule
              transactions={data.transactions}
              cases={data.cases}
              currency={currency}
              onChangeCurrency={setCurrency}
              onCreateTransaction={handleCreateTransaction}
              onAuditExport={handleAuditExport}
            />
          )}

          {activeSection === 'directory' && (
            <FamilyDirectoryModule
              cases={data.cases}
              providers={data.providers}
              notifications={data.notifications}
              onSendNotification={handleSendNotification}
            />
          )}

          {activeSection === 'security' && (
            <SecurityApiModule
              users={data.users}
              auditLogs={data.auditLogs}
              apiKeys={data.apiKeys}
              cases={data.cases}
              theme={theme}
              onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              language={language}
              onChangeLanguage={setLanguage}
              density={density}
              onChangeDensity={setDensity}
              onToggleUserSecurity={handleToggleUserSecurity}
              onCreateApiKey={handleCreateApiKey}
            />
          )}
        </main>
      </div>

      {/* Notifications Slide-Over Drawer */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs no-print">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pusat Notifikasi Real-Time
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  WhatsApp · SMS · Email · Push Terkirim
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
              {data.notifications.map((n) => (
                <div key={n.id} className="p-4 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-100">
                    <span>{n.channel} · {n.recipient}</span>
                    <span className="font-mono text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 max-w-sm px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium shadow-xl flex items-center gap-2 no-print">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <NewRegistrationModal
        open={newCaseModalOpen}
        onClose={() => setNewCaseModalOpen(false)}
        availablePlots={data.plots}
        currency={currency}
        onSubmitCase={handleCreateCase}
      />

      <EmergencyChatWidget
        messages={data.chatMessages}
        onSendMessage={handleSendChat}
      />
    </div>
  );
}
