# Walkthrough — Formulaire Add Business Enhanced

## Fichiers créés/modifiés

### 1. [NEW] API Route — Google Places Proxy
**[route.ts](file:///c:/Users/INFOKOM/Desktop/private-PFE-repos/app/api/places/search/route.ts)**
- Endpoint : `GET /api/places/search?q=nom&country=TN`
- Proxifie les appels à Google Places Text Search API (clé API côté serveur)
- Vérifie les doublons via `place_id` dans `business_directory_tunisia`
- Retourne max 5 résultats avec photos, coordonnées, et flag `already_in_db`
- Cache navigateur de 5 minutes

### 2. [MODIFY] Server Action — Add Business
**[addbuss.ts](file:///c:/Users/INFOKOM/Desktop/private-PFE-repos/lib/actions/addbuss.ts)**

```diff:addbuss.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mockBusinessDirectory } from '@/lib/mock-data'

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now()
}

export async function searchBusinessDirectory(queryStr: string) {
    if (!queryStr || queryStr.length < 2) return [];

    const supabase = createClient();

    // Broaden search to include title, categoryName and vitrine_category
    const { data, error } = await supabase
        .from('business_directory_tunisia' as any)
        .select('id, title, city, phone, full_address, vitrine_category, is_claimed, categoryName')
        .or(`title.ilike.%${queryStr}%,categoryName.ilike.%${queryStr}%,vitrine_category.ilike.%${queryStr}%`)
        .limit(5);

    if (error) {
        console.error('Search error:', error);
        return [];
    }

    return (data as any[]) || [];
}

export async function addBusiness(formData: FormData) {
    const supabase = createClient()

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Vous devez être connecté pour ajouter un business.' }
    }

    // Extract form fields
    const name = formData.get('companyName') as string
    const email = formData.get('companyEmail') as string
    const rne = formData.get('rne') as string
    const website = formData.get('companyWebsite') as string
    const address = formData.get('companyAddress') as string
    const city = formData.get('location') as string
    const description = formData.get('description') as string
    const phone = formData.get('phone') as string
    const category = formData.get('category') as string
    const directoryId = formData.get('directoryId') as string // For linking to business_directory_tunisia

    // Validation
    if (!name || !email || !rne || !city || !phone || !category) {
        return { error: 'Veuillez remplir tous les champs obligatoires.' }
    }

    const slug = generateSlug(name)

    // Handle logo upload
    let logoUrl: string | null = null
    const logoFile = formData.get('logo') as File | null

    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const filePath = `${user.id}/${slug}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('store-images')
            .upload(filePath, logoFile, { cacheControl: '3600', upsert: true })

        if (uploadError) {
            return { error: `Erreur lors de l'upload du logo: ${uploadError.message}` }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('store-images')
            .getPublicUrl(uploadData.path)

        logoUrl = publicUrl
    }

    // 1. Upgrade user role to 'PRO' in public.users
    // This MUST happen before store insertion due to foreign key constraints
    const { error: userUpdateError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            email: user.email,
            role: 'PRO',
            full_name: user.user_metadata?.full_name || user.email,
            updated_at: new Date().toISOString()
        } as any)

    if (userUpdateError) {
        console.error('Error updating public user role:', userUpdateError)
        return { error: `Erreur lors de la mise à jour de l'utilisateur: ${userUpdateError.message}` }
    }

    // Insert into stores table
    const { data: storeData, error: insertError } = await (supabase as any)
        .from('stores')
        .insert({
            owner_id: user.id,
            name,
            slug,
            description: description || null,
            category: category as any,
            phone,
            email,
            website: website || null,
            address: address || '',
            latitude: 0,
            longitude: 0,
            city,
            logo_url: logoUrl,
            rne: rne,
            business_registration: rne,
            business_directory_id: directoryId ? parseInt(directoryId) : null,
            id_business: directoryId ? parseInt(directoryId) : null,
            status: 'PENDING',
        })
        .select('id')
        .single() as any

    if (insertError) {
        return { error: `Erreur lors de l'ajout: ${insertError.message}` }
    }

    // 2. Update auth metadata role to 'business_owner'
    const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'business_owner' }
    })

    if (metadataError) {
        console.error('Error updating auth metadata:', metadataError)
    }

    revalidatePath('/', 'layout')
    revalidatePath('/')

    // Redirect to the new dynamic dashboard!
    if (storeData?.id) {
        redirect(`/dashboard/${storeData.id}`)
    } else {
        redirect('/')
    }
}
===
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UnifiedSearchResult {
    source: 'business_directory' | 'service_directory'
    id: number
    name: string
    city: string
    phone: string | null
    address: string | null
    category: string | null
    is_claimed: boolean
    place_id: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now()
}

