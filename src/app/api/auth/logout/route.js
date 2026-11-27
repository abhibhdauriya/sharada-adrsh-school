import { cookies } from 'next/headers';
import { json } from '@/lib/auth';
export async function POST() { cookies().delete('sess'); return json({ ok: true }); }
