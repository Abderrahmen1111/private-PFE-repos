import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = 'ro2ya_reels';
  
  console.log('--- Diagnostic Cloudinary ---');
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', preset);
  console.log('-----------------------------\n');

  if (!cloudName) {
    console.error('❌ Erreur: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME est manquant dans .env.local');
    return;
  }

  // On simule un upload avec une image bidon (1x1 pixel transparent)
  const fakeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/5+hEgAH5AIm6cy8AgAAAABJRU5ErkJggg==';
  
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  const formData = new URLSearchParams();
  formData.append('file', fakeImage);
  formData.append('upload_preset', preset);

  try {
    console.log('Tentative d\'upload vers:', endpoint);
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCÈS ! Cloudinary est bien configuré.');
      console.log('URL de l\'image:', data.secure_url);
    } else {
      console.log('❌ ÉCHEC de l\'upload.');
      console.log('Code erreur:', response.status);
      console.log('Message Cloudinary:', data.error?.message || 'Erreur inconnue');
      console.log('\nCONSEIL: Vérifiez que le preset "' + preset + '" est bien créé en mode "Unsigned" dans votre console Cloudinary.');
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

testCloudinary();
