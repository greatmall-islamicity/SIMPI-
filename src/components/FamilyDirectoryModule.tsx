import React, { useState } from 'react';
import {
  Phone,
  Star,
  ShieldCheck,
  Send,
  Mail,
  MessageSquare,
} from 'lucide-react';
import {
  FuneralCase,
  NotificationLog,
  ServiceProvider,
} from '../types/simpi';

interface FamilyDirectoryModuleProps {
  cases: FuneralCase[];
  providers: ServiceProvider[];
  notifications: NotificationLog[];
  onSendNotification: (payload: Partial<NotificationLog>) => Promise<void>;
}

export const FamilyDirectoryModule: React.FC<FamilyDirectoryModuleProps> = ({
  cases,
  providers,
  notifications,
  onSendNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'providers' | 'families' | 'notifications'>('providers');
  const [channel, setChannel] = useState<NotificationLog['channel']>('WhatsApp');
  const [recipient, setRecipient] = useState(cases[0]?.nextOfKinName || '');
  const [phone, setPhone] = useState(cases[0]?.nextOfKinPhone || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await onSendNotification({
        channel,
        recipient: recipient || 'Wali Keluarga',
        recipientPhone: phone || '+6281200000000',
        caseRef: cases[0]?.id || 'UMUM',
        message: message.trim(),
      });
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Keluarga Duka, Direktori Penyedia & Pusat Notifikasi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Direktori petugas bersertifikat, manajemen hubungan keluarga duka, serta komunikasi real-time via WhatsApp, SMS, Email & Push.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
          {[
            { id: 'providers', label: 'Direktori Penyedia Terverifikasi' },
            { id: 'families', label: 'Database Keluarga Duka' },
            { id: 'notifications', label: 'Log & Kirim Notifikasi' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'providers' | 'families' | 'notifications')}
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

      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {providers.map((prv) => (
            <div
              key={prv.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3.5">
                {prv.avatarUrl ? (
                  <img
                    src={prv.avatarUrl}
                    alt={prv.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-lg object-cover bg-slate-200 dark:bg-slate-800 shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-display font-bold text-base shrink-0">
                    {prv.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {prv.name}
                  </h2>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {prv.role}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {prv.region}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{prv.certification}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    {prv.rating.toFixed(1)}
                  </span>
                  <span>{prv.completedCases} layanan</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {prv.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'families' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Wali / Ahli Waris</th>
                  <th className="py-3 px-4">Kontak & Email</th>
                  <th className="py-3 px-4">Almarhum & Hubungan</th>
                  <th className="py-3 px-4">Lokasi Makam</th>
                  <th className="py-3 px-4 text-right">Komunikasi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {c.nextOfKinName}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                      <div>{c.nextOfKinPhone}</div>
                      <div className="text-slate-400 font-sans">{c.nextOfKinEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{c.deceasedName}</p>
                      <p className="text-slate-500 dark:text-slate-400">{c.nextOfKinRelation}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {c.plotCode || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setRecipient(c.nextOfKinName);
                          setPhone(c.nextOfKinPhone);
                          setMessage(
                            `Assalamu'alaikum ${c.nextOfKinName}, berikut laporan berkala SIMPI untuk makam ${c.deceasedName} (${c.plotCode || '-'}). Kondisi area makam terawat dengan baik.`
                          );
                          setActiveTab('notifications');
                        }}
                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Kirim Laporan Berkala
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleDispatch}
            className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Kirim Notifikasi Real-Time Keluarga
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kanal Pengiriman
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as NotificationLog['channel'])}
                  className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="WhatsApp">WhatsApp Business</option>
                  <option value="SMS">SMS Gateway</option>
                  <option value="Email">Email Terenkripsi</option>
                  <option value="Push">Push Mobile App</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nomor / Alamat Tujuan
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama Penerima (Ahli Waris)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Isi Pesan Laporan / Pengingat Jadwal
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pembaruan status pemulasaran, pengingat waktu shalat jenazah, atau laporan pemeliharaan makam..."
                className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full h-10 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sending ? 'Mengirim...' : `Kirim via ${channel}`}</span>
            </button>
          </form>

          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
            <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Riwayat Pengiriman Notifikasi ({notifications.length})
              </h3>
            </div>
            {notifications.map((n) => (
              <div key={n.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
                    {n.channel === 'Email' ? (
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                    )}
                    {n.channel} · {n.recipient} ({n.recipientPhone})
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {n.timestamp} · {n.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
