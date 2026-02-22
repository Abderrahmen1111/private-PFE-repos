'use client';

import React, { useState } from 'react';
import { Promotion } from '@/types';
import { mockPromotions } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Zap, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditingPromotion extends Partial<Promotion> {
  id?: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<EditingPromotion | null>(null);

  const activePromos = promotions.filter((p) => p.active);
  const inactivePromos = promotions.filter((p) => !p.active);

  const handleAddPromotion = (promo: EditingPromotion) => {
    if (!promo.title || !promo.validFrom || !promo.validUntil) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (promo.id) {
      // Update existing promotion
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promo.id
            ? {
                ...p,
                title: promo.title!,
                description: promo.description || '',
                discountPercent: promo.discountPercent,
                discountText: promo.discountText,
                validFrom: promo.validFrom!,
                validUntil: promo.validUntil!,
              }
            : p
        )
      );
      toast.success('Promotion updated successfully!');
    } else {
      // Create new promotion
      const newPromo: Promotion = {
        id: `promo-${Date.now()}`,
        businessId: 'biz-001',
        title: promo.title!,
        description: promo.description || '',
        discountPercent: promo.discountPercent,
        discountText: promo.discountText,
        validFrom: promo.validFrom!,
        validUntil: promo.validUntil!,
        active: true,
      };

      setPromotions((prev) => [...prev, newPromo]);
      toast.success('Promotion created successfully!');
    }

    setEditingPromo(null);
    setIsOpen(false);
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    toast.success('Promotion deleted successfully!');
  };

  const handleToggleActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingPromo(null);
    }
  };

  const isExpired = (date: Date) => date < new Date();
  const daysUntilExpiration = (date: Date) => Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Promotions & Offers</h1>
          <p className="text-muted-foreground">
            Create and manage promotional campaigns to drive customer engagement
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={() => setEditingPromo(null)}>
              <Plus className="w-5 h-5 mr-2" />
              New Promotion
            </Button>
          </DialogTrigger>

          <PromotionForm
            promo={editingPromo}
            onSave={handleAddPromotion}
            onClose={() => handleDialogChange(false)}
          />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Active Promotions</p>
              <p className="text-4xl font-bold text-foreground">{activePromos.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Total Promotions</p>
              <p className="text-4xl font-bold text-foreground">{promotions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Inactive</p>
              <p className="text-4xl font-bold text-foreground">{inactivePromos.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active ({activePromos.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({inactivePromos.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Promotions */}
        <TabsContent value="active" className="space-y-4">
          {activePromos.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12">
                <div className="text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No active promotions</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new promotion to engage your customers
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            activePromos.map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                isExpired={isExpired(promo.validUntil)}
                daysUntilExpiration={daysUntilExpiration(promo.validUntil)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggleActive}
                isOpen={isOpen}
                setIsOpen={handleDialogChange}
                editingPromo={editingPromo}
                onSave={handleAddPromotion}
              />
            ))
          )}
        </TabsContent>

        {/* Inactive Promotions */}
        <TabsContent value="inactive" className="space-y-4">
          {inactivePromos.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No inactive promotions</p>
              </CardContent>
            </Card>
          ) : (
            inactivePromos.map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                isExpired={isExpired(promo.validUntil)}
                daysUntilExpiration={daysUntilExpiration(promo.validUntil)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggleActive}
                isOpen={isOpen}
                setIsOpen={handleDialogChange}
                editingPromo={editingPromo}
                onSave={handleAddPromotion}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface PromotionCardProps {
  promo: Promotion;
  isExpired: boolean;
  daysUntilExpiration: number;
  onEdit: (promo: Promotion) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingPromo: EditingPromotion | null;
  onSave: (promo: EditingPromotion) => void;
}

function PromotionCard({
  promo,
  isExpired,
  daysUntilExpiration,
  onEdit,
  onDelete,
  onToggle,
  isOpen,
  setIsOpen,
  editingPromo,
  onSave,
}: PromotionCardProps) {
  return (
    <Card className={`border-0 shadow-sm ${isExpired && promo.active ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{promo.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-2 ml-4">
              {isExpired && (
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 px-2 py-1 rounded">
                  Expired
                </span>
              )}
              {promo.active && !isExpired && (
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-1 rounded">
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Discount Info */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                {promo.discountPercent && (
                  <p className="text-3xl font-bold text-foreground">{promo.discountPercent}% OFF</p>
                )}
                {promo.discountText && (
                  <p className="text-lg font-bold text-foreground">{promo.discountText}</p>
                )}
              </div>
              <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>

          {/* Dates & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Valid From</p>
                <p className="text-sm font-medium text-foreground">
                  {promo.validFrom.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="text-sm font-medium text-foreground">
                  {promo.validUntil.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          {!isExpired && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <span className="font-medium">{daysUntilExpiration}</span> days remaining
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onToggle(promo.id)}
            >
              {promo.active ? (
                <>
                  <ToggleRight className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(promo)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <PromotionForm
                promo={editingPromo}
                onSave={onSave}
                onClose={() => {}}
              />
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(promo.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PromotionFormProps {
  promo: EditingPromotion | null;
  onSave: (promo: EditingPromotion) => void;
  onClose: () => void;
}

function PromotionForm({ promo, onSave, onClose }: PromotionFormProps) {
  const [formData, setFormData] = useState<EditingPromotion>(
    promo || {
      title: '',
      description: '',
      discountPercent: undefined,
      discountText: undefined,
      validFrom: new Date(),
      validUntil: new Date(),
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'discountPercent' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{promo?.id ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
        <DialogDescription>
          {promo?.id ? 'Update promotion details' : 'Create a new promotional offer'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="mb-2">
            Promotion Title *
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            placeholder="e.g., Summer Sale"
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-2">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Tell customers about this promotion..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountPercent" className="mb-2">
              Discount %
            </Label>
            <Input
              id="discountPercent"
              name="discountPercent"
              type="number"
              value={formData.discountPercent || ''}
              onChange={handleChange}
              placeholder="e.g., 20"
            />
          </div>

          <div>
            <Label htmlFor="discountText" className="mb-2">
              Or Custom Text
            </Label>
            <Input
              id="discountText"
              name="discountText"
              value={formData.discountText || ''}
              onChange={handleChange}
              placeholder="e.g., Free Shipping"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="validFrom" className="mb-2">
            Valid From *
          </Label>
          <Input
            id="validFrom"
            name="validFrom"
            type="date"
            value={formData.validFrom instanceof Date ? formData.validFrom.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                validFrom: new Date(e.target.value),
              }))
            }
          />
        </div>

        <div>
          <Label htmlFor="validUntil" className="mb-2">
            Valid Until *
          </Label>
          <Input
            id="validUntil"
            name="validUntil"
            type="date"
            value={formData.validUntil instanceof Date ? formData.validUntil.toISOString().split('T')[0] : ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                validUntil: new Date(e.target.value),
              }))
            }
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {promo?.id ? 'Update' : 'Create'} Promotion
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
