import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileText,
  GraduationCap,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import { buildAuditMetadata, downloadPdfReport } from '../utils/formatters';

interface VideoResource {
  id: string;
  title: string;
  topic: string;
  url: string;
}

const OPERATIONAL_PRINCIPLES = [
  {
    code: '01',
    title: 'Kehormatan dan Penghormatan',
    description:
      'Jenazah Muslim harus diperlakukan dengan hormat dan bermartabat sejak saat wafat hingga dimakamkan ke alam barzakh.',
  },
  {
    code: '02',
    title: 'Kesederhanaan',
    description:
      'Pemakaman dan pemulasaran Islam dilaksanakan secara sederhana, khidmat, dan tidak berlebihan.',
  },
  {
    code: '03',
    title: 'Kebersihan & Higienitas',
    description:
      'Jenazah dimandikan, dikafani, dan dimakamkan dengan air suci, sarana bersih, dan standar higienitas yang terjaga.',
  },
  {
    code: '04',
    title: 'Ketepatan Waktu',
    description:
      'Penanganan dan pemakaman dilaksanakan sesegera mungkin setelah wafat tanpa menunda-nunda hak jenazah.',
  },
  {
    code: '05',
    title: 'Ketaatan pada Syariat',
    description:
      'Seluruh rangkaian prosesi mengikuti tuntunan Al-Qur’an, Sunnah Rasulullah SAW, dan fatwa ulama kompeten.',
  },
];

const SPIRITUAL_VALUES = [
  {
    name: 'Tauhid',
    detail: 'Pengakuan atas keesaan Allah SWT dan keyakinan bahwa Dia-lah yang menentukan kehidupan dan kematian.',
  },
  {
    name: 'Iman',
    detail: 'Keyakinan penuh kepada hari akhir, tempat seluruh manusia dibangkitkan dan dimintai pertanggungjawaban.',
  },
  {
    name: 'Ihsan',
    detail: 'Berbuat baik dan penuh kasih sayang kepada sesama, termasuk memuliakan saudara Muslim yang telah wafat.',
  },
  {
    name: 'Sabar',
    detail: 'Menerima musibah kematian sebagai ketetapan Allah SWT dengan ketenangan hati dan keteguhan jiwa.',
  },
  {
    name: 'Tawakkal',
    detail: 'Berserah diri sepenuhnya kepada Allah SWT dengan keyakinan bahwa ketetapan-Nya adalah yang terbaik.',
  },
];

const SEVEN_MECHANISMS = [
  {
    step: '01. Memandikan Jenazah (Ghusl)',
    summary:
      'Jenazah dimandikan secara tertutup dengan air bersih, daun bidara/sabun, dan kapur barus oleh Muslim yang memahami tata cara syar’i (petugas sesama jenis/mahram).',
  },
  {
    step: '02. Mengkafani Jenazah (Takfin)',
    summary:
      'Jenazah dibungkus kain kafan putih bersih dan baru (3 lapis untuk jenazah pria; 5 lapis atau minimal 2 lapis dasar + kelengkapan untuk jenazah wanita) disertai wewangian non-alkohol.',
  },
  {
    step: '03. Membawa Jenazah ke Masjid',
    summary:
      'Jenazah diantar dengan tenang menuju masjid atau mushalla terdekat untuk dishalatkan secara berjamaah oleh kaum Muslimin.',
  },
  {
    step: '04. Shalat Jenazah (4 Takbir)',
    summary:
      'Shalat berdiri tanpa rukuk dan sujud (Al-Fatihah, Shalawat Nabi, Doa khusus jenazah, dan Salam) guna memohonkan ampunan dan rahmat Allah SWT.',
  },
  {
    step: '05. Mengantar Jenazah ke Kuburan',
    summary:
      'Pengantaran jenazah menuju area pemakaman oleh keluarga dan para pelayat dengan penuh ketenangan, dzikir, dan penghormatan.',
  },
  {
    step: '06. Menguburkan Jenazah',
    summary:
      'Jenazah ditempatkan di liang lahad yang suci dalam posisi miring ke kanan menghadap arah Kiblat (295.14° WNW), dibuka tali kafannya, lalu ditutup tanah.',
  },
  {
    step: '07. Mendoakan Jenazah',
    summary:
      'Pembacaan doa keteguhan iman (talqin) dan istighfar bagi almarhum/almarhumah sebelum maupun sesudah prosesi penguburan selesai.',
  },
];

