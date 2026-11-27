'use client';
import { useEffect, useState } from 'react';
import { api, inp, btn } from '@/lib/client';
export default function DevVault() {
  const [d, setD] = useState(null); const [pin, setPin] = useState(''); const [err, setErr] = useState(''); const [rp, setRp] = useState({ username: 'principal', password: '' });
  const load = () => api('/api/dev/override').then(r => setD(r.error ? null : r));
  useEffect(() => { load(); }, []);
  const act = async body => { const r = await api('/api/dev/override', 'POST', body); alert(r.ok ? 'Done' : r.error); load(); };
  if (!d) return (
    <main className="max-w-xs mx-auto mt-24 p-4 space-y-2">
      <input className={inp} type="password" placeholder="Master PIN" value={pin} onChange={e => setPin(e.target.value)} />
      <button className={btn + ' w-full'} onClick={async () => { const r = await api('/api/auth/dev-auth', 'POST', { pin }); r.ok ? load() : setErr('Denied'); }}>Enter</button><p className="text-red-600 text-sm">{err}</p>
    </main>);
  return (
    <main className="max-w-xl mx-auto p-4 space-y-4 text-sm">
      <h1 className="font-bold text-lg">Developer Vault</h1>
      <section className="bg-white border rounded p-3"><p>Kill-switch: <b className={d.locked ? 'text-red-600' : 'text-green-700'}>{d.locked ? 'LOCKED' : 'LIVE'}</b></p>
        <button className={btn + ' mt-2'} onClick={() => act({ action: d.locked ? 'unlock' : 'lock' })}>{d.locked ? 'Unlock portal' : 'Lock portal (staff + public APIs)'}</button></section>
      <section className="bg-white border rounded p-3"><p className="font-semibold">Env / keys status (values never shown)</p>
        {Object.entries(d.env).map(([k, v]) => <p key={k}>{v ? '✅' : '❌'} {k}</p>)}<p className="mt-1">Users {d.counts.users} · Students {d.counts.students} · Leads {d.counts.leads}</p></section>
      <section className="bg-white border rounded p-3 space-y-2"><p className="font-semibold">Reset a user password</p>
        <input className={inp} value={rp.username} onChange={e => setRp({ ...rp, username: e.target.value })} /><input className={inp} type="password" placeholder="New password" value={rp.password} onChange={e => setRp({ ...rp, password: e.target.value })} />
        <button className={btn} onClick={() => act({ action: 'reset_password', ...rp })}>Reset</button></section>
    </main>);
}
