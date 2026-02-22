'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { mockProducts } from '@/lib/mock-data';
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
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditingProduct extends Partial<Product> {
  id?: string;
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
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);

  const handleAddProduct = (product: EditingProduct) => {
    if (!product.name || !product.price || !product.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (product.id) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                name: product.name!,
                description: product.description || '',
                price: product.price!,
                category: product.category!,
                available: product.available !== undefined ? product.available : p.available,
                stock: product.stock || p.stock,
              }
            : p
        )
      );
      toast.success('Product updated successfully!');
    } else {
      // Create new product
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        businessId: 'biz-001',
        name: product.name!,
        description: product.description || '',
        price: product.price!,
        category: product.category!,
        image: product.image || '/images/product-placeholder.jpg',
        available: product.available !== undefined ? product.available : true,
        stock: product.stock || 0,
        createdAt: new Date(),
      };

      setProducts((prev) => [...prev, newProduct]);
      toast.success('Product added successfully!');
    }

    setEditingProduct(null);
    setIsOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Product deleted successfully!');
  };

  const handleToggleAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, available: !p.available } : p
      )
    );
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Products & Services</h1>
          <p className="text-muted-foreground">
            Manage your business offerings and inventory
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={() => setEditingProduct(null)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Product
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
      {products.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Package className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">No products yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Start adding your products or services to get customers engaged
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
                  <Package className="w-8 h-8 text-muted-foreground/50" />
                </div>
                {!product.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">Out of Stock</span>
                  </div>
                )}
              </div>

              <CardContent className="pt-6">
                {/* Product Name & Category */}
                <div className="mb-3">
                  <h3 className="font-bold text-foreground text-lg line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{product.category}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {product.description}
                </p>

                {/* Price & Stock */}
                <div className="flex items-end justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.stock !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Stock: {product.stock} units
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(product.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.available
                        ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {product.available ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <ProductForm
                      product={editingProduct}
                      onSave={handleAddProduct}
                      onClose={() => {}}
                    />
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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
  onSave: (product: EditingProduct) => void;
  onClose: () => void;
}

function ProductForm({ product, onSave, onClose }: ProductFormProps) {
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

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{product?.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogDescription>
          {product?.id ? 'Update your product details' : 'Create a new product or service listing'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2">
            Product Name *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g., Premium Silk Blazer"
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
            placeholder="Describe your product..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="mb-2">
              Price *
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

          <div>
            <Label htmlFor="stock" className="mb-2">
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
        </div>

        <div>
          <Label htmlFor="category" className="mb-2">
            Category *
          </Label>
          <Select value={formData.category || 'other'} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
          <Label htmlFor="available" className="cursor-pointer">
            Available for purchase
          </Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {product?.id ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
