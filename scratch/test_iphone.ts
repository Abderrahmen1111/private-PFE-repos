import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { parseDarijaPrompt } from '../lib/ai/darija-parser';

async function test() {
  console.log('Testing "iphone 17":');
  const res = await parseDarijaPrompt("iphone 17");
  console.log('Result:', JSON.stringify(res, null, 2));
}

test();
