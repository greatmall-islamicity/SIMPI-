import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Target,
  X,
} from 'lucide-react';
import {
  CemeteryPlot,
  CurrencyCode,
  FinancialTransaction,
  FuneralCase,
  KpiTargets,
  NotificationLog,
  PlotStatus,
  RitualStage,
} from '../types/simpi';
import { formatCurrency } from '../utils/formatters';

interface KpiTargetComparisonProps {
  cases: FuneralCase[];
  plots: CemeteryPlot[];
  transactions: FinancialTransaction[];
  notifications: NotificationLog[];
  currency: CurrencyCode;
  targets: KpiTargets;
  onSaveTargets: (next: Omit<KpiTargets, 'updatedAt'>) => Promise<void>;
}

type PrimaryComparisonMetric = 'burials' | 'bookings' | 'revenue';
type RangeFilter = '6m' | '12m';

interface ComparisonPoint {
  month: string;
  burials: number;
  bookings: number;
  revenueIdr: number;
  efficiencyPct: number;
}

const DEFAULT_TARGETS: Omit<KpiTargets, 'updatedAt'> = {
  monthlyBurialTarget: 30,
  monthlyBookingTarget: 26,
  serviceEfficiencyTargetPct: 95,
  monthlyRevenueTargetIdr: 165000000,
};

