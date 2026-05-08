import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
// Bounding box for Tunisia (approx): min_lon, min_lat, max_lon, max_lat
const TUNISIA_BBOX = '7.522,30.230,11.598,37.340';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text) {
        return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    if (!GEOAPIFY_API_KEY) {
        console.error('Missing GEOAPIFY_API_KEY');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient();
    const queryKey = text.toLowerCase().trim();

    try {
        // 1. Check Cache
        const { data: cachedData } = await (supabase as any)
            .from('geo_cache')
            .select('data, created_at')
            .eq('query', queryKey)
            .single();

        if (cachedData) {
            const createdAt = new Date(cachedData.created_at).getTime();
            const now = new Date().getTime();
            const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

            // Return cached data if less than 24 hours old
            if (hoursDiff < 24) {
                return NextResponse.json(cachedData.data);
            } else {
                // Delete old cache entry
                await (supabase as any).from('geo_cache').delete().eq('query', queryKey);
            }
        }

        // 2. Call Geoapify API
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&filter=rect:${TUNISIA_BBOX}&limit=5&apiKey=${GEOAPIFY_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Geoapify API error: ${response.status}`);
        }

        const data = await response.json();

        // 3. Save to Cache
        if (data.features && data.features.length > 0) {
            await (supabase as any).from('geo_cache').insert({
                query: queryKey,
                data: data
            });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 });
    }
}
