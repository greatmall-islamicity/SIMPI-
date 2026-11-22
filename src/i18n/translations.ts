import { Language } from '../types/simpi';

export const TRANSLATIONS: Record<
  Language,
  {
    brandShort: string;
    brandFull: string;
    nav: {
      dashboard: string;
      gis: string;
      funeral: string;
      inventory: string;
      finance: string;
      directory: string;
      security: string;
    };
    actions: {
      newCase: string;
      exportPdf: string;
      exportCsv: string;
      searchPlaceholder: string;
      emergencyChat: string;
      verifyNik: string;
    };
    dashboard: {
      title: string;
      subtitle: string;
      kpiPlots: string;
      kpiActiveCases: string;
      kpiRevenue: string;
      kpiSla: string;
      occupancyTitle: string;
      trendTitle: string;
      activePipelineTitle: string;
      familyReportTitle: string;
    };
    securityNote: string;
  }
> = {
  id: {
    brandShort: 'SIMPI',
    brandFull: 'Sistem Informasi Manajemen Pemakaman & Pemulasaran Islam',
    nav: {
      dashboard: 'Dasbor Eksekutif',
      gis: 'Pemakaman & GIS',
      funeral: 'Pemulasaran & Ritual',
      inventory: 'Inventaris',
      finance: 'Keuangan & Pembayaran',
      directory: 'Keluarga & Penyedia',
      security: 'Pengguna, Keamanan & API',
    },
    actions: {
      newCase: 'Registrasi Jenazah',
      exportPdf: 'Ekspor PDF',
      exportCsv: 'Ekspor CSV',
      searchPlaceholder: 'Cari nama almarhum, NIK, kode makam, atau nomor registrasi...',
      emergencyChat: 'Bantuan Darurat 24/7',
      verifyNik: 'Verifikasi Dukcapil',
    },
    dashboard: {
      title: 'Ringkasan Operasional & Analitik Eksekutif',
      subtitle: 'Pemantauan real-time ketersediaan kavling GIS, progres pemulasaran syariah, dan arus kas transparan.',
      kpiPlots: 'Kavling Makam Tersedia',
      kpiActiveCases: 'Prosesi Pemulasaran Aktif',
      kpiRevenue: 'Pendapatan Periode Berjalan',
      kpiSla: 'Tingkat Respon & Notifikasi',
      occupancyTitle: 'Okupansi Lahan Makam per Zona GIS',
      trendTitle: 'Tren Layanan Pemakaman & Pemulasaran (6 Bulan)',
      activePipelineTitle: 'Pemantauan Status Prosesi Real-Time',
      familyReportTitle: 'Pelaporan Otomatis & Arsip Keluarga Duka',
    },
    securityNote: 'Enkripsi End-to-End AES-256 · Terintegrasi Dukcapil & API Nasional',
  },
  en: {
    brandShort: 'SIMPI',
    brandFull: 'Islamic Burial & Funeral Management Information System',
    nav: {
      dashboard: 'Executive Dashboard',
      gis: 'Burial & GIS Map',
      funeral: 'Funeral & Rituals',
      inventory: 'Inventory',
      finance: 'Finance & Payments',
      directory: 'Families & Providers',
      security: 'Users, Security & API',
    },
    actions: {
      newCase: 'Register Case',
      exportPdf: 'Export PDF',
      exportCsv: 'Export CSV',
      searchPlaceholder: 'Search deceased name, ID, plot code, or registration...',
      emergencyChat: '24/7 Emergency Desk',
      verifyNik: 'Verify Civil ID',
    },
    dashboard: {
      title: 'Executive Operations & Analytics Overview',
      subtitle: 'Real-time GIS plot availability, Shariah funeral workflow milestones, and transparent financial ledger.',
      kpiPlots: 'Available Burial Plots',
      kpiActiveCases: 'Active Funeral Processions',
      kpiRevenue: 'Current Period Revenue',
      kpiSla: 'Dispatch & Notification Rate',
      occupancyTitle: 'Burial Plot Occupancy by GIS Zone',
      trendTitle: '6-Month Burial & Funeral Service Volume',
      activePipelineTitle: 'Real-Time Procession Milestone Tracker',
      familyReportTitle: 'Automated Bereaved Family Reports',
    },
    securityNote: 'AES-256 End-to-End Encrypted · National Civil & API Interoperable',
  },
  ar: {
    brandShort: 'SIMPI',
    brandFull: 'نظام إدارة المقابر والجنائز الإسلامية',
    nav: {
      dashboard: 'لوحة القيادة التنفيذية',
      gis: 'خريطة المقابر GIS',
      funeral: 'تجهيز الجنائز والطقوس',
      inventory: 'المخزون والتوريد',
      finance: 'المالية والمدفوعات',
      directory: 'الأسر ومقدمو الخدمة',
      security: 'المستخدمون والأمان و API',
    },
    actions: {
      newCase: 'تسجيل حالة وفاة',
      exportPdf: 'تصدير PDF',
      exportCsv: 'تصدير CSV',
      searchPlaceholder: 'ابحث بالاسم أو الرقم الوطني أو رمز القبر...',
      emergencyChat: 'دعم الطوارئ 24/7',
      verifyNik: 'التحقق المدني',
    },
    dashboard: {
      title: 'ملخص العمليات والتحليلات التنفيذية',
      subtitle: 'متابعة فورية لتوافر القبور عبر GIS ومراحل التجهيز الشرعي والشفافية المالية.',
      kpiPlots: 'القبور المتاحة حالياً',
      kpiActiveCases: 'جنائز قيد التنفيذ',
      kpiRevenue: 'إيرادات الفترة الحالية',
      kpiSla: 'معدل الاستجابة والإشعارات',
      occupancyTitle: 'نسبة إشغال المقابر حسب المنطقة',
      trendTitle: 'مؤشر خدمات الدفن والتجهيز (6 أشهر)',
      activePipelineTitle: 'متابعة مراحل التجهيز الشرعي',
      familyReportTitle: 'التقارير الآلية لأسر المتوفين',
    },
    securityNote: 'تشفير كامل AES-256 · تكامل السجل المدني والواجهة البرمجية',
  },
};
