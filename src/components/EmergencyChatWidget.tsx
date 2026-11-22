import React, { useState } from 'react';
import { MessageCircle, X, Send, PhoneCall } from 'lucide-react';
import { ChatMessage } from '../types/simpi';

interface EmergencyChatWidgetProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, urgent?: boolean) => Promise<void>;
}

export const EmergencyChatWidget: React.FC<EmergencyChatWidgetProps> = ({
  messages,
  onSendMessage,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await onSendMessage(input.trim(), input.toLowerCase().includes('darurat'));
      setInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 px-4 rounded-xl bg-slate-900 dark:bg-emerald-700 hover:bg-slate-800 dark:hover:bg-emerald-800 text-white shadow-lg flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Bantuan Darurat 24/7</span>
        </button>
      ) : (
        <div className="w-[360px] max-w-[92vw] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-display text-xs font-semibold">Pusat Siaga Darurat SIMPI 24/7</p>
                <p className="text-[11px] text-slate-300">Koordinasi Ambulans, Pemulasaran & Makam</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3.5 h-72 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'family' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                  {m.senderName} · {m.timestamp}
                </span>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                    m.sender === 'family'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pt-2 flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            {[
              'Kirim Ambulans Darurat',
              'Cek Kavling Makam Tersedia',
              'Jadwal Ustadz & Shalat',
            ].map((tpl) => (
              <button
                key={tpl}
                type="button"
                onClick={() => setInput(tpl)}
                className="px-2 py-1 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {tpl}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan bantuan darurat..."
              className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="h-9 w-9 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
