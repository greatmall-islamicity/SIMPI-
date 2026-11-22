import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import {
  PlotStatus,
  RitualStage,
  UserRole,
  type SimpiDataSnapshot,
  type CemeteryPlot,
  type FuneralCase,
  type FinancialTransaction,
  type NotificationLog,
  type AuditLogEntry,
  type ChatMessage,
} from './src/types/simpi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'simpi-data.json');
const PORT = Number(process.env.PORT) || 3000;

function generateInitialPlots(): CemeteryPlot[] {
  const zones: Array<{
    zone: CemeteryPlot['zone'];
    prefix: string;
    baseLat: number;
    baseLng: number;
    price: number;
  }> = [
    { zone: 'Blok A - Raudhah', prefix: 'A', baseLat: -6.2841, baseLng: 106.8245, price: 4500000 },
    { zone: 'Blok B - Al-Firdaus', prefix: 'B', baseLat: -6.2846, baseLng: 106.8251, price: 3500000 },
    { zone: 'Blok C - As-Salam', prefix: 'C', baseLat: -6.2852, baseLng: 106.8246, price: 2500000 },
    { zone: 'Blok D - Wakaf Umat', prefix: 'D', baseLat: -6.2857, baseLng: 106.8253, price: 750000 },
  ];

  const occupiedSamples: Record<string, { deceasedName: string; burialDate: string; familyContact: string; caseId?: string }> = {
    'A-01': { deceasedName: 'H. Ahmad Subandi bin H. Mansur', burialDate: '2026-11-12', familyContact: '0812-8841-2201' },
    'A-02': { deceasedName: 'Hj. Siti Aminah binti K.H. Zainuddin', burialDate: '2026-11-15', familyContact: '0813-1190-4452' },
    'A-04': { deceasedName: 'Drs. Muhammad Ridwan', burialDate: '2026-11-18', familyContact: '0811-9023-7741', caseId: 'CASE-2026-0841' },
    'B-01': { deceasedName: 'Ir. Bambang Kusuma', burialDate: '2026-11-08', familyContact: '0815-7740-1129' },
    'B-03': { deceasedName: 'Nurhayati binti Sulaiman', burialDate: '2026-11-19', familyContact: '0817-6632-8890', caseId: 'CASE-2026-0842' },
    'C-02': { deceasedName: 'Rahmat Hidayatullah', burialDate: '2026-11-04', familyContact: '0852-9910-3348' },
    'D-01': { deceasedName: 'Fulan bin Abdullah (Program Wakaf)', burialDate: '2026-11-10', familyContact: '0812-4410-9902' },
  };

  const reservedCodes = new Set(['A-05', 'B-04', 'C-06', 'D-04']);
  const maintenanceCodes = new Set(['C-08']);

  const plots: CemeteryPlot[] = [];
  zones.forEach((z) => {
    for (let r = 1; r <= 2; r++) {
      for (let c = 1; c <= 6; c++) {
        const idx = (r - 1) * 6 + c;
        const code = `${z.prefix}-${String(idx).padStart(2, '0')}`;
        const occ = occupiedSamples[code];
        let status = PlotStatus.AVAILABLE;
        if (occ) status = PlotStatus.OCCUPIED;
        else if (reservedCodes.has(code)) status = PlotStatus.RESERVED;
        else if (maintenanceCodes.has(code)) status = PlotStatus.MAINTENANCE;

        plots.push({
          id: `PLOT-${code}`,
          code,
          zone: z.zone,
          row: r,
          col: c,
          lat: Number((z.baseLat - r * 0.00012).toFixed(6)),
          lng: Number((z.baseLng + c * 0.00014).toFixed(6)),
          qiblaBearing: 295.14,
          sizeMeters: '1.5m x 2.5m',
          status,
          priceIdr: z.price,
          deceasedName: occ?.deceasedName,
          burialDate: occ?.burialDate,
          familyContact: occ?.familyContact,
          caseId: occ?.caseId,
        });
      }
    }
  });
  return plots;
}

