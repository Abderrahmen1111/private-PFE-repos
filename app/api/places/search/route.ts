import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/places/search?q=name&country=TN
 * 
 * Proxy sécurisé pour Google Places API.
 * - La clé API reste côté serveur
 * - Vérifie les doublons via place_id dans business_directory_tunisia
 * - Retourne max 5 résultats avec photos
 */

export interface PlaceResult {
    place_id: string
    name: string
    formatted_address: string
    lat: number
    lng: number
    phone?: string
    rating?: number
    photo_url?: string
    types?: string[]
    business_status?: string
    already_in_db: boolean
    db_id?: number // Si déjà dans la DB, l'ID du record
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const country = searchParams.get('country') || 'TN'

    if (!query || query.length < 3) {
        return NextResponse.json([], { status: 200 })
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
        console.error('GOOGLE_PLACES_API_KEY is not set')
        return NextResponse.json([], { status: 200 })
    }

    try {
        // 1. Appeler Google Places Text Search API
        const googleUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
        googleUrl.searchParams.set('query', query)
        googleUrl.searchParams.set('region', country.toLowerCase())
        googleUrl.searchParams.set('key', apiKey)
        // Limiter à la Tunisie
        googleUrl.searchParams.set('location', '34.0,9.0') // Centre de la Tunisie
        googleUrl.searchParams.set('radius', '500000') // 500km

        const googleRes = await fetch(googleUrl.toString(), {
            next: { revalidate: 300 } // Cache 5 min
        })
        const googleData = await googleRes.json()

        if (googleData.status !== 'OK' && googleData.status !== 'ZERO_RESULTS') {
            console.error('Google Places error:', googleData.status, googleData.error_message)
            return NextResponse.json([], { status: 200 })
        }

        const rawResults = (googleData.results || []).slice(0, 5)

        // 2. Extraire les place_ids pour vérifier les doublons
        const placeIds = rawResults.map((r: any) => r.place_id).filter(Boolean)

        let dbMatches: Record<string, number> = {}

        if (placeIds.length > 0) {
            const supabase = createClient()
            const { data: existingPlaces } = await (supabase as any)
                .from('business_directory_tunisia')
                .select('id, place_id')
                .in('place_id', placeIds)

            if (existingPlaces) {
                existingPlaces.forEach((p: any) => {
                    dbMatches[p.place_id] = p.id
                })
            }
        }

        // 3. Construire les résultats avec photo et flag already_in_db
        const results: PlaceResult[] = rawResults.map((place: any) => {
            let photo_url: string | undefined
            if (place.photos && place.photos.length > 0) {
                const photoRef = place.photos[0].photo_reference
                photo_url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${photoRef}&key=${apiKey}`
            }

            return {
                place_id: place.place_id,
                name: place.name,
                formatted_address: place.formatted_address || '',
                lat: place.geometry?.location?.lat || 0,
                lng: place.geometry?.location?.lng || 0,
                rating: place.rating || null,
                photo_url,
                types: place.types || [],
                business_status: place.business_status || null,
                already_in_db: place.place_id in dbMatches,
                db_id: dbMatches[place.place_id] || undefined,
            }
        })

        return NextResponse.json(results, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=300', // Cache 5 min
            }
        })
    } catch (error) {
        console.error('Places search error:', error)
        return NextResponse.json([], { status: 200 })
    }
}
