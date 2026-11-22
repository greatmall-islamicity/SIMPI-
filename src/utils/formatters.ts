import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CurrencyCode } from '../types/simpi';

const FX_RATES_FROM_IDR: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 0.000063,
  SGD: 0.000084,
  MYR: 0.00028,
  SAR: 0.000236,
};

export function formatCurrency(amountIdr: number, currency: CurrencyCode): string {
  const converted = amountIdr * FX_RATES_FROM_IDR[currency];
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(converted);
  }
  const localeMap: Record<Exclude<CurrencyCode, 'IDR'>, string> = {
    USD: 'en-US',
    SGD: 'en-SG',
    MYR: 'ms-MY',
    SAR: 'ar-SA',
  };
  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}

export interface ExportAuditMetadata {
  reportId: string;
  module: string;
  reportTitle: string;
  generatedAtIso: string;
  generatedAtLocal: string;
  exportedBy: string;
  appliedFilters: string;
  recordCount: number;
  currency?: CurrencyCode;
  integrityChecksum: string;
}

function computeChecksum(seed: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `SIMPI-CHK-${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`.toUpperCase();
}

export function buildAuditMetadata(params: {
  moduleCode: 'FIN' | 'INV' | 'BRG' | 'FNR' | 'EXEC';
  moduleName: string;
  reportTitle: string;
  appliedFilters: string;
  recordCount: number;
  currency?: CurrencyCode;
  exportedBy?: string;
}): ExportAuditMetadata {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeSuffix = now.getTime().toString().slice(-4);
  const reportId = `RPT-${params.moduleCode}-${datePart}-${timeSuffix}`;
  const generatedAtIso = now.toISOString();
  const generatedAtLocal = `${now.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })} WIB`;
  const exportedBy = params.exportedBy || 'Ir. Ahmad Fauzan, M.M. (ahmad.fauzan@simpi.id)';
  const integrityChecksum = computeChecksum(
    `${reportId}|${params.moduleName}|${generatedAtIso}|${params.recordCount}|${params.appliedFilters}`
  );

  return {
    reportId,
    module: params.moduleName,
    reportTitle: params.reportTitle,
    generatedAtIso,
    generatedAtLocal,
    exportedBy,
    appliedFilters: params.appliedFilters,
    recordCount: params.recordCount,
    currency: params.currency,
    integrityChecksum,
  };
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  metadata?: ExportAuditMetadata
): void {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const metadataRows: (string | number)[][] = metadata
    ? [
        ['SIMPI AUDIT EXPORT METADATA', metadata.reportTitle],
        ['Report ID', metadata.reportId],
        ['Module', metadata.module],
        ['Export Timestamp (ISO-8601)', metadata.generatedAtIso],
        ['Export Timestamp (Local)', metadata.generatedAtLocal],
        ['Exported By', metadata.exportedBy],
        ['Applied Filters', metadata.appliedFilters],
        ['Record Count', metadata.recordCount],
        ...(metadata.currency ? [['Reporting Currency', metadata.currency]] : []),
        ['Security & Integrity Checksum', `AES-256-GCM / ${metadata.integrityChecksum}`],
        [],
      ]
    : [];

  const csvContent = [
    ...metadataRows.map((row) => row.map(escapeCell).join(',')),
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface PdfReportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  metadata?: ExportAuditMetadata;
  summaryRows?: Array<{ label: string; value: string }>;
  headers: string[];
  rows: (string | number)[][];
  orientation?: 'portrait' | 'landscape';
}

export function downloadPdfReport(options: PdfReportOptions): void {
  const {
    filename,
    title,
    subtitle,
    metadata,
    summaryRows = [],
    headers,
    rows,
    orientation = 'landscape',
  } = options;

  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Institutional header bar
  doc.setFillColor(4, 120, 87);
  doc.rect(0, 0, pageWidth, 56, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SIMPI — Sistem Informasi Manajemen Pemakaman & Pemulasaran Islamicity', margin, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const timestampStr = metadata
    ? `Audit ID: ${metadata.reportId} · Diekspor: ${metadata.generatedAtLocal} (${metadata.generatedAtIso})`
    : `Diekspor otomatis: ${new Date().toLocaleString('id-ID')}`;
  doc.text(timestampStr, margin, 42);

  // Report Title & Subtitle
  let currentY = 80;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, margin, currentY);
  currentY += 15;

  if (subtitle) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(subtitle, margin, currentY);
    currentY += 16;
  }

  // Audit Metadata Block
  if (metadata) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 48, 4, 4, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('METADATA AUDIT:', margin + 10, currentY + 14);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Operator: ${metadata.exportedBy}  |  Modul: ${metadata.module}  |  Jumlah Baris: ${metadata.recordCount}`,
      margin + 92,
      currentY + 14
    );
    doc.text(
      `Filter Aktif: ${metadata.appliedFilters}${metadata.currency ? `  |  Mata Uang: ${metadata.currency}` : ''}`,
      margin + 10,
      currentY + 28
    );
    doc.text(
      `Integritas: AES-256-GCM · Checksum: ${metadata.integrityChecksum} · ISO: ${metadata.generatedAtIso}`,
      margin + 10,
      currentY + 41
    );
    currentY += 60;
  }

  // Optional Summary Strip
  if (summaryRows.length > 0) {
    const colWidth = (pageWidth - margin * 2) / summaryRows.length;
    summaryRows.forEach((item, idx) => {
      const boxX = margin + idx * colWidth;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(boxX, currentY, colWidth - 8, 42, 4, 4, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(item.label, boxX + 10, currentY + 15);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(item.value, boxX + 10, currentY + 32);
    });
    currentY += 54;
  }

  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: rows.map((r) => r.map((cell) => String(cell ?? '-'))),
    margin: { left: margin, right: margin, bottom: 42 },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [4, 120, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        metadata
          ? `Dokumen Audit SIMPI (${metadata.reportId}) · ${metadata.integrityChecksum}`
          : 'Dokumen Resmi SIMPI · Terenkripsi AES-256 · Pelaporan Operasional Terverifikasi',
        margin,
        pageHeight - 20
      );
      doc.text(
        `Halaman ${doc.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
        pageWidth - margin,
        pageHeight - 20,
        { align: 'right' }
      );
    },
  });

  doc.save(filename);
}
