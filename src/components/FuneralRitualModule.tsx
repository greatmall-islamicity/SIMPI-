import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  Send,
  ShieldCheck,
  Download,
  FileText,
} from 'lucide-react';
import {
  CurrencyCode,
  FuneralCase,
  NotificationLog,
  RitualStage,
} from '../types/simpi';
import { downloadCsv, downloadPdfReport, formatCurrency } from '../utils/formatters';
import { IslamicityGuidelinesView } from './IslamicityGuidelinesView';

interface FuneralRitualModuleProps {
  cases: FuneralCase[];
  currency: CurrencyCode;
  onAdvanceStage: (
    caseId: string,
    nextStage: RitualStage,
    channel?: NotificationLog['channel']
  ) => Promise<void>;
}

const RITUAL_STEPS: Array<{
  stage: RitualStage;
  title: string;
  arabicTitle: string;
  guidance: string;
}> = [
  {
    stage: RitualStage.REGISTERED,
    title: '1. Verifikasi & Penjemputan',
    arabicTitle: 'التحقق والنقل',
    guidance: 'Verifikasi surat keterangan kematian medis, pengisian data ahli waris, dan penjemputan ambulans jenazah.',
  },
  {
    stage: RitualStage.BATHING,
    title: '2. Memandikan Jenazah',
    arabicTitle: 'تغسيل الميت',
    guidance: 'Dilaksanakan tertutup oleh petugas sesama jenis (putra/putri) menggunakan air suci, daun bidara, dan kapur barus (hitungan ganjil 3/5/7 kali).',
  },
  {
    stage: RitualStage.SHROUDING,
    title: '3. Mengkafani Jenazah',
    arabicTitle: 'تكفين الميت',
    guidance: 'Kain kafan putih bersih (3 lapis untuk laki-laki, 5 lapis untuk perempuan) diberi wewangian non-alkohol sesuai sunnah.',
  },
  {
    stage: RitualStage.PRAYER,
    title: '4. Shalat Jenazah Berjamaah',
    arabicTitle: 'صلاة الجنازة',
    guidance: '4 Takbir berdiri tanpa rukuk/sujud: Takbir 1 Al-Fatihah, Takbir 2 Shalawat Nabi, Takbir 3 Doa Khusus Jenazah, Takbir 4 Doa & Salam.',
  },
  {
    stage: RitualStage.BURIAL,
    title: '5. Pengantaran & Pemakaman',
    arabicTitle: 'الدفن والتلقين',
    guidance: 'Penempatan di liang lahad menghadap Kiblat (295.14° WNW), pelepasan tali kafan, penutupan papan lahad, serta doa talqin.',
  },
  {
    stage: RitualStage.COMPLETED,
    title: '6. Selesai & Arsip Keluarga',
    arabicTitle: 'الاكتمال والأرشفة',
    guidance: 'Sertifikat koordinat GIS makam & laporan lengkap prosesi dikirimkan otomatis ke wali keluarga.',
  },
];