const STRATEGIC_RECOMMENDATIONS = [
  {
    title: '01. Meningkatkan Edukasi Masyarakat',
    detail:
      'Penyelenggaraan ceramah, seminar, lokakarya, dan publikasi digital agar umat memahami tata cara pemakaman dan pemulasaran sesuai syariat.',
  },
  {
    title: '02. Menyusun Pedoman Terstandar',
    detail:
      'Penyediaan buku pedoman yang jelas dan mudah dipahami sebagai acuan operasional bagi keluarga duka maupun petugas pemulasaran.',
  },
  {
    title: '03. Menyelenggarakan Pelatihan Bersertifikat',
    detail:
      'Pelatihan berkala bagi petugas pemakaman dan pemulasaran bersama MUI serta lembaga Islam yang kompeten.',
  },
  {
    title: '04. Memperkuat Kerjasama Lintas Lembaga',
    detail:
      'Sinergi antara lembaga keagamaan, organisasi masyarakat Islam, fasilitas kesehatan, dan pemerintah daerah.',
  },
];

const PORTALS = [
  { label: 'Global.islamicity.TV', href: 'https://global.islamicity.tv', desc: 'Portal Siaran & Informasi Global Islamicity' },
  { label: 'pemakaman.islamicity.tv', href: 'https://pemakaman.islamicity.tv', desc: 'Kanal Khusus Manajemen Pemakaman Islam' },
  { label: 'pemulasaran.islamicity.tv', href: 'https://pemulasaran.islamicity.tv', desc: 'Kanal Edukasi & Protokol Pemulasaran Jenazah' },
];

const VIDEO_RESOURCES: VideoResource[] = [
  {
    id: 'T9Mhc3LLwQc',
    title: 'Panduan Praktik Pemulasaran Jenazah Sesuai Sunnah',
    topic: 'Memandikan & Mengkafani',
    url: 'https://www.youtube.com/watch?v=T9Mhc3LLwQc',
  },
  {
    id: 'Gq2V0Dmcs3k',
    title: 'Tata Cara Shalat Jenazah & Doa Pemakaman',
    topic: 'Shalat Jenazah 4 Takbir',
    url: 'https://www.youtube.com/watch?v=Gq2V0Dmcs3k',
  },
  {
    id: 'hmLAr5SAqYQ',
    title: 'Standar Operasional Pengurusan Jenazah Terpadu',
    topic: 'Protokol Tim Lapangan',
    url: 'https://www.youtube.com/watch?v=hmLAr5SAqYQ',
  },
  {
    id: 'QiCMDLM941g',
    title: 'Adab Mengantar & Menguburkan Jenazah Menghadap Kiblat',
    topic: 'Prosesi Pemakaman & Doa',
    url: 'https://www.youtube.com/watch?v=QiCMDLM941g',
  },
];

