'use client';
import { useEffect, useState } from 'react';
import { api, inp, btn } from '@/lib/client';
import { link, noticeMsg } from '@/lib/whatsapp';
import AdminDashboard from './AdminDashboard';
const Staff = () => {
  const [u, setU] = useState([]); const e0 = { username: '', password: '', name: '', role: 'teacher', class_name: '', phone: '' }; const [f, setF] = useState(e0); const [m, setM] = useState('');
  const load = () => api('/api/principal/staff-manage').then(r => setU(r.users || [])); useEffect(() => { load(); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <input className={inp} placeholder="Username" value={f.username} onChange={set('username')} /><input className={inp} placeholder="Password" value={f.password} onChange={set('password')} />
      <input className={inp} placeholder="Name" value={f.name} onChange={set('name')} /><select className={inp} value={f.role} onChange={set('role')}><option>teacher</option><option>admin</option></select>
      <input className={inp} placeholder="Class (teacher)" value={f.class_name} onChange={set('class_name')} /><input className={inp} placeholder="Phone" value={f.phone} onChange={set('phone')} />
    </div>
    <button className={btn} onClick={async () => { const r = await api('/api/principal/staff-manage', 'POST', f); setM(r.ok ? '✅ Added' : '❌ ' + r.error); if (r.ok) { setF(e0); load(); } }}>Add staff</button> {m}
    {u.map(x => <div key={x.id} className="bg-white border rounded p-2 text-sm flex justify-between"><span>{x.name} · {x.role} {x.class_name} · @{x.username}</span>
      <span className="space-x-2"><button onClick={async () => { const p = prompt('New password (min 6)'); if (p) alert((await api('/api/principal/staff-manage', 'PUT', { id: x.id, password: p })).ok ? 'Updated' : 'Failed'); }}>🔑</button>
      <button onClick={async () => { if (confirm('Delete ' + x.name + '?')) { await api('/api/principal/staff-manage?id=' + x.id, 'DELETE'); load(); } }}>🗑️</button></span></div>)}
  </div>;
};
const Notices = ({ school }) => {
  const [n, setN] = useState([]); const [t, setT] = useState(''); const [b, setB] = useState('');
  const load = () => api('/api/principal/cms').then(r => setN(r.notices || [])); useEffect(() => { load(); }, []);
  return <div className="space-y-2">
    <input className={inp} placeholder="Title" value={t} onChange={e => setT(e.target.value)} /><textarea className={inp} placeholder="Details" value={b} onChange={e => setB(e.target.value)} />
    <button className={btn} onClick={async () => { await api('/api/principal/cms', 'POST', { type: 'notice', title: t, body: b }); setT(''); setB(''); load(); }}>Publish notice</button>
    {n.map(x => <div key={x.id} className="bg-white border rounded p-2 text-sm flex justify-between"><span>{x.title}</span><span className="space-x-2">
      <a target="_blank" href={link('', noticeMsg(x, school.name))}>📲</a><button onClick={async () => { await api('/api/principal/cms', 'POST', { type: 'delete_notice', id: x.id }); load(); }}>🗑️</button></span></div>)}
  </div>;
};
const Cms = ({ school, setSchool }) => {
  const [fees, setFees] = useState(''); const [gal, setGal] = useState(''); const [m, setM] = useState('');
  useEffect(() => { api('/api/principal/cms').then(r => { setFees(r.fees || ''); setGal((r.gallery || []).join('\n')); }); }, []);
  const save = async (key, value) => setM((await api('/api/principal/cms', 'POST', { type: 'setting', key, value })).ok ? '✅ Saved' : '❌ Failed');
  return <div className="space-y-2">
    <input className={inp} placeholder="School name" value={school.name || ''} onChange={e => setSchool({ ...school, name: e.target.value })} />
    <input className={inp} placeholder="School WhatsApp (10 digit)" value={school.phone || ''} onChange={e => setSchool({ ...school, phone: e.target.value })} />
    <textarea className={inp} placeholder="About / address" value={school.about || ''} onChange={e => setSchool({ ...school, about: e.target.value })} />
    <button className={btn} onClick={() => save('school', school)}>Save school info</button>
    <textarea className={inp} rows={4} placeholder="Fee structure" value={fees} onChange={e => setFees(e.target.value)} /><button className={btn} onClick={() => save('fees', fees)}>Save fees</button>
    <textarea className={inp} rows={3} placeholder="Gallery image URLs, one per line" value={gal} onChange={e => setGal(e.target.value)} /><button className={btn} onClick={() => save('gallery', gal.split('\n').map(x => x.trim()).filter(Boolean))}>Save gallery</button> {m}
  </div>;
};
const Analytics = () => {
  const [st, setSt] = useState([]); const [ld, setLd] = useState([]);
  useEffect(() => { api('/api/students').then(r => setSt(r.students || [])); api('/api/admission').then(r => setLd(r.leads || [])); }, []);
  const by = st.reduce((a, s) => ({ ...a, [s.class_name]: (a[s.class_name] || 0) + 1 }), {});
  return <div className="text-sm space-y-1"><p>Students: <b>{st.length}</b> · Admission leads: <b>{ld.length}</b> · Fee due: <b>₹{st.reduce((a, s) => a + Number(s.fee_due || 0), 0)}</b></p>
    {Object.entries(by).map(([c, n]) => <p key={c}>Class {c}: {n}</p>)}</div>;
};
const Sync = () => { const [m, setM] = useState('');
  const go = async d => { setM('Working…'); const r = await api('/api/principal/sheet-sync', 'POST', { direction: d }); setM(r.ok ? `✅ ${r.count} rows` : '❌ ' + r.error); };
  return <div className="space-y-2"><button className={btn} onClick={() => go('push')}>⬆️ Turso → Sheet</button> <button className={btn} onClick={() => go('pull')}>⬇️ Sheet → Turso</button><p className="text-sm">{m}</p></div>; };
export default function PrincipalDashboard() {
  const [tab, setTab] = useState('analytics'); const [school, setSchool] = useState({});
  useEffect(() => { api('/api/principal/cms').then(r => setSchool(r.school || {})); }, []);
  const tabs = { analytics: 'Analytics', staff: 'Teachers/Admins', notices: 'Notices', cms: 'School/Fees/Gallery', ops: 'Admissions & Students', sync: 'Sheet Sync' };
  return <div>
    <div className="flex gap-2 overflow-x-auto mb-3">{Object.entries(tabs).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`${btn} whitespace-nowrap ${tab !== k && '!bg-slate-300 !text-black'}`}>{l}</button>)}</div>
    {tab === 'analytics' && <Analytics />}{tab === 'staff' && <Staff />}{tab === 'notices' && <Notices school={school} />}
    {tab === 'cms' && <Cms school={school} setSchool={setSchool} />}{tab === 'ops' && <AdminDashboard />}{tab === 'sync' && <Sync />}
  </div>;
}
