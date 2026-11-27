'use client';
import { useEffect, useState } from 'react';
import { api, inp, btn } from '@/lib/client';
import PrincipalDashboard from '@/components/staff/PrincipalDashboard';
import AdminDashboard from '@/components/staff/AdminDashboard';
import TeacherDashboard from '@/components/staff/TeacherDashboard';
export default function Staff() {
  const [u, setU] = useState(undefined); const [f, setF] = useState({ username: '', password: '' }); const [err, setErr] = useState('');
  useEffect(() => { api('/api/auth/login').then(r => setU(r.user)); }, []);
  async function login(e) { e.preventDefault(); setErr(''); const r = await api('/api/auth/login', 'POST', f); if (r.ok) api('/api/auth/login').then(r => setU(r.user)); else setErr(r.error); }
  if (u === undefined) return <p className="p-4">Loading…</p>;
  if (!u) return (
    <main className="max-w-sm mx-auto p-4 mt-10"><h1 className="font-bold text-xl mb-3">Staff Login</h1>
      <form onSubmit={login} className="space-y-2">
        <input className={inp} placeholder="Username" autoCapitalize="none" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} />
        <input className={inp} type="password" placeholder="Password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
        <button className={btn + ' w-full'}>Login</button>{err && <p className="text-red-600 text-sm">{err}</p>}
      </form><a href="/" className="text-sm text-blue-700 block mt-3">← Home</a></main>);
  return (
    <main className="max-w-3xl mx-auto p-3">
      <div className="flex justify-between items-center mb-3"><b>{u.name} <span className="text-xs text-slate-500">({u.role})</span></b>
        <button className="text-sm underline" onClick={async () => { await api('/api/auth/logout', 'POST'); setU(null); }}>Logout</button></div>
      {u.role === 'principal' ? <PrincipalDashboard /> : u.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard cls={u.cls} />}
    </main>);
}
