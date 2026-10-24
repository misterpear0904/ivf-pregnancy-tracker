import fs from 'node:fs';
import path from 'node:path';

const files = ['README.md', 'DASHBOARD.md', 'CHECKLIST.md', 'FLOW.md'];
const anchors = {};
const slug = s => s.toLowerCase()
  .replace(/<[^>]+>/g, '')
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/^-+|-+$/g, '');

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const a = new Set();
  for (const m of t.matchAll(/^#{1,6}\s+(.+)$/gm)) a.add(slug(m[1]));
  for (const m of t.matchAll(/<a id="([^"]+)"/g)) a.add(m[1]);
  anchors[f] = a;
}

let bad = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    const link = m[2];
    if (/^(https?:|tel:|sms:|mailto:)/.test(link)) continue;
    const [p, hash] = link.split('#');
    const target = p ? path.normalize(p) : f;
    if (p && !fs.existsSync(target)) {
      console.log('MISSING FILE', f, '->', link);
      bad++;
      continue;
    }
    if (hash && anchors[target] && !anchors[target].has(hash)) {
      console.log('MISSING ANCHOR', f, '->', link);
      bad++;
    }
  }
}
console.log(bad ? `BROKEN LINKS: ${bad}` : 'All relative links and anchors resolve.');
process.exitCode = bad ? 1 : 0;