export const KpiTargetComparison: React.FC<KpiTargetComparisonProps> = ({
  cases,
  plots,
  transactions,
  notifications,
  currency,
  targets,
  onSaveTargets,
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState<RangeFilter>('6m');
  const [metric, setMetric] = useState<PrimaryComparisonMetric>('burials');

  const [draft, setDraft] = useState<Omit<KpiTargets, 'updatedAt'>>({
    monthlyBurialTarget: targets.monthlyBurialTarget,
    monthlyBookingTarget: targets.monthlyBookingTarget,
    serviceEfficiencyTargetPct: targets.serviceEfficiencyTargetPct,
    monthlyRevenueTargetIdr: targets.monthlyRevenueTargetIdr,
  });

  useEffect(() => {
    setDraft({
      monthlyBurialTarget: targets.monthlyBurialTarget,
      monthlyBookingTarget: targets.monthlyBookingTarget,
      serviceEfficiencyTargetPct: targets.serviceEfficiencyTargetPct,
      monthlyRevenueTargetIdr: targets.monthlyRevenueTargetIdr,
    });
  }, [targets]);

  const activeTargets = editing ? draft : targets;

  const liveNovCases = cases.length;
  const liveNovBookings = plots.filter(
    (p) => p.status === PlotStatus.OCCUPIED || p.status === PlotStatus.RESERVED
  ).length;
  const liveNovRevenue = transactions
    .filter((t) => t.type === 'PEMASUKAN')
    .reduce((sum, t) => sum + t.amountIdr, 0);

  const verifiedCaseRatio =
    cases.length > 0
      ? cases.filter((c) => c.dukcapilVerified).length / cases.length
      : 1;
  const completedOrActiveRatio =
    cases.length > 0
      ? cases.filter((c) => c.stage !== RitualStage.REGISTERED).length / cases.length
      : 1;
  const notifSuccessRatio =
    notifications.length > 0
      ? notifications.filter((n) => n.status !== 'Antrean').length / notifications.length
      : 1;

  const liveNovEfficiency = Number(
    Math.min(
      99.8,
      91.2 + verifiedCaseRatio * 3.1 + completedOrActiveRatio * 1.4 + notifSuccessRatio * 1.1
    ).toFixed(1)
  );

  const fullSeries: ComparisonPoint[] = useMemo(
    () => [
      { month: 'Des', burials: 24, bookings: 21, revenueIdr: 132000000, efficiencyPct: 91.8 },
      { month: 'Jan', burials: 27, bookings: 23, revenueIdr: 148500000, efficiencyPct: 92.6 },
      { month: 'Feb', burials: 22, bookings: 20, revenueIdr: 126400000, efficiencyPct: 93.4 },
      { month: 'Mar', burials: 29, bookings: 25, revenueIdr: 159000000, efficiencyPct: 94.1 },
      { month: 'Apr', burials: 26, bookings: 24, revenueIdr: 147200000, efficiencyPct: 93.8 },
      { month: 'Mei', burials: 31, bookings: 27, revenueIdr: 169400000, efficiencyPct: 95.2 },
      { month: 'Jun', burials: 28, bookings: 24, revenueIdr: 152800000, efficiencyPct: 94.6 },
      { month: 'Jul', burials: 32, bookings: 28, revenueIdr: 174200000, efficiencyPct: 95.9 },
      { month: 'Agu', burials: 29, bookings: 25, revenueIdr: 158600000, efficiencyPct: 95.1 },
      { month: 'Sep', burials: 34, bookings: 29, revenueIdr: 186400000, efficiencyPct: 96.4 },
      { month: 'Okt', burials: 30, bookings: 27, revenueIdr: 168900000, efficiencyPct: 96.1 },
      {
        month: 'Nov',
        burials: 28 + liveNovCases,
        bookings: 18 + liveNovBookings,
        revenueIdr: 158000000 + liveNovRevenue,
        efficiencyPct: liveNovEfficiency,
      },
    ],
    [liveNovCases, liveNovBookings, liveNovRevenue, liveNovEfficiency]
  );

  const visibleSeries = useMemo(() => {
    const sliced = range === '6m' ? fullSeries.slice(-6) : fullSeries;
    return sliced.map((row) => {
      const actualValue =
        metric === 'burials'
          ? row.burials
          : metric === 'bookings'
            ? row.bookings
            : row.revenueIdr;
      const targetValue =
        metric === 'burials'
          ? activeTargets.monthlyBurialTarget
          : metric === 'bookings'
            ? activeTargets.monthlyBookingTarget
            : activeTargets.monthlyRevenueTargetIdr;

      return {
        ...row,
        actualValue,
        targetValue,
        targetEfficiency: activeTargets.serviceEfficiencyTargetPct,
      };
    });
  }, [fullSeries, range, metric, activeTargets]);

  const currentMonth = visibleSeries[visibleSeries.length - 1];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveTargets({
        monthlyBurialTarget: Math.max(1, Math.round(Number(draft.monthlyBurialTarget) || 1)),
        monthlyBookingTarget: Math.max(1, Math.round(Number(draft.monthlyBookingTarget) || 1)),
        serviceEfficiencyTargetPct: Math.max(
          50,
          Math.min(100, Number(Number(draft.serviceEfficiencyTargetPct || 95).toFixed(1)))
        ),
        monthlyRevenueTargetIdr: Math.max(
          1000000,
          Math.round(Number(draft.monthlyRevenueTargetIdr) || 1000000)
        ),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    setDraft(DEFAULT_TARGETS);
  };

  const formatPrimaryValue = (val: number) => {
    if (metric === 'revenue') return formatCurrency(val, currency);
    if (metric === 'burials') return `${val} Pemakaman`;
    return `${val} Kavling`;
  };

  const formatPrimaryAxis = (val: number) => {
    if (metric !== 'revenue') return String(val);
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
    if (val >= 1000000) return `${Math.round(val / 1000000)}Jt`;
    return String(val);
  };

  const metricLabel =
    metric === 'burials'
      ? 'Jumlah Pemakaman'
      : metric === 'bookings'
        ? 'Pemesanan Kavling GIS'
        : 'Pendapatan Bulanan';

  const currentTargetValue =
    metric === 'burials'
      ? activeTargets.monthlyBurialTarget
      : metric === 'bookings'
        ? activeTargets.monthlyBookingTarget
        : activeTargets.monthlyRevenueTargetIdr;

  const summaryItems = [
    {
      label: 'Target Pemakaman / Bln',
      actualDisplay: `${currentMonth.burials}`,
      targetDisplay: `${activeTargets.monthlyBurialTarget} Kasus`,
      deltaPct:
        ((currentMonth.burials - activeTargets.monthlyBurialTarget) /
          Math.max(1, activeTargets.monthlyBurialTarget)) *
        100,
      met: currentMonth.burials >= activeTargets.monthlyBurialTarget,
    },
    {
      label: 'Efisiensi Layanan Syariah',
      actualDisplay: `${currentMonth.efficiencyPct.toFixed(1)}%`,
      targetDisplay: `${activeTargets.serviceEfficiencyTargetPct.toFixed(1)}% SLA`,
      deltaPct: currentMonth.efficiencyPct - activeTargets.serviceEfficiencyTargetPct,
      isPercentagePoint: true,
      met: currentMonth.efficiencyPct >= activeTargets.serviceEfficiencyTargetPct,
    },
    {
      label: 'Target Kavling GIS / Bln',
      actualDisplay: `${currentMonth.bookings}`,
      targetDisplay: `${activeTargets.monthlyBookingTarget} Kavling`,
      deltaPct:
        ((currentMonth.bookings - activeTargets.monthlyBookingTarget) /
          Math.max(1, activeTargets.monthlyBookingTarget)) *
        100,
      met: currentMonth.bookings >= activeTargets.monthlyBookingTarget,
    },
    {
      label: `Target Pendapatan (${currency})`,
      actualDisplay: formatCurrency(currentMonth.revenueIdr, currency),
      targetDisplay: formatCurrency(activeTargets.monthlyRevenueTargetIdr, currency),
      deltaPct:
        ((currentMonth.revenueIdr - activeTargets.monthlyRevenueTargetIdr) /
          Math.max(1, activeTargets.monthlyRevenueTargetIdr)) *
        100,
      met: currentMonth.revenueIdr >= activeTargets.monthlyRevenueTargetIdr,
    },
  ];

  const monthsMeetingPrimary = visibleSeries.filter((p) => p.actualValue >= p.targetValue).length;
  const monthsMeetingEfficiency = visibleSeries.filter(
    (p) => p.efficiencyPct >= p.targetEfficiency
  ).length;

  return (
    <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Target KPI Bulanan & Perbandingan Performa Aktual
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tetapkan sasaran operasional bulanan dan evaluasi pencapaian realisasi lapangan · Pembaruan terakhir: {targets.updatedAt}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { id: '6m', label: '6 Bulan' },
                { id: '12m', label: '12 Bulan' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  range === opt.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setEditing((prev) => !prev)}
            className={`h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              editing
                ? 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {editing ? (
              <>
                <X className="h-3.5 w-3.5" />
                <span>Tutup Pengaturan</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Atur Target KPI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive KPI Target Editor */}
      {editing && (
        <form
          onSubmit={handleSave}
          className="pb-6 border-b border-slate-200 dark:border-slate-800 space-y-4 no-print"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Konfigurasi Target KPI Bulanan (Pratinjau Langsung pada Grafik)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah nilai target untuk melihat simulasi perbandingan pada grafik sebelum menyimpan ke sistem.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Standar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Jumlah Pemakaman / Bln
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={draft.monthlyBurialTarget}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, monthlyBurialTarget: Number(e.target.value) }))
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Kasus</span>
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Efisiensi Layanan (%)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={100}
                  step={0.5}
                  value={draft.serviceEfficiencyTargetPct}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, serviceEfficiencyTargetPct: Number(e.target.value) }))
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">% SLA</span>
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Pemesanan Kavling / Bln
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={draft.monthlyBookingTarget}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, monthlyBookingTarget: Number(e.target.value) }))
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Kavling</span>
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Pendapatan / Bln (IDR)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1000000}
                  step={5000000}
                  value={draft.monthlyRevenueTargetIdr}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, monthlyRevenueTargetIdr: Number(e.target.value) }))
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setDraft({
                  monthlyBurialTarget: targets.monthlyBurialTarget,
                  monthlyBookingTarget: targets.monthlyBookingTarget,
                  serviceEfficiencyTargetPct: targets.serviceEfficiencyTargetPct,
                  monthlyRevenueTargetIdr: targets.monthlyRevenueTargetIdr,
                });
                setEditing(false);
              }}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Target KPI'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4-Column Attainment Summary Strip (Hairline-divided, zero nested cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
        {summaryItems.map((item) => (
          <div key={item.label} className="p-4 space-y-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {item.actualDisplay}
              </span>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                / {item.targetDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {item.met ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono tabular-nums">
                    Tercapai ({item.deltaPct >= 0 ? '+' : ''}
                    {item.deltaPct.toFixed(1)}
                    {item.isPercentagePoint ? ' poin' : '%'})
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono tabular-nums">
                    Selisih ({item.deltaPct.toFixed(1)}
                    {item.isPercentagePoint ? ' poin' : '%'})
                  </span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dual Recharts Target vs Actual Comparison Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-1">
        {/* Left Chart: Volume / Revenue Actual vs Target */}
        <div className="xl:col-span-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Perbandingan Aktual vs Target: {metricLabel}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                {monthsMeetingPrimary} dari {visibleSeries.length} bulan memenuhi target ({formatPrimaryValue(currentTargetValue)})
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg no-print">
              {(
                [
                  { id: 'burials', label: 'Pemakaman' },
                  { id: 'bookings', label: 'Kavling' },
                  { id: 'revenue', label: 'Pendapatan' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMetric(opt.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    metric === opt.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-700 inline-block" />
              Mencapai Target
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-600 inline-block" />
              Di Bawah Target
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-sky-600 inline-block" />
              Garis Target KPI
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleSeries} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatPrimaryAxis}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={metric === 'revenue' ? 46 : 36}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as (typeof visibleSeries)[number] | undefined;
                    if (!row) return null;
                    const diff = row.actualValue - row.targetValue;
                    const met = diff >= 0;
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 shadow-lg text-xs space-y-1.5">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Bulan {label} · {metricLabel}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-600 dark:text-slate-300">Realisasi Aktual:</span>
                          <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatPrimaryValue(row.actualValue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-600 dark:text-slate-300">Target KPI:</span>
                          <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                            {formatPrimaryValue(row.targetValue)}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Status:</span>
                          <span
                            className={`font-mono font-semibold tabular-nums ${
                              met ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {met ? 'Tercapai' : 'Kurang'} ({diff >= 0 ? '+' : ''}
                            {metric === 'revenue' ? formatCurrency(diff, currency) : diff})
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={currentTargetValue}
                  stroke="#0284c7"
                  strokeDasharray="5 5"
                  strokeWidth={1.75}
                />
                <Bar
                  dataKey="actualValue"
                  name="Aktual"
                  radius={[4, 4, 0, 0]}
                  barSize={range === '6m' ? 26 : 16}
                >
                  {visibleSeries.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.actualValue >= entry.targetValue ? '#047857' : '#d97706'}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="targetValue"
                  name="Target KPI"
                  stroke="#0284c7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Service Efficiency (%) Actual vs Target */}
        <div className="xl:col-span-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Efisiensi Layanan Syariah (% SLA): Aktual vs Target KPI
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                {monthsMeetingEfficiency} dari {visibleSeries.length} bulan melampaui target {activeTargets.serviceEfficiencyTargetPct.toFixed(1)}%
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 inline-block" />
                Efisiensi Aktual (%)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-600 inline-block" />
                Target Efisiensi ({activeTargets.serviceEfficiencyTargetPct}%)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleSeries} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="simpiEfficiencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[
                    Math.min(80, Math.floor(activeTargets.serviceEfficiencyTargetPct - 10)),
                    100,
                  ]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as (typeof visibleSeries)[number] | undefined;
                    if (!row) return null;
                    const diff = Number((row.efficiencyPct - row.targetEfficiency).toFixed(1));
                    const met = diff >= 0;
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 shadow-lg text-xs space-y-1.5">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Bulan {label} · Efisiensi Layanan
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-600 dark:text-slate-300">Efisiensi Aktual:</span>
                          <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {row.efficiencyPct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-600 dark:text-slate-300">Target Efisiensi:</span>
                          <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400">
                            {row.targetEfficiency.toFixed(1)}%
                          </span>
                        </div>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Deviasi SLA:</span>
                          <span
                            className={`font-mono font-semibold tabular-nums ${
                              met ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {diff >= 0 ? '+' : ''}
                            {diff.toFixed(1)} poin ({met ? 'Tercapai' : 'Perlu Evaluasi'})
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={activeTargets.serviceEfficiencyTargetPct}
                  stroke="#d97706"
                  strokeDasharray="5 5"
                  strokeWidth={1.75}
                />
                <Area
                  type="monotone"
                  dataKey="efficiencyPct"
                  name="Efisiensi Aktual"
                  stroke="#059669"
                  strokeWidth={2.25}
                  fill="url(#simpiEfficiencyGrad)"
                  dot={{ r: 3.5, fill: '#059669', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetEfficiency"
                  name="Target Efisiensi"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
