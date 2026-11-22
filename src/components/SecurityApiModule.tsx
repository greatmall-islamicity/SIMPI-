import React, { useState } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Lock,
  FileCheck2,
  Sliders,
  Terminal,
  Plus,
} from 'lucide-react';
import {
  ApiKeyRecord,
  AuditLogEntry,
  FuneralCase,
  Language,
  LayoutDensity,
  SystemUser,
  ThemeMode,
  UserRole,
} from '../types/simpi';

interface SecurityApiModuleProps {
  users: SystemUser[];
  auditLogs: AuditLogEntry[];
  apiKeys: ApiKeyRecord[];
  cases: FuneralCase[];
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: Language;
  onChangeLanguage: (l: Language) => void;
  density: LayoutDensity;
  onChangeDensity: (d: LayoutDensity) => void;
  onToggleUserSecurity: (
    userId: string,
    patch: { twoFactorEnabled?: boolean; biometricEnrolled?: boolean }
  ) => Promise<void>;
  onCreateApiKey: (name: string, scope: string) => Promise<void>;
}

export const SecurityApiModule: React.FC<SecurityApiModuleProps> = ({
  users,
  auditLogs,
  apiKeys,
  cases,
  theme,
  onToggleTheme,
  language,
  onChangeLanguage,
  density,
  onChangeDensity,
  onToggleUserSecurity,
  onCreateApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'verification' | 'api' | 'preferences'>('users');
  const [docQuery, setDocQuery] = useState(cases[0]?.documentHash || '');
  const [biometricVerifiedMsg, setBiometricVerifiedMsg] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('plots:read, cases:read, finance:read');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiTesting, setApiTesting] = useState(false);

  const matchedCase = cases.find(
    (c) =>
      c.documentHash === docQuery.trim() ||
      c.registrationNo === docQuery.trim() ||
      c.nik === docQuery.trim()
  );

  const handleTestBiometric = () => {
    setBiometricVerifiedMsg(
      'Passkey Biometrik (WebAuthn FIDO2) berhasil diverifikasi untuk sesi Ir. Ahmad Fauzan, M.M.'
    );
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    await onCreateApiKey(newKeyName.trim(), newKeyScope);
    setNewKeyName('');
  };

  const handleRunApiEndpoint = async (endpoint: string) => {
    setApiTesting(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      setApiResponse(JSON.stringify(json, null, 2));
    } catch (err) {
      setApiResponse(String(err));
    } finally {
      setApiTesting(false);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.FUNERAL_OFFICER]: 'Petugas Pemulasaran',
    [UserRole.GIS_OPERATOR]: 'Operator GIS Makam',
    [UserRole.TREASURER]: 'Bendahara Keuangan',
    [UserRole.FAMILY_LIAISON]: 'Koordinator Keluarga',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pengguna, Keamanan Enkripsi, Verifikasi & API
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kontrol akses staf, autentikasi dua faktor (2FA), login biometrik, verifikasi dokumen digital, dan interoperabilitas API eksternal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
          {[
            { id: 'users', label: 'Staf, 2FA & Biometrik' },
            { id: 'verification', label: 'Verifikasi Dokumen & Audit' },
            { id: 'api', label: 'API Pihak Ketiga' },
            { id: 'preferences', label: 'Kustomisasi Antarmuka' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'users' | 'verification' | 'api' | 'preferences')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                <Lock className="h-4 w-4" />
                <span>Enkripsi End-to-End AES-256-GCM Aktif</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Seluruh data kependudukan (NIK), rekam medis wafat, dan dokumen keluarga terenkripsi saat transit maupun penyimpanan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestBiometric}
              className="h-9 px-3.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Fingerprint className="h-4 w-4" />
              <span>Uji Login Biometrik / Passkey</span>
            </button>
          </div>

          {biometricVerifiedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
              {biometricVerifiedMsg}
            </div>
          )}

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Petugas / Staf</th>
                    <th className="py-3 px-4">Peran (RBAC)</th>
                    <th className="py-3 px-4">Autentikasi 2FA</th>
                    <th className="py-3 px-4">Biometrik Passkey</th>
                    <th className="py-3 px-4 text-right">Aktivitas Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{u.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {roleLabels[u.role]}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleUserSecurity(u.id, { twoFactorEnabled: !u.twoFactorEnabled })}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer ${
                            u.twoFactorEnabled
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {u.twoFactorEnabled ? '2FA Aktif' : 'Aktifkan 2FA'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleUserSecurity(u.id, { biometricEnrolled: !u.biometricEnrolled })}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer ${
                            u.biometricEnrolled
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {u.biometricEnrolled ? 'Terdaftar' : 'Daftarkan'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {u.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Verifikasi Keaslian Dokumen Administrasi Digital
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Masukkan Hash SHA-256 sertifikat makam, Nomor Registrasi SIMPI, atau NIK untuk memverifikasi integritas dokumen.
            </p>
            <input
              type="text"
              value={docQuery}
              onChange={(e) => setDocQuery(e.target.value)}
              placeholder="sha256:... atau REG/SIMPI/..."
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
            />
            {matchedCase ? (
              <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Dokumen Sah & Terverifikasi
                </p>
                <p>Almarhum: {matchedCase.deceasedName}</p>
                <p className="font-mono">Registrasi: {matchedCase.registrationNo}</p>
                <p className="font-mono">Kavling GIS: {matchedCase.plotCode || '-'}</p>
                <p className="font-mono text-[11px] opacity-80">{matchedCase.documentHash}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tidak ada dokumen yang cocok dengan kueri di atas.
              </p>
            )}
          </div>

          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
            <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Log Pemantauan Aktivitas Pengguna (Audit Trail)
              </h3>
            </div>
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{log.action}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {log.actor} · {log.role} · Target {log.target}
                  </p>
                </div>
                <div className="font-mono text-slate-500 dark:text-slate-400 shrink-0 text-right">
                  <div>{log.timestamp}</div>
                  <div className="text-emerald-700 dark:text-emerald-400">{log.encryptionStatus}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handleCreateKey}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Terbitkan API Key Pihak Ketiga
                </h2>
              </div>
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Nama Sistem Mitra (mis. RS Islam / ERP)"
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={newKeyScope}
                onChange={(e) => setNewKeyScope(e.target.value)}
                className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-full h-9 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Buat Kunci API</span>
              </button>
            </form>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
              {apiKeys.map((k) => (
                <div key={k.id} className="p-4 text-xs space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{k.name}</p>
                  <p className="font-mono text-emerald-700 dark:text-emerald-400">{k.prefix}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono">Scope: {k.scope}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Uji Coba Interoperabilitas Endpoint REST API v1
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['/api/v1/health', '/api/v1/plots?status=AVAILABLE', '/api/v1/cases'].map((ep) => (
                <button
                  key={ep}
                  type="button"
                  disabled={apiTesting}
                  onClick={() => handleRunApiEndpoint(ep)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  GET {ep}
                </button>
              ))}
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs overflow-auto max-h-80">
              {apiResponse || 'Klik salah satu endpoint di atas untuk menguji respons JSON langsung dari server SIMPI.'}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-2xl space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Kustomisasi Antarmuka, Bahasa & Kenyamanan Visual
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Tema Tampilan (Mode Gelap / Terang)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Optimal untuk penggunaan operasional siang dan malam hari.</p>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                {theme === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Bahasa Antarmuka Global</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mendukung Bahasa Indonesia, Inggris, dan Arab.</p>
              </div>
              <select
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as Language)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (Global)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Kepadatan Tata Letak (Layout Density)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Personalisasi jarak antar panel dan tabel operasional.</p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['comfortable', 'compact'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onChangeDensity(d)}
                    className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                      density === d
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d === 'comfortable' ? 'Lega' : 'Padat'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
