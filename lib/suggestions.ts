import { createClient } from './supabase/server';

export interface UserSuggestion {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  role: 'CLIENT' | 'PRO' | 'ADMIN';
  friendship?: {
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
    direction: 'SENT' | 'RECEIVED';
  } | null;
}

export async function getFriendSuggestions(): Promise<UserSuggestion[]> {
  const supabase = createClient();
  
  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Error fetching current user:', authError);
    return [];
  }

  try {
    // 2. Query users who are NOT the current user
    // We remove the exclusion of messaged users because now we care about friendship status
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, city, role')
      .neq('id', user.id)
      .limit(20);

    if (suggestionsError) throw suggestionsError;

    // 3. For these users, fetch any friendship records involving the current user
    const userIds = (suggestions as any[]).map(s => s.id);
    const { data: friendshipRecords, error: friendshipError } = await (supabase.from('friendships') as any)
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.in.(${userIds.join(',')})),and(friend_id.eq.${user.id},user_id.in.(${userIds.join(',')}))`);

    if (friendshipError) throw friendshipError;

    // 4. Merge friendship status into suggestions
    const enhancedSuggestions = (suggestions as any[]).map(s => {
      const record = (friendshipRecords as any[])?.find(r => 
        (r.user_id === user.id && r.friend_id === s.id) || 
        (r.friend_id === user.id && r.user_id === s.id)
      );

      return {
        ...s,
        friendship: record ? {
          status: record.status,
          direction: record.user_id === user.id ? 'SENT' : 'RECEIVED'
        } : null
      };
    });

    return enhancedSuggestions;
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    return [];
  }
}
