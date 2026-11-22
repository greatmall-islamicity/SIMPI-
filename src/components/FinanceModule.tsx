import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import {
  CurrencyCode,
  FinancialTransaction,
  FuneralCase,
} from '../types/simpi';
import {
  buildAuditMetadata,
  downloadCsv,
  downloadPdfReport,
  formatCurrency,
} from '../utils/formatters';
import { ExportMenuButton } from './ExportMenuButton';

interface AuditExportPayload {
  module: string;
  format: 'PDF' | 'CSV';
  reportId: string;
  recordCount: number;
  filters: string;
}

interface FinanceModuleProps {
  transactions: FinancialTransaction[];
  cases: FuneralCase[];
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  onCreateTransaction: (payload: Partial<FinancialTransaction>) => Promise<void>;
  onAuditExport?: (payload: AuditExportPayload) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  transactions,
  cases,
  currency,
  onChangeCurrency,
  onCreateTransaction,
  onAuditExport,
}) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'pnl' | 'balance'>('ledger');
  const [showPayModal, setShowPayModal] = useState(false);
  const [payRef, setPayRef] = useState(cases.find((c) => c.paymentStatus !== 'LUNAS')?.id || '');
  const [payDesc, setPayDesc] = useState('Pelunasan Layanan Pemulasaran & Kavling Makam');
  const [payAmountIdr, setPayAmountIdr] = useState(7250000);
  const [payMethod, setPayMethod] = useState<FinancialTransaction['paymentMethod']>('QRIS');
  const [submitting, setSubmitting] = useState(false);

  const totalIncomeIdr = transactions
    .filter((t) => t.type === 'PEMASUKAN')
    .reduce((sum, t) => sum + t.amountIdr, 0);
  const totalExpenseIdr = transactions
    .filter((t) => t.type === 'PENGELUARAN')
    .reduce((sum, t) => sum + t.amountIdr, 0);
  const netSurplusIdr = totalIncomeIdr - totalExpenseIdr;

  const dateStamp = new Date().toISOString().slice(0, 10);
  const tabLabel =
    activeTab === 'pnl'
      ? 'Laporan Laba Rugi'
      : activeTab === 'balance'
        ? 'Neraca Aset & Wakaf'
        : 'Buku Kas & Arus Transaksi';
  const activeRecordCount = activeTab === 'ledger' ? transactions.length : 4;
  const appliedFilters = `Tab: ${tabLabel} · Mata Uang: ${currency}`;

  const handleExportCsv = () => {
    const metadata = buildAuditMetadata({
      moduleCode: 'FIN',
      moduleName: 'Manajemen Keuangan & Pembayaran',
      reportTitle: `Ekspor ${tabLabel}`,
      appliedFilters,
      recordCount: activeRecordCount,
      currency,
    });

    if (activeTab === 'pnl') {
      downloadCsv(
        `simpi-laba-rugi-${dateStamp}.csv`,
        ['Pos Laporan Laba Rugi', `Nominal (${currency})`, 'Stempel Waktu Audit'],
        [
          ['Pendapatan Layanan Pemulasaran & Kavling Makam', formatCurrency(totalIncomeIdr, currency), metadata.generatedAtIso],
          ['Beban Pengadaan Kain Kafan, Nisan & Perlengkapan', `-${formatCurrency(13650000, currency)}`, metadata.generatedAtIso],
          ['Insentif Tim Pemulasaran & Perawatan Lahan', `-${formatCurrency(Math.max(0, totalExpenseIdr - 13650000), currency)}`, metadata.generatedAtIso],
          ['Surplus Operasional & Dana Pemeliharaan Abadi', formatCurrency(netSurplusIdr, currency), metadata.generatedAtIso],
        ],
        metadata
      );
    } else if (activeTab === 'balance') {
      downloadCsv(
        `simpi-neraca-${dateStamp}.csv`,
        ['Pos Neraca Aset & Wakaf', `Nilai (${currency})`, 'Stempel Waktu Audit'],
        [
          ['Kas & Rekening Bank Syariah Terverifikasi', formatCurrency(185400000 + netSurplusIdr, currency), metadata.generatedAtIso],
          ['Nilai Persediaan Perlengkapan Pemakaman & Pemulasaran', formatCurrency(56450000, currency), metadata.generatedAtIso],
          ['Aset Armada Ambulans & Peralatan Stainless', formatCurrency(1420000000, currency), metadata.generatedAtIso],
          ['Total Ekuitas & Aset Wakaf Produktif', formatCurrency(1661850000 + netSurplusIdr, currency), metadata.generatedAtIso],
        ],
        metadata
      );
    } else {
      downloadCsv(
        `simpi-laporan-keuangan-${dateStamp}.csv`,
        ['ID Transaksi', 'Tanggal Transaksi', 'Jenis', 'Kategori', 'Deskripsi', 'Referensi', 'Metode', 'Mata Uang Bayar', `Nominal (${currency})`, 'Status', 'Audit Timestamp'],
        transactions.map((t) => [
          t.id,
          t.date,
          t.type,
          t.category,
          t.description,
          t.referenceId,
          t.paymentMethod,
          t.currencyPaid,
          formatCurrency(t.amountIdr, currency),
          t.status,
          metadata.generatedAtIso,
        ]),
        metadata
      );
    }

    onAuditExport?.({
      module: 'Keuangan',
      format: 'CSV',
      reportId: metadata.reportId,
      recordCount: activeRecordCount,
      filters: appliedFilters,
    });
  };

  const handleExportPdf = () => {
    const metadata = buildAuditMetadata({
      moduleCode: 'FIN',
      moduleName: 'Manajemen Keuangan & Pembayaran',
      reportTitle: `Laporan ${tabLabel}`,
      appliedFilters,
      recordCount: activeRecordCount,
      currency,
    });

    const summaryRows = [
      { label: 'Total Pendapatan', value: formatCurrency(totalIncomeIdr, currency) },
      { label: 'Total Pengeluaran', value: formatCurrency(totalExpenseIdr, currency) },
      { label: 'Surplus Bersih', value: formatCurrency(netSurplusIdr, currency) },
    ];

    if (activeTab === 'pnl') {
      downloadPdfReport({
        filename: `simpi-laba-rugi-${dateStamp}.pdf`,
        title: 'Laporan Laba Rugi Operasional SIMPI',
        subtitle: `Ikhtisar pendapatan dan beban operasional dalam mata uang ${currency}`,
        metadata,
        orientation: 'portrait',
        summaryRows,
        headers: ['Pos Laporan Laba Rugi', `Nominal (${currency})`],
        rows: [
          ['Pendapatan Layanan Pemulasaran & Kavling Makam', formatCurrency(totalIncomeIdr, currency)],
          ['Beban Pengadaan Kain Kafan, Nisan & Perlengkapan', `-${formatCurrency(13650000, currency)}`],
          ['Insentif Tim Pemulasaran & Perawatan Lahan', `-${formatCurrency(Math.max(0, totalExpenseIdr - 13650000), currency)}`],
          ['Surplus Operasional & Dana Pemeliharaan Abadi', formatCurrency(netSurplusIdr, currency)],
        ],
      });
    } else if (activeTab === 'balance') {
      downloadPdfReport({
        filename: `simpi-neraca-${dateStamp}.pdf`,
        title: 'Laporan Neraca Aset & Wakaf SIMPI',
        subtitle: `Posisi kas, persediaan perlengkapan, dan aset wakaf produktif (${currency})`,
        metadata,
        orientation: 'portrait',
        summaryRows,
        headers: ['Pos Neraca Aset & Wakaf', `Nilai (${currency})`],
        rows: [
          ['Kas & Rekening Bank Syariah Terverifikasi', formatCurrency(185400000 + netSurplusIdr, currency)],
          ['Nilai Persediaan Perlengkapan Pemakaman & Pemulasaran', formatCurrency(56450000, currency)],
          ['Aset Armada Ambulans & Peralatan Stainless', formatCurrency(1420000000, currency)],
          ['Total Ekuitas & Aset Wakaf Produktif', formatCurrency(1661850000 + netSurplusIdr, currency)],
        ],
      });
    } else {
      downloadPdfReport({
        filename: `simpi-laporan-keuangan-${dateStamp}.pdf`,
        title: 'Laporan Buku Kas & Transaksi Keuangan SIMPI',
        subtitle: `Rincian arus kas masuk & keluar multi-mata uang (${currency}) · ${transactions.length} transaksi`,
        metadata,
        summaryRows,
        headers: ['ID', 'Tanggal', 'Jenis', 'Deskripsi', 'Referensi', 'Metode', `Nominal (${currency})`, 'Status'],
        rows: transactions.map((t) => [
          t.id,
          t.date,
          t.type,
          t.description,
          t.referenceId,
          `${t.paymentMethod} (${t.currencyPaid})`,
          `${t.type === 'PEMASUKAN' ? '+' : '-'} ${formatCurrency(t.amountIdr, currency)}`,
          t.status,
        ]),
      });
    }

    onAuditExport?.({
      module: 'Keuangan',
      format: 'PDF',
      reportId: metadata.reportId,
      recordCount: activeRecordCount,
      filters: appliedFilters,
    });
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreateTransaction({
        type: 'PEMASUKAN',
        category: 'Pembayaran Layanan Digital',
        description: payDesc,
        referenceId: payRef || 'DIRECT-PAY',
        paymentMethod: payMethod,
        amountIdr: payAmountIdr,
        currencyPaid: currency,
      });
      setShowPayModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Manajemen Keuangan & Pembayaran Digital Global
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Transparansi biaya operasional, laporan laba rugi & neraca, serta dukungan pembayaran multi-mata uang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <select
            aria-label="Mata Uang Tampilan"
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
            className="h-9 px-3 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="IDR">IDR (Rupiah)</option>
            <option value="USD">USD (US Dollar)</option>
            <option value="SGD">SGD (Singapore Dollar)</option>
            <option value="MYR">MYR (Malaysian Ringgit)</option>
            <option value="SAR">SAR (Saudi Riyal)</option>
          </select>

          <ExportMenuButton
            label="Export"
            recordCount={activeRecordCount}
            appliedFilters={appliedFilters}
            onExportPdf={handleExportPdf}
            onExportCsv={handleExportCsv}
          />

          <button
            type="button"
            onClick={() => setShowPayModal(true)}
            className="h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Terima Pembayaran Digital</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Pendapatan (Kas Masuk)</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(totalIncomeIdr, currency)}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Pengeluaran Operasional</span>
            <ArrowUpRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(totalExpenseIdr, currency)}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Surplus Bersih Periode Berjalan</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatCurrency(netSurplusIdr, currency)}
          </p>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit no-print">
        {[
          { id: 'ledger', label: 'Buku Kas & Arus Transaksi' },
          { id: 'pnl', label: 'Laporan Laba Rugi' },
          { id: 'balance', label: 'Neraca Aset & Wakaf' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'ledger' | 'pnl' | 'balance')}
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

      {activeTab === 'ledger' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">ID & Waktu</th>
                  <th className="py-3 px-4">Kategori & Deskripsi</th>
                  <th className="py-3 px-4">Metode / Mata Uang</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Nominal ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{tx.id}</p>
                      <p className="text-slate-500 dark:text-slate-400 tabular-nums">{tx.date}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{tx.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tx.category} · Ref {tx.referenceId}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {tx.paymentMethod} · <span className="font-mono">{tx.currencyPaid}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {tx.status}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono tabular-nums font-medium ${
                        tx.type === 'PEMASUKAN'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'PEMASUKAN' ? '+' : '-'} {formatCurrency(tx.amountIdr, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pnl' && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-w-3xl">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Ikhtisar Laporan Laba Rugi Operasional (Periode Berjalan)
          </h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Pendapatan Layanan Pemulasaran & Kavling Makam</span>
              <span className="font-mono tabular-nums font-medium">{formatCurrency(totalIncomeIdr, currency)}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Beban Pengadaan Kain Kafan, Nisan & Perlengkapan</span>
              <span className="font-mono tabular-nums">-{formatCurrency(13650000, currency)}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Insentif Tim Pemulasaran & Perawatan Lahan</span>
              <span className="font-mono tabular-nums">-{formatCurrency(Math.max(0, totalExpenseIdr - 13650000), currency)}</span>
            </div>
            <div className="py-3.5 flex justify-between font-semibold text-base">
              <span>Surplus Operasional & Dana Pemeliharaan Abadi</span>
              <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatCurrency(netSurplusIdr, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-w-3xl">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Neraca Ringkas Aset, Persediaan & Dana Wakaf
          </h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Kas & Rekening Bank Syariah Terverifikasi</span>
              <span className="font-mono tabular-nums font-medium">{formatCurrency(185400000 + netSurplusIdr, currency)}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Nilai Persediaan Perlengkapan Pemakaman & Pemulasaran</span>
              <span className="font-mono tabular-nums font-medium">{formatCurrency(56450000, currency)}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Aset Armada Ambulans & Peralatan Stainless</span>
              <span className="font-mono tabular-nums font-medium">{formatCurrency(1420000000, currency)}</span>
            </div>
            <div className="py-3.5 flex justify-between font-semibold text-base">
              <span>Total Ekuitas & Aset Wakaf Produktif</span>
              <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatCurrency(1661850000 + netSurplusIdr, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Checkout Pembayaran Digital Multi-Mata Uang
            </h2>
            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Referensi Kasus / Kavling
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Contoh: CASE-2026-0843"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Pembayaran
                </label>
                <input
                  type="text"
                  required
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nominal Dasar (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    value={payAmountIdr}
                    onChange={(e) => setPayAmountIdr(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kanal Pembayaran
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as FinancialTransaction['paymentMethod'])}
                    className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="QRIS">QRIS Nasional</option>
                    <option value="VA Syariah">VA Bank Syariah</option>
                    <option value="Kartu Global">Kartu Kredit / Debit Global</option>
                    <option value="Transfer Bank">Transfer Antar Bank</option>
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Konversi Mata Uang ({currency})</span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(payAmountIdr, currency)}
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {submitting ? 'Memverifikasi...' : 'Proses & Terbitkan Kwitansi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
