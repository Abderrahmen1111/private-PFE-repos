import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  // Create a 1.2MB dummy buffer
  const size = 1.2 * 1024 * 1024;
  const buffer = Buffer.alloc(size, 'a');
  const filePath = `ai-generated/test-large-${Date.now()}.png`;

  console.log('Uploading large buffer...', filePath, `${size} bytes`);
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload failed with error:', error);
    } else {
      console.log('Upload success! Data:', data);
    }
  } catch (err: any) {
    console.error('Exception caught during upload:', err);
  }
}

testUpload();
