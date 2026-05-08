import { NextResponse } from 'next/server';

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
        return NextResponse.json({ error: 'Missing lat or lng parameter' }, { status: 400 });
    }

    if (!GEOAPIFY_API_KEY) {
        console.error('Missing GEOAPIFY_API_KEY');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    try {
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Geoapify API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            
            // Format for Tunisia: "Wilaya de [state], Délégation de [county/city]"
            const wilaya = result.state || result.region || 'Inconnue';
            const delegation = result.county || result.city || result.suburb || 'Inconnue';
            
            const formattedAddress = `Wilaya de ${wilaya}, Délégation de ${delegation}`;
            
            return NextResponse.json({
                formatted_address: formattedAddress,
                raw_data: result
            });
        }

        return NextResponse.json({ formatted_address: 'Adresse non trouvée', raw_data: null });

    } catch (error) {
        console.error('Reverse Geocoding error:', error);
        return NextResponse.json({ error: 'Failed to reverse geocode' }, { status: 500 });
    }
}
