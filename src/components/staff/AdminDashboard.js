'use client';
import { useEffect, useState } from 'react';
import { api, inp, btn } from '@/lib/client';
import { link, feeMsg } from '@/lib/whatsapp';
export default function AdminDashboard() {
  const [tab, setTab] = useState('leads'); const [leads, setLeads] = useState([]); const [st, setSt] = useState([]);
  const [bulk, setBulk] = useState(''); const [msg, setMsg] = useState(''); const [school, setSchool] = useState('');
  const load = () => { api('/api/admission').then(r => setLeads(r.leads || [])); api('/api/students').then(r => setSt(r.students || [])); };
  useEffect(() => { load(); api('/api/principal/cms').then(r => setSchool(r.school?.name || '')); }, []);
  async function imp() {
    const students = bulk.split('\n').map(l => l.split(',').map(x => x.trim())).filter(a => a.length >= 4).map(([roll_no, name, father_name, class_name, dob, parent_phone, fee_due]) => ({ roll_no, name, father_name, class_name, dob, parent_phone, fee_due }));
    const r = await api('/api/students', 'POST', { students }); setMsg(r.ok ? `✅ ${r.saved} saved` : '❌ ' + r.error); setBulk(''); load();
  }
  return (
    <div>
      <div className="flex gap-2 mb-3">{[['leads', 'Leads'], ['students', 'Students'], ['fees', 'Fees']].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`${btn} ${tab !== k && '!bg-slate-300 !text-black'}`}>{l}</button>)}</div>
      {tab === 'leads' && leads.map(l => <div key={l.id} className="bg-white border rounded p-2 mb-1 text-sm flex justify-between"><span>{l.name} · {l.class_name} · {l.phone}</span><a className="text-green-700" target="_blank" href={`https://wa.me/91${l.phone}`}>WA</a></div>)}
      {tab === 'students' && <>
        <p className="text-xs mb-1">One per line: roll,name,father,class,dob(YYYY-MM-DD),phone,fee_due</p>
        <textarea className={inp} rows={5} value={bulk} onChange={e => setBulk(e.target.value)} />
        <button className={btn + ' mt-2'} onClick={imp}>Import / Update</button> {msg}
        <p className="text-sm mt-3">{st.length} students</p>
      </>}
      {tab === 'fees' && st.map(s => <div key={s.id} className="bg-white border rounded p-2 mb-1 text-sm flex items-center gap-2">
        <span className="flex-1">{s.name} ({s.class_name})</span>
        <input type="number" defaultValue={s.fee_due} className="border rounded w-20 p-1" onBlur={e => api('/api/students', 'PATCH', { id: s.id, fee_due: e.target.value })} />
        <a className="text-green-700" target="_blank" href={link(s.parent_phone, feeMsg(s.name, s.fee_due, school))}>Remind</a></div>)}
    </div>
  );
}
