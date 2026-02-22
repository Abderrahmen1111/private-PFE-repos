'use client';

import React, { useState } from 'react';
import { BusinessProfile } from '@/types';
import { mockBusinessProfile } from '@/lib/mock-data';
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
import { Clock, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

type Category = 'boutique' | 'restaurant' | 'hotel' | 'salon' | 'grocery' | 'automotive' | 'fitness' | 'other';

const categories: { value: Category; label: string }[] = [
  { value: 'boutique', label: 'Boutique' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'salon', label: 'Salon & Spa' },
  { value: 'grocery', label: 'Grocery Store' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'fitness', label: 'Fitness Center' },
  { value: 'other', label: 'Other' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<BusinessProfile>(mockBusinessProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(profile.gallery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setProfile((prev) => ({ ...prev, category: value as Category }));
  };

  const handleHourChange = (day: keyof typeof profile.workingHours, field: 'open' | 'close', value: string) => {
    setProfile((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleClosed = (day: keyof typeof profile.workingHours, closed: boolean) => {
    setProfile((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          closed,
        },
      },
    }));
  };

  const handleAddGalleryImage = () => {
    toast.success('In a real app, this would open a file picker');
    // In production, this would open a file picker and upload the image
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Business profile updated successfully!');
  };

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
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name" className="mb-2">
              Business Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              placeholder="Enter business name"
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={profile.description}
              onChange={handleInputChange}
              placeholder="Describe your business..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category" className="mb-2">
                Category *
              </Label>
              <Select value={profile.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2">
                Phone Number *
              </Label>
              <Input
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="mb-2">
              Address *
            </Label>
            <Input
              id="address"
              name="address"
              value={profile.address}
              onChange={handleInputChange}
              placeholder="Street address, city, state, zip"
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(profile.workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-end gap-4 pb-4 border-b border-border last:border-0">
                <div className="w-24">
                  <Label className="capitalize text-sm">{day}</Label>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => handleClosed(day as keyof typeof profile.workingHours, e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Closed</span>
                </label>

                {!hours.closed && (
                  <>
                    <div className="flex-1">
                      <Label className="text-xs mb-1">Opens</Label>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          handleHourChange(day as keyof typeof profile.workingHours, 'open', e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs mb-1">Closes</Label>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          handleHourChange(day as keyof typeof profile.workingHours, 'close', e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Business Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Upload high-quality images of your business to increase customer engagement
          </p>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Image {index + 1}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveGalleryImage(index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Image Button */}
            <button
              onClick={handleAddGalleryImage}
              className="aspect-square border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center hover:border-foreground hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add Image</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