function createSeedData(): SimpiDataSnapshot {
  const plots = generateInitialPlots();

  const cases: FuneralCase[] = [
    {
      id: 'CASE-2026-0842',
      registrationNo: 'REG/SIMPI/2026/0842',
      nik: '3174011905580004',
      deceasedName: 'Hj. Nurhayati binti Sulaiman',
      gender: 'Perempuan',
      age: 68,
      address: 'Jl. Kemang Timur No. 42, Jakarta Selatan',
      dateOfDeath: '2026-11-19',
      timeOfDeath: '05:15 WIB',
      causeOfDeath: 'Komplikasi Jantung (Surat Dokter RS Fatmawati)',
      medicalFacility: 'RSUP Fatmawati Jakarta',
      nextOfKinName: 'Hendra Wijaya, S.T.',
      nextOfKinRelation: 'Anak Kandung',
      nextOfKinPhone: '+6281766328890',
      nextOfKinEmail: 'hendra.wijaya@keluarga.id',
      plotId: 'PLOT-B-03',
      plotCode: 'B-03',
      packageId: 'PKG-SYARIAH-UTAMA',
      packageName: 'Paket Pemulasaran Syariah Utama (Lengkap)',
      assignedOfficialId: 'PRV-01',
      assignedOfficialName: 'K.H. Mahmud Syarifuddin',
      hearseUnit: 'Ambulans Jenazah B-9012-SYR',
      scheduledPrayerTime: '12:15 WIB (Ba’da Dzuhur)',
      scheduledBurialTime: '13:30 WIB',
      stage: RitualStage.SHROUDING,
      stageUpdatedAt: '2026-11-19 08:40 WIB',
      paymentStatus: 'LUNAS',
      totalFeeIdr: 6850000,
      documentHash: 'sha256:8f9c2a44e11d7b89c301a94b',
      dukcapilVerified: true,
    },
    {
      id: 'CASE-2026-0843',
      registrationNo: 'REG/SIMPI/2026/0843',
      nik: '3275021408640011',
      deceasedName: 'H. Darmawan Prakoso bin Suryono',
      gender: 'Laki-laki',
      age: 62,
      address: 'Komplek Griya Asri Blok D4, Bekasi Selatan',
      dateOfDeath: '2026-11-19',
      timeOfDeath: '07:20 WIB',
      causeOfDeath: 'Sakit Menahun (Verifikasi Puskesmas)',
      medicalFacility: 'Rumah Duka / Kediaman Keluarga',
      nextOfKinName: 'Siti Rahma Prakoso',
      nextOfKinRelation: 'Istri',
      nextOfKinPhone: '+6281299453120',
      nextOfKinEmail: 'siti.rahma@mail.id',
      plotId: 'PLOT-A-05',
      plotCode: 'A-05',
      packageId: 'PKG-SYARIAH-MANDIRI',
      packageName: 'Paket Pemulasaran & Pengantaran Masjid',
      assignedOfficialId: 'PRV-02',
      assignedOfficialName: 'Ustadz Farhan Al-Habsyi',
      hearseUnit: 'Ambulans Jenazah B-9014-SYR',
      scheduledPrayerTime: '15:30 WIB (Ba’da Ashar)',
      scheduledBurialTime: '16:15 WIB',
      stage: RitualStage.BATHING,
      stageUpdatedAt: '2026-11-19 09:05 WIB',
      paymentStatus: 'MENUNGGU',
      totalFeeIdr: 7250000,
      documentHash: 'sha256:4a12e88b0931f5c2d178e003',
      dukcapilVerified: true,
    },
    {
      id: 'CASE-2026-0841',
      registrationNo: 'REG/SIMPI/2026/0841',
      nik: '3171042103520002',
      deceasedName: 'Drs. Muhammad Ridwan',
      gender: 'Laki-laki',
      age: 74,
      address: 'Jl. Cempaka Putih Tengah No. 18, Jakarta Pusat',
      dateOfDeath: '2026-11-18',
      timeOfDeath: '19:45 WIB',
      causeOfDeath: 'Usia Lanjut',
      medicalFacility: 'RS Islam Jakarta Cempaka Putih',
      nextOfKinName: 'Faisal Ridwan',
      nextOfKinRelation: 'Anak Kandung',
      nextOfKinPhone: '+6281190237741',
      nextOfKinEmail: 'faisal.r@organisasi.org',
      plotId: 'PLOT-A-04',
      plotCode: 'A-04',
      packageId: 'PKG-SYARIAH-UTAMA',
      packageName: 'Paket Pemulasaran Syariah Utama (Lengkap)',
      assignedOfficialId: 'PRV-01',
      assignedOfficialName: 'K.H. Mahmud Syarifuddin',
      hearseUnit: 'Ambulans Jenazah B-9012-SYR',
      scheduledPrayerTime: '09:00 WIB',
      scheduledBurialTime: '10:00 WIB',
      stage: RitualStage.COMPLETED,
      stageUpdatedAt: '2026-11-18 11:15 WIB',
      paymentStatus: 'LUNAS',
      totalFeeIdr: 8350000,
      documentHash: 'sha256:9c03b71e451a88f10d43b212',
      dukcapilVerified: true,
    },
  ];

  const inventory = [
    {
      id: 'INV-01',
      sku: 'KFN-SYR-01',
      name: 'Set Kain Kafan Katun Premium (Pria/Wanita)',
      category: 'Pemulasaran' as const,
      stock: 42,
      minThreshold: 15,
      unit: 'Paket',
      unitCostIdr: 450000,
      supplier: 'Koperasi Al-Mubarok Tekstil',
      lastRestocked: '2026-11-10',
    },
    {
      id: 'INV-02',
      sku: 'NSN-JTI-02',
      name: 'Papan Nisan Kayu Jati Ukir Kaligrafi',
      category: 'Pemakaman' as const,
      stock: 11,
      minThreshold: 15,
      unit: 'Unit',
      unitCostIdr: 650000,
      supplier: 'Pengrajin Nisan Jepara Amanah',
      lastRestocked: '2026-10-28',
    },
    {
      id: 'INV-03',
      sku: 'KPR-WNG-03',
      name: 'Kapur Barus, Bidara & Minyak Kasturi',
      category: 'Pemulasaran' as const,
      stock: 64,
      minThreshold: 20,
      unit: 'Botol/Set',
      unitCostIdr: 120000,
      supplier: 'Distributor Herbal Thibbun',
      lastRestocked: '2026-11-14',
    },
    {
      id: 'INV-04',
      sku: 'PPN-LHD-04',
      name: 'Papan Penutup Liang Lahad (Kayu Meranti)',
      category: 'Pemakaman' as const,
      stock: 9,
      minThreshold: 12,
      unit: 'Set (7 Bilah)',
      unitCostIdr: 520000,
      supplier: 'UD Berkah Kayu Nusantara',
      lastRestocked: '2026-11-02',
    },
    {
      id: 'INV-05',
      sku: 'MND-STN-05',
      name: 'Meja & Bak Pemandian Jenazah Stainless',
      category: 'Pemulasaran' as const,
      stock: 6,
      minThreshold: 3,
      unit: 'Unit',
      unitCostIdr: 4200000,
      supplier: 'Medika Syariah Engineering',
      lastRestocked: '2026-09-20',
    },
    {
      id: 'INV-06',
      sku: 'ARM-AMB-06',
      name: 'Unit Ambulans Jenazah & Keranda Terpadu',
      category: 'Armada' as const,
      stock: 5,
      minThreshold: 4,
      unit: 'Armada',
      unitCostIdr: 0,
      supplier: 'Operasional Armada SIMPI',
      lastRestocked: '2026-11-01',
    },
  ];

  const transactions: FinancialTransaction[] = [
    {
      id: 'TRX-2026-901',
      date: '2026-11-19 08:15',
      type: 'PEMASUKAN',
      category: 'Layanan Pemulasaran & Kavling Makam',
      description: 'Pelunasan REG/SIMPI/2026/0842 (Blok B-03 + Paket Utama)',
      referenceId: 'CASE-2026-0842',
      paymentMethod: 'VA Syariah',
      amountIdr: 6850000,
      status: 'TERVERIFIKASI',
      currencyPaid: 'IDR',
    },
    {
      id: 'TRX-2026-900',
      date: '2026-11-18 16:40',
      type: 'PEMASUKAN',
      category: 'Layanan Pemulasaran & Kavling Makam',
      description: 'Pelunasan REG/SIMPI/2026/0841 (Blok A-04 + Paket Utama)',
      referenceId: 'CASE-2026-0841',
      paymentMethod: 'QRIS',
      amountIdr: 8350000,
      status: 'TERVERIFIKASI',
      currencyPaid: 'IDR',
    },
    {
      id: 'TRX-2026-899',
      date: '2026-11-17 14:10',
      type: 'PENGELUARAN',
      category: 'Pengadaan Perlengkapan',
      description: 'Restok 25 Paket Kain Kafan Katun & Minyak Kasturi',
      referenceId: 'PO-2026-118',
      paymentMethod: 'Transfer Bank',
      amountIdr: 13650000,
      status: 'TERVERIFIKASI',
      currencyPaid: 'IDR',
    },
    {
      id: 'TRX-2026-898',
      date: '2026-11-16 10:25',
      type: 'PEMASUKAN',
      category: 'Reservasi Kavling Jangka Panjang',
      description: 'Booking Kavling Blok A-05 (Transfer Internasional)',
      referenceId: 'PLOT-A-05',
      paymentMethod: 'Kartu Global',
      amountIdr: 4500000,
      status: 'TERVERIFIKASI',
      currencyPaid: 'SGD',
    },
    {
      id: 'TRX-2026-897',
      date: '2026-11-15 09:00',
      type: 'PENGELUARAN',
      category: 'Operasional Petugas & Pemeliharaan',
      description: 'Insentif Tim Pemulasaran & Perawatan Taman Makam',
      referenceId: 'OPS-2026-11',
      paymentMethod: 'Transfer Bank',
      amountIdr: 9200000,
      status: 'TERVERIFIKASI',
      currencyPaid: 'IDR',
    },
  ];

  const providers = [
    {
      id: 'PRV-01',
      name: 'K.H. Mahmud Syarifuddin',
      role: 'Ustadz / Modin' as const,
      certification: 'Sertifikasi Pembimbing Jenazah MUI DKI',
      region: 'Jakarta Selatan & Pusat',
      phone: '+62811-2201-8890',
      availability: 'Bertugas' as const,
      completedCases: 342,
      rating: 4.9,
      avatarUrl: '/src/assets/images/avatar_ustadz_official_1795079101915.jpg',
    },
    {
      id: 'PRV-02',
      name: 'Ustadz Farhan Al-Habsyi',
      role: 'Ustadz / Modin' as const,
      certification: 'Lulusan Darul Musthofa · Bersertifikat Syariah',
      region: 'Jakarta Timur & Bekasi',
      phone: '+62812-3309-4412',
      availability: 'Bertugas' as const,
      completedCases: 218,
      rating: 4.9,
    },
    {
      id: 'PRV-03',
      name: 'Hj. Rahmawati & Tim Akhwat',
      role: 'Tim Pemulasaran Putri' as const,
      certification: 'Sertifikasi Pemulasaran Jenazah Muslimah Kemenag',
      region: 'Jabodetabek',
      phone: '+62813-8821-7761',
      availability: 'Siaga 24 Jam' as const,
      completedCases: 415,
      rating: 5.0,
    },
    {
      id: 'PRV-04',
      name: 'Tim Pemulasaran Ikhwan Al-Ikhlas',
      role: 'Tim Pemulasaran Putra' as const,
      certification: 'Standar Keselamatan Medis & Protokol Syariah',
      region: 'Jabodetabek',
      phone: '+62815-4410-2219',
      availability: 'Tersedia' as const,
      completedCases: 509,
      rating: 4.8,
    },
    {
      id: 'PRV-05',
      name: 'Armada Ambulans Amanah 24J',
      role: 'Pengemudi Ambulans' as const,
      certification: 'SIM B1 Umum & Pelatihan Evakuasi Medis',
      region: 'Nasional / Antar Kota',
      phone: '+62818-9901-3300',
      availability: 'Siaga 24 Jam' as const,
      completedCases: 612,
      rating: 4.9,
    },
  ];

  const notifications: NotificationLog[] = [
    {
      id: 'NTF-101',
      timestamp: '2026-11-19 08:41 WIB',
      channel: 'WhatsApp',
      recipient: 'Hendra Wijaya, S.T.',
      recipientPhone: '+6281766328890',
      caseRef: 'CASE-2026-0842',
      message: 'Assalamu’alaikum Bpk Hendra. Tahap Mengkafani almarhumah Hj. Nurhayati telah selesai sesuai sunnah. Jadwal Shalat Jenazah pukul 12:15 WIB di Masjid Raudhah.',
      status: 'Dibaca',
    },
    {
      id: 'NTF-102',
      timestamp: '2026-11-19 08:16 WIB',
      channel: 'Email',
      recipient: 'hendra.wijaya@keluarga.id',
      recipientPhone: 'Email Terverifikasi',
      caseRef: 'CASE-2026-0842',
      message: 'Kwitansi digital & sertifikat koordinat GIS makam Blok B-03 telah diterbitkan dan terenkripsi.',
      status: 'Terkirim',
    },
    {
      id: 'NTF-103',
      timestamp: '2026-11-19 09:06 WIB',
      channel: 'SMS',
      recipient: 'Siti Rahma Prakoso',
      recipientPhone: '+6281299453120',
      caseRef: 'CASE-2026-0843',
      message: 'SIMPI Info: Tim Pemulasaran Putra sedang melaksanakan tahap Memandikan jenazah Bpk H. Darmawan Prakoso.',
      status: 'Terkirim',
    },
    {
      id: 'NTF-104',
      timestamp: '2026-11-19 09:10 WIB',
      channel: 'Push',
      recipient: 'Petugas Lapangan Blok A',
      recipientPhone: 'App Mobile Petugas',
      caseRef: 'PLOT-A-05',
      message: 'Pengingat persiapan liang lahad Blok A-05 selesai sebelum pukul 15:00 WIB.',
      status: 'Dibaca',
    },
  ];

  const users = [
    {
      id: 'USR-01',
      name: 'Ir. Ahmad Fauzan, M.M.',
      email: 'ahmad.fauzan@simpi.id',
      role: UserRole.SUPER_ADMIN,
      twoFactorEnabled: true,
      biometricEnrolled: true,
      lastActive: 'Baru saja',
      status: 'Aktif' as const,
      avatarUrl: '/src/assets/images/avatar_admin_director_1795079102336.jpg',
    },
    {
      id: 'USR-02',
      name: 'Ustadz Mahmud Syarifuddin',
      email: 'mahmud.s@simpi.id',
      role: UserRole.FUNERAL_OFFICER,
      twoFactorEnabled: true,
      biometricEnrolled: true,
      lastActive: '12 menit lalu',
      status: 'Aktif' as const,
      avatarUrl: '/src/assets/images/avatar_ustadz_official_1795079101915.jpg',
    },
    {
      id: 'USR-03',
      name: 'Rizky Pratama, S.Geo.',
      email: 'rizky.gis@simpi.id',
      role: UserRole.GIS_OPERATOR,
      twoFactorEnabled: true,
      biometricEnrolled: false,
      lastActive: '1 jam lalu',
      status: 'Aktif' as const,
    },
    {
      id: 'USR-04',
      name: 'Nadia Kusuma, S.E.',
      email: 'nadia.finance@simpi.id',
      role: UserRole.TREASURER,
      twoFactorEnabled: true,
      biometricEnrolled: true,
      lastActive: '25 menit lalu',
      status: 'Aktif' as const,
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'AUD-501',
      timestamp: '2026-11-19 09:05:12 WIB',
      actor: 'Ustadz Mahmud Syarifuddin',
      role: 'FUNERAL_OFFICER',
      action: 'Pembaruan Status Ritual → MEMANDIKAN & Kirim WhatsApp Keluarga',
      target: 'CASE-2026-0843',
      encryptionStatus: 'AES-256-GCM',
    },
    {
      id: 'AUD-502',
      timestamp: '2026-11-19 08:15:44 WIB',
      actor: 'Nadia Kusuma, S.E.',
      role: 'TREASURER',
      action: 'Verifikasi Pembayaran VA Syariah Rp 6.850.000',
      target: 'TRX-2026-901',
      encryptionStatus: 'AES-256-GCM',
    },
    {
      id: 'AUD-503',
      timestamp: '2026-11-19 07:45:03 WIB',
      actor: 'Rizky Pratama, S.Geo.',
      role: 'GIS_OPERATOR',
      action: 'Validasi Koordinat & Arah Kiblat 295.14° Kavling B-03',
      target: 'PLOT-B-03',
      encryptionStatus: 'AES-256-GCM',
    },
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: 'MSG-01',
      sender: 'dispatcher',
      senderName: 'Pusat Siaga SIMPI 24/7',
      text: 'Assalamu’alaikum warahmatullahi wabarakatuh. Layanan Siaga Darurat Pemulasaran & Pemakaman 24/7 siap membantu keluarga Anda. Silakan sampaikan kebutuhan ambulans jenazah, tim pemulasaran, atau informasi ketersediaan makam.',
      timestamp: '08:00 WIB',
    },
    {
      id: 'MSG-02',
      sender: 'family',
      senderName: 'Bpk. Hendra Wijaya',
      text: 'Wa’alaikumussalam, kami membutuhkan konfirmasi jadwal shalat jenazah di Masjid Raudhah untuk almarhumah ibunda kami Hj. Nurhayati.',
      timestamp: '08:30 WIB',
    },
    {
      id: 'MSG-03',
      sender: 'dispatcher',
      senderName: 'Pusat Siaga SIMPI 24/7',
      text: 'Baik Bpk Hendra, jadwal Shalat Jenazah telah dikonfirmasi pukul 12:15 WIB (Ba’da Dzuhur) dipimpin oleh K.H. Mahmud Syarifuddin, dilanjutkan pemakaman di Blok B-03 pukul 13:30 WIB.',
      timestamp: '08:32 WIB',
    },
  ];

  const apiKeys = [
    {
      id: 'KEY-01',
      name: 'Integrasi Dukcapil Kemendagri (Sinkronisasi NIK)',
      prefix: 'simpi_live_dkc_994a****',
      scope: 'citizens:verify, death_records:read',
      createdAt: '2026-06-12',
      lastUsed: '2026-11-19 08:10 WIB',
      active: true,
    },
    {
      id: 'KEY-02',
      name: 'Webhook Akuntansi & ERP Jurnal Syariah',
      prefix: 'simpi_live_erp_318f****',
      scope: 'finance:read, transactions:webhook',
      createdAt: '2026-08-04',
      lastUsed: '2026-11-19 08:16 WIB',
      active: true,
    },
  ];

  return {
    plots,
    cases,
    inventory,
    transactions,
    providers,
    notifications,
    users,
    auditLogs,
    chatMessages,
    apiKeys,
  };
}

