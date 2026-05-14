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
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MapPicker from '@/components/ui/MapPicker';

export default function AddBusinessPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // ─── Type toggle ────────────────────────────────────────────────
  const [businessType, setBusinessType] = useState<'BUSINESS' | 'SERVICE'>('BUSINESS');

  // ─── Mode création (business non trouvé) ────────────────────────
  const [isCreateMode, setIsCreateMode] = useState(true);

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
  >({ type: 'new' });

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
                          {!isCreateMode && (
                            <button
                              type="button"
                              onClick={handleCreateMode}
                              className="w-full p-3.5 text-sm font-semibold hover:bg-amber-50 flex items-center justify-center gap-2 border-t border-gray-100 transition-colors text-amber-600"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Mon établissement n'est pas listé → Créer
                            </button>
                          )}
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
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-medium ml-2">
                      Auto-rempli
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Ouvrir la carte
                  </button>
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

      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent">
          <DialogHeader className="hidden">
            <DialogTitle>Pointer l'emplacement</DialogTitle>
          </DialogHeader>
          <MapPicker
            initialLat={formData.lat}
            initialLng={formData.lng}
            onSelect={(lat, lng) => setFormData({ ...formData, lat, lng })}
            onClose={() => setIsMapOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}