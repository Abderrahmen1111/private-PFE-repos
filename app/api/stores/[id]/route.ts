import { NextResponse } from 'next/server'
import { getStoreById } from '@/lib/actions/stores'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const { data, error } = await getStoreById(id)
    
    if (error) {
      return NextResponse.json({ error }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
