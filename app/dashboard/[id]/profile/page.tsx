'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BusinessProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStoreById, updateStoreProfile, getStoreByBusinessId } from '@/lib/actions/stores';
import { uploadFile } from '@/lib/supabase/storage';

type Category = 'boutique' | 'restaurant' | 'hotel' | 'salon' | 'grocery' | 'automotive' | 'fitness' | 'other';

const categories: { value: string; label: string }[] = [
  { value: 'BOUTIQUE', label: 'Boutique' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'OTHER', label: 'Other' },
];

export default function ProfilePage() {
  const { id } = useParams();
  const storeId = parseInt(id as string);

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [resolvedStoreId, setResolvedStoreId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);

      // Resolve the actual internal store ID
      const { data: store, error: resolveError } = await getStoreByBusinessId(storeId) as any;

      if (resolveError || !store) {
        toast.error('Failed to resolve store profile');
        setLoading(false);
        return;
      }

      setResolvedStoreId(store.id);
      const data = store as any; // Use casting to avoid union type lint issues

      if (data) {
        // Map database store to BusinessProfile type
        const mappedProfile: BusinessProfile = {
          id: data.id.toString(),
          name: data.name,
          description: data.description || '',
          category: (data.category?.toLowerCase() || 'other') as any,
          address: data.address || '',
          phone: data.phone || '',
          workingHours: (data as any).opening_hours || {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '10:00', close: '16:00', closed: false },
            sunday: { open: '00:00', close: '00:00', closed: true },
          },
          image: data.logo_url || '',
          gallery: (data as any).gallery || [],
          rating: data.rating_average || 0,
          reviewCount: data.total_reviews || 0,
        };

        setProfile(mappedProfile);
        setGalleryImages(mappedProfile.gallery || []);
      }
      setLoading(false);
    };

    fetchStore();
  }, [storeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleCategoryChange = (value: string) => {
    setProfile((prev) => prev ? ({ ...prev, category: value.toLowerCase() as any }) : null);
  };

  const handleHourChange = (day: keyof BusinessProfile['workingHours'], field: 'open' | 'close', value: string) => {
    if (!profile) return;
    setProfile((prev: BusinessProfile | null) => {
      if (!prev) return null;
      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: {
            ...prev.workingHours[day],
            [field]: value,
          },
        },
      };
    });
  };

  const handleClosed = (day: keyof BusinessProfile['workingHours'], closed: boolean) => {
    if (!profile) return;
    setProfile((prev: BusinessProfile | null) => {
      if (!prev) return null;
      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: {
            ...prev.workingHours[day],
            closed,
          },
        },
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!resolvedStoreId) {
      toast.error('Identification de boutique en cours...');
      return;
    }

    const { url, error } = await uploadFile('STORES', `${resolvedStoreId}/logo-${Date.now()}`, file);

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return;
    }

    if (url) {
      setProfile({ ...profile, image: url });
      toast.success('Logo uploaded successfully!');
    }
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !profile) return;

    if (!resolvedStoreId) {
      toast.error('Identification de boutique en cours...');
      return;
    }

    const effectiveId = resolvedStoreId;

    // Convert FileList to Array for easier processing
    const fileArray = Array.from(files);

    // Show loading toast for multiple uploads
    const toastId = toast.loading(`Uploading ${fileArray.length} files...`);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileName = `${effectiveId}/gallery-${Date.now()}-${file.name}`;
        const { url, error } = await uploadFile('STORES', fileName, file);
        if (error) throw error;
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => !!url);

      if (validUrls.length > 0) {
        setGalleryImages(prev => [...prev, ...validUrls]);
        setProfile(prev => prev ? ({ ...prev, gallery: [...(prev.gallery || []), ...validUrls] }) : null);
        toast.success(`${validUrls.length} files added to gallery!`, { id: toastId });
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`, { id: toastId });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profile || !resolvedStoreId) {
      toast.error("Identifiant de boutique non résolu.");
      return;
    }
    setIsSaving(true);

    // Call server action for database update
    const result = await updateStoreProfile(resolvedStoreId, {
      ...profile,
      gallery: galleryImages
    });

    if (result.error) {
      toast.error(`Update failed: ${result.error}`);
    } else {
      toast.success('Store profile updated in database!');
    }

    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center">Store not found.</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Business Profile</h1>
        <p className="text-muted-foreground">
          Manage your business information and visibility
        </p>
      </div>

      {/* Basic Information */}
      <Card className="border-0 shadow-sm bg-white/5 backdrop-blur-3xl border-white/10 text-white">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <Label className="text-white/70">Business Logo</Label>
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center ring-1 ring-white/5 shadow-2xl">
                  {profile.image ? (
                    <img src={profile.image} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/20">
                      <Upload className="w-8 h-8" />
                      <span className="text-[10px] font-bold">Upload Logo</span>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                  <div className="flex flex-col items-center gap-1 text-white">
                    <Upload className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Change Logo</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="flex-1 w-full space-y-6">
              <div>
                <Label htmlFor="name" className="mb-2 text-white/70">
                  Business Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10 text-white focus:ring-blue-500"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 text-white/70">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={profile.description}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10 text-white focus:ring-blue-500"
                  placeholder="Describe your business..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="mb-2 text-white/70">
                    Category *
                  </Label>
                  <Select value={profile.category.toUpperCase()} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2 text-white/70">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 text-white focus:ring-blue-500"
                    placeholder="+216 ..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="mb-2 text-white/70">
                  Address *
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10 text-white focus:ring-blue-500"
                  placeholder="Street address, city"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours - Handled Locally */}
      <Card className="border-0 shadow-sm bg-white/5 backdrop-blur-3xl border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(profile.workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-end gap-4 pb-4 border-b border-white/5 last:border-0">
                <div className="w-24">
                  <Label className="capitalize text-sm text-white/70">{day}</Label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => handleClosed(day as keyof BusinessProfile['workingHours'], e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm text-white/60">Closed</span>
                </label>

                {!hours.closed && (
                  <>
                    <div className="flex-1">
                      <Label className="text-[10px] mb-1 text-white/40 uppercase">Opens</Label>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          handleHourChange(day as keyof BusinessProfile['workingHours'], 'open', e.target.value)
                        }
                        className="bg-white/5 border-white/10 text-white h-9"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] mb-1 text-white/40 uppercase">Closes</Label>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          handleHourChange(day as keyof BusinessProfile['workingHours'], 'close', e.target.value)
                        }
                        className="bg-white/5 border-white/10 text-white h-9"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images - Placeholder */}
      <Card className="border-0 shadow-sm bg-white/5 backdrop-blur-3xl border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400" />
            Business Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-white/40">
            Upload images to showcase your establishment
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((url, index) => {
              const isVideo = url.match(/\.(mp4|webm|ogg|mov)$|^data:video\//i);
              return (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center ring-1 ring-white/10">
                    {isVideo ? (
                      <video src={url} className="w-full h-full object-cover" controls={false} />
                    ) : (
                      <img src={url} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-2 right-2 bg-rose-500 text-white rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/50 rounded-full p-2">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <label
              className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-400 transition-all text-white/20 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6" />
                <span className="text-xs font-bold">Add Media</span>
              </div>
              <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleAddGalleryImage} />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