// ─── Recherche unifiée (DB locale + Service Directory) ────────────────────────

export async function searchUnified(queryStr: string): Promise<UnifiedSearchResult[]> {
    if (!queryStr || queryStr.length < 2) return []
    
    const supabase = createClient()
    
    // Recherche parallèle dans les deux directories
    const [bizRes, svcRes] = await Promise.all([
        (supabase as any)
            .from('business_directory_tunisia')
            .select('id, title, city, phone, full_address, vitrine_category, is_claimed, place_id')
            .or(`title.ilike.%${queryStr}%,categoryName.ilike.%${queryStr}%,vitrine_category.ilike.%${queryStr}%`)
            .limit(5),
        (supabase as any)
            .from('service_directory')
            .select('service_id, name, city, phone, address, category')
            .or(`name.ilike.%${queryStr}%,category.ilike.%${queryStr}%`)
            .eq('status', 'ACTIVE')
            .limit(5)
    ])
    
    const results: UnifiedSearchResult[] = []
    
    if (bizRes.data) {
        bizRes.data.forEach((biz: any) => {
            results.push({
                source: 'business_directory',
                id: biz.id,
                name: biz.title,
                city: biz.city,
                phone: biz.phone,
                address: biz.full_address,
                category: biz.vitrine_category,
                is_claimed: biz.is_claimed || false,
                place_id: biz.place_id || null,
            })
        })
    }
    
    if (svcRes.data) {
        svcRes.data.forEach((svc: any) => {
            results.push({
                source: 'service_directory',
                id: svc.service_id,
                name: svc.name,
                city: svc.city,
                phone: svc.phone,
                address: svc.address,
                category: svc.category,
                is_claimed: false, // Services don't have is_claimed
                place_id: null,
            })
        })
    }
    
    return results
}

// ─── Ancienne recherche (conservée pour compatibilité) ────────────────────────

export async function searchBusinessDirectory(queryStr: string) {
    if (!queryStr || queryStr.length < 2) return [];

    const supabase = createClient();

    const { data, error } = await supabase
        .from('business_directory_tunisia' as any)
        .select('id, title, city, phone, full_address, vitrine_category, is_claimed, categoryName')
        .or(`title.ilike.%${queryStr}%,categoryName.ilike.%${queryStr}%,vitrine_category.ilike.%${queryStr}%`)
        .limit(5);

    if (error) {
        console.error('Search error:', error);
        return [];
    }

    return (data as any[]) || [];
}

// ─── Ajout Business/Service (version améliorée) ──────────────────────────────

