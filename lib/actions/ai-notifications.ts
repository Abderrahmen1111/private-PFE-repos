'use server'
import { createClient } from '@/lib/supabase/server'
import { getPersonalizedReels } from './recommendations'
import { createNotification } from './notifications'
/**
 * AI-powered notification engine.
 * Analyzes user preferences and sends a targeted notification 
 * when a highly relevant match is found.
 */
export async function triggerPersonalizedAINotifications() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  try {
    // 1. Get top recommendations for this specific user
    const topReels = await getPersonalizedReels() 
    if (topReels.length === 0) return { success: true, message: 'No new matches found' }
    // 2. Pick the absolute best match (first one in sorted list)
    const bestMatch = topReels[0]
    // 3. Set a high threshold for "Pushworthy" content
    // engagementScore represents the personalization match (Categories, City, etc.)
    if (bestMatch.engagementScore > 100) {  
      // 4. Check if we already sent a recommendation today to avoid spam
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'AI_RECOMMENDATION')
        .gte('created_at', `${today}T00:00:00Z`)
        .limit(1)
      if (existing && existing.length > 0) {
        return { success: true, message: 'Notification already sent today' }
      }
      // 5. Create the smart notification
      const result = await createNotification({
        userId: user.id,
        title: `✨ Spécialement pour vous : ${bestMatch.product}`,
        description: `Nous avons trouvé un article qui correspond exactement à vos goûts chez ${bestMatch.merchantName}.`,
        type: 'AI_RECOMMENDATION',
        link: `/discover?reelId=${bestMatch.id.replace('reel-', '')}`,
        metadata: {
          reelId: bestMatch.id,
          score: bestMatch.engagementScore,
          merchantName: bestMatch.merchantName,
          category: bestMatch.category
        }
      })
      return { success: true, notification: result }
    }
    return { success: true, message: 'Scores below notification threshold' }
  } catch (error) {
    console.error('[AI Notifications] Error:', error)
    return { success: false, error }
  }
}

/**
 * Can be called when user changes preferences or performs 
 * a high-intent search to provide instant recommendation alerts.
 */
export async function triggerInstantRecommendation(category: string) {
    // Logic for immediate notification based on specific category intent
    // (e.g. user just searched for "Wedding Dress" -> notify of top wedding stores)
}
