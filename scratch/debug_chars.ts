import fs from 'fs';
const content = fs.readFileSync('c:/Users/INFOKOM/Desktop/private-PFE-repos/lib/darija-dictionary.ts', 'utf8');
const lines = content.split('\n');
const nklLine = lines.find(l => l.includes("'nkl'"));
if (nklLine) {
  console.log('Line:', nklLine);
  console.log('Char codes:', Array.from(nklLine).map(c => c.charCodeAt(0)));
} else {
  console.log('nkl not found in file');
}