export const FuneralRitualModule: React.FC<FuneralRitualModuleProps> = ({
  cases,
  currency,
  onAdvanceStage,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [notifyChannel, setNotifyChannel] = useState<NotificationLog['channel']>('WhatsApp');
  const [activeTab, setActiveTab] = useState<'workflow' | 'protocol' | 'packages'>('workflow');

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const currentStageIdx = selectedCase
    ? RITUAL_STEPS.findIndex((s) => s.stage === selectedCase.stage)
    : 0;

  const servicePackages = [
    {
      code: 'PKG-SYARIAH-UTAMA',
      name: 'Paket Pemulasaran Syariah Utama (Lengkap)',
      priceIdr: 6850000,
      items: [
        'Penjemputan Ambulans Jenazah 24 Jam (Jabodetabek)',
        'Tim Pemulasaran Putra/Putri Bersertifikat + Kain Kafan Katun Premium',
        'Pemandian Stainless, Daun Bidara, Kapur Barus & Minyak Kasturi',
        'Imam Shalat Jenazah, Papan Lahad, Nisan Jati & Doa Talqin',
      ],
    },
    {
      code: 'PKG-SYARIAH-MANDIRI',
      name: 'Paket Pemulasaran & Pengantaran Masjid',
      priceIdr: 4250000,
      items: [
        'Tim Pemulasaran Syariah & Perlengkapan Kain Kafan Lengkap',
        'Koordinasi Jadwal Shalat Jenazah Masjid Terdekat',
        'Ambulans Pengantaran ke Area Pemakaman',
      ],
    },
    {
      code: 'PKG-WAKAF-DHUAFA',
      name: 'Program Layanan Pemulasaran Wakaf Umat',
      priceIdr: 750000,
      items: [
        'Subsidi Penuh Perlengkapan Kafan & Memandikan (Gratis bagi Mustahik)',
        'Kavling Blok D - Wakaf Umat & Pendampingan Ustadz Relawan',
      ],
    },
  ];

  const dateStamp = new Date().toISOString().slice(0, 10);

  const handleExportCsv = () => {
    downloadCsv(
      `simpi-laporan-pemulasaran-${dateStamp}.csv`,
      ['No Registrasi', 'NIK', 'Nama Almarhum', 'Tgl Wafat', 'Wali Keluarga', 'Kavling GIS', 'Pembimbing', 'Tahap Prosesi', `Biaya (${currency})`, 'Status Bayar'],
      cases.map((c) => [
        c.registrationNo,
        c.nik,
        c.deceasedName,
        `${c.dateOfDeath} ${c.timeOfDeath}`,
        `${c.nextOfKinName} (${c.nextOfKinPhone})`,
        c.plotCode || '-',
        c.assignedOfficialName || '-',
        RITUAL_STEPS.find((s) => s.stage === c.stage)?.title || c.stage,
        formatCurrency(c.totalFeeIdr, currency),
        c.paymentStatus,
      ])
    );
  };

  const handleExportPdf = () => {
    const completedCount = cases.filter((c) => c.stage === RitualStage.COMPLETED).length;
    const activeCount = cases.length - completedCount;

    downloadPdfReport({
      filename: `simpi-laporan-pemulasaran-${dateStamp}.pdf`,
      title: 'Laporan Layanan Pemulasaran Jenazah Syariah SIMPI',
      subtitle: `Rekapitulasi prosesi pemulasaran, jadwal shalat jenazah, dan alokasi kavling makam (${cases.length} kasus)`,
      summaryRows: [
        { label: 'Total Penanganan', value: `${cases.length} Kasus` },
        { label: 'Sedang Berjalan', value: `${activeCount} Prosesi` },
        { label: 'Selesai & Terarsip', value: `${completedCount} Kasus` },
      ],
      headers: ['No Registrasi', 'Almarhum', 'Wali Keluarga', 'Kavling', 'Tahap Ritual', `Biaya (${currency})`, 'Status'],
      rows: cases.map((c) => [
        c.registrationNo,
        c.deceasedName,
        c.nextOfKinName,
        c.plotCode || '-',
        RITUAL_STEPS.find((s) => s.stage === c.stage)?.title || c.stage,
        formatCurrency(c.totalFeeIdr, currency),
        c.paymentStatus,
      ]),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Manajemen Pemulasaran Jenazah & Protokol Ritual
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pengendalian prosesi pemulasaran berstandar Syariah dengan pembaruan status real-time kepada keluarga duka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Ekspor PDF</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: 'workflow', label: 'Alur Prosesi Aktif' },
              { id: 'protocol', label: 'Panduan Tata Cara Syariah' },
              { id: 'packages', label: 'Paket Layanan' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'workflow' | 'protocol' | 'packages')}
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
      </div>

      {activeTab === 'workflow' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Case Selector List */}
          <div className="xl:col-span-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Daftar Penanganan Jenazah ({cases.length})
              </h2>
            </div>
            {cases.map((c) => {
              const active = selectedCase?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                      {c.deceasedName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                      {c.plotCode || '-'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {c.registrationNo} · {c.scheduledPrayerTime}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={c.stage === RitualStage.COMPLETED ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-amber-700 dark:text-amber-400 font-medium'}>
                      {RITUAL_STEPS.find((s) => s.stage === c.stage)?.title}
                    </span>
                    <span className="text-slate-400 font-mono">{c.stageUpdatedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Case Ritual Detail & Stepper */}
          {selectedCase && (
            <div className="xl:col-span-8 space-y-5">
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {selectedCase.registrationNo} · Hash: {selectedCase.documentHash}
                    </p>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {selectedCase.deceasedName} ({selectedCase.gender}, {selectedCase.age} Thn)
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Wafat: {selectedCase.dateOfDeath} {selectedCase.timeOfDeath} · {selectedCase.medicalFacility}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Dukcapil & Medis Terverifikasi</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Ustadz / Pembimbing</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {selectedCase.assignedOfficialName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Armada Jenazah</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 inline-flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-slate-500" />
                      {selectedCase.hearseUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Jadwal Shalat & Makam</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {selectedCase.scheduledPrayerTime} · {selectedCase.plotCode || 'Belum dipilih'}
                    </span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Progres Tahapan Ritual & Pengiriman Notifikasi Keluarga
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Kanal Notifikasi:</span>
                      <select
                        value={notifyChannel}
                        onChange={(e) => setNotifyChannel(e.target.value as NotificationLog['channel'])}
                        className="h-8 px-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="WhatsApp">WhatsApp Real-Time</option>
                        <option value="SMS">SMS Gateway</option>
                        <option value="Email">Email Keluarga</option>
                        <option value="Push">Push Notification</option>
                      </select>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {RITUAL_STEPS.map((step, idx) => {
                      const isDone = idx < currentStageIdx || selectedCase.stage === RitualStage.COMPLETED;
                      const isCurrent = idx === currentStageIdx && selectedCase.stage !== RitualStage.COMPLETED;
                      const isNext = idx === currentStageIdx + 1;

                      return (
                        <div
                          key={step.stage}
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrent ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <Clock className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                              )}
                              <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                {step.title}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                ({step.arabicTitle})
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 pl-6">
                              {step.guidance}
                            </p>
                          </div>

                          <div className="pl-6 sm:pl-0 shrink-0">
                            {isNext ? (
                              <button
                                type="button"
                                onClick={() => onAdvanceStage(selectedCase.id, step.stage, notifyChannel)}
                                className="h-8 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <Send className="h-3 w-3" />
                                <span>Tandai Selesai & Kirim {notifyChannel}</span>
                              </button>
                            ) : isDone ? (
                              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                Terlaksana
                              </span>
                            ) : isCurrent ? (
                              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                Sedang Berjalan
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Terjadwal</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'protocol' && <IslamicityGuidelinesView />}

      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {servicePackages.map((pkg) => (
            <div
              key={pkg.code}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{pkg.code}</p>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  {pkg.name}
                </h3>
                <p className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(pkg.priceIdr, currency)}
                </p>
                <ul className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  {pkg.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
