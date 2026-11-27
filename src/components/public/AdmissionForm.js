'use client';
import { useState } from 'react';
import { api, inp, btn, useLang } from '@/lib/client';
export default function AdmissionForm() {
  const { t } = useLang();
  const [f, setF] = useState({ name: '', father: '', phone: '', cls: '' });
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const r = await api('/api/admission', 'POST', f);
    setBusy(false);
    if (r.ok) { setMsg('✅ Saved. Opening WhatsApp…'); window.location.href = r.wa; } else setMsg('❌ ' + (r.error || 'Error'));
  }
  return (
    <form onSubmit={submit} className="space-y-2">
      <input className={inp} placeholder={t('name')} value={f.name} onChange={set('name')} required />
      <input className={inp} placeholder={t('father')} value={f.father} onChange={set('father')} />
      <input className={inp} placeholder={t('phone')} inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} required />
      <input className={inp} placeholder={t('cls')} value={f.cls} onChange={set('cls')} required />
      <button className={btn + ' w-full'} disabled={busy}>{t('submit')}</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
