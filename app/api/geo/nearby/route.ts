import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius') || '5000'; // Default 5km

    if (!latStr || !lngStr) {
        return NextResponse.json({ error: 'Missing lat or lng parameter' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = parseFloat(radiusStr);

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        return NextResponse.json({ error: 'Invalid coordinates or radius' }, { status: 400 });
    }

    const supabase = createClient();

    try {
        // Call the PostGIS RPC function created in Supabase
        const { data, error } = await (supabase.rpc as any)('get_nearby_stores', {
            search_lat: lat,
            search_lng: lng,
            radius_meters: radius
        });

        if (error) throw error;

        return NextResponse.json({
            results: data,
            count: data ? data.length : 0
        });

    } catch (error: any) {
        console.error('Nearby search error:', error);
        return NextResponse.json({ error: 'Failed to search nearby locations', details: error.message }, { status: 500 });
    }
}
