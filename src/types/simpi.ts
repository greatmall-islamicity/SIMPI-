export type Language = 'id' | 'en' | 'ar';
export type CurrencyCode = 'IDR' | 'USD' | 'SGD' | 'MYR' | 'SAR';
export type ThemeMode = 'light' | 'dark';
export type LayoutDensity = 'comfortable' | 'compact';

export type NavSection =
  | 'dashboard'
  | 'gis'
  | 'funeral'
  | 'inventory'
  | 'finance'
  | 'directory'
  | 'security';

export enum PlotStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum RitualStage {
  REGISTERED = 'REGISTERED',
  BATHING = 'BATHING',
  SHROUDING = 'SHROUDING',
  PRAYER = 'PRAYER',
  BURIAL = 'BURIAL',
  COMPLETED = 'COMPLETED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FUNERAL_OFFICER = 'FUNERAL_OFFICER',
  GIS_OPERATOR = 'GIS_OPERATOR',
  TREASURER = 'TREASURER',
  FAMILY_LIAISON = 'FAMILY_LIAISON',
}

export interface CemeteryPlot {
  id: string;
  code: string;
  zone: 'Blok A - Raudhah' | 'Blok B - Al-Firdaus' | 'Blok C - As-Salam' | 'Blok D - Wakaf Umat';
  row: number;
  col: number;
  lat: number;
  lng: number;
  qiblaBearing: number;
  sizeMeters: string;
  status: PlotStatus;
  priceIdr: number;
  deceasedName?: string;
  burialDate?: string;
  familyContact?: string;
  caseId?: string;
}

export interface FuneralCase {
  id: string;
  registrationNo: string;
  nik: string;
  deceasedName: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: number;
  address: string;
  dateOfDeath: string;
  timeOfDeath: string;
  causeOfDeath: string;
  medicalFacility: string;
  nextOfKinName: string;
  nextOfKinRelation: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
  plotId?: string;
  plotCode?: string;
  packageId: string;
  packageName: string;
  assignedOfficialId?: string;
  assignedOfficialName?: string;
  hearseUnit: string;
  scheduledPrayerTime: string;
  scheduledBurialTime: string;
  stage: RitualStage;
  stageUpdatedAt: string;
  paymentStatus: 'LUNAS' | 'MENUNGGU' | 'CICILAN';
  totalFeeIdr: number;
  documentHash: string;
  dukcapilVerified: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Pemakaman' | 'Pemulasaran' | 'Armada';
  stock: number;
  minThreshold: number;
  unit: string;
  unitCostIdr: number;
  supplier: string;
  lastRestocked: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'PEMASUKAN' | 'PENGELUARAN';
  category: string;
  description: string;
  referenceId: string;
  paymentMethod: 'QRIS' | 'VA Syariah' | 'Transfer Bank' | 'Kartu Global' | 'Tunai Terverifikasi';
  amountIdr: number;
  status: 'TERVERIFIKASI' | 'PROSES';
  currencyPaid: CurrencyCode;
}

export interface ServiceProvider {
  id: string;
  name: string;
  role: 'Ustadz / Modin' | 'Tim Pemulasaran Putra' | 'Tim Pemulasaran Putri' | 'Pengemudi Ambulans' | 'Petugas Gali Makam';
  certification: string;
  region: string;
  phone: string;
  availability: 'Tersedia' | 'Bertugas' | 'Siaga 24 Jam';
  completedCases: number;
  rating: number;
  avatarUrl?: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  channel: 'WhatsApp' | 'SMS' | 'Email' | 'Push';
  recipient: string;
  recipientPhone: string;
  caseRef: string;
  message: string;
  status: 'Terkirim' | 'Dibaca' | 'Antrean';
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  biometricEnrolled: boolean;
  lastActive: string;
  status: 'Aktif' | 'Nonaktif';
  avatarUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  encryptionStatus: 'AES-256-GCM';
}

export interface ChatMessage {
  id: string;
  sender: 'family' | 'dispatcher';
  senderName: string;
  text: string;
  timestamp: string;
  urgent?: boolean;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  createdAt: string;
  lastUsed: string;
  active: boolean;
}

export interface KpiTargets {
  monthlyBurialTarget: number;
  monthlyBookingTarget: number;
  serviceEfficiencyTargetPct: number;
  monthlyRevenueTargetIdr: number;
  updatedAt: string;
}

export interface SimpiDataSnapshot {
  plots: CemeteryPlot[];
  cases: FuneralCase[];
  inventory: InventoryItem[];
  transactions: FinancialTransaction[];
  providers: ServiceProvider[];
  notifications: NotificationLog[];
  users: SystemUser[];
  auditLogs: AuditLogEntry[];
  chatMessages: ChatMessage[];
  apiKeys: ApiKeyRecord[];
  kpiTargets: KpiTargets;
}
