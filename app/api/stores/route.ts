import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { searchStores } from '@/lib/actions/search'
import { updateStoreProfile } from '@/lib/actions/stores'
import { generateEmbedding } from '@/lib/openrouter-embeddings'
import { searchUnified } from '@/lib/actions/addbuss'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const directory = searchParams.get('directory') === 'true'

  try {
    if (directory) {
      const results = await searchUnified(query)
      return NextResponse.json(results)
    }
    const results = await searchStores(query, location)
    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, ...data } = await request.json()
    
    // Security check: Verify ownership
    const { data: store } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!store || store.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { success, error } = await updateStoreProfile(id, data)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Store updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let body: any = {}

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        body[key] = value
      }
    } else {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 })
    }

    const name = body.companyName
    const email = body.companyEmail
    const rne = body.rne
    const website = body.companyWebsite
    const address = body.companyAddress
    const city = body.location
    const description = body.description
    const phone = body.phone
    const category = body.category
    const directoryId = body.directoryId
    const serviceDirectoryId = body.serviceDirectoryId
    const businessType = body.businessType || 'BUSINESS'
    const isCreateMode = String(body.isCreateMode) === 'true'
    const googlePlaceId = body.googlePlaceId
    const lat = parseFloat(body.lat) || 0
    const lng = parseFloat(body.lng) || 0

    if (!name || !email || !city || !phone || !category) {
      return NextResponse.json({ error: 'Veuillez remplir tous les champs obligatoires.' }, { status: 400 })
    }

    if (businessType === 'BUSINESS' && !rne) {
      return NextResponse.json({ error: 'Le RNE est obligatoire pour un business.' }, { status: 400 })
    }

    const slug = generateSlug(name)

    // Handle logo upload
    let logoUrl: string | null = null
    if (body.logoBase64 && typeof body.logoBase64 === 'string') {
      const matches = body.logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64')
        const fileExt = matches[1].split('/')[1] || 'png'
        const filePath = `${user.id}/${slug}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('store-images')
          .upload(filePath, buffer, { contentType: matches[1], upsert: true })
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('store-images').getPublicUrl(uploadData.path)
          logoUrl = publicUrl
        }
      }
    } else if (body.logo && typeof body.logo !== 'string') {
      // Assuming it's a File object from FormData
      const fileExt = body.logo.name?.split('.').pop() || 'png'
      const filePath = `${user.id}/${slug}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(filePath, body.logo, { cacheControl: '3600', upsert: true })
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('store-images').getPublicUrl(uploadData.path)
        logoUrl = publicUrl
      }
    }

    // Handle justificatif upload
    let justificatifUrl: string | null = null
    if (body.justificatifBase64 && typeof body.justificatifBase64 === 'string') {
       const matches = body.justificatifBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
       if (matches && matches.length === 3) {
         const buffer = Buffer.from(matches[2], 'base64')
         const fileExt = matches[1].split('/')[1] || 'png'
         const filePath = `${user.id}/justificatif-${slug}.${fileExt}`
         const { data: uploadData, error: uploadError } = await supabase.storage
           .from('store-images')
           .upload(filePath, buffer, { contentType: matches[1], upsert: true })
         if (!uploadError && uploadData) {
           const { data: { publicUrl } } = supabase.storage.from('store-images').getPublicUrl(uploadData.path)
           justificatifUrl = publicUrl
         }
       }
    } else if (body.justificatif && typeof body.justificatif !== 'string') {
      const fileExt = body.justificatif.name?.split('.').pop() || 'png'
      const filePath = `${user.id}/justificatif-${slug}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(filePath, body.justificatif, { cacheControl: '3600', upsert: true })
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('store-images').getPublicUrl(uploadData.path)
        justificatifUrl = publicUrl
      }
    }

    // Update user role to PRO
    await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      role: 'PRO',
      full_name: user.user_metadata?.full_name || user.email,
      updated_at: new Date().toISOString()
    } as any)

    let finalDirectoryId: number | null = directoryId ? parseInt(directoryId) : null
    let finalServiceId: number | null = serviceDirectoryId ? parseInt(serviceDirectoryId) : null

    // Generate Embedding
    const textToEmbed = `${name} ${description || ''} ${category}`
    const embedding = await generateEmbedding(textToEmbed).catch(() => null)

    if (isCreateMode) {
        if (businessType === 'BUSINESS') {
            const { data: dirEntry, error: dirError } = await (supabase as any)
                .from('business_directory_tunisia')
                .insert({
                    title: name,
                    city,
                    phone,
                    full_address: address || '',
                    place_id: googlePlaceId || null,
                    latitude: lat,
                    longitude: lng,
                    vitrine_category: category,
                    is_claimed: true,
                    claimed_by: user.id,
                    data_source: 'user_created',
                    website: website || null,
                    description: description || null,
                    embedding,
                })
                .select('id')
                .single()

            if (dirError) return NextResponse.json({ error: `Erreur lors de la création: ${dirError.message}` }, { status: 400 })
            finalDirectoryId = dirEntry.id
        } else {
            const { data: serviceEntry, error: svcError } = await (supabase as any)
                .from('service_directory')
                .insert({
                    name,
                    slug,
                    category,
                    phone,
                    address: address || '',
                    city,
                    owner_id: user.id,
                    latitude: lat,
                    longitude: lng,
                    status: 'ACTIVE',
                    description: description || null,
                    embedding,
                })
                .select('service_id')
                .single()

            if (svcError) return NextResponse.json({ error: `Erreur création service: ${svcError.message}` }, { status: 400 })
            finalServiceId = serviceEntry.service_id
        }
    } else if (googlePlaceId && !finalDirectoryId) {
        const { data: dirEntry, error: dirError } = await (supabase as any)
            .from('business_directory_tunisia')
            .insert({
                title: name,
                city,
                phone,
                full_address: address || '',
                place_id: googlePlaceId,
                latitude: lat,
                longitude: lng,
                vitrine_category: category,
                is_claimed: true,
                claimed_by: user.id,
                data_source: 'google_maps',
                website: website || null,
            })
            .select('id')
            .single()

        if (dirError) return NextResponse.json({ error: `Erreur réclamation: ${dirError.message}` }, { status: 400 })
        finalDirectoryId = dirEntry.id
    }

    const storeInsert: any = {
        owner_id: user.id,
        name,
        slug,
        description: description || null,
        category: category as any,
        phone,
        email,
        website: website || null,
        address: address || '',
        latitude: lat,
        longitude: lng,
        city,
        logo_url: logoUrl,
        rne: rne || null,
        business_registration: rne || null,
        status: 'PENDING',
        embedding,
    }

    if (finalDirectoryId) {
        storeInsert.business_directory_id = finalDirectoryId
        storeInsert.id_business = finalDirectoryId
    }
    if (finalServiceId) {
        storeInsert.service_id = finalServiceId
    }
    if (justificatifUrl) {
        storeInsert.business_license_url = justificatifUrl
    }

    const { data: storeData, error: insertError } = await (supabase as any)
        .from('stores')
        .insert(storeInsert)
        .select('id')
        .single()

    if (insertError) return NextResponse.json({ error: `Erreur lors de l'ajout: ${insertError.message}` }, { status: 400 })

    await supabase.auth.updateUser({ data: { role: 'business_owner' } })

    if (finalDirectoryId && storeData?.id) {
        await (supabase as any)
            .from('business_directory_tunisia')
            .update({ store_id: storeData.id })
            .eq('id', finalDirectoryId)
    }

    return NextResponse.json({ success: true, storeId: storeData.id })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
