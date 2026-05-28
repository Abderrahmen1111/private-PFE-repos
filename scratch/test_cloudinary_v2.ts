import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCloudinaryFormData() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = 'ro2ya_reels';
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  console.log('--- Test 4: Upload with FormData and Blob ---');
  
  // Create a dummy 1x1 pixel transparent PNG buffer
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/5+hEgAH5AIm6cy8AgAAAABJRU5ErkJggg==', 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });

  const fd = new FormData();
  fd.append('file', blob, 'image.png');
  fd.append('upload_preset', preset);
  fd.append('public_id', `ai_val_formdata_${Date.now()}`);

  try {
    const res = await fetch(endpoint, { method: 'POST', body: fd });
    const data = await res.json();
    
    if (res.ok) {
      console.log('✅ Test 4 Réussi ! Image URL:', data.secure_url);
    } else {
      console.log('❌ Test 4 Échoué:', data.error?.message || data);
    }
  } catch (err: any) {
    console.error('Exception caught:', err);
  }
}

testCloudinaryFormData();
