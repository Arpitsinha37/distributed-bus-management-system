const fs = require('fs');
const path = require('path');
const dashboardPath = path.join(__dirname, 'admin-panel/src/app/dashboard');
const sections = fs.readdirSync(dashboardPath).filter(f => fs.statSync(path.join(dashboardPath, f)).isDirectory() && fs.existsSync(path.join(dashboardPath, f, 'page.tsx')));
const filesToCheck = sections.map(s => ({ section: s, file: path.join(dashboardPath, s, 'page.tsx') }));
filesToCheck.unshift({ section: 'CounterBookingModal', file: path.join(__dirname, 'admin-panel/src/components/CounterBookingModal.tsx') });
console.log('| Section | Status | Evidence |');
console.log('|---|---|---|');
for (const { section, file } of filesToCheck) {
  const content = fs.readFileSync(file, 'utf-8');
  let status = 'MOCKED';
  let evidence = 'No API import found';
  const lines = content.split('\n');
  const liveLines = lines.filter(l => !l.includes('import ') && (l.includes('apiGet') || l.includes('apiPost') || l.includes('apiPatch') || l.includes('apiDelete') || l.includes('authFetch') || l.includes('axios.get') || l.includes('fetch(') || (l.includes('axios') && !l.includes('import'))));
  if (liveLines.length > 0) {
    status = 'LIVE';
    evidence = liveLines[0].trim().substring(0, 80);
  } else {
    const useStateLine = lines.find(l => l.includes('useState([') || l.includes('useState<{') || l.includes('const mock') || l.includes('data = ['));
    if (useStateLine) evidence = useStateLine.trim().substring(0, 80);
  }
  const commentedApiLines = lines.filter(l => l.trim().startsWith('//') && (l.includes('apiGet') || l.includes('apiPost') || l.includes('fetch')));
  if (commentedApiLines.length > 0 && status !== 'LIVE') {
      status = 'MOCKED (Commented API)';
      evidence = commentedApiLines[0].trim().substring(0, 80);
  }
  console.log(`| ${section} | ${status} | \`${evidence.replace(/`/g, "'")}\` |`);
}
