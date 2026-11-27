const clean = p => { p = String(p || '').replace(/\D/g, ''); return p.length === 10 ? '91' + p : p; };
export const link = (phone, text) => `https://wa.me/${clean(phone)}?text=${encodeURIComponent(text)}`;
const S = s => s || 'Sharda Adarsh Inter College';
export const admissionMsg = (l, school) => `🙏 नमस्ते / Hello ${S(school)}\n\n📝 प्रवेश पूछताछ / Admission Enquiry\nछात्र / Student: ${l.name}\nपिता / Father: ${l.father || '-'}\nकक्षा / Class: ${l.cls}\nमोबाइल / Mobile: ${l.phone}\n\nकृपया प्रवेश की जानकारी दें।\nPlease share admission details.`;
export const absentMsg = (name, date, school) => `🙏 नमस्ते,\n\n${S(school)}\n⚠️ आपका बच्चा *${name}* आज (${date}) विद्यालय में अनुपस्थित है।\nYour ward *${name}* was ABSENT today (${date}).\n\nकृपया कारण बताएं / Please inform the reason.`;
export const feeMsg = (name, due, school) => `🙏 नमस्ते,\n\n${S(school)}\n💰 *${name}* की ₹${due} फीस बकाया है।\nFee due for *${name}*: ₹${due}.\n\nकृपया शीघ्र जमा करें / Kindly pay at the earliest. धन्यवाद।`;
export const noticeMsg = (n, school) => `📢 *${S(school)}*\n\n*${n.title}*\n${n.body || ''}\n\n— प्रधानाचार्य / Principal`;
