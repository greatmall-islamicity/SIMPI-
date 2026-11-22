import React, { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

interface ExportMenuButtonProps {
  label?: string;
  recordCount: number;
  appliedFilters: string;
  onExportPdf: () => void;
  onExportCsv: () => void;
}

export const ExportMenuButton: React.FC<ExportMenuButtonProps> = ({
  label = 'Export',
  recordCount,
  appliedFilters,
  onExportPdf,
  onExportCsv,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block no-print">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
      >
        <Download className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
        <span>{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-40 overflow-hidden"
        >
          <div className="p-1.5 space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onExportPdf();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Unduh Laporan PDF (.pdf)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lengkap dengan metadata audit & kop resmi
                </p>
              </div>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onExportCsv();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Unduh Data CSV (.csv)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Format tabel UTF-8 dengan stempel waktu
                </p>
              </div>
            </button>
          </div>

          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Cakupan:</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                {recordCount} baris
              </span>
            </div>
            <p className="truncate" title={appliedFilters}>
              Filter: {appliedFilters}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
