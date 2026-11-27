'use client';
import { useEffect, useState } from 'react';
export const api = async (url, method = 'GET', body) => {
  try { const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return await r.json(); }
  catch { return { error: 'Network error' }; }
};
export const inp = 'border rounded-lg p-2 w-full text-sm';
export const btn = 'bg-blue-800 text-white rounded-lg px-3 py-2 text-sm active:scale-95 disabled:opacity-50';
const T = {
  home: ['होम', 'Home'], about: ['हमारे बारे में', 'About'], admission: ['प्रवेश', 'Admission'], result: ['परिणाम', 'Result'], staffLogin: ['स्टाफ लॉगिन', 'Staff Login'],
  submit: ['जमा करें', 'Submit'], name: ['छात्र का नाम', 'Student Name'], father: ['पिता का नाम', 'Father Name'], phone: ['मोबाइल नंबर', 'Mobile'], cls: ['कक्षा', 'Class'],
  roll: ['रोल नंबर', 'Roll No'], dob: ['जन्म तिथि', 'Date of Birth'], view: ['देखें', 'View'], welcome: ['स्वागत है', 'Welcome'], att: ['उपस्थिति', 'Attendance'],
};
export function useLang() {
  const [l, setL] = useState(0);
  useEffect(() => { const f = () => setL(localStorage.lang === 'en' ? 1 : 0); f(); window.addEventListener('lang', f); return () => window.removeEventListener('lang', f); }, []);
  const toggle = () => { localStorage.lang = l ? 'hi' : 'en'; window.dispatchEvent(new Event('lang')); };
  return { toggle, label: l ? 'हिंदी' : 'EN', t: k => (T[k] || [k, k])[l] };
}
