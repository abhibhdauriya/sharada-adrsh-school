'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/public/Header';
import NoticeTicker from '@/components/public/NoticeTicker';
import AdmissionForm from '@/components/public/AdmissionForm';
import ResultLookup from '@/components/public/ResultLookup';
import { api } from '@/lib/client';
const Sec = ({ id, title, children }) => <section id={id} className="scroll-mt-24 bg-white rounded-xl shadow-sm border p-4 mb-4"><h2 className="font-bold text-lg mb-2">{title}</h2>{children}</section>;
export default function Home() {
  const [c, setC] = useState({ school: {}, fees: '', gallery: [] });
  useEffect(() => { api('/api/principal/cms').then(setC); }, []);
  return (
    <>
      <Header /><NoticeTicker />
      <main className="max-w-4xl mx-auto p-3">
        <Sec id="home" title="🏫 Sharda Adarsh Inter College"><p className="text-sm">शिक्षा • संस्कार • सफलता / Education • Values • Success</p></Sec>
        <Sec id="about" title="About / हमारे बारे में">
          <p className="text-sm whitespace-pre-line">{c.school.about || c.school.address || 'Welcome to Sharda Adarsh Inter College.'}</p>
          {c.fees && <><h3 className="font-semibold mt-3">Fees / फीस</h3><p className="text-sm whitespace-pre-line">{c.fees}</p></>}
          {c.gallery?.length > 0 && <div className="grid grid-cols-3 gap-2 mt-3">{c.gallery.map((u, i) => <img key={i} src={u} alt="" loading="lazy" className="rounded aspect-square object-cover" />)}</div>}
        </Sec>
        <Sec id="admission" title="Admission / प्रवेश"><AdmissionForm /></Sec>
        <Sec id="result" title="Result & Attendance / परिणाम"><ResultLookup /></Sec>
      </main>
    </>
  );
}
