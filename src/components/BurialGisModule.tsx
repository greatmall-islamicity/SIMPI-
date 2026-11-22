import React, { useState } from 'react';
import {
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  CheckCircle2,
  Clock,
  Lock,
  Wrench,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  CemeteryPlot,
  CurrencyCode,
  FinancialTransaction,
  PlotStatus,
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

interface BurialGisModuleProps {
  plots: CemeteryPlot[];
  currency: CurrencyCode;
  searchQuery: string;
  onReservePlot: (
    plotId: string,
    payload: { familyContact: string; deceasedName: string; paymentMethod: FinancialTransaction['paymentMethod'] }
  ) => Promise<void>;
  onAuditExport?: (payload: AuditExportPayload) => void;
}

const ZONES: CemeteryPlot['zone'][] = [
  'Blok A - Raudhah',
  'Blok B - Al-Firdaus',
  'Blok C - As-Salam',
  'Blok D - Wakaf Umat',
];

export const BurialGisModule: React.FC<BurialGisModuleProps> = ({
  plots,
  currency,
  searchQuery,
  onReservePlot,
  onAuditExport,
}) => {
  const [selectedZone, setSelectedZone] = useState<'ALL' | CemeteryPlot['zone']>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PlotStatus>('ALL');
  const [zoom, setZoom] = useState(1);
  const [selectedPlot, setSelectedPlot] = useState<CemeteryPlot | null>(plots[0] || null);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [familyContact, setFamilyContact] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<FinancialTransaction['paymentMethod']>('QRIS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dukcapil Verification State
  const [nikInput, setNikInput] = useState('3174011905580004');
  const [nikResult, setNikResult] = useState<{
    verified: boolean;
    fullName?: string;
    address?: string;
    registryStatus?: string;
    message?: string;
  } | null>(null);
  const [nikLoading, setNikLoading] = useState(false);

  const visibleZones = selectedZone === 'ALL' ? ZONES : [selectedZone];

  const handleVerifyNik = async (e: React.FormEvent) => {
    e.preventDefault();
    setNikLoading(true);
    setNikResult(null);
    try {
      const res = await fetch('/api/v1/dukcapil/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: nikInput }),
      });
      const json = await res.json();
      setNikResult(json);
    } catch {
      setNikResult({ verified: false, message: 'Gagal terhubung ke layanan verifikasi kependudukan.' });
    } finally {
      setNikLoading(false);
    }
  };

  const handleConfirmReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlot) return;
    setIsSubmitting(true);
    try {
      await onReservePlot(selectedPlot.id, {
        familyContact: familyContact || '+6281200000000',
        deceasedName: deceasedName || 'Reservasi Kavling Keluarga',
        paymentMethod,
      });
      setShowReserveForm(false);
      setFamilyContact('');
      setDeceasedName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusMeta = (status: PlotStatus) => {
    switch (status) {
      case PlotStatus.AVAILABLE:
        return {
          label: 'Tersedia',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300',
          icon: CheckCircle2,
        };
      case PlotStatus.RESERVED:
        return {
          label: 'Dipesan',
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
          icon: Clock,
        };
      case PlotStatus.OCCUPIED:
        return {
          label: 'Terisi',
          bg: 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
          icon: Lock,
        };
      case PlotStatus.MAINTENANCE:
        return {
          label: 'Perawatan',
          bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300',
          icon: Wrench,
        };
    }
  };

  const currentPlot = selectedPlot ? plots.find((p) => p.id === selectedPlot.id) || selectedPlot : null;

  const filteredPlots = plots.filter((p) => {
    if (selectedZone !== 'ALL' && p.zone !== selectedZone) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q) ||
        (p.deceasedName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const dateStamp = new Date().toISOString().slice(0, 10);
  const appliedFilters = `Zona: ${selectedZone === 'ALL' ? 'Semua Zona' : selectedZone} · Status: ${statusFilter === 'ALL' ? 'Semua' : statusFilter}${searchQuery.trim() ? ` · Pencarian: "${searchQuery.trim()}"` : ''}`;

  const handleExportCsv = () => {
    const metadata = buildAuditMetadata({
      moduleCode: 'BRG',
      moduleName: 'Pemakaman & Pelacakan GIS',
      reportTitle: 'Laporan Inventarisasi Kavling & Pemakaman GIS SIMPI',
      appliedFilters,
      recordCount: filteredPlots.length,
      currency,
    });

    downloadCsv(
      `simpi-laporan-pemakaman-gis-${dateStamp}.csv`,
      ['Kode Kavling', 'Zona GIS', 'Status', 'Koordinat Lat', 'Koordinat Lng', 'Arah Kiblat', 'Dimensi', `Biaya (${currency})`, 'Nama Almarhum / Pemesan', 'Tanggal Makam', 'Kontak Wali', 'Audit Timestamp'],
      filteredPlots.map((p) => [
        p.code,
        p.zone,
        getStatusMeta(p.status).label,
        p.lat,
        p.lng,
        `${p.qiblaBearing}°`,
        p.sizeMeters,
        formatCurrency(p.priceIdr, currency),
        p.deceasedName || '-',
        p.burialDate || '-',
        p.familyContact || '-',
        metadata.generatedAtIso,
      ]),
      metadata
    );

    onAuditExport?.({
      module: 'Pemakaman GIS',
      format: 'CSV',
      reportId: metadata.reportId,
      recordCount: filteredPlots.length,
      filters: appliedFilters,
    });
  };

  const handleExportPdf = () => {
    const metadata = buildAuditMetadata({
      moduleCode: 'BRG',
      moduleName: 'Pemakaman & Pelacakan GIS',
      reportTitle: 'Laporan Pemakaman & Inventarisasi Kavling GIS SIMPI',
      appliedFilters,
      recordCount: filteredPlots.length,
      currency,
    });

    const availCount = filteredPlots.filter((p) => p.status === PlotStatus.AVAILABLE).length;
    const occCount = filteredPlots.filter((p) => p.status === PlotStatus.OCCUPIED).length;
    const resCount = filteredPlots.filter((p) => p.status === PlotStatus.RESERVED).length;

    downloadPdfReport({
      filename: `simpi-laporan-pemakaman-gis-${dateStamp}.pdf`,
      title: 'Laporan Pemakaman & Inventarisasi Kavling GIS SIMPI',
      subtitle: `Zona: ${selectedZone === 'ALL' ? 'Semua Zona (Blok A–D)' : selectedZone} · ${filteredPlots.length} kavling terpetakan`,
      metadata,
      summaryRows: [
        { label: 'Kavling Tersedia', value: `${availCount} Kavling` },
        { label: 'Kavling Dipesan', value: `${resCount} Kavling` },
        { label: 'Kavling Terisi', value: `${occCount} Kavling` },
      ],
      headers: ['Kode', 'Zona GIS', 'Status', 'Koordinat GPS', 'Kiblat', `Retribusi (${currency})`, 'Almarhum / Pemesan', 'Tgl Makam'],
      rows: filteredPlots.map((p) => [
        p.code,
        p.zone,
        getStatusMeta(p.status).label,
        `${p.lat}, ${p.lng}`,
        `${p.qiblaBearing}°`,
        formatCurrency(p.priceIdr, currency),
        p.deceasedName || '-',
        p.burialDate || '-',
      ]),
    });

    onAuditExport?.({
      module: 'Pemakaman GIS',
      format: 'PDF',
      reportId: metadata.reportId,
      recordCount: filteredPlots.length,
      filters: appliedFilters,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pemakaman & Pelacakan Lokasi Makam GIS
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Peta spasial kavling makam terkalibrasi arah Kiblat (295.14° WNW), pemesanan kavling online, dan verifikasi Dukcapil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <ExportMenuButton
            label="Export"
            recordCount={filteredPlots.length}
            appliedFilters={appliedFilters}
            onExportPdf={handleExportPdf}
            onExportCsv={handleExportCsv}
          />

          <select
            aria-label="Filter Zona"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value as 'ALL' | CemeteryPlot['zone'])}
            className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">Semua Zona (Blok A–D)</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['ALL', PlotStatus.AVAILABLE, PlotStatus.RESERVED, PlotStatus.OCCUPIED] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === PlotStatus.AVAILABLE
                    ? 'Tersedia'
                    : st === PlotStatus.RESERVED
                      ? 'Dipesan'
                      : 'Terisi'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Interactive GIS Spatial Map Viewport */}
        <div className="xl:col-span-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <Compass className="h-4 w-4" />
                Arah Kiblat 295.14° WNW
              </span>
              <span className="hidden sm:inline font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                Datum WGS84 · -6.2841° S, 106.8245° E
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono text-xs tabular-nums px-2 text-slate-600 dark:text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-950/60 overflow-auto">
            <div
              className="space-y-6 origin-top-left transition-transform duration-150"
              style={{ transform: `scale(${zoom})` }}
            >
              {visibleZones.map((zone) => {
                const zonePlots = plots.filter((p) => {
                  if (p.zone !== zone) return false;
                  if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return (
                      p.code.toLowerCase().includes(q) ||
                      (p.deceasedName || '').toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                return (
                  <div
                    key={zone}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {zone}
                      </h3>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {zonePlots.filter((p) => p.status === PlotStatus.AVAILABLE).length} Tersedia ·{' '}
                        {zonePlots.length} Ditampilkan
                      </span>
                    </div>

                    {zonePlots.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                        Tidak ada kavling yang sesuai filter di zona ini.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {zonePlots.map((plot) => {
                          const meta = getStatusMeta(plot.status);
                          const StatusIcon = meta.icon;
                          const isSelected = currentPlot?.id === plot.id;
                          return (
                            <button
                              key={plot.id}
                              type="button"
                              onClick={() => {
                                setSelectedPlot(plot);
                                setShowReserveForm(false);
                              }}
                              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${meta.bg} ${
                                isSelected
                                  ? 'ring-2 ring-emerald-700 dark:ring-emerald-400 ring-offset-1 dark:ring-offset-slate-900'
                                  : 'hover:opacity-90'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-xs font-semibold tabular-nums">
                                  {plot.code}
                                </span>
                                <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                              </div>
                              <div className="mt-1 text-[11px] font-medium truncate">
                                {plot.deceasedName ? plot.deceasedName : meta.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Tersedia (Siap Pesan)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Dipesan (Reservasi Keluarga)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              Terisi (Tercatat di Arsip)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              Perawatan Lahan
            </span>
          </div>
        </div>

        {/* Plot Inspector & Dukcapil Verification Column */}
        <div className="xl:col-span-4 space-y-6">
          {currentPlot && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Detail Koordinat Kavling GIS</p>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Kavling {currentPlot.code}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{currentPlot.zone}</p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  {getStatusMeta(currentPlot.status).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-200 dark:border-slate-800 py-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Koordinat GPS</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                    {currentPlot.lat}, {currentPlot.lng}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Orientasi Kiblat</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                    {currentPlot.qiblaBearing}° WNW
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Dimensi Lahan</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                    {currentPlot.sizeMeters}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Biaya Retribusi / Wakaf</span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(currentPlot.priceIdr, currency)}
                  </span>
                </div>
              </div>

              {currentPlot.deceasedName && (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 block">Data Tercatat</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {currentPlot.deceasedName}
                  </p>
                  {currentPlot.burialDate && (
                    <p className="text-slate-500 dark:text-slate-400 font-mono">
                      Tanggal Pemakaman: {currentPlot.burialDate}
                    </p>
                  )}
                  {currentPlot.familyContact && (
                    <p className="text-slate-500 dark:text-slate-400 font-mono">
                      Kontak Wali: {currentPlot.familyContact}
                    </p>
                  )}
                </div>
              )}

              {currentPlot.status === PlotStatus.AVAILABLE && !showReserveForm && (
                <button
                  type="button"
                  onClick={() => setShowReserveForm(true)}
                  className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Pesan Kavling {currentPlot.code} Sekarang</span>
                </button>
              )}

              {showReserveForm && currentPlot.status === PlotStatus.AVAILABLE && (
                <form onSubmit={handleConfirmReserve} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Atas Nama Almarhum / Keluarga Pemesan
                    </label>
                    <input
                      type="text"
                      required
                      value={deceasedName}
                      onChange={(e) => setDeceasedName(e.target.value)}
                      placeholder="Contoh: Kel. Bpk. H. Ridwan"
                      className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nomor WhatsApp Keluarga (Notifikasi Real-Time)
                    </label>
                    <input
                      type="text"
                      required
                      value={familyContact}
                      onChange={(e) => setFamilyContact(e.target.value)}
                      placeholder="+62812..."
                      className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Metode Pembayaran Digital
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as FinancialTransaction['paymentMethod'])}
                      className="w-full h-9 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="QRIS">QRIS Instan</option>
                      <option value="VA Syariah">Virtual Account Bank Syariah</option>
                      <option value="Transfer Bank">Transfer Bank Nasional</option>
                      <option value="Kartu Global">Kartu Kredit / Debit Global</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-9 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                    >
                      {isSubmitting ? 'Memproses...' : 'Konfirmasi & Bayar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReserveForm(false)}
                      className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Dukcapil Civil Registry Verification Widget */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Integrasi Verifikasi Kependudukan (NIK)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Validasi cepat data kependudukan dan akta kematian untuk percepatan administrasi pemakaman.
            </p>
            <form onSubmit={handleVerifyNik} className="flex gap-2">
              <input
                type="text"
                value={nikInput}
                onChange={(e) => setNikInput(e.target.value)}
                placeholder="Masukkan 16 digit NIK..."
                className="flex-1 h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={nikLoading}
                className="h-9 px-3 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{nikLoading ? 'Cek...' : 'Verifikasi'}</span>
              </button>
            </form>

            {nikResult && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  nikResult.verified
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                {nikResult.verified ? (
                  <>
                    <p className="font-semibold">{nikResult.fullName}</p>
                    <p>{nikResult.address}</p>
                    <p className="font-mono text-[11px] opacity-80">{nikResult.registryStatus}</p>
                  </>
                ) : (
                  <p>{nikResult.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
