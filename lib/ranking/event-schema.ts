import { z } from 'zod'
import type { BehavioralEvent } from './types'

const eventTypeSchema = z.enum([
  'view',
  'scroll',
  'click',
  'search',
  'category_click',
  'contact',
  'save',
  'like',
  'map_click',
  'discount_click',
  'share',
  'watch',
  'purchase',
  'revisit',
])

const itemTypeSchema = z.enum(['business', 'product', 'service', 'reel'])

export const behavioralEventSchema = z.object({
  user_id: z.string().min(1).max(128),
  session_id: z.string().min(1).max(128),
  event_type: eventTypeSchema,
  item_id: z.string().max(128).optional(),
  item_type: itemTypeSchema.optional(),
  category: z.string().max(120).optional(),
  scroll_speed: z.number().finite().optional(),
  watch_time: z.number().finite().optional(),
  distance_km: z.number().finite().optional(),
  has_discount: z.boolean().optional(),
  query_length: z.number().int().nonnegative().optional(),
  price: z.number().finite().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const trackEventsBodySchema = z.union([
  behavioralEventSchema,
  z.array(behavioralEventSchema).min(1).max(100),
  z.object({
    events: z.array(behavioralEventSchema).min(1).max(100),
  }),
])

export function parseTrackEventsBody(body: unknown): BehavioralEvent[] {
  const parsed = trackEventsBodySchema.parse(body)

  if (Array.isArray(parsed)) return parsed
  if ('events' in parsed) return parsed.events
  return [parsed]
}
