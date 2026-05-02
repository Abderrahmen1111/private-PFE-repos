'use client';

import React, { useEffect, useState } from 'react';
import { getAdminItemsByStoreId, upsertItem, deleteItem } from '@/lib/actions/items';
import type { Item } from '@/lib/actions/items';
import { getStoreByAnyId } from '@/lib/actions/stores';
import { getPromotions } from '@/lib/actions/promotions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';
import { uploadFile } from '@/lib/supabase/storage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Package, Loader2, Sparkles, Zap, Tag } from 'lucide-react';
import DarijaAIPanel from '@/components/dashboard/DarijaAIPanel';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EditingProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  stock: number;
  itemType: 'PRODUCT' | 'SERVICE';
  image?: string;
  imageFile?: File | null;
  galleryFiles?: File[];
  videoFiles?: File[];
  galleryUrls?: string[];
  videoUrls?: string[];
}

const productCategories = [
  'clothing',
  'accessories',
  'food',
  'beverages',
  'furniture',
  'electronics',
  'beauty',
  'home',
  'sports',
  'health',
  'automotive',
  'books',
  'toys',
  'services',
  'other',
];

import PromotionsSection from '@/components/dashboard/PromotionsSection';

export default function ProductsPage() {
  const params = useParams();
  const storeId = parseInt(params.id as string);
  const [products, setProducts] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [resolvedStoreId, setResolvedStoreId] = useState<number | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    async function resolveAndFetch() {
      if (storeId) {
        setIsLoading(true);
        const { data: store, error: storeError } = await getStoreByAnyId(storeId) as any;
        if (storeError || !store) {
          toast.error("Impossible de trouver la boutique correspondante");
          setIsLoading(false);
          return;
        }
        const actualId = store.id;
        setResolvedStoreId(actualId);
        
        // Fetch both products and promotions
        const [itemsData, promosData] = await Promise.all([
          getAdminItemsByStoreId(actualId),
          getPromotions(actualId)
        ]);
        
        setProducts(itemsData);
        setPromotions(promosData);
      }
      setIsLoading(false);
    }
    resolveAndFetch();
  }, [storeId]);

  const handleAddProduct = async (productData: EditingProduct) => {
    if (!productData.name || !productData.price || !productData.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (!resolvedStoreId) {
      toast.error("Identifiant de boutique non résolu. Veuillez patienter.");
      return;
    }
    const effectiveId = resolvedStoreId;
    let imageUrl = productData.image || '';
    if (productData.imageFile) {
      const fileName = `${effectiveId}/${Date.now()}-main-${productData.imageFile.name}`;
      const { url, error: uploadError } = await uploadFile('PRODUCTS', fileName, productData.imageFile);
      if (uploadError) {
        toast.error("Erreur lors de l'upload de l'image principale");
      } else if (url) {
        imageUrl = url;
      }
    }

    // Upload gallery images
    const galleryUrls = [...(productData.galleryUrls || [])];
    if (productData.galleryFiles && productData.galleryFiles.length > 0) {
      for (const file of productData.galleryFiles) {
        const fileName = `${effectiveId}/${Date.now()}-gallery-${file.name}`;
        const { url } = await uploadFile('PRODUCTS', fileName, file);
        if (url) galleryUrls.push(url);
      }
    }

    // Upload videos
    const videoUrls = [...(productData.videoUrls || [])];
    if (productData.videoFiles && productData.videoFiles.length > 0) {
      for (const file of productData.videoFiles) {
        const fileName = `${effectiveId}/${Date.now()}-video-${file.name}`;
        const { url } = await uploadFile('REELS', fileName, file);
        if (url) videoUrls.push(url);
      }
    }

    const itemData: any = {
      id: productData.id ? parseInt(productData.id) : undefined,
      store_id: effectiveId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      item_type: productData.itemType,
      category: productData.category,
      status: productData.available ? 'AVAILABLE' : 'UNAVAILABLE',
      stock_quantity: productData.itemType === 'SERVICE' ? 0 : (productData.stock || 0),
      main_image: imageUrl,
      images: galleryUrls,
      metadata: {
        ...((products.find(p => p.id === parseInt(productData.id || '')) as any)?.metadata || {}),
        videos: videoUrls
      },
      slug: (productData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()),
      price_unit: 'unit'
    };
    
    const { data, error } = await upsertItem(itemData);
    if (error) {
      toast.error(`Erreur: ${error}`);
      return;
    }
    if (productData.id) {
      setProducts(prev => prev.map(p => p.id === data!.id ? data! : p));
      toast.success('Annonce mise à jour !');
    } else {
      setProducts(prev => [data!, ...prev]);
      toast.success('Annonce ajoutée !');
    }
    setEditingProduct(null);
    setIsOpen(false);
  };

  const handleEdit = (item: Item) => {
    setEditingProduct({
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.item_type === 'SERVICE' ? 'services' : (item as any).category || 'other',
      available: item.status === 'AVAILABLE',
      itemType: (item.item_type as 'PRODUCT' | 'SERVICE') || 'PRODUCT',
      stock: item.stock_quantity || 0,
      image: item.main_image,
      galleryUrls: (item as any).images || [],
      videoUrls: ((item as any).metadata)?.videos || [],
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!resolvedStoreId) return;
    const { success, error } = await deleteItem(id, resolvedStoreId);
    if (success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Annonce supprimée !');
    } else {
      toast.error(`Erreur: ${error}`);
    }
  };

  const handleToggleAvailability = async (item: Item) => {
    if (!resolvedStoreId) return;
    setTogglingId(item.id);
    const newStatus = item.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      const { error } = await upsertItem({
        ...item,
        status: newStatus as any
      } as any);
      if (!error) {
        setProducts(prev => prev.map(p => p.id === item.id ? { ...p, status: newStatus as any } : p));
        toast.success(newStatus === 'AVAILABLE' ? 'Annonce désormais visible' : 'Annonce masquée avec succès');
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
            Inventaire & Marketing
          </h1>
          <p className="text-slate-400 font-medium">
            Gérez vos annonces et optimisez vos ventes avec des promotions ciblées.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsAIOpen(true)}
            disabled={isLoading || !resolvedStoreId}
            className="border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/70 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Darija
          </Button>
          <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={() => setEditingProduct(null)} disabled={isLoading || !resolvedStoreId}>
                <Plus className="w-5 h-5 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <ProductForm
              product={editingProduct}
              onSave={handleAddProduct}
              onClose={() => handleDialogChange(false)}
            />
          </Dialog>
        </div>
      </div>


      {/* AI Darija Panel */}
      {resolvedStoreId && (
        <DarijaAIPanel
          open={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          storeId={resolvedStoreId}
          mode="product"
          onApplyProduct={(data) => {
            setEditingProduct({
              name: data.name,
              description: data.description,
              price: data.price ?? 0,
              category: data.category ?? 'other',
              available: true,
              itemType: 'PRODUCT',
              stock: 0,
              image: data.image_url ?? undefined,
            });
            setIsOpen(true);
          }}
        />
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Package className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Aucune annonce trouvée</h3>
              <p className="text-muted-foreground max-w-sm">
                Ajoutez vos annonces pour attirer des clients. Ces annonces ne seront visibles par le public que lorsque votre établissement sera vérifié.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const activePromo = promotions.find(p => {
              const now = new Date();
              const isValid = p.active && new Date(p.valid_from) <= now && new Date(p.valid_until) >= now;
              if (!isValid) return false;
              return p.apply_to_all || p.item_ids?.includes(product.id);
            });

            return (
              <Card key={product.id} className={`group relative border-0 bg-slate-900/40 backdrop-blur-xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:-translate-y-2 ${activePromo ? 'ring-2 ring-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'border-white/5 shadow-2xl'}`}>
                {activePromo && (
                  <>
                    <div className="absolute top-0 right-0 z-30 pointer-events-none overflow-hidden w-32 h-32">
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black py-1 px-10 transform translate-x-10 translate-y-4 rotate-45 shadow-xl border-y border-white/20 uppercase tracking-widest z-40 whitespace-nowrap">
                        Spécial
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 z-30">
                      <div className="relative">
                        {/* High-End Glassmorphism Badge */}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[1.2rem] bg-gradient-to-br from-red-600/40 to-red-900/40 backdrop-blur-2xl border border-white/20 shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-pulse transition-transform group-hover:scale-110">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Promo</span>
                            <span className="text-xl font-black text-white leading-none italic tracking-tighter">
                              {activePromo.discount_percent ? `-${activePromo.discount_percent}%` : 'OFFRE'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Floating Glow Indicator */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full blur-[2px] animate-ping" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full" />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="aspect-video relative overflow-hidden bg-slate-950">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10 opacity-80 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="w-full h-full flex items-center justify-center">
                  {product.main_image ? (
                    <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>
                {product.status !== 'AVAILABLE' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">Masqué</span>
                  </div>
                )}
              </div>
              <CardContent className="pt-6">
                <div className="mb-3">
                  <h3 className="font-bold text-foreground text-lg line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{product.item_type}</p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {product.description}
                </p>
                <div className="flex items-end justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    {product.price} {product.price_unit || 'DT'}
                    {product.stock_quantity !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Stock: {product.stock_quantity} unités
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    disabled={togglingId === product.id}
                    className={`p-2.5 rounded-full transition-all duration-300 shadow-sm border ${product.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 hover:scale-110 shadow-emerald-500/10'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20 hover:scale-110'
                      }`}
                    title={product.status === 'AVAILABLE' ? 'Rendre invisible' : 'Rendre visible'}
                  >
                    {togglingId === product.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : product.status === 'AVAILABLE' ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* PROMOTIONS SECTION INTEGRATION */}
      {resolvedStoreId && (
        <PromotionsSection 
          storeId={resolvedStoreId} 
          items={products} 
          initialPromotions={promotions}
          onPromotionsChange={setPromotions}
        />
      )}
    </div>
  );
}

interface ProductFormProps {
  product: EditingProduct | null;
  onSave: (product: EditingProduct) => Promise<void>;
  onClose: () => void;
}

function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EditingProduct>(
    product || {
      name: '',
      description: '',
      price: 0,
      category: 'other',
      available: true,
      itemType: 'PRODUCT',
      stock: 0,
    }
  );

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        itemType: product.itemType || 'PRODUCT'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'other',
        available: true,
        itemType: 'PRODUCT',
        stock: 0,
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      image: '',
    }));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        galleryFiles: [...(prev.galleryFiles || []), ...files],
      }));
    }
  };

  const handleRemoveGalleryImage = (index: number, isExisting: boolean) => {
    setFormData((prev) => {
      if (isExisting) {
        const galleryUrls = [...(prev.galleryUrls || [])];
        galleryUrls.splice(index, 1);
        return { ...prev, galleryUrls };
      } else {
        const galleryFiles = [...(prev.galleryFiles || [])];
        galleryFiles.splice(index, 1);
        return { ...prev, galleryFiles };
      }
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        videoFiles: [...(prev.videoFiles || []), ...files],
      }));
    }
  };

  const handleRemoveVideo = (index: number, isExisting: boolean) => {
    setFormData((prev) => {
      if (isExisting) {
        const videoUrls = [...(prev.videoUrls || [])];
        videoUrls.splice(index, 1);
        return { ...prev, videoUrls };
      } else {
        const videoFiles = [...(prev.videoFiles || [])];
        videoFiles.splice(index, 1);
        return { ...prev, videoFiles };
      }
    });
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{product?.id ? 'Modifier l\'annonce' : 'Ajouter une annonce'}</DialogTitle>
        <DialogDescription>
          {product?.id ? 'Mettez à jour les détails' : 'Créez une nouvelle annonce'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {/* Type Choice */}
        <div className="flex p-1 bg-white/5 rounded-lg border border-white/10 mb-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, itemType: 'PRODUCT' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${formData.itemType === 'PRODUCT' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Package className="w-4 h-4" />
            <span className="text-sm font-bold">Produit</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, itemType: 'SERVICE' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${formData.itemType === 'SERVICE' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">Service</span>
          </button>
        </div>

        {/* Image Upload */}
        {/* Main Image Upload */}
        <div className="space-y-2">
          <Label className="text-slate-200">Image principale *</Label>
          <div className="flex flex-col items-center gap-4">
            {formData.image ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            ) : (
              <label className="w-full aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-400 font-medium">Image principale</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Gallery Images */}
        <div className="space-y-2">
          <Label className="text-slate-200">Galerie photos</Label>
          <div className="grid grid-cols-3 gap-2">
            {formData.galleryUrls?.map((url, idx) => (
              <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx, true)}
                  className="absolute top-1 right-1 p-1 bg-rose-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
              </div>
            ))}
            {formData.galleryFiles?.map((file, idx) => (
              <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                <img src={URL.createObjectURL(file)} alt="Gallery New" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx, false)}
                  className="absolute top-1 right-1 p-1 bg-rose-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
              </div>
            ))}
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
              <Plus className="w-6 h-6 text-slate-400" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
            </label>
          </div>
        </div>

        {/* Videos */}
        <div className="space-y-2">
          <Label className="text-slate-200">Vidéos / Reels</Label>
          <div className="grid grid-cols-2 gap-2">
            {formData.videoUrls?.map((url, idx) => (
              <div key={`vid-existing-${idx}`} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black group">
                <video src={url} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveVideo(idx, true)}
                  className="absolute top-1 right-1 p-1 bg-rose-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
              </div>
            ))}
            {formData.videoFiles?.map((file, idx) => (
              <div key={`vid-new-${idx}`} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black group">
                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveVideo(idx, false)}
                  className="absolute top-1 right-1 p-1 bg-rose-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
              </div>
            ))}
            <label className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-all col-span-2">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-400">Ajouter des vidéos</span>
              <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoChange} />
            </label>
          </div>
        </div>
        <div>
          <Label htmlFor="name" className="mb-2 text-slate-200">
            Nom *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Ex: Blazer en soie"
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-2 text-slate-200">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Décrivez votre annonce..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`${formData.itemType === 'SERVICE' ? 'col-span-2' : ''}`}>
            <Label htmlFor="price" className="mb-2 text-slate-200">
              Prix (DT) *
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          {formData.itemType !== 'SERVICE' && (
            <div>
              <Label htmlFor="stock" className="mb-2 text-slate-200">
                Stock
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock || ''}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="category" className="mb-2 text-slate-200">
            Catégorie *
          </Label>
          <Select value={formData.category || 'other'} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white">
              {productCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'clothing' ? 'Vêtements' :
                    cat === 'accessories' ? 'Accessoires' :
                      cat === 'food' ? 'Nourriture' :
                        cat === 'beverages' ? 'Boissons' :
                          cat === 'furniture' ? 'Meubles' :
                            cat === 'electronics' ? 'Électronique' :
                              cat === 'beauty' ? 'Beauté & Soins' :
                                cat === 'home' ? 'Maison & Cuisine' :
                                  cat === 'sports' ? 'Sports & Loisirs' :
                                    cat === 'health' ? 'Santé' :
                                      cat === 'automotive' ? 'Automobile' :
                                        cat === 'books' ? 'Livres & Papeterie' :
                                          cat === 'toys' ? 'Jouets & Jeux' :
                                            cat === 'services' ? 'Services' :
                                              'Autre'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="available"
            checked={formData.available || false}
            onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
            className="w-4 h-4"
          />
          <Label htmlFor="available" className="cursor-pointer text-slate-200">
            Disponible à la vente
          </Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              product?.id ? 'Mettre à jour' : 'Créer'
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
