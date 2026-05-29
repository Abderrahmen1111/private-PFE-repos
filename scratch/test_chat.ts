import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { parseDarijaPrompt } from '../lib/ai/darija-parser';

async function test() {
  console.log('Testing "salem labas":');
  const res = await parseDarijaPrompt("salem labas");
  console.log('Result:', JSON.stringify(res, null, 2));
}

test();
