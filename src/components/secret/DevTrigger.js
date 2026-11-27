'use client';
import { useEffect } from 'react';
// Invisible: Ctrl+Shift+D (desktop) or 5 taps on footer copyright within 3s (mobile)
export default function DevTrigger() {
  useEffect(() => {
    let taps = [];
    const go = () => { window.location.href = '/dev-vault'; };
    const key = e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') { e.preventDefault(); go(); } };
    const tap = e => {
      if (!e.target.closest('[data-dev-tap]')) return;
      const n = Date.now(); taps = [...taps.filter(t => n - t < 3000), n];
      if (taps.length >= 5) go();
    };
    window.addEventListener('keydown', key); window.addEventListener('click', tap);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('click', tap); };
  }, []);
  return null;
}
