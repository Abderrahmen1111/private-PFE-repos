import CartView from '@/components/profile/cart';
import Navbar from '@/components/Navbar';

export default function CartPage() {
  return (
    <main className="min-h-screen bg-stone-50/50">
      <Navbar />
      <div className="pt-24 pb-20">
        <CartView />
      </div>
    </main>
  );
}