export const IslamicityGuidelinesView: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<VideoResource | null>(null);

  const handleDownloadPedomanPdf = () => {
    const metadata = buildAuditMetadata({
      moduleCode: 'FNR',
      moduleName: 'Pedoman Pemakaman & Pemulasaran Islamicity',
      reportTitle: 'Konsep, Prinsip, dan Mekanisme Pemakaman & Pemulasaran Islamicity',
      appliedFilters: 'Standar Al-Qur’an, Sunnah & Praktisi Profesional',
      recordCount: SEVEN_MECHANISMS.length + OPERATIONAL_PRINCIPLES.length,
    });

    downloadPdfReport({
      filename: `pedoman-pemakaman-pemulasaran-islamicity-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Pedoman Konsep, Prinsip & Mekanisme Pemakaman dan Pemulasaran Islamicity',
      subtitle: 'Rujukan Al-Qur’an, Sunnah Rasulullah SAW, Pakar Ahli, dan Praktisi Profesional Internasional',
      metadata,
      orientation: 'portrait',
      headers: ['Tahap / Aspek', 'Keterangan & Ketentuan Syariat'],
      rows: [
        ...OPERATIONAL_PRINCIPLES.map((p) => [`Prinsip ${p.code}: ${p.title}`, p.description]),
        ...SPIRITUAL_VALUES.map((v) => [`Nilai Utama: ${v.name}`, v.detail]),
        ...SEVEN_MECHANISMS.map((m) => [m.step, m.summary]),
        ...STRATEGIC_RECOMMENDATIONS.map((r) => [`Rekomendasi ${r.title}`, r.detail]),
      ],
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Bismillahirrahmaanirrahiim · Pedoman Resmi Islamicity
          </p>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
            Konsep, Prinsip, dan Mekanisme Pemakaman dan Pemulasaran Islamicity
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Menurut Al-Qur’an dan Sunnah Rasulullah SAW, Pakar Ahli, dan Praktisi Profesional Internasional — mengantarkan jenazah Muslim ke alam barzakh dengan penuh penghormatan dan ketaatan pada syariat Islam.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPedomanPdf}
          className="h-9 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start lg:self-center cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Unduh Pedoman PDF</span>
        </button>
      </div>

      {/* Section 1: 5 Prinsip Operasional & 5 Nilai Ruhani */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Lima Prinsip Dasar Pelaksanaan
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {OPERATIONAL_PRINCIPLES.map((item) => (
              <div key={item.code} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-0.5 shrink-0">
                  {item.code}.
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Prinsip Utama Akidah & Akhlak
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {SPIRITUAL_VALUES.map((val) => (
              <div key={val.name} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{val.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {val.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: 7-Step Mechanism */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Tujuh Mekanisme Pemakaman & Pemulasaran Islam
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEVEN_MECHANISMS.map((m) => (
            <div
              key={m.step}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{m.step}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{m.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Al-Qur'an, Sunnah & International Experts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Panduan Al-Qur’an & Keteladanan Sunnah
          </h3>
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Rujukan Dalil & Keteladanan Rasulullah SAW
              </p>
              <p>
                Al-Qur’an dan Sunnah Nabi Muhammad SAW memberikan landasan jelas tentang pemeliharaan jiwa, kemuliaan wafat di jalan Allah, dan tata cara mengurus jenazah (termasuk QS. Al-Baqarah, QS. An-Nisa’, dan QS. Al-A’raf sebagai rujukan tematik dalam kajian dokumen ini).
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Praktik Langsung Sunnah Nabi SAW
              </p>
              <p>
                Rasulullah SAW mencontohkan langsung pemulasaran jenazah putranya, Ibrahim, dengan memandikan menggunakan air suci serta mengkafaninya dengan kain kafan putih yang bersih sebagai standar penghormatan tertinggi bagi jenazah Muslim.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Pandangan Pakar Ahli & Rekomendasi Strategis
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Kajian para pakar syariah dan praktisi pemulasaran profesional internasional menjadi rujukan penguatan SOP SIMPI melalui empat langkah strategis berikut:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STRATEGIC_RECOMMENDATIONS.map((rec) => (
              <div
                key={rec.title}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>{rec.title}</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rec.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Video Sumber Daya & Portal Islamicity */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Pustaka Video Edukasi & Jaringan Portal Islamicity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sumber daya pelatihan petugas dan edukasi keluarga duka. Informasi ini bersifat edukatif; konsultasikan hal spesifik dengan ulama atau pakar ahli kompeten.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VIDEO_RESOURCES.map((video) => (
            <div
              key={video.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 bg-slate-50/70 dark:bg-slate-800/40"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {video.topic}
                </p>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {video.title}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Putar Video</span>
                </button>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <span>YouTube</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
          {PORTALS.map((portal) => (
            <a
              key={portal.label}
              href={portal.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-600/50 flex items-center justify-between gap-3 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {portal.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {portal.desc}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Inline Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {activeVideo.topic}
                </p>
                <h4 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {activeVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Tutup video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-slate-950">
              <iframe
                title={activeVideo.title}
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
