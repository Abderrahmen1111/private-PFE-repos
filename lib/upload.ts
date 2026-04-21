import { supabase } from "@/lib/supabase/browser";
export const uploadToSupabase = async (file: File, storeId: number) => {
  const fileName = `store_${storeId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("reels")
    .upload(fileName, file);

  if (error) throw error;

  return `reels/${fileName}`;
};