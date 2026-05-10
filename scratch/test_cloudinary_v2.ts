import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCloudinaryExtended() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = 'ro2ya_reels';
  const fakeImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mP8/5+hEgAH5AIm6cy8AgAAAABJRU5ErkJggg==';
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  console.log('--- Test 1: Upload à la RACINE (sans dossier) ---');
  const fd1 = new URLSearchParams();
  fd1.append('file', fakeImage);
  fd1.append('upload_preset', preset);

  const res1 = await fetch(endpoint, { method: 'POST', body: fd1 });
  const data1 = await res1.json();
  
  if (res1.ok) {
    console.log('✅ Test 1 Réussi ! (Sans dossier)');
  } else {
    console.log('❌ Test 1 Échoué:', data1.error?.message);
  }

  console.log('\n--- Test 2: Upload dans un DOSSIER (products/test) ---');
  const fd2 = new URLSearchParams();
  fd2.append('file', fakeImage);
  fd2.append('upload_preset', preset);
  fd2.append('folder', 'products/test');

  const res2 = await fetch(endpoint, { method: 'POST', body: fd2 });
  const data2 = await res2.json();
  
  if (res2.ok) {
    console.log('✅ Test 2 Réussi ! (Avec dossier)');
  } else {
    console.log('❌ Test 2 Échoué:', data2.error?.message);
    if (data2.error?.message?.includes('slashes')) {
      console.log('\n💡 ANALYSE: Votre preset Cloudinary interdit les slashs dans le paramètre "folder".');
      console.log('ACTION: Nous allons modifier le code pour utiliser des tirets (ex: products-ID).');
    }
  }
}

testCloudinaryExtended();