export async function addBusiness(formData: FormData) {
    const supabase = createClient()

    // 1. Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Vous devez être connecté pour ajouter un business.' }
    }

    // 2. Extraire les champs du formulaire
    const name = formData.get('companyName') as string
    const email = formData.get('companyEmail') as string
    const rne = formData.get('rne') as string
    const website = formData.get('companyWebsite') as string
    const address = formData.get('companyAddress') as string
    const city = formData.get('location') as string
    const description = formData.get('description') as string
    const phone = formData.get('phone') as string
    const category = formData.get('category') as string
    const directoryId = formData.get('directoryId') as string
    const serviceDirectoryId = formData.get('serviceDirectoryId') as string

    // Nouveaux champs
    const businessType = (formData.get('businessType') as string) || 'BUSINESS'
    const isCreateMode = formData.get('isCreateMode') === 'true'
    const googlePlaceId = formData.get('googlePlaceId') as string
    const lat = parseFloat(formData.get('lat') as string) || 0
    const lng = parseFloat(formData.get('lng') as string) || 0

    // 3. Validation
    if (!name || !email || !city || !phone || !category) {
        return { error: 'Veuillez remplir tous les champs obligatoires.' }
    }

    // RNE obligatoire seulement pour les Business, pas les Services
    if (businessType === 'BUSINESS' && !rne) {
        return { error: 'Le RNE est obligatoire pour un business.' }
    }

    const slug = generateSlug(name)

    // 4. Upload du logo
    let logoUrl: string | null = null
    const logoFile = formData.get('logo') as File | null

    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const filePath = `${user.id}/${slug}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('store-images')
            .upload(filePath, logoFile, { cacheControl: '3600', upsert: true })

        if (uploadError) {
            return { error: `Erreur lors de l'upload du logo: ${uploadError.message}` }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('store-images')
            .getPublicUrl(uploadData.path)

        logoUrl = publicUrl
    }

    // Upload pièce justificative (pour les Services)
    let justificatifUrl: string | null = null
    const justificatifFile = formData.get('justificatif') as File | null

    if (justificatifFile && justificatifFile.size > 0) {
        const fileExt = justificatifFile.name.split('.').pop()
        const filePath = `${user.id}/justificatif-${slug}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('store-images')
            .upload(filePath, justificatifFile, { cacheControl: '3600', upsert: true })

        if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
                .from('store-images')
                .getPublicUrl(uploadData.path)
            justificatifUrl = publicUrl
        }
    }

    // 5. Mettre à jour le rôle utilisateur → PRO
    const { error: userUpdateError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            email: user.email,
            role: 'PRO',
            full_name: user.user_metadata?.full_name || user.email,
            updated_at: new Date().toISOString()
        } as any)

    if (userUpdateError) {
        console.error('Error updating public user role:', userUpdateError)
        return { error: `Erreur lors de la mise à jour de l'utilisateur: ${userUpdateError.message}` }
    }

    // ─── Logique selon le mode ───────────────────────────────────────────

    let finalDirectoryId: number | null = directoryId ? parseInt(directoryId) : null
    let finalServiceId: number | null = serviceDirectoryId ? parseInt(serviceDirectoryId) : null

    if (isCreateMode) {
        // ─── Mode CRÉATION : insérer dans la directory puis dans stores ───

        if (businessType === 'BUSINESS') {
            // Insérer dans business_directory_tunisia
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
                })
                .select('id')
                .single()

            if (dirError) {
                console.error('Error creating directory entry:', dirError)
                return { error: `Erreur lors de la création: ${dirError.message}` }
            }

            finalDirectoryId = dirEntry.id

        } else {
            // Insérer dans service_directory
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
                })
                .select('service_id')
                .single()

            if (svcError) {
                console.error('Error creating service entry:', svcError)
                return { error: `Erreur lors de la création du service: ${svcError.message}` }
            }

            finalServiceId = serviceEntry.service_id
        }

    } else if (googlePlaceId && !finalDirectoryId) {
        // ─── Mode RÉCLAMATION Google Maps (pas encore dans la DB) ─────────

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

        if (dirError) {
            console.error('Error creating GM directory entry:', dirError)
            return { error: `Erreur lors de la réclamation: ${dirError.message}` }
        }

        finalDirectoryId = dirEntry.id
    }

    // ─── 6. Insérer dans stores ──────────────────────────────────────────

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
    }

    // Lier selon le type
    if (finalDirectoryId) {
        storeInsert.business_directory_id = finalDirectoryId
        storeInsert.id_business = finalDirectoryId
    }
    if (finalServiceId) {
        storeInsert.service_id = finalServiceId
    }

    // Stocker la pièce justificative
    if (justificatifUrl) {
        storeInsert.business_license_url = justificatifUrl
    }

    const { data: storeData, error: insertError } = await (supabase as any)
        .from('stores')
        .insert(storeInsert)
        .select('id')
        .single()

    if (insertError) {
        return { error: `Erreur lors de l'ajout: ${insertError.message}` }
    }

    // 7. Mettre à jour les métadonnées d'auth
    const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'business_owner' }
    })

    if (metadataError) {
        console.error('Error updating auth metadata:', metadataError)
    }

    // 8. Lier le store_id dans le directory si création
    if (finalDirectoryId && storeData?.id) {
        await (supabase as any)
            .from('business_directory_tunisia')
            .update({ store_id: storeData.id })
            .eq('id', finalDirectoryId)
    }

    revalidatePath('/', 'layout')
    revalidatePath('/')

    // 9. Redirection
    if (storeData?.id) {
        redirect(`/dashboard/${storeData.id}`)
    } else {
        redirect('/')
    }
}

