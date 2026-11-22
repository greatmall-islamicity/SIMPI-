import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  CemeteryPlot,
  CurrencyCode,
  FinancialTransaction,
  FuneralCase,
  PlotStatus,
} from '../types/simpi';
import { formatCurrency } from '../utils/formatters';

interface MonthlyAnalyticsChartsProps {
  cases: FuneralCase[];
  plots: CemeteryPlot[];
  transactions: FinancialTransaction[];
  currency: CurrencyCode;
}

interface MonthlyPoint {
  month: string;
  deceasedCount: number;
  plotBookings: number;
  revenueIdr: number;
  expenseIdr: number;
}

type RangeFilter = '6m' | '12m';
type SeriesVisibility = {
  deceasedCount: boolean;
  plotBookings: boolean;
};

export const MonthlyAnalyticsCharts: React.FC<MonthlyAnalyticsChartsProps> = ({
  cases,
  plots,
  transactions,
  currency,
}) => {
  const [range, setRange] = useState<RangeFilter>('6m');
  const [visibleSeries, setVisibleSeries] = useState<SeriesVisibility>({
    deceasedCount: true,
    plotBookings: true,
  });

  const liveNovCases = cases.length;
  const liveNovBookings = plots.filter(
    (p) => p.status === PlotStatus.OCCUPIED || p.status === PlotStatus.RESERVED
  ).length;
  const liveNovRevenue = transactions
    .filter((t) => t.type === 'PEMASUKAN')
    .reduce((sum, t) => sum + t.amountIdr, 0);
  const liveNovExpense = transactions
    .filter((t) => t.type === 'PENGELUARAN')
    .reduce((sum, t) => sum + t.amountIdr, 0);

  const fullYearData: MonthlyPoint[] = useMemo(
    () => [
      { month: 'Des', deceasedCount: 16, plotBookings: 14, revenueIdr: 98500000, expenseIdr: 34200000 },
      { month: 'Jan', deceasedCount: 19, plotBookings: 17, revenueIdr: 114200000, expenseIdr: 38900000 },
      { month: 'Feb', deceasedCount: 15, plotBookings: 15, revenueIdr: 96400000, expenseIdr: 31500000 },
      { month: 'Mar', deceasedCount: 21, plotBookings: 18, revenueIdr: 126800000, expenseIdr: 41200000 },
      { month: 'Apr', deceasedCount: 20, plotBookings: 19, revenueIdr: 122500000, expenseIdr: 39800000 },
      { month: 'Mei', deceasedCount: 23, plotBookings: 20, revenueIdr: 138400000, expenseIdr: 44100000 },
      { month: 'Jun', deceasedCount: 21, plotBookings: 18, revenueIdr: 129600000, expenseIdr: 40500000 },
      { month: 'Jul', deceasedCount: 24, plotBookings: 22, revenueIdr: 149200000, expenseIdr: 46800000 },
      { month: 'Agu', deceasedCount: 22, plotBookings: 19, revenueIdr: 135800000, expenseIdr: 42300000 },
      { month: 'Sep', deceasedCount: 28, plotBookings: 26, revenueIdr: 172400000, expenseIdr: 51900000 },
      { month: 'Okt', deceasedCount: 27, plotBookings: 24, revenueIdr: 164900000, expenseIdr: 49200000 },
      {
        month: 'Nov',
        deceasedCount: 28 + liveNovCases,
        plotBookings: 18 + liveNovBookings,
        revenueIdr: 158000000 + liveNovRevenue,
        expenseIdr: 32000000 + liveNovExpense,
      },
    ],
    [liveNovCases, liveNovBookings, liveNovRevenue, liveNovExpense]
  );

  const chartData = useMemo(
    () => (range === '6m' ? fullYearData.slice(-6) : fullYearData),
    [fullYearData, range]
  );

  const summary = useMemo(() => {
    const totalDeceased = chartData.reduce((s, d) => s + d.deceasedCount, 0);
    const totalBookings = chartData.reduce((s, d) => s + d.plotBookings, 0);
    const totalRevenue = chartData.reduce((s, d) => s + d.revenueIdr, 0);
    return { totalDeceased, totalBookings, totalRevenue };
  }, [chartData]);

  const toggleSeries = (key: keyof SeriesVisibility) => {
    setVisibleSeries((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.deceasedCount && !next.plotBookings) return prev;
      return next;
    });
  };

  const formatCompactAxis = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
    if (val >= 1000000) return `${Math.round(val / 1000000)}Jt`;
    return String(val);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Visualisasi Tren Operasional & Pendapatan Bulanan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis interaktif jumlah pemulasaran jenazah, pemesanan kavling makam GIS, dan arus pendapatan periode berjalan.
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
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  range === opt.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Period Quantitative Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Penanganan Jenazah ({range === '6m' ? '6 Bln' : '12 Bln'})
          </span>
          <p className="font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {summary.totalDeceased} <span className="text-xs font-sans font-normal text-slate-500">Jenazah</span>
          </p>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Pemesanan Kavling GIS ({range === '6m' ? '6 Bln' : '12 Bln'})
          </span>
          <p className="font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
            {summary.totalBookings} <span className="text-xs font-sans font-normal text-slate-500">Kavling</span>
          </p>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Akumulasi Pendapatan ({currency})
          </span>
          <p className="font-mono text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
            {formatCurrency(summary.totalRevenue, currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Chart: Monthly Deceased & Plot Bookings */}
        <div className="xl:col-span-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <BarChart3 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>Tren Jumlah Jenazah & Pemesanan Kavling</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => toggleSeries('deceasedCount')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  visibleSeries.deceasedCount
                    ? 'border-emerald-600/40 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 inline-block" />
                <span>Jumlah Jenazah</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSeries('plotBookings')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  visibleSeries.plotBookings
                    ? 'border-amber-600/40 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-xs bg-amber-500 inline-block" />
                <span>Pemesanan Kavling</span>
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg text-xs space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Bulan {label}
                        </p>
                        {payload.map((entry) => (
                          <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4">
                            <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
                            <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                {visibleSeries.deceasedCount && (
                  <Bar
                    dataKey="deceasedCount"
                    name="Jumlah Jenazah"
                    fill="#047857"
                    radius={[4, 4, 0, 0]}
                    barSize={range === '6m' ? 22 : 14}
                  />
                )}
                {visibleSeries.plotBookings && (
                  <Line
                    type="monotone"
                    dataKey="plotBookings"
                    name="Pemesanan Kavling"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#d97706', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Monthly Operational Revenue vs Expenses */}
        <div className="xl:col-span-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <TrendingUp className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>Tren Pendapatan & Biaya Operasional</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 inline-block" />
                Pendapatan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-500 inline-block" />
                Pengeluaran
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="simpiRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="simpiExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.02} />
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
                  tickFormatter={formatCompactAxis}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as MonthlyPoint | undefined;
                    if (!row) return null;
                    const surplus = row.revenueIdr - row.expenseIdr;
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 shadow-lg text-xs space-y-1.5">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Arus Kas Bulan {label}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-600 dark:text-slate-300">Pendapatan:</span>
                          <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(row.revenueIdr, currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-600 dark:text-slate-300">Pengeluaran:</span>
                          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {formatCurrency(row.expenseIdr, currency)}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">Surplus Bersih:</span>
                          <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(surplus, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenueIdr"
                  name="Pendapatan"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#simpiRevenueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expenseIdr"
                  name="Pengeluaran"
                  stroke="#64748b"
                  strokeWidth={1.75}
                  fill="url(#simpiExpenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
