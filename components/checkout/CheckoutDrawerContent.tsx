'use client';

import { useState, useEffect } from 'react';
import { Package, Minus, Plus, ShoppingBag, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Item } from '@/lib/actions/items';
import { createOrder, getUserOrders } from '@/lib/actions/orders';
import { useActionDrawer } from '@/hooks/useActionDrawer';
import { useCartStore } from '@/lib/store/use-cart-store';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/actions/users';
import OrderCard from '@/components/profile/order-card';

interface Props {
  item: Item;
  businessName?: string;
  storeId?: number;
  promotion?: {
    discount_percent?: number;
    discount_text?: string;
  };
  isOwner?: boolean;
  onConfirm?: (orderData: any) => void;
  cartItems?: any[];
  isCartCheckout?: boolean;
}

export function CheckoutDrawerContent({ item, businessName, storeId, promotion, isOwner = false, onConfirm, cartItems, isCartCheckout }: Props) {
  const { clearCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { closeDrawer } = useActionDrawer();
  
  // Delivery info state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  // Get user data and active orders on component mount
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        
        // Fetch and pre-fill profile data using server action
        const { data: profile } = await getUserProfile(user.id);
        if (profile) {
          setName(profile.full_name || '');
          setPhone(profile.phone || '');
          setAddress(profile.address || '');
        }

        const targetStoreId = storeId || item.store_id;
        if (targetStoreId) {
          const orders = await getUserOrders(user.id);
          const storeOrders = orders.filter((o: any) => o.store_id === targetStoreId && (o.status === 'PENDING' || o.status === 'VALIDATED'));
          setActiveOrders(storeOrders);
        }
      }
    };
    loadData();
  }, [storeId, item.store_id]);

  const hasDiscount = !!promotion?.discount_percent;
  const unitPrice = hasDiscount
    ? item.price * (1 - (promotion.discount_percent! / 100))
    : item.price;
  
  const totalPrice = unitPrice * quantity;

  const isFormValid = (name?.trim() || userEmail) && phone?.trim() && address?.trim();

  const effectiveStoreId = storeId || item.store_id;

  const handleOrder = async () => {
    if (!isFormValid || !effectiveStoreId) {
      toast.error('Veuillez remplir tous les champs requis');
      console.error('Validation failed:', { isFormValid, effectiveStoreId, name, phone, address });
      return;
    }
    
    setIsLoading(true);
    try {
      if (isCartCheckout && cartItems && cartItems.length > 0) {
        // Process each item in the cart
        const orders = [];
        const errors = [];
        
        for (const cartItem of cartItems) {
          try {
            const result = await createOrder({
              store_id: parseInt(cartItem.store_id),
              item_id: parseInt(cartItem.id),
              quantity: cartItem.quantity,
              unit_price: cartItem.discountedPrice || cartItem.price,
              total_price: (cartItem.discountedPrice || cartItem.price) * cartItem.quantity,
              customer_name: name,
              customer_phone: phone,
              customer_email: userEmail || '',
              delivery_address: address,
              customer_notes: notes || undefined,
            });
            orders.push(result);
          } catch (err: any) {
            console.error(`Error creating order for item ${cartItem.name}:`, err.message);
            errors.push({ name: cartItem.name, message: err.message });
          }

        }

        if (orders.length > 0) {
          clearCart();
          setIsSuccess(true);
          if (errors.length > 0) {
            toast.warning(`${orders.length} commandes créées, mais ${errors.length} articles étaient déjà en attente.`);
          } else {
            toast.success(`${orders.length} commandes créées avec succès! 🎉`);
          }

          onConfirm?.({
            orders: orders,
            isCart: true
          });
        } else if (errors.length > 0) {
          throw new Error(errors[0].message);
        }
      } else {
        // Single item checkout
        const result = await createOrder({
          store_id: effectiveStoreId,
          item_id: item.id,
          quantity,
          unit_price: item.price,
          total_price: totalPrice,
          customer_name: name,
          customer_phone: phone,
          customer_email: userEmail || '',
          delivery_address: address,
          customer_notes: notes || undefined,
        });

        if (result.success) {
          setIsSuccess(true);
          toast.success('Commande créée avec succès! 🎉');
          
          onConfirm?.({
            itemId: item.id,
            quantity,
            totalPrice,
            businessName,
            orderNumber: result.order?.order_number,
            customer: { name, phone, address }
          });
        }
      }

      if (isSuccess || true) { // Re-fetch activity if any order succeeded
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const orders = await getUserOrders(user.id);
          const storeOrders = orders.filter((o: any) => o.store_id === effectiveStoreId && (o.status === 'PENDING' || o.status === 'VALIDATED'));
          setActiveOrders(storeOrders);
        }

        setTimeout(() => {
          setIsSuccess(false);
          closeDrawer();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Erreur lors de la création de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  if (isOwner) {
    return (
      <div className="py-12 space-y-6 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
          <Package className="w-8 h-8 text-blue-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Votre propre article</h3>
          <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
            Vous ne pouvez pas passer de commande dans votre propre boutique.
          </p>
        </div>
        <button
          onClick={() => closeDrawer()}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Existing Orders Section */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-black uppercase tracking-tight">Vos commandes en cours</h4>
          </div>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="scale-[0.9] origin-top -mb-10">
                <OrderCard 
                  id={order.id.toString()}
                  order_number={order.order_number}
                  businessName={businessName || 'Boutique'}
                  status={order.status}
                  total_price={order.total_price}
                  date={new Date(order.created_at).toLocaleDateString()}
                />
              </div>
            ))}
          </div>
          <div className="h-px bg-stone-100 my-8" />
        </div>
      )}
      {/* Success State */}
      {isSuccess && (
        <div className="space-y-4 py-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600 tracking-tight">Commande créée!</h3>
          <p className="text-sm text-slate-500">Votre commande a été enregistrée avec succès. Le propriétaire la validera bientôt.</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fermeture dans 2 secondes...</p>
        </div>
      )}

      {!isSuccess && (
        <>
          {/* Product Summary Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex gap-4 items-center">
            <div className="w-20 h-20 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0">
              {item.main_image ? (
                <img src={item.main_image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-100">
                  <Package className="w-8 h-8 text-stone-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 truncate">{businessName}</p>
              <h3 className="text-base font-black text-stone-900 leading-tight line-clamp-2">{item.name}</h3>
              <p className="text-sm font-bold text-blue-600 mt-1">{unitPrice.toLocaleString()} DT <span className="text-[10px] text-stone-400 font-medium">l'unité</span></p>
            </div>
          </div>

          {/* Configuration Section */}
          {!isCartCheckout && (
            <div className="bg-slate-50 rounded-2xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-700">Quantité</p>
                  <div className="flex items-center gap-4 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors text-slate-400"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-black text-slate-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors text-slate-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
  
              {/* Order Summary */}
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sous-total ({quantity} items)</span>
                  <span className="font-bold text-slate-900">{(item.price * quantity).toLocaleString()} DT</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-sm text-rose-500">
                    <span>Réduction</span>
                    <span className="font-bold">-{((item.price - unitPrice) * quantity).toLocaleString()} DT</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-slate-900">Total commande</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">{totalPrice.toLocaleString()} DT</span>
                </div>
              </div>
            </div>
          )}
          {isCartCheckout && (
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-indigo-900">Total du panier</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">{totalPrice.toLocaleString()} DT</span>
              </div>
            </div>
          )}

          {/* Delivery Information Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Informations de livraison</h4>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
                <input 
                  type="text" 
                  placeholder="Ex: Ahmed Ben Salem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Numéro de téléphone</label>
                <input 
                  type="tel" 
                  placeholder="Ex: +216 22 222 222"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse de livraison</label>
                <textarea 
                  placeholder="Ex: Rue 123, Immeuble Alpha, Tunis"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (optionnel)</label>
                <textarea 
                  placeholder="Ex: Livraison avant 18h, heure précise..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 italic">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700">Commande sécurisée</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100 italic">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700">Garantie satisfaction</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleOrder}
            disabled={isLoading || !isFormValid}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
              isLoading || !isFormValid
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100' 
                : 'bg-stone-900 hover:bg-stone-800 text-white active:scale-95 shadow-stone-200'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Traitement...
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                Confirmer la commande
              </>
            )}
          </button>

          {!isFormValid && (
            <p className="text-center text-[10px] text-rose-500 font-bold uppercase tracking-wider animate-pulse">
              Veuillez remplir toutes les informations
            </p>
          )}

          <p className="text-center text-[11px] text-stone-400 font-medium pt-2">Validation par le commerçant requise</p>
        </>
      )}
    </div>
  );
}
