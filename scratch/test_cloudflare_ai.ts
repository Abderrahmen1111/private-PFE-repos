import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCloudflareAI() {
  const apiKey = process.env.CLOUDFLARE_AI_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  console.log('--- Diagnostic Cloudflare AI ---');
  console.log('Account ID:', accountId);
  console.log('API Key length:', apiKey?.length);
  console.log('-----------------------------\n');

  if (!apiKey || !accountId) {
    console.error('❌ Error: CLOUDFLARE_AI_KEY or CLOUDFLARE_ACCOUNT_ID missing');
    return;
  }

  const prompt = "A beautiful Tunisian landscape, 8k resolution";
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`;

  try {
    console.log('Calling Cloudflare API...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, num_steps: 4 }),
    });

    if (response.ok) {
      console.log('✅ SUCCESS! Cloudflare AI is working.');
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
    } else {
      const errorText = await response.text();
      console.log('❌ FAILED.');
      console.log('Status:', response.status);
      console.log('Error message:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testCloudflareAI();