```

Nouvelles fonctionnalités :
- `searchUnified(query)` — Recherche parallèle dans `business_directory_tunisia` + `service_directory`
- `addBusiness(formData)` — Étendu avec 3 modes :
  - **Réclamation DB** : flow existant conservé
  - **Réclamation Google Maps** : insère dans `business_directory_tunisia` puis crée le store
  - **Création inline** : insère dans la directory cible (business ou service) puis crée le store
- RNE optionnel pour les Services (utilise pièce justificative à la place)
- Upload pièce justificative → stockée dans `business_license_url`

### 3. [MODIFY] Page — Add Business Form
**[page.tsx](file:///c:/Users/INFOKOM/Desktop/private-PFE-repos/app/merchants/business/add/page.tsx)**

```diff:page.tsx
'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Search, CheckCircle, ExternalLink, PlusCircle } from 'lucide-react';
import { addBusiness, searchBusinessDirectory } from '@/lib/actions/addbuss';

export default function AddBusinessPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Predictive search state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    rne: '',
    companyWebsite: '',
    companyAddress: '',
    location: '',
    description: '',
    phone: '',
    category: '',
    directoryId: '',
    logo: null as File | null,
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [characterCount, setCharacterCount] = useState(0);

  // Debounced search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.companyName.length >= 2) {
        setIsSearching(true);
        const results = await searchBusinessDirectory(formData.companyName);
        setSuggestions(results);
        setIsSearching(false);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.companyName]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFormData({ ...formData, description: text });
    setCharacterCount(text.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('companyName', formData.companyName);
      fd.append('companyEmail', formData.companyEmail);
      fd.append('rne', formData.rne);
      fd.append('companyWebsite', formData.companyWebsite);
      fd.append('companyAddress', formData.companyAddress);
      fd.append('location', formData.location);
      fd.append('description', formData.description);
      fd.append('phone', formData.phone);
      fd.append('category', formData.category);
      if (formData.directoryId) {
        fd.append('directoryId', formData.directoryId);
      }
      if (formData.logo) {
        fd.append('logo', formData.logo);
      }

      const result = await addBusiness(fd);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Info</h1>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors">
                    Browse
                  </div>
                </label>
              </div>
            </div>

            {/* Company Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    onFocus={() => formData.companyName.length >= 2 && setShowSuggestions(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />

                  {/* Suggestions List */}
                  {showSuggestions && (formData.companyName.length >= 2) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Searching...
                        </div>
                      ) : (
                        <>
                          {suggestions.map((biz) => (
                            <div key={biz.id} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{biz.title}</p>
                                <p className="text-xs text-gray-500 truncate">{biz.city}</p>
                              </div>

                              {biz.is_claimed ? (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded flex items-center gap-1 shrink-0">
                                  <CheckCircle className="w-3 h-3" />
                                  DÉJÀ RÉCLAMÉ
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      companyName: biz.title || '',
                                      companyEmail: '', // New schema doesn't have email in directory
                                      companyAddress: biz.full_address || '',
                                      phone: biz.phone || '',
                                      location: biz.city?.toLowerCase() || '',
                                      category: biz.vitrine_category || '',
                                      directoryId: biz.id?.toString() || '',
                                    });
                                    setShowSuggestions(false);
                                  }}
                                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded flex items-center gap-1 shrink-0 transition-colors"
                                >
                                  RÉCLAMER
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => setShowSuggestions(false)}
                            className="w-full p-3 text-sm text-emerald-600 font-medium hover:bg-emerald-50 flex items-center justify-center gap-2 border-t border-gray-100 italic"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Aucun ? → Ajouter mon business
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Email ID"
                  value={formData.companyEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, companyEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+216 XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Select category</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="RETAIL">Retail</option>
                  <option value="BEAUTY">Beauty</option>
                  <option value="REPAIR">Repair</option>
                  <option value="HEALTH">Health</option>
                  <option value="EDUCATION">Education</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* RNE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RNE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1234567A"
                value={formData.rne}
                onChange={(e) =>
                  setFormData({ ...formData, rne: e.target.value.toUpperCase() })
                }
                maxLength={8}
                pattern="[0-9]{7}[A-Za-z]"
                title="RNE must be 7 digits followed by 1 letter (e.g. 1234567A)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">
                Registre National des Entreprises — 7 digits + 1 letter
              </p>
            </div>

            {/* Company Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <input
                  type="url"
                  placeholder="https://"
                  value={formData.companyWebsite}
                  onChange={(e) =>
                    setFormData({ ...formData, companyWebsite: e.target.value })
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Company Address and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.companyAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, companyAddress: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Select location</option>
                  <option value="tunis">Tunis</option>
                  <option value="ariana">Ariana</option>
                  <option value="ben-arous">Ben Arous</option>
                  <option value="manouba">Manouba</option>
                  <option value="nabeul">Nabeul</option>
                  <option value="zaghouan">Zaghouan</option>
                  <option value="bizerte">Bizerte</option>
                  <option value="beja">Béja</option>
                  <option value="jendouba">Jendouba</option>
                  <option value="kef">Le Kef</option>
                  <option value="siliana">Siliana</option>
                  <option value="kairouan">Kairouan</option>
                  <option value="kasserine">Kasserine</option>
                  <option value="sidi-bouzid">Sidi Bouzid</option>
                  <option value="sousse">Sousse</option>
                  <option value="monastir">Monastir</option>
                  <option value="mahdia">Mahdia</option>
                  <option value="sfax">Sfax</option>
                  <option value="gafsa">Gafsa</option>
                  <option value="tozeur">Tozeur</option>
                  <option value="kebili">Kébili</option>
                  <option value="gabes">Gabès</option>
                  <option value="medenine">Médenine</option>
                  <option value="tataouine">Tataouine</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter your company info"
                value={formData.description}
                onChange={handleDescriptionChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                You inserted {characterCount} characters
              </p>
            </div>

            {/* Required Fields Notice */}
            <p className="text-sm text-red-500 text-center">
              Required fields are marked with an asterisk *
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
===
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe, Search, CheckCircle, PlusCircle, MapPin,
  Building2, Wrench, Upload, X, Loader2, Star, ImageIcon
} from 'lucide-react';
import { addBusiness, searchUnified } from '@/lib/actions/addbuss';
import type { UnifiedSearchResult } from '@/lib/actions/addbuss';
import type { PlaceResult } from '@/app/api/places/search/route';

export default function AddBusinessPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // ─── Type toggle ────────────────────────────────────────────────
  const [businessType, setBusinessType] = useState<'BUSINESS' | 'SERVICE'>('BUSINESS');

  // ─── Mode création (business non trouvé) ────────────────────────
  const [isCreateMode, setIsCreateMode] = useState(false);

  // ─── Recherche multi-source ─────────────────────────────────────
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dbResults, setDbResults] = useState<UnifiedSearchResult[]>([]);
  const [gmResults, setGmResults] = useState<PlaceResult[]>([]);

  // ─── Source sélectionnée ────────────────────────────────────────
  const [selectedSource, setSelectedSource] = useState<
    | { type: 'db'; data: UnifiedSearchResult }
    | { type: 'gm'; data: PlaceResult }
    | { type: 'new' }
    | null
  >(null);

  // ─── Form data ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    rne: '',
    companyWebsite: '',
    companyAddress: '',
    location: '',
    description: '',
    phone: '',
    category: '',
    directoryId: '',
    serviceDirectoryId: '',
    googlePlaceId: '',
    lat: 0,
    lng: 0,
    logo: null as File | null,
    justificatif: null as File | null,
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [justificatifName, setJustificatifName] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  // ─── Recherche debounced (DB + Google Maps en parallèle) ───────
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (formData.companyName.length < 3) {
        setDbResults([]);
        setGmResults([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);

      try {
        const [dbRes, gmRes] = await Promise.all([
          searchUnified(formData.companyName),
          fetch(`/api/places/search?q=${encodeURIComponent(formData.companyName)}&country=TN`)
            .then(r => r.json())
            .catch(() => [])
        ]);

        setDbResults(dbRes);
        // Filtrer les résultats GM déjà dans la DB
        setGmResults((gmRes || []).filter((g: PlaceResult) => !g.already_in_db));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [formData.companyName]);

  // ─── Handlers ──────────────────────────────────────────────────

  const handleSelectDbResult = (result: UnifiedSearchResult) => {
    setSelectedSource({ type: 'db', data: result });
    setIsCreateMode(false);
    setFormData({
      ...formData,
      companyName: result.name,
      companyAddress: result.address || '',
      phone: result.phone || '',
      location: result.city?.toLowerCase() || '',
      category: result.category || '',
      directoryId: result.source === 'business_directory' ? result.id.toString() : '',
      serviceDirectoryId: result.source === 'service_directory' ? result.id.toString() : '',
      googlePlaceId: '',
    });
    setShowSuggestions(false);
  };

  const handleSelectGmResult = (place: PlaceResult) => {
    setSelectedSource({ type: 'gm', data: place });
    setIsCreateMode(false);

    // Extraire la ville de l'adresse formatée
    const addressParts = place.formatted_address.split(',').map(s => s.trim());
    const possibleCity = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : '';

    setFormData({
      ...formData,
      companyName: place.name,
      companyAddress: place.formatted_address,
      phone: place.phone || formData.phone,
      location: possibleCity.toLowerCase() || '',
      googlePlaceId: place.place_id,
      directoryId: '',
      serviceDirectoryId: '',
      lat: place.lat,
      lng: place.lng,
    });
    setShowSuggestions(false);
  };

  const handleCreateMode = () => {
    setSelectedSource({ type: 'new' });
    setIsCreateMode(true);
    setShowSuggestions(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleJustificatifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, justificatif: file });
      setJustificatifName(file.name);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFormData({ ...formData, description: text });
    setCharacterCount(text.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('companyName', formData.companyName);
      fd.append('companyEmail', formData.companyEmail);
      fd.append('rne', formData.rne);
      fd.append('companyWebsite', formData.companyWebsite);
      fd.append('companyAddress', formData.companyAddress);
      fd.append('location', formData.location);
      fd.append('description', formData.description);
      fd.append('phone', formData.phone);
      fd.append('category', formData.category);
      fd.append('businessType', businessType);
      fd.append('isCreateMode', isCreateMode.toString());

      if (formData.directoryId) fd.append('directoryId', formData.directoryId);
      if (formData.serviceDirectoryId) fd.append('serviceDirectoryId', formData.serviceDirectoryId);
      if (formData.googlePlaceId) fd.append('googlePlaceId', formData.googlePlaceId);
      if (formData.lat) fd.append('lat', formData.lat.toString());
      if (formData.lng) fd.append('lng', formData.lng.toString());
      if (formData.logo) fd.append('logo', formData.logo);
      if (formData.justificatif) fd.append('justificatif', formData.justificatif);

      const result = await addBusiness(fd);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">

          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajouter un établissement</h1>
          <p className="text-gray-500 text-sm mb-8">
            Recherchez votre établissement ou créez-en un nouveau
          </p>

          {/* ── Type Toggle ─────────────────────────────────────── */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setBusinessType('BUSINESS')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                businessType === 'BUSINESS'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Business
            </button>
            <button
              type="button"
              onClick={() => setBusinessType('SERVICE')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                businessType === 'SERVICE'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Wrench className="w-5 h-5" />
              Service
            </button>
          </div>

          {/* Selected source badge */}
          {selectedSource && (
            <div className={`mb-6 flex items-center justify-between p-3 rounded-lg border text-sm ${
              selectedSource.type === 'gm'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : selectedSource.type === 'db'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span className="font-medium">
                {selectedSource.type === 'gm' && '🗺️ Réclamé depuis Google Maps'}
                {selectedSource.type === 'db' && '🗄️ Réclamé depuis la base locale'}
                {selectedSource.type === 'new' && '✨ Création d\'un nouvel établissement'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSource(null);
                  setIsCreateMode(false);
                  setFormData({
                    ...formData,
                    directoryId: '',
                    serviceDirectoryId: '',
                    googlePlaceId: '',
                    lat: 0,
                    lng: 0,
                  });
                }}
                className="p-1 hover:bg-black/5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Logo ─────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <div className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors text-sm">
                    Parcourir
                  </div>
                </label>
              </div>
            </div>

            {/* ── Company Name + Email ─────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'établissement <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Café Express"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      onFocus={() => formData.companyName.length >= 3 && setShowSuggestions(true)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* ── Suggestions Dropdown ───────────────────── */}
                  {showSuggestions && formData.companyName.length >= 3 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">

                      {isSearching ? (
                        <div className="p-6 text-center">
                          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Recherche en cours...</p>
                        </div>
                      ) : (
                        <>
                          {/* Section Google Maps */}
                          {gmResults.length > 0 && (
                            <>
                              <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3" />
                                  Google Maps
                                </span>
                              </div>
                              {gmResults.map((place) => (
                                <button
                                  key={place.place_id}
                                  type="button"
                                  onClick={() => handleSelectGmResult(place)}
                                  className="w-full p-3 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 flex items-center gap-3 text-left transition-colors"
                                >
                                  {/* Photo thumbnail */}
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                    {place.photo_url ? (
                                      <img src={place.photo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{place.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{place.formatted_address}</p>
                                    {place.rating && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] text-gray-500">{place.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="px-2.5 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full shrink-0">
                                    RÉCLAMER
                                  </span>
                                </button>
                              ))}
                            </>
                          )}

                          {/* Section DB locale */}
                          {dbResults.length > 0 && (
                            <>
                              <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100">
                                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                                  <Building2 className="w-3 h-3" />
                                  Base de données locale
                                </span>
                              </div>
                              {dbResults.map((biz) => (
                                <div
                                  key={`${biz.source}-${biz.id}`}
                                  className="p-3 border-b border-gray-50 last:border-0 hover:bg-emerald-50/50 flex items-center justify-between gap-3 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{biz.name}</p>
                                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                        biz.source === 'business_directory'
                                          ? 'bg-emerald-100 text-emerald-600'
                                          : 'bg-blue-100 text-blue-600'
                                      }`}>
                                        {biz.source === 'business_directory' ? 'BIZ' : 'SVC'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                      {biz.city}{biz.category ? ` · ${biz.category}` : ''}
                                    </p>
                                  </div>

                                  {biz.is_claimed ? (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded flex items-center gap-1 shrink-0">
                                      <CheckCircle className="w-3 h-3" />
                                      RÉCLAMÉ
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectDbResult(biz)}
                                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-full shrink-0 transition-colors"
                                    >
                                      RÉCLAMER
                                    </button>
                                  )}
                                </div>
                              ))}
                            </>
                          )}

                          {/* Aucun résultat */}
                          {dbResults.length === 0 && gmResults.length === 0 && !isSearching && (
                            <div className="p-4 text-center text-sm text-gray-400">
                              Aucun résultat pour « {formData.companyName} »
                            </div>
                          )}

                          {/* Bouton Créer */}
                          <button
                            type="button"
                            onClick={handleCreateMode}
                            className="w-full p-3.5 text-sm font-semibold hover:bg-amber-50 flex items-center justify-center gap-2 border-t border-gray-100 transition-colors text-amber-600"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Mon établissement n'est pas listé → Créer
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@exemple.tn"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* ── Phone + Category ──────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+216 XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Sélectionner</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="RETAIL">Commerce</option>
                  <option value="BEAUTY">Beauté</option>
                  <option value="REPAIR">Réparation</option>
                  <option value="HEALTH">Santé</option>
                  <option value="EDUCATION">Éducation</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>

            {/* ── RNE (obligatoire pour Business, optionnel pour Service) ─ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RNE {businessType === 'BUSINESS' && <span className="text-red-500">*</span>}
                {businessType === 'SERVICE' && <span className="text-gray-400 font-normal ml-1">(optionnel)</span>}
              </label>
              <input
                type="text"
                required={businessType === 'BUSINESS'}
                placeholder="Ex: 1234567A"
                value={formData.rne}
                onChange={(e) => setFormData({ ...formData, rne: e.target.value.toUpperCase() })}
                maxLength={8}
                pattern={businessType === 'BUSINESS' ? '[0-9]{7}[A-Za-z]' : undefined}
                title="RNE : 7 chiffres + 1 lettre (ex: 1234567A)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">
                {businessType === 'BUSINESS'
                  ? 'Registre National des Entreprises — 7 chiffres + 1 lettre'
                  : 'Optionnel pour les prestataires de services. Vous pouvez fournir une pièce justificative à la place.'
                }
              </p>
            </div>

            {/* ── Pièce justificative (Services uniquement) ───────── */}
            {businessType === 'SERVICE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pièce justificative
                  {!formData.rne && <span className="text-red-500"> *</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex-1">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleJustificatifUpload}
                      className="hidden"
                    />
                    <div className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                      justificatifName
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <Upload className={`w-5 h-5 ${justificatifName ? 'text-emerald-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${justificatifName ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                        {justificatifName || 'CIN, Patente, ou document justificatif'}
                      </span>
                    </div>
                  </label>
                  {justificatifName && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, justificatif: null });
                        setJustificatifName('');
                      }}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  CIN, Patente, ou tout document prouvant votre activité
                </p>
              </div>
            )}

            {/* ── Website ─────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <input
                  type="url"
                  placeholder="https://"
                  value={formData.companyWebsite}
                  onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* ── Address + Location ───────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  placeholder="Rue, avenue..."
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gouvernorat <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Sélectionner</option>
                  <option value="tunis">Tunis</option>
                  <option value="ariana">Ariana</option>
                  <option value="ben-arous">Ben Arous</option>
                  <option value="manouba">Manouba</option>
                  <option value="nabeul">Nabeul</option>
                  <option value="zaghouan">Zaghouan</option>
                  <option value="bizerte">Bizerte</option>
                  <option value="beja">Béja</option>
                  <option value="jendouba">Jendouba</option>
                  <option value="kef">Le Kef</option>
                  <option value="siliana">Siliana</option>
                  <option value="kairouan">Kairouan</option>
                  <option value="kasserine">Kasserine</option>
                  <option value="sidi-bouzid">Sidi Bouzid</option>
                  <option value="sousse">Sousse</option>
                  <option value="monastir">Monastir</option>
                  <option value="mahdia">Mahdia</option>
                  <option value="sfax">Sfax</option>
                  <option value="gafsa">Gafsa</option>
                  <option value="tozeur">Tozeur</option>
                  <option value="kebili">Kébili</option>
                  <option value="gabes">Gabès</option>
                  <option value="medenine">Médenine</option>
                  <option value="tataouine">Tataouine</option>
                </select>
              </div>
            </div>

            {/* ── Coordonnées (visible si GM ou création) ────────── */}
            {(formData.lat !== 0 || formData.lng !== 0 || isCreateMode) && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">Coordonnées GPS</span>
                  {formData.lat !== 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-medium">
                      Auto-rempli
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="34.7405"
                      value={formData.lat || ''}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="10.7603"
                      value={formData.lng || ''}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Description ──────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Décrivez votre activité..."
                value={formData.description}
                onChange={handleDescriptionChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">{characterCount} caractères</p>
            </div>

            {/* ── Required notice ───────────────────────────────────── */}
            <p className="text-sm text-red-500 text-center">
              Les champs marqués d'un astérisque * sont obligatoires
            </p>

            {/* ── Buttons ──────────────────────────────────────────── */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                disabled={isPending}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
}
```

Nouvelles fonctionnalités UI :
- **Toggle Business/Service** — détermine la table de destination et la validation
- **Recherche multi-source** — Dropdown avec 2 sections (🗺️ Google Maps + 🗄️ DB locale)
- **Photos GM** — Thumbnails dans le dropdown pour les résultats Google Maps
- **Mode création** — Bouton "Mon établissement n'est pas listé → Créer"
- **Coordonnées GPS** — Auto-remplies depuis Google Maps, éditables manuellement
- **Pièce justificative** — Upload CIN/Patente/document (Services uniquement)
- **RNE conditionnel** — Obligatoire pour Business, optionnel pour Service
- **Badge source** — Affiche la provenance (GM, DB locale, ou Nouveau)
- Textes traduits en français

### 4. [NEW] Env Example
**[.env.local.example](file:///c:/Users/INFOKOM/Desktop/private-PFE-repos/.env.local.example)**
- Variable : `GOOGLE_PLACES_API_KEY`

## ⚠️ Action requise

> [!IMPORTANT]
> Vous devez ajouter votre clé Google Places API dans `.env.local` :
> ```
> GOOGLE_PLACES_API_KEY=AIzaSy...
> ```
> Sans cette clé, la section Google Maps dans le dropdown sera vide (les résultats DB locale fonctionneront normalement).

## Test rapide

1. Aller à `/merchants/business/add`
2. Basculer entre **Business** et **Service**
3. Taper un nom → observer le dropdown avec 2 sections
4. Cliquer "Créer" → observer les champs GPS et justificatif
5. Soumettre → vérifier la redirection vers `/dashboard/{id}`
