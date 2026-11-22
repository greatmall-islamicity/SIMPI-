import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, PackagePlus } from 'lucide-react';
import { CurrencyCode, InventoryItem } from '../types/simpi';
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

interface InventoryModuleProps {
  inventory: InventoryItem[];
  currency: CurrencyCode;
  searchQuery: string;
  onRestock: (itemId: string, quantity: number) => Promise<void>;
  onAuditExport?: (payload: AuditExportPayload) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  inventory,
  currency,
  searchQuery,
  onRestock,
  onAuditExport,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | InventoryItem['category']>('ALL');
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(20);
  const [loading, setLoading] = useState(false);

  const filtered = inventory.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockItems = inventory.filter((i) => i.stock <= i.minThreshold);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const appliedFilters = `Kategori: ${categoryFilter === 'ALL' ? 'Semua Kategori' : categoryFilter}${searchQuery.trim() ? ` · Pencarian: "${searchQuery.trim()}"` : ''}`;

  const handleExportCsv = () => {
    const metadata = buildAuditMetadata({
      moduleCode: 'INV',
      moduleName: 'Manajemen Inventaris & Pengadaan',
      reportTitle: 'Laporan Persediaan & Pengadaan Perlengkapan SIMPI',
      appliedFilters,
      recordCount: filtered.length,
      currency,
    });

    downloadCsv(
      `simpi-laporan-inventaris-${dateStamp}.csv`,
      ['SKU', 'Nama Perlengkapan', 'Kategori', 'Pemasok', 'Stok Saat Ini', 'Ambang Minimum', 'Satuan', 'Status', `Biaya Satuan (${currency})`, 'Restok Terakhir', 'Audit Timestamp'],
      filtered.map((item) => [
        item.sku,
        item.name,
        item.category,
        item.supplier,
        item.stock,
        item.minThreshold,
        item.unit,
        item.stock <= item.minThreshold ? 'Stok Menipis' : 'Aman',
        item.unitCostIdr > 0 ? formatCurrency(item.unitCostIdr, currency) : 'Aset Tetap',
        item.lastRestocked,
        metadata.generatedAtIso,
      ]),
      metadata
    );

    onAuditExport?.({
      module: 'Inventaris',
      format: 'CSV',
      reportId: metadata.reportId,
      recordCount: filtered.length,
      filters: appliedFilters,
    });
  };

  const handleExportPdf = () => {
    const metadata = buildAuditMetadata({
      moduleCode: 'INV',
      moduleName: 'Manajemen Inventaris & Pengadaan',
      reportTitle: 'Laporan Inventaris & Persediaan Perlengkapan SIMPI',
      appliedFilters,
      recordCount: filtered.length,
      currency,
    });

    const totalValuationIdr = filtered.reduce((acc, i) => acc + i.stock * i.unitCostIdr, 0);
    downloadPdfReport({
      filename: `simpi-laporan-inventaris-${dateStamp}.pdf`,
      title: 'Laporan Inventaris & Persediaan Perlengkapan SIMPI',
      subtitle: `Kategori: ${categoryFilter === 'ALL' ? 'Semua Kategori' : categoryFilter} · ${filtered.length} item tercatat`,
      metadata,
      summaryRows: [
        { label: 'Total Item Ditampilkan', value: `${filtered.length} SKU` },
        { label: 'Peringatan Stok Menipis', value: `${lowStockItems.length} Item` },
        { label: `Estimasi Nilai Persediaan (${currency})`, value: formatCurrency(totalValuationIdr, currency) },
      ],
      headers: ['SKU', 'Perlengkapan', 'Kategori', 'Pemasok', 'Stok / Min', 'Status', `Biaya Satuan (${currency})`],
      rows: filtered.map((item) => [
        item.sku,
        item.name,
        item.category,
        item.supplier,
        `${item.stock} / ${item.minThreshold} ${item.unit}`,
        item.stock <= item.minThreshold ? 'Stok Menipis' : 'Aman',
        item.unitCostIdr > 0 ? formatCurrency(item.unitCostIdr, currency) : 'Aset Tetap',
      ]),
    });

    onAuditExport?.({
      module: 'Inventaris',
      format: 'PDF',
      reportId: metadata.reportId,
      recordCount: filtered.length,
      filters: appliedFilters,
    });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget) return;
    setLoading(true);
    try {
      await onRestock(restockTarget.id, restockQty);
      setRestockTarget(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Manajemen Inventaris & Pengadaan Perlengkapan
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pelacakan persediaan perlengkapan pemakaman, pemulasaran, dan kesiapan armada ambulans jenazah secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <ExportMenuButton
            label="Export"
            recordCount={filtered.length}
            appliedFilters={appliedFilters}
            onExportPdf={handleExportPdf}
            onExportCsv={handleExportCsv}
          />

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['ALL', 'Pemulasaran', 'Pemakaman', 'Armada'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Peringatan Batas Minimum Persediaan ({lowStockItems.length} item perlu pengadaan)
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                {lowStockItems.map((i) => `${i.name} (${i.stock} ${i.unit})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setRestockTarget(lowStockItems[0]);
              setRestockQty(25);
            }}
            className="h-8 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pesan Pengadaan Segera
          </button>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">SKU & Perlengkapan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Pemasok</th>
                <th className="py-3 px-4 text-right">Stok / Ambang</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Biaya Satuan</th>
                <th className="py-3 px-4 text-right">Pengadaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filtered.map((item) => {
                const isLow = item.stock <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {item.sku} · Restok terakhir {item.lastRestocked}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {item.supplier}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {item.stock} <span className="text-xs text-slate-400">/ min {item.minThreshold} {item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Stok Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-slate-700 dark:text-slate-300">
                      {item.unitCostIdr > 0 ? formatCurrency(item.unitCostIdr, currency) : 'Aset Tetap'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setRestockTarget(item);
                          setRestockQty(20);
                        }}
                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <PackagePlus className="h-3.5 w-3.5" />
                        <span>Pesan Stok</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Pemesanan Pengadaan Perlengkapan
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {restockTarget.name} ({restockTarget.sku}) · Pemasok: {restockTarget.supplier}
            </p>
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Pesanan ({restockTarget.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-y border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Estimasi Total Pengeluaran</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(restockQty * restockTarget.unitCostIdr, currency)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {loading ? 'Memproses...' : 'Kirim Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
