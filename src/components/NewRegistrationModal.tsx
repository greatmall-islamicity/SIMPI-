import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import {
  CemeteryPlot,
  CurrencyCode,
  FinancialTransaction,
  FuneralCase,
  PlotStatus,
} from '../types/simpi';
import { formatCurrency } from '../utils/formatters';

interface NewRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  availablePlots: CemeteryPlot[];
  currency: CurrencyCode;
  onSubmitCase: (
    payload: Partial<FuneralCase> & {
      paymentMethod?: FinancialTransaction['paymentMethod'];
      currencyPaid?: CurrencyCode;
    }
  ) => Promise<void>;
}

export const NewRegistrationModal: React.FC<NewRegistrationModalProps> = ({
  open,
  onClose,
  availablePlots,
  currency,
  onSubmitCase,
}) => {
  const [nik, setNik] = useState('3174012207600008');
  const [deceasedName, setDeceasedName] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [age, setAge] = useState(66);
  const [address, setAddress] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState(new Date().toISOString().slice(0, 10));
  const [timeOfDeath, setTimeOfDeath] = useState('08:30 WIB');
  const [causeOfDeath, setCauseOfDeath] = useState('Terverifikasi Medis');
  const [medicalFacility, setMedicalFacility] = useState('RS Islam Jakarta');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinRelation, setNextOfKinRelation] = useState('Anak Kandung');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('+62812');
  const [nextOfKinEmail, setNextOfKinEmail] = useState('');
  const [plotId, setPlotId] = useState(availablePlots[0]?.id || '');
  const [packageName, setPackageName] = useState('Paket Pemulasaran Syariah Utama (Lengkap)');
  const [paymentMethod, setPaymentMethod] = useState<FinancialTransaction['paymentMethod']>('VA Syariah');
  const [nikStatus, setNikStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const selectedPlot = availablePlots.find((p) => p.id === plotId);
  const baseServiceFee = packageName.includes('Utama') ? 4500000 : packageName.includes('Mandiri') ? 2800000 : 500000;
  const totalFeeIdr = baseServiceFee + (selectedPlot?.priceIdr || 0);

  const handleNikCheck = async () => {
    try {
      const res = await fetch('/api/v1/dukcapil/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik }),
      });
      const json = await res.json();
      if (json.verified) {
        setNikStatus('Data Kependudukan Terverifikasi SIAK');
        if (!deceasedName) setDeceasedName(json.fullName);
        if (!address) setAddress(json.address);
      } else {
        setNikStatus(json.message);
      }
    } catch {
      setNikStatus('Gagal memverifikasi NIK');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitCase({
        nik,
        deceasedName,
        gender,
        age,
        address,
        dateOfDeath,
        timeOfDeath,
        causeOfDeath,
        medicalFacility,
        nextOfKinName,
        nextOfKinRelation,
        nextOfKinPhone,
        nextOfKinEmail,
        plotId: selectedPlot?.id,
        plotCode: selectedPlot?.code,
        packageName,
        totalFeeIdr,
        paymentMethod,
        currencyPaid: currency,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const plotsReady = availablePlots.filter((p) => p.status === PlotStatus.AVAILABLE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="sticky top-0 z-10 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Registrasi Jenazah & Pemesanan Layanan Terpadu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data kependudukan terenkripsi AES-256 dengan penjadwalan makam GIS & notifikasi WhatsApp otomatis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              01. Data Kependudukan & Kematian
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 Digit NIK KTP/KK"
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleNikCheck}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Cek Dukcapil</span>
              </button>
            </div>
            {nikStatus && (
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">{nikStatus}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Almarhum / Almarhumah
                </label>
                <input
                  type="text"
                  required
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Usia
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Wafat
                </label>
                <input
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Jam Wafat
                </label>
                <input
                  type="text"
                  value={timeOfDeath}
                  onChange={(e) => setTimeOfDeath(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  RS / Lokasi Wafat
                </label>
                <input
                  type="text"
                  value={medicalFacility}
                  onChange={(e) => setMedicalFacility(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Keterangan Medis & Alamat Domisili
              </label>
              <input
                type="text"
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mb-2"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat tempat tinggal..."
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              02. Wali Keluarga (Penerima Notifikasi WhatsApp & Laporan)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={nextOfKinName}
                onChange={(e) => setNextOfKinName(e.target.value)}
                placeholder="Nama Lengkap Ahli Waris"
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={nextOfKinRelation}
                onChange={(e) => setNextOfKinRelation(e.target.value)}
                placeholder="Hubungan Keluarga"
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                required
                value={nextOfKinPhone}
                onChange={(e) => setNextOfKinPhone(e.target.value)}
                placeholder="No. WhatsApp (+62...)"
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
              />
              <input
                type="email"
                value={nextOfKinEmail}
                onChange={(e) => setNextOfKinEmail(e.target.value)}
                placeholder="Email Keluarga"
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              03. Kavling Makam GIS, Paket Pemulasaran & Pembayaran Transparan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Kavling GIS Tersedia
                </label>
                <select
                  value={plotId}
                  onChange={(e) => setPlotId(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {plotsReady.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} · {p.zone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Paket Pemulasaran
                </label>
                <select
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Paket Pemulasaran Syariah Utama (Lengkap)">Syariah Utama (Lengkap)</option>
                  <option value="Paket Pemulasaran & Pengantaran Masjid">Pemulasaran & Masjid</option>
                  <option value="Program Layanan Pemulasaran Wakaf Umat">Program Wakaf Umat</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as FinancialTransaction['paymentMethod'])}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="VA Syariah">VA Bank Syariah</option>
                  <option value="QRIS">QRIS Nasional</option>
                  <option value="Kartu Global">Kartu Kredit/Debit Global</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Total Biaya Transparan (Pemulasaran + Kavling {selectedPlot?.code || '-'})
              </span>
              <span className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatCurrency(totalFeeIdr, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
            >
              {submitting ? 'Menyimpan & Mengirim Notifikasi...' : 'Simpan Registrasi & Terbitkan Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
