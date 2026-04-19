import { NextResponse } from 'next/server';

export function checkAdminAuth(request: Request): NextResponse | null {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing API Key' }, { status: 401 });
  }
  
  return null; // Passes verification
}
