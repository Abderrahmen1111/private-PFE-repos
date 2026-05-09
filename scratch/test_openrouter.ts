import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.OPENROUTER_API_KEY!;
const model = process.env.OPENROUTER_MODEL!;

async function testModel() {
  console.log(`Testing model: ${model}`);
  console.log(`Using API Key: ${apiKey.slice(0, 15)}...`);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: 'Reply ONLY with: {"test":"ok"}' }],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`✅ SUCCESS! Response: ${data.choices?.[0]?.message?.content}`);
    } else {
      console.log(`❌ ERROR: ${JSON.stringify(data.error, null, 2)}`);
    }
  } catch (e: any) {
    console.log(`❌ EXCEPTION: ${e.message}`);
  }
}

testModel();