function loadDatabase(): SimpiDataSnapshot {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as SimpiDataSnapshot;
    }
  } catch (err) {
    console.error('Failed to read persisted data, re-seeding:', err);
  }
  const seed = createSeedData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  return seed;
}

let db: SimpiDataSnapshot = loadDatabase();

function saveDatabase(): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to persist SIMPI data:', err);
  }
}

function addAudit(actor: string, role: string, action: string, target: string): void {
  const entry: AuditLogEntry = {
    id: `AUD-${Date.now().toString().slice(-5)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
    actor,
    role,
    action,
    target,
    encryptionStatus: 'AES-256-GCM',
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > 40) db.auditLogs.pop();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/v1/health', (_req, res) => {
    res.json({
      service: 'SIMPI Core API',
      status: 'operational',
      encryption: 'AES-256-GCM',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/v1/snapshot', (_req, res) => {
    res.json(db);
  });

  app.get('/api/v1/plots', (req, res) => {
    const status = req.query.status as string | undefined;
    const zone = req.query.zone as string | undefined;
    let filtered = db.plots;
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (zone) filtered = filtered.filter((p) => p.zone === zone);
    res.json({ total: filtered.length, data: filtered });
  });

  app.post('/api/v1/plots/:id/reserve', (req, res) => {
    const plot = db.plots.find((p) => p.id === req.params.id);
    if (!plot) return res.status(404).json({ error: 'Kavling makam tidak ditemukan' });
    if (plot.status !== PlotStatus.AVAILABLE) {
      return res.status(400).json({ error: 'Kavling makam sudah dipesan atau terisi' });
    }
    const { familyContact, deceasedName, paymentMethod } = req.body as {
      familyContact?: string;
      deceasedName?: string;
      paymentMethod?: FinancialTransaction['paymentMethod'];
    };

    plot.status = PlotStatus.RESERVED;
    plot.familyContact = familyContact || 'Keluarga Pemesan Online';
    plot.deceasedName = deceasedName || 'Reservasi Kavling Keluarga';

    const trx: FinancialTransaction = {
      id: `TRX-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 899)}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'PEMASUKAN',
      category: 'Pemesanan Kavling Makam GIS',
      description: `Reservasi Online Kavling ${plot.code} (${plot.zone})`,
      referenceId: plot.id,
      paymentMethod: paymentMethod || 'QRIS',
      amountIdr: plot.priceIdr,
      status: 'TERVERIFIKASI',
      currencyPaid: 'IDR',
    };
    db.transactions.unshift(trx);

    const notif: NotificationLog = {
      id: `NTF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Baru saja',
      channel: 'WhatsApp',
      recipient: plot.familyContact,
      recipientPhone: plot.familyContact,
      caseRef: plot.code,
      message: `Reservasi kavling makam GIS ${plot.code} (${plot.zone}) berhasil terverifikasi. Koordinat: ${plot.lat}, ${plot.lng}.`,
      status: 'Terkirim',
    };
    db.notifications.unshift(notif);
    addAudit('Portal Layanan Online', 'GIS_OPERATOR', `Reservasi Kavling GIS ${plot.code}`, plot.id);
    saveDatabase();
    return res.json({ plot, transaction: trx, notification: notif });
  });

  app.get('/api/v1/cases', (_req, res) => {
    res.json({ total: db.cases.length, data: db.cases });
  });

  app.post('/api/v1/cases', (req, res) => {
    const body = req.body as Partial<FuneralCase> & { paymentMethod?: FinancialTransaction['paymentMethod']; currencyPaid?: FinancialTransaction['currencyPaid'] };
    const id = `CASE-2026-${Math.floor(844 + Math.random() * 150)}`;
    const regNo = `REG/SIMPI/2026/${id.slice(-4)}`;
    const hash = 'sha256:' + crypto.createHash('sha256').update(id + (body.nik || '')).digest('hex').slice(0, 24);

    let plotCode = body.plotCode;
    if (body.plotId) {
      const plot = db.plots.find((p) => p.id === body.plotId);
      if (plot) {
        plot.status = PlotStatus.OCCUPIED;
        plot.deceasedName = body.deceasedName || 'Almarhum/Almarhumah';
        plot.burialDate = body.dateOfDeath || new Date().toISOString().slice(0, 10);
        plot.familyContact = body.nextOfKinPhone;
        plot.caseId = id;
        plotCode = plot.code;
      }
    }

    const newCase: FuneralCase = {
      id,
      registrationNo: regNo,
      nik: body.nik || '3174010000000001',
      deceasedName: body.deceasedName || 'Nama Almarhum',
      gender: body.gender || 'Laki-laki',
      age: Number(body.age) || 65,
      address: body.address || 'Jakarta',
      dateOfDeath: body.dateOfDeath || new Date().toISOString().slice(0, 10),
      timeOfDeath: body.timeOfDeath || '09:00 WIB',
      causeOfDeath: body.causeOfDeath || 'Terverifikasi Medis',
      medicalFacility: body.medicalFacility || 'Rumah Sakit Rujukan',
      nextOfKinName: body.nextOfKinName || 'Keluarga Duka',
      nextOfKinRelation: body.nextOfKinRelation || 'Ahli Waris',
      nextOfKinPhone: body.nextOfKinPhone || '+6281200000000',
      nextOfKinEmail: body.nextOfKinEmail || 'keluarga@simpi.id',
      plotId: body.plotId,
      plotCode,
      packageId: body.packageId || 'PKG-SYARIAH-UTAMA',
      packageName: body.packageName || 'Paket Pemulasaran Syariah Utama (Lengkap)',
      assignedOfficialId: 'PRV-01',
      assignedOfficialName: body.assignedOfficialName || 'K.H. Mahmud Syarifuddin',
      hearseUnit: body.hearseUnit || 'Ambulans Jenazah B-9012-SYR',
      scheduledPrayerTime: body.scheduledPrayerTime || '15:30 WIB (Ba’da Ashar)',
      scheduledBurialTime: body.scheduledBurialTime || '16:30 WIB',
      stage: RitualStage.REGISTERED,
      stageUpdatedAt: 'Baru saja',
      paymentStatus: 'LUNAS',
      totalFeeIdr: Number(body.totalFeeIdr) || 6850000,
      documentHash: hash,
      dukcapilVerified: true,
    };

    db.cases.unshift(newCase);

    const trx: FinancialTransaction = {
      id: `TRX-2026-${Math.floor(902 + Math.random() * 90)}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'PEMASUKAN',
      category: 'Registrasi Pemulasaran & Pemakaman',
      description: `Pembayaran ${regNo} (${newCase.deceasedName})`,
      referenceId: id,
      paymentMethod: body.paymentMethod || 'VA Syariah',
      amountIdr: newCase.totalFeeIdr,
      status: 'TERVERIFIKASI',
      currencyPaid: body.currencyPaid || 'IDR',
    };
    db.transactions.unshift(trx);

    db.notifications.unshift({
      id: `NTF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Baru saja',
      channel: 'WhatsApp',
      recipient: newCase.nextOfKinName,
      recipientPhone: newCase.nextOfKinPhone,
      caseRef: id,
      message: `Inna lillahi wa inna ilaihi raji'un. Registrasi pemulasaran ${newCase.deceasedName} (${regNo}) telah aktif. Kavling: ${plotCode || 'Dalam Penjadwalan'}.`,
      status: 'Terkirim',
    });

    addAudit('Ir. Ahmad Fauzan, M.M.', 'SUPER_ADMIN', `Registrasi Jenazah Baru ${regNo}`, id);
    saveDatabase();
    res.status(201).json(newCase);
  });

  app.patch('/api/v1/cases/:id/stage', (req, res) => {
    const found = db.cases.find((c) => c.id === req.params.id);
    if (!found) return res.status(404).json({ error: 'Kasus tidak ditemukan' });
    const { stage, notifyChannel } = req.body as { stage: RitualStage; notifyChannel?: NotificationLog['channel'] };
    found.stage = stage;
    found.stageUpdatedAt = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const stageLabels: Record<RitualStage, string> = {
      [RitualStage.REGISTERED]: 'Registrasi & Verifikasi Dokumen',
      [RitualStage.BATHING]: 'Memandikan Jenazah',
      [RitualStage.SHROUDING]: 'Mengkafani Jenazah',
      [RitualStage.PRAYER]: 'Shalat Jenazah Berjamaah',
      [RitualStage.BURIAL]: 'Pengantaran & Pemakaman di Liang Lahad',
      [RitualStage.COMPLETED]: 'Prosesi Pemakaman Selesai & Doa Talqin',
    };

    const notif: NotificationLog = {
      id: `NTF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Baru saja',
      channel: notifyChannel || 'WhatsApp',
      recipient: found.nextOfKinName,
      recipientPhone: found.nextOfKinPhone,
      caseRef: found.id,
      message: `Pembaruan Status Real-Time SIMPI (${found.deceasedName}): Tahap "${stageLabels[stage]}" sedang/telah dilaksanakan.`,
      status: 'Terkirim',
    };
    db.notifications.unshift(notif);
    addAudit('Tim Pemulasaran Syariah', 'FUNERAL_OFFICER', `Update Tahap → ${stageLabels[stage]}`, found.id);
    saveDatabase();
    return res.json({ caseItem: found, notification: notif });
  });

  app.post('/api/v1/inventory/:id/restock', (req, res) => {
    const item = db.inventory.find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Item inventaris tidak ditemukan' });
    const qty = Number(req.body?.quantity) || 20;
    item.stock += qty;
    item.lastRestocked = new Date().toISOString().slice(0, 10);

    if (item.unitCostIdr > 0) {
      db.transactions.unshift({
        id: `TRX-2026-${Math.floor(910 + Math.random() * 80)}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        type: 'PENGELUARAN',
        category: 'Pengadaan Perlengkapan',
        description: `Pengadaan ${qty} ${item.unit} ${item.name}`,
        referenceId: item.sku,
        paymentMethod: 'Transfer Bank',
        amountIdr: qty * item.unitCostIdr,
        status: 'TERVERIFIKASI',
        currencyPaid: 'IDR',
      });
    }

    addAudit('Nadia Kusuma, S.E.', 'TREASURER', `Pengadaan Stok +${qty} ${item.unit} ${item.name}`, item.sku);
    saveDatabase();
    return res.json(item);
  });

  app.post('/api/v1/transactions', (req, res) => {
    const body = req.body as Partial<FinancialTransaction>;
    const trx: FinancialTransaction = {
      id: `TRX-2026-${Math.floor(920 + Math.random() * 79)}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: body.type || 'PEMASUKAN',
      category: body.category || 'Pembayaran Layanan Digital',
      description: body.description || 'Transaksi Digital Terverifikasi',
      referenceId: body.referenceId || 'MANUAL-REF',
      paymentMethod: body.paymentMethod || 'QRIS',
      amountIdr: Number(body.amountIdr) || 1500000,
      status: 'TERVERIFIKASI',
      currencyPaid: body.currencyPaid || 'IDR',
    };
    db.transactions.unshift(trx);

    if (body.referenceId?.startsWith('CASE-')) {
      const c = db.cases.find((item) => item.id === body.referenceId);
      if (c) c.paymentStatus = 'LUNAS';
    }

    addAudit('Nadia Kusuma, S.E.', 'TREASURER', `Transaksi ${trx.paymentMethod} (${trx.currencyPaid})`, trx.id);
    saveDatabase();
    res.status(201).json(trx);
  });

  app.post('/api/v1/notifications', (req, res) => {
    const body = req.body as Partial<NotificationLog>;
    const notif: NotificationLog = {
      id: `NTF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Baru saja',
      channel: body.channel || 'WhatsApp',
      recipient: body.recipient || 'Keluarga Duka',
      recipientPhone: body.recipientPhone || '+6281200000000',
      caseRef: body.caseRef || 'UMUM',
      message: body.message || 'Notifikasi operasional SIMPI.',
      status: 'Terkirim',
    };
    db.notifications.unshift(notif);
    saveDatabase();
    res.status(201).json(notif);
  });

  app.post('/api/v1/dukcapil/verify', (req, res) => {
    const { nik } = req.body as { nik?: string };
    const cleanNik = (nik || '').replace(/\D/g, '');
    if (cleanNik.length < 16) {
      return res.status(400).json({
        verified: false,
        message: 'NIK harus terdiri dari 16 digit numerik standar Dukcapil RI.',
      });
    }
    const existing = db.cases.find((c) => c.nik === cleanNik);
    if (existing) {
      return res.json({
        verified: true,
        nik: cleanNik,
        fullName: existing.deceasedName,
        address: existing.address,
        province: 'DKI Jakarta',
        registryStatus: 'Terdaftar & Terverifikasi SIAK',
      });
    }
    return res.json({
      verified: true,
      nik: cleanNik,
      fullName: 'H. Sulaiman Mansur (Data SIAK Tersinkron)',
      address: 'Jl. Tebet Barat Raya No. 14, Jakarta Selatan',
      province: 'DKI Jakarta',
      registryStatus: 'Valid & Aktif di Database Kependudukan Nasional',
    });
  });

  app.post('/api/v1/chat', (req, res) => {
    const { text, senderName, urgent } = req.body as { text?: string; senderName?: string; urgent?: boolean };
    if (!text?.trim()) return res.status(400).json({ error: 'Pesan tidak boleh kosong' });

    const userMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      sender: 'family',
      senderName: senderName || 'Keluarga / Petugas',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      urgent,
    };
    db.chatMessages.push(userMsg);

    const lower = text.toLowerCase();
    let replyText =
      'Terima kasih telah menghubungi Pusat Siaga 24/7 SIMPI. Petugas piket kami telah menerima pesan Anda dan akan segera mengkoordinasikan tim lapangan.';
    if (lower.includes('ambulans') || lower.includes('jemput') || lower.includes('darurat')) {
      replyText =
        'Unit Ambulans Jenazah Siaga (B-9014-SYR) siap diberangkatkan dalam 15 menit. Mohon pastikan alamat penjemputan dan nomor kontak wali keluarga di formulir registrasi.';
    } else if (lower.includes('makam') || lower.includes('kavling') || lower.includes('blok')) {
      replyText =
        'Saat ini tersedia kavling makam di Blok A (Raudhah), Blok B (Al-Firdaus), Blok C (As-Salam), dan Blok D (Wakaf Umat). Anda dapat langsung memilih koordinat pada menu Pemakaman & GIS.';
    } else if (lower.includes('shalat') || lower.includes('ustadz') || lower.includes('mandi')) {
      replyText =
        'Tim Pemulasaran Putra/Putri bersertifikat dan Ustadz Pembimbing siaga 24 jam sesuai protokol Syariah. Seluruh tahap akan dilaporkan otomatis via WhatsApp keluarga.';
    }

    const replyMsg: ChatMessage = {
      id: `MSG-${Date.now() + 1}`,
      sender: 'dispatcher',
      senderName: 'Pusat Siaga SIMPI 24/7',
      text: replyText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
    db.chatMessages.push(replyMsg);
    saveDatabase();
    return res.status(201).json({ userMsg, replyMsg });
  });

  app.post('/api/v1/users/:id/security', (req, res) => {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    const { twoFactorEnabled, biometricEnrolled, role } = req.body as {
      twoFactorEnabled?: boolean;
      biometricEnrolled?: boolean;
      role?: UserRole;
    };
    if (typeof twoFactorEnabled === 'boolean') user.twoFactorEnabled = twoFactorEnabled;
    if (typeof biometricEnrolled === 'boolean') user.biometricEnrolled = biometricEnrolled;
    if (role) user.role = role;

    addAudit('Ir. Ahmad Fauzan, M.M.', 'SUPER_ADMIN', `Pembaruan Keamanan Akun (${user.name})`, user.id);
    saveDatabase();
    return res.json(user);
  });

  app.post('/api/v1/api-keys', (req, res) => {
    const { name, scope } = req.body as { name?: string; scope?: string };
    const token = 'simpi_live_' + crypto.randomBytes(4).toString('hex') + '****';
    const newKey = {
      id: `KEY-${Date.now().toString().slice(-3)}`,
      name: name || 'Integrasi Sistem Eksternal Baru',
      prefix: token,
      scope: scope || 'plots:read, cases:read',
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: 'Baru dibuat',
      active: true,
    };
    db.apiKeys.unshift(newKey);
    addAudit('Ir. Ahmad Fauzan, M.M.', 'SUPER_ADMIN', `Penerbitan API Key Pihak Ketiga`, newKey.id);
    saveDatabase();
    res.status(201).json(newKey);
  });

  app.post('/api/v1/audit/export', (req, res) => {
    const { module, format, reportId, recordCount, filters } = req.body as {
      module?: string;
      format?: 'PDF' | 'CSV';
      reportId?: string;
      recordCount?: number;
      filters?: string;
    };
    const action = `Ekspor Laporan ${format || 'PDF'} (${module || 'SIMPI'}) · ${recordCount ?? 0} baris · Filter: ${filters || 'Semua'}`;
    addAudit('Ir. Ahmad Fauzan, M.M.', 'SUPER_ADMIN', action, reportId || 'RPT-EXPORT');
    saveDatabase();
    res.status(201).json({ recorded: true, reportId });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIMPI server listening on http://localhost:${PORT}`);
  });
}

startServer();
