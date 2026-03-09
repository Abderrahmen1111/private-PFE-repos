'use client';

import React, { useEffect, useState } from 'react';
import { Item, getAdminItemsByStoreId, upsertItem, deleteItem } from '@/lib/actions/items';
import { getStoreByBusinessId } from '@/lib/actions/stores';
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
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditingProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  stock: number;
  image?: string;
  imageFile?: File | null;
}

const productCategories = [
  'clothing',
  'accessories',
  'food',
  'beverages',
  'furniture',
  'electronics',
  'services',
  'other',
];

export default function ProductsPage() {
  const params = useParams();
  const storeId = parseInt(params.id as string);
  const [products, setProducts] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [resolvedStoreId, setResolvedStoreId] = useState<number | null>(null);

  useEffect(() => {
    async function resolveAndFetch() {
      if (storeId) {
        setIsLoading(true);
        // Resolve the actual internal store ID
        const { data: store, error: storeError } = await getStoreByBusinessId(storeId) as any;

        if (storeError || !store) {
          toast.error("Impossible de trouver la boutique correspondante");
          setIsLoading(false);
          return;
        }

        const actualId = store.id;
        setResolvedStoreId(actualId);

        // Fetch products using the actual internal ID
        const data = await getAdminItemsByStoreId(actualId);
        setProducts(data);
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
      const fileName = `${effectiveId}/${Date.now()}-${productData.imageFile.name}`;
      const { url, error: uploadError } = await uploadFile('PRODUCTS', fileName, productData.imageFile);
      if (uploadError) {
        toast.error(`Erreur d'upload: ${uploadError.message}`);
        return;
      }
      imageUrl = url || '';
    }

    const itemPayload = {
      id: productData.id ? parseInt(productData.id) : undefined,
      store_id: effectiveId,
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      item_type: (productData.category === 'services' ? 'SERVICE' : 'PRODUCT') as any,
      status: (productData.available ? 'AVAILABLE' : 'ARCHIVED') as any,
      price_unit: 'unit',
      slug: (productData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()),
      main_image: imageUrl,
      stock_quantity: productData.category === 'services' ? 0 : (productData.stock || 0)
    };

    const { data, error } = await upsertItem(itemPayload as any);

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
      category: item.item_type === 'SERVICE' ? 'services' : 'other',
      available: item.status === 'AVAILABLE',
      stock: item.stock_quantity || 0,
      image: item.main_image
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
    const newStatus = item.status === 'AVAILABLE' ? 'ARCHIVED' : 'AVAILABLE';
    const { error } = await upsertItem({
      id: item.id,
      store_id: resolvedStoreId,
      status: newStatus as any
    } as any);

    if (!error) {
      setProducts(prev => prev.map(p => p.id === item.id ? { ...p, status: newStatus as any } : p));
      toast.success(newStatus === 'AVAILABLE' ? 'Annonce visible' : 'Annonce masquée');
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
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Annonces</h1>
          <p className="text-muted-foreground">
            Gérez vos offres et votre inventaire
          </p>
        </div>

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
          {products.map((product) => (
            <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Product Image */}
              <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/20 relative group overflow-hidden">
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
                    className={`p-2 rounded-lg transition-colors ${product.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    {product.status === 'AVAILABLE' ? (
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
          ))}
        </div>
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
      stock: 0,
    }
  );

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'other',
        available: true,
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
        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-slate-200">Image de l'annonce</Label>
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
                <span className="text-sm text-slate-400">Cliquez pour choisir une image</span>
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
          <div className={`${formData.category === 'services' ? 'col-span-2' : ''}`}>
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

          {formData.category !== 'services' && (
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
