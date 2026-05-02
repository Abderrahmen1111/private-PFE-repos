'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, ShoppingBag, Store, CheckCircle2, Loader2, QrCode, X, Clock, Package, Calendar } from 'lucide-react';
import { useCartStore, CartItem } from '@/lib/store/use-cart-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cancelOrder, getUserOrders, createOrder } from '@/lib/actions/orders';
import { getQRCodeImageUrl } from '@/lib/utils/qr-code';
import { createClient } from '@/lib/supabase/client';
import { getUserBookings, updateBookingStatus } from '@/lib/actions/reservation';
import { getUserProfile } from '@/lib/actions/users';
import OrderCard from '@/components/profile/order-card';
import ReservationHistoryCard from '@/components/profile/ReservationHistoryCard';
import { toast } from 'sonner';
import { useActionDrawer } from '@/hooks/useActionDrawer';

export default function CartView() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'cart' | 'orders' | 'bookings'>('cart');
  const [userOrders, setUserOrders] = React.useState<any[]>([]);
  const [userBookings, setUserBookings] = React.useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const router = useRouter();
  const { openDrawer } = useActionDrawer();

  const fetchActivity = async () => {
    try {
      const { data: { user } } = await createClient().auth.getUser();
      if (user) {
        const [orders, bookings] = await Promise.all([
          getUserOrders(user.id),
          getUserBookings(user.id)
        ]);
        setUserOrders(orders);
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  React.useEffect(() => {
    setMounted(true);
    fetchActivity();
  }, []);

  if (!mounted) return null;

  const pendingOrders = userOrders.filter(o => o.status === 'PENDING');
  const validatedOrders = userOrders.filter(o => o.status === 'VALIDATED');
  const otherOrders = userOrders.filter(o => !['PENDING', 'VALIDATED'].includes(o.status));
  
  // Filter active bookings (demandes) and hide history (COMPLETED, CANCELLED)
  const activeBookings = userBookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));

  if (items.length === 0 && pendingOrders.length === 0 && validatedOrders.length === 0 && activeBookings.length === 0 && !isLoadingActivity) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-6"
        >
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </motion.div>
        <h2 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">Aucune activité pour le moment</h2>
        <p className="text-stone-500 mb-8 max-w-xs">
          Votre panier est vide et vous n'avez pas de commandes en cours. Explorez nos offres pour commencer !
        </p>
        <Link href="/shop">
          <button className="px-8 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-xl">
            Découvrir la boutique
          </button>
        </Link>
      </div>
    );
  }

  const groupedByStore = items.reduce((acc, item) => {
    if (!acc[item.store_name]) {
      acc[item.store_name] = [];
    }
    acc[item.store_name].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Open checkout drawer for the entire cart
    // We'll pass the first item as a reference, but the drawer will now handle pre-filling
    const firstItem = items[0];
    
    openDrawer('checkout', {
      item: {
        id: firstItem.id,
        name: `Commande groupée (${items.length} articles)`,
        price: getTotalPrice(),
        main_image: firstItem.image,
      },
      businessName: items.length > 1 ? "Plusieurs boutiques" : firstItem.store_name,
      storeId: parseInt(firstItem.store_id),
      // Pass a flag or the whole cart if we want to handle multiple orders in the drawer
      cartItems: items,
      isCartCheckout: true,
      onConfirm: () => {
        fetchActivity();
      }
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(parseInt(orderId));
      toast.success("Commande annulée avec succès");
      fetchActivity();
    } catch (error: any) {
      toast.error("Erreur lors de l'annulation: " + error.message);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(parseInt(bookingId), 'CANCELLED');
      toast.success("Réservation annulée avec succès");
      fetchActivity();
    } catch (error: any) {
      toast.error("Erreur lors de l'annulation: " + error.message);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Premium Header with Integrated Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 pb-8 border-b border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-3 rounded-2xl bg-stone-50 text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-3xl font-black text-stone-900 tracking-tighter whitespace-nowrap">Mon Activité</h1>
          </div>

          <div className="bg-stone-50 p-1.5 rounded-[1.5rem] inline-flex items-center gap-1 border border-stone-100">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
                activeTab === 'cart'
                  ? 'bg-white text-indigo-600 shadow-sm border border-stone-100'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <ShoppingBag className={`w-4 h-4 ${activeTab === 'cart' ? 'text-indigo-600' : 'text-stone-300'}`} />
              Panier
              {items.length > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  activeTab === 'cart' ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-500'
                }`}>
                  {items.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-indigo-600 shadow-sm border border-stone-100'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-indigo-600' : 'text-stone-300'}`} />
              Commandes
              {(pendingOrders.length + validatedOrders.length) > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-500'
                }`}>
                  {pendingOrders.length + validatedOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
                activeTab === 'bookings'
                  ? 'bg-white text-indigo-600 shadow-sm border border-stone-100'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-indigo-600' : 'text-stone-300'}`} />
              Réservations
              {activeBookings.length > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                  activeTab === 'bookings' ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-500'
                }`}>
                  {activeBookings.length}
                </span>
              )}
            </button>
          </div>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${
              showHistory 
                ? 'bg-stone-900 text-white border-stone-900 shadow-lg' 
                : 'bg-white text-stone-400 border-stone-100 hover:text-stone-600 hover:border-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {showHistory ? "Masquer l'historique" : "Afficher l'historique"}
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-black text-stone-300 block uppercase tracking-[0.2em] mb-1">Résumé</span>
            <div className="flex items-center gap-3 font-black text-stone-900">
              <div className="flex flex-col items-end">
                <span className="text-xl leading-none">{getTotalItems()}</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest">Articles</span>
              </div>
              <div className="w-px h-6 bg-stone-100" />
              <div className="flex flex-col items-end">
                <span className="text-xl leading-none text-indigo-600">{getTotalPrice().toLocaleString()}</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest">Dinars</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Cart Tab Content */}
          {activeTab === 'cart' && (
            <div className="space-y-8">
              {items.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">Dans votre panier</h2>
                    <button onClick={clearCart} className="text-xs font-bold text-stone-400 hover:text-rose-500 transition-colors uppercase tracking-widest">Vider tout</button>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {Object.entries(groupedByStore).map(([storeName, storeItems]) => (
                      <motion.div
                        key={storeName}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[2.5rem] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden mb-8"
                      >
                        <div className="px-8 py-5 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-stone-100">
                              <Store className="w-5 h-5 text-stone-400" />
                            </div>
                            <h3 className="font-black text-stone-800 text-sm tracking-tight uppercase">{storeName}</h3>
                          </div>
                        </div>
                        <div className="divide-y divide-stone-50">
                          {storeItems.map((item) => {
                            const isItemPending = pendingOrders.some(po => po.item_id === parseInt(item.id));
                            return (
                              <div key={item.id} className="p-8 flex gap-8">
                                <div className="w-28 h-28 rounded-3xl bg-stone-50 flex-shrink-0 overflow-hidden border border-stone-100 group">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                                      <ShoppingBag className="w-10 h-10" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-black text-xl text-stone-900 tracking-tight mb-2">{item.name}</h4>
                                      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-stone-100 text-stone-400 uppercase tracking-widest border border-stone-200">
                                        {item.item_type}
                                      </span>
                                    </div>
                                    {!isItemPending && (
                                      <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-3 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-6">
                                    {isItemPending ? (
                                      <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                                        <Clock className="w-4 h-4 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">En attente de validation</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-4 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-stone-200 text-stone-600 hover:text-rose-500 transition-all active:scale-95"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-base font-black text-stone-900 w-8 text-center">{item.quantity}</span>
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-stone-200 text-stone-600 hover:text-indigo-600 transition-all active:scale-95"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-6">
                                      {item.item_type === 'SERVICE' && (
                                        <button
                                          onClick={() => openDrawer('reservation', {
                                            itemId: item.id,
                                            businessName: item.store_name,
                                            businessId: item.store_id,
                                            storeId: parseInt(item.store_id),
                                            service: {
                                              id: parseInt(item.id),
                                              name: item.name,
                                              price: item.price,
                                              main_image: item.image,
                                              store_id: parseInt(item.store_id),
                                              duration_minutes: 30
                                            },
                                            address: 'En ligne / Sur place',
                                            rating: 4.5,
                                            reviewCount: 12,
                                            ownerId: item.owner_id,
                                          })}
                                          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center gap-2.5"
                                        >
                                          <Calendar className="w-4 h-4" />
                                          Réserver
                                        </button>
                                      )}
                                      <div className="text-right">
                                        <span className="text-[10px] font-black text-stone-300 block uppercase tracking-widest mb-1">Prix total</span>
                                        <span className="text-2xl font-black text-stone-900 tracking-tighter">
                                          {((item.discountedPrice || item.price) * item.quantity).toLocaleString()} <span className="text-xs font-bold text-stone-400 uppercase">DT</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </>
              ) : (
                <div className="py-32 text-center bg-stone-50/50 rounded-[4rem] border-2 border-dashed border-stone-100">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-stone-200/50">
                    <ShoppingBag className="w-12 h-12 text-stone-200" />
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mb-3 tracking-tight">Votre panier est vide</h3>
                  <p className="text-stone-400 font-medium mb-10 max-w-sm mx-auto">Explorez nos boutiques et services pour commencer votre expérience.</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="px-10 py-4 bg-stone-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-stone-800 transition-all shadow-2xl active:scale-95"
                  >
                    Découvrir l'accueil
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab Content */}
          {activeTab === 'orders' && (
            <div className="space-y-12">
              {validatedOrders.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase tracking-tighter">Commandes Prêtes</h2>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Présentez le code QR au commerçant</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {validatedOrders.map(order => (
                      <OrderCard 
                        key={order.id}
                        id={order.id.toString()}
                        order_number={order.order_number}
                        businessName={order.stores?.name}
                        businessImage={order.stores?.logo_url}
                        status={order.status}
                        total_price={order.total_price}
                        date={new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        onCancel={handleCancelOrder}
                      />
                    ))}
                  </div>
                </section>
              )}

              {pendingOrders.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase tracking-tighter">En cours</h2>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">En attente de validation commerçant</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {pendingOrders.map(order => (
                      <OrderCard 
                        key={order.id}
                        id={order.id.toString()}
                        order_number={order.order_number}
                        businessName={order.stores?.name}
                        businessImage={order.stores?.logo_url}
                        status={order.status}
                        total_price={order.total_price}
                        date={new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        onCancel={handleCancelOrder}
                      />
                    ))}
                  </div>
                </section>
              )}

              {showHistory && otherOrders.length > 0 && (
                <section className="space-y-6 pt-6 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-stone-100 text-stone-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase tracking-tighter">Historique</h2>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Vos commandes passées</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {otherOrders.map(order => (
                      <OrderCard 
                        key={order.id}
                        id={order.id.toString()}
                        order_number={order.order_number}
                        businessName={order.stores?.name}
                        businessImage={order.stores?.logo_url}
                        status={order.status}
                        total_price={order.total_price}
                        date={new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        onCancel={handleCancelOrder}
                      />
                    ))}
                  </div>
                </section>
              )}


              {userOrders.length === 0 && (
                <div className="py-24 text-center bg-stone-50 rounded-[3rem] border border-stone-100">
                  <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Aucune commande enregistrée</p>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab Content */}
          {activeTab === 'bookings' && (
            <div className="space-y-12">
              {activeBookings.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase tracking-tighter">Mes Rendez-vous</h2>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Prestations de services et réservations</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {activeBookings.map(booking => (
                      <ReservationHistoryCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancel={handleCancelBooking}
                      />
                    ))}
                  </div>

                  {showHistory && userBookings.filter(b => !['PENDING', 'CONFIRMED'].includes(b.status)).length > 0 && (
                    <section className="space-y-6 pt-12 border-t border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-stone-100 text-stone-400">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase tracking-tighter">Historique des RDV</h2>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Vos réservations passées</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-8">
                        {userBookings.filter(b => !['PENDING', 'CONFIRMED'].includes(b.status)).map(booking => (
                          <ReservationHistoryCard 
                            key={booking.id} 
                            booking={booking} 
                            onCancel={handleCancelBooking}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="py-24 text-center bg-stone-50 rounded-[3rem] border border-stone-100">
                  <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Aucune réservation active</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Sticky Summary */}
        <div className="lg:col-span-1">
          {items.length > 0 ? (
            <div className="sticky top-12 space-y-8">
              <div className="bg-stone-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-8 tracking-tighter uppercase flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-indigo-500" />
                    Paiement
                  </h3>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between text-stone-400 font-bold text-sm uppercase tracking-widest">
                      <span>Sous-total</span>
                      <span className="text-white">{getTotalPrice().toLocaleString()} DT</span>
                    </div>
                    <div className="flex justify-between text-stone-400 font-bold text-sm uppercase tracking-widest">
                      <span>Frais de service</span>
                      <span className="text-white">0.00 DT</span>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                      <span className="text-sm font-black text-stone-500 uppercase tracking-[0.2em]">Total Final</span>
                      <div className="text-right">
                        <span className="text-4xl font-black block leading-none tracking-tighter">{getTotalPrice().toLocaleString()}</span>
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em]">Dinars Tunisiens</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-sm tracking-[0.15em] uppercase transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isCheckingOut ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirmer Tout
                      </>
                    )}
                  </button>
                  
                  <div className="mt-8 flex items-center justify-center gap-6 opacity-20 grayscale hover:opacity-100 transition-opacity">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                 <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Offre Spéciale</p>
                   <h4 className="text-xl font-black tracking-tight mb-4">-15% sur votre prochaine réservation</h4>
                   <button className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Utiliser</button>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-[2.5rem] p-8 border border-stone-100 text-center">
              <ShoppingBag className="w-8 h-8 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">Le récapitulatif apparaîtra ici</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-8 right-8 p-3 rounded-full bg-stone-100 text-stone-400 hover:text-stone-900 transition-all z-10 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-10 text-center bg-stone-50 border-b border-stone-100">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-stone-900 tracking-tighter mb-4">Parfait !</h2>
                <p className="text-stone-500 font-medium px-6 leading-relaxed">Vos demandes ont été transmises avec succès. Le commerçant va les valider sous peu.</p>
              </div>

              <div className="p-10 bg-white">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black tracking-[0.2em] uppercase text-xs hover:bg-stone-800 transition-all shadow-xl active:scale-95"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
