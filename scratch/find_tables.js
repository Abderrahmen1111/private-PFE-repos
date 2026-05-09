import fs from 'fs';

const content = fs.readFileSync('c:/Users/INFOKOM/Desktop/private-PFE-repos/types/supabase.ts', 'utf8');

const tableRegex = /(\w+): {\s+Row: {[^}]+?(store_id|merchant_id):/g;
let match;
const tables = [];

while ((match = tableRegex.exec(content)) !== null) {
    tables.push(match[1]);
}

console.log('Tables with store_id or merchant_id:');
console.log([...new Set(tables)].sort());
