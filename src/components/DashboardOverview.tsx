import React from 'react';
import {
  Download,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import {
  CurrencyCode,
  Language,
  NavSection,
  PlotStatus,
  RitualStage,
  SimpiDataSnapshot,
} from '../types/simpi';
import { TRANSLATIONS } from '../i18n/translations';
import { downloadCsv, downloadPdfReport, formatCurrency } from '../utils/formatters';
import { MonthlyAnalyticsCharts } from './MonthlyAnalyticsCharts';

interface DashboardOverviewProps {
  data: SimpiDataSnapshot;
  language: Language;
  currency: CurrencyCode;
  searchQuery: string;
  onNavigate: (section: NavSection) => void;
  onAdvanceStage: (caseId: string, nextStage: RitualStage) => Promise<void>;
}

const STAGE_ORDER: RitualStage[] = [
  RitualStage.REGISTERED,
  RitualStage.BATHING,
  RitualStage.SHROUDING,
  RitualStage.PRAYER,
  RitualStage.BURIAL,
  RitualStage.COMPLETED,
];

const STAGE_LABELS: Record<RitualStage, string> = {
  [RitualStage.REGISTERED]: 'Registrasi',
  [RitualStage.BATHING]: 'Memandikan',
  [RitualStage.SHROUDING]: 'Mengkafani',
  [RitualStage.PRAYER]: 'Shalat Jenazah',
  [RitualStage.BURIAL]: 'Pemakaman',
  [RitualStage.COMPLETED]: 'Selesai',
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  language,
  currency,
  searchQuery,
  onNavigate,
  onAdvanceStage,
}) => {
  const t = TRANSLATIONS[language];

  const availablePlots = data.plots.filter((p) => p.status === PlotStatus.AVAILABLE).length;
  const totalPlots = data.plots.length;
  const activeCases = data.cases.filter((c) => c.stage !== RitualStage.COMPLETED);
  const totalIncomeIdr = data.transactions
    .filter((tx) => tx.type === 'PEMASUKAN')
    .reduce((acc, tx) => acc + tx.amountIdr, 0);

  const zoneStats = [
    'Blok A - Raudhah',
    'Blok B - Al-Firdaus',
    'Blok C - As-Salam',
    'Blok D - Wakaf Umat',
  ].map((zone) => {
    const plots = data.plots.filter((p) => p.zone === zone);
    const occupied = plots.filter((p) => p.status === PlotStatus.OCCUPIED).length;
    const reserved = plots.filter((p) => p.status === PlotStatus.RESERVED).length;
    const available = plots.filter((p) => p.status === PlotStatus.AVAILABLE).length;
    return {
      zone,
      total: plots.length,
      occupied,
      reserved,
      available,
      pct: Math.round(((occupied + reserved) / Math.max(plots.length, 1)) * 100),
    };
  });

  const filteredCases = data.cases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.deceasedName.toLowerCase().includes(q) ||
      c.nik.includes(q) ||
      c.registrationNo.toLowerCase().includes(q) ||
      (c.plotCode || '').toLowerCase().includes(q)
    );
  });

  const handleExportSummaryCsv = () => {
    downloadCsv(
      `simpi-laporan-eksekutif-${new Date().toISOString().slice(0, 10)}.csv`,
      ['No Registrasi', 'Nama Almarhum', 'NIK', 'Kavling GIS', 'Tahap Ritual', 'Status Pembayaran', 'Total Biaya (IDR)'],
      data.cases.map((c) => [
        c.registrationNo,
        c.deceasedName,
        c.nik,
        c.plotCode || '-',
        STAGE_LABELS[c.stage],
        c.paymentStatus,
        c.totalFeeIdr,
      ])
    );
  };

  const handleExportSummaryPdf = () => {
    downloadPdfReport({
      filename: `simpi-laporan-eksekutif-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Laporan Ringkasan Eksekutif Operasional SIMPI',
      subtitle: `Rekapitulasi ketersediaan kavling GIS, prosesi pemulasaran, dan pendapatan (${currency})`,
      summaryRows: [
        { label: 'Kavling Tersedia', value: `${availablePlots} / ${totalPlots}` },
        { label: 'Prosesi Aktif', value: `${activeCases.length} Kasus` },
        { label: `Total Pendapatan (${currency})`, value: formatCurrency(totalIncomeIdr, currency) },
      ],
      headers: ['No Registrasi', 'Nama Almarhum', 'NIK', 'Kavling GIS', 'Tahap Ritual', 'Status Bayar', `Total Biaya (${currency})`],
      rows: filteredCases.map((c) => [
        c.registrationNo,
        c.deceasedName,
        c.nik,
        c.plotCode || '-',
        STAGE_LABELS[c.stage],
        c.paymentStatus,
        formatCurrency(c.totalFeeIdr, currency),
      ]),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            type="button"
            onClick={handleExportSummaryCsv}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.actions.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={handleExportSummaryPdf}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{t.actions.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* 4-Column Executive KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('gis')}
          className="text-left p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-600/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.kpiPlots}</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {availablePlots}
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              / {totalPlots} Kavling
            </span>
          </div>
          <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
            4 Zona GIS · Arah Kiblat 295.14° Terkalibrasi
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('funeral')}
          className="text-left p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-600/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.kpiActiveCases}</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {activeCases.length}
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              dari {data.cases.length} total kasus
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Pemulasaran Syariah · Tim Siaga 24 Jam
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('finance')}
          className="text-left p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-600/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.kpiRevenue}</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(totalIncomeIdr, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {data.transactions.filter((x) => x.type === 'PEMASUKAN').length} transaksi digital terverifikasi
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('directory')}
          className="text-left p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-600/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t.dashboard.kpiSla}</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              99.4%
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {data.notifications.length} Terkirim
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            WhatsApp · SMS · Email · Push Real-Time
          </p>
        </button>
      </div>

      {/* Interactive Recharts Monthly Trends Visualization */}
      <MonthlyAnalyticsCharts
        cases={data.cases}
        plots={data.plots}
        transactions={data.transactions}
        currency={currency}
      />

      {/* Main Analytics Split + Memorial Park Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                {t.dashboard.occupancyTitle}
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('gis')}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Buka Peta GIS
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {zoneStats.map((z) => (
                <div key={z.zone} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{z.zone}</span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {z.occupied} Terisi · {z.reserved} Dipesan · {z.available} Tersedia ({z.pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-sm bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-slate-700 dark:bg-slate-400 h-full transition-all"
                      style={{ width: `${(z.occupied / z.total) * 100}%` }}
                      title={`Terisi: ${z.occupied}`}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${(z.reserved / z.total) * 100}%` }}
                      title={`Dipesan: ${z.reserved}`}
                    />
                    <div
                      className="bg-emerald-600/30 h-full transition-all"
                      style={{ width: `${(z.available / z.total) * 100}%` }}
                      title={`Tersedia: ${z.available}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Kapasitas: {totalPlots} Kavling Terpetakan</span>
            <span className="font-mono tabular-nums">Arah Kiblat 295.14° WNW</span>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="relative h-52 lg:h-56 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <img
              src="/src/assets/images/cemetery_park_aerial_1795079102309.jpg"
              alt="Kawasan Taman Pemakaman Islam Terpadu SIMPI"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs font-medium text-emerald-300">
                Taman Pemakaman Islam Terpadu · Pusat Operasi
              </p>
              <p className="font-display text-lg font-semibold mt-0.5">
                Raudhah Memorial Park & Masjid Al-Ikhlas
              </p>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.dashboard.familyReportTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Setiap tahapan pemulasaran mengirimkan laporan status terenkripsi otomatis kepada ahli waris melalui WhatsApp, SMS, dan Email beserta sertifikat koordinat GIS makam.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              {data.notifications.slice(0, 2).map((n) => (
                <div key={n.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {n.channel} · {n.recipient}
                    </span>
                    <span className="font-mono tabular-nums">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('directory')}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Kelola Notifikasi & Laporan Keluarga</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Procession Milestone Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.dashboard.activePipelineTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Klik tombol lanjut tahap untuk memperbarui progres pemulasaran & mengirim notifikasi otomatis ke keluarga duka.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {filteredCases.length} Kasus Ditampilkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Registrasi & Almarhum</th>
                <th className="py-3 px-4">Wali Keluarga</th>
                <th className="py-3 px-4">Kavling GIS</th>
                <th className="py-3 px-4">Tahap Prosesi</th>
                <th className="py-3 px-4 text-right">Biaya</th>
                <th className="py-3 px-4 text-right no-print">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredCases.map((c) => {
                const idx = STAGE_ORDER.indexOf(c.stage);
                const nextStage = idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {c.deceasedName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                        {c.registrationNo} · NIK {c.nik}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800 dark:text-slate-200">{c.nextOfKinName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {c.nextOfKinPhone}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>{c.plotCode || 'Menunggu'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {c.stage === RitualStage.COMPLETED ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {STAGE_LABELS[c.stage]}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            {STAGE_LABELS[c.stage]}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.stageUpdatedAt}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      <div>{formatCurrency(c.totalFeeIdr, currency)}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.paymentStatus}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right no-print">
                      {nextStage ? (
                        <button
                          type="button"
                          onClick={() => onAdvanceStage(c.id, nextStage)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Lanjut: {STAGE_LABELS[nextStage]}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigate('funeral')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Lihat Arsip
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
