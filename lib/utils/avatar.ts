/**
 * lib/utils/avatar.ts
 * Shared utility for formatting avatar URLs on the web.
 */

export function getAvatarUrl(path: string | null | undefined, name: string = 'User'): string {
  if (!path || path === '') {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4F46E5&color=fff&size=200`;
  }
  
  if (path.startsWith('http')) return path;
  
  // Assuming 'avatars' bucket in Supabase storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;
  
  return `${supabaseUrl}/storage/v1/object/public/avatars/${path}`;
}
