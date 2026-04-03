# 📦 SYSTÈME DE COMMANDES - GUIDE COMPLET

## 🎯 Vue d'ensemble

Le système de commandes (`orders.ts`) permet aux clients de commander des produits via la page d'un commerce. Le propriétaire doit d'abord valider la commande, puis un QR code est généré pour confirmer la livraison.

---

## 📊 FLUX COMPLET DE LA COMMANDE

### Phase 1: CLIENT CRÉE UNE COMMANDE (Page Produit/Commerce)

```
[Client sur page produit]
        ↓
  [Clique sur "Commander"]
        ↓
  [Form: Quantité + Adresse]
        ↓
  [Appelle createOrder()]
        ↓
  Status: PENDING ✓
  Order Number: ORD-XXXXXX-XXXX ✓
  Dans DB ✓
```

**Code requis (dans page produit):**
```typescript
import { createOrder } from '@/lib/actions/orders';

async function handleOrderClick(formData: {
  quantity: number;
  delivery_address: string;
  customer_notes?: string;
}) {
  try {
    const result = await createOrder({
      store_id: storeId,
      item_id: productId,
      quantity: formData.quantity,
      unit_price: product.price,
      total_price: formData.quantity * product.price,
      customer_name: user.full_name,
      customer_phone: user.phone,
      customer_email: user.email,
      delivery_address: formData.delivery_address,
      customer_notes: formData.customer_notes,
    });
    
    if (result.success) {
      toast.success('Commande créée avec succès!');
    }
  } catch (error) {
    toast.error(error.message);
  }
}
```

---

### Phase 2: OWNER VER LA DEMANDE (Dashboard › Leads)

```
[Owner dashboard /dashboard/[id]/leads]
        ↓
  [Affiche PENDING orders via getPendingOrdersForStore()]
        ↓
  [Card avec détails de la commande]
        ├─ client_name, phone, email
        ├─ product_name + image
        ├─ quantity × price = total
        ├─ delivery_address
        └─ customer_notes
        ↓
  [Deux boutons: ✓ Accepter | ✗ Refuser]
```

**Code requis (dans /dashboard/[id]/leads):**
```typescript
import { getPendingOrdersForStore, validateOrder, cancelOrder } from '@/lib/actions/orders';

// Fetch orders
const pendingOrders = await getPendingOrdersForStore(storeId);

// Component pour afficher les commandes
function PendingOrderCard({ order }: { order: OrderRow }) {
  async function handleAccept() {
    await validateOrder(order.id);
    // After validation:
    // - Status: PENDING → VALIDATED
    // - tracking_code généré (QR token)
    // - validated_at timestamp enregistré
    toast.success('Commande acceptée!');
  }

  async function handleReject() {
    await cancelOrder(order.id, 'Commande refusée par le propriétaire');
    toast.info('Commande refusée');
  }

  return (
    <div className="order-card">
      <h3>{order.customer_name}</h3>
      <p>📞 {order.customer_phone}</p>
      <p>📧 {order.customer_email}</p>
      
      <div className="item-info">
        <img src={order.items.main_image} alt={order.items.name} />
        <h4>{order.items.name}</h4>
        <p>Qty: {order.quantity} × {order.unit_price}TB = {order.total_price}TB</p>
      </div>
      
      <p>📍 {order.delivery_address}</p>
      {order.customer_notes && <p>📝 {order.customer_notes}</p>}
      
      <button onClick={handleAccept} className="btn-success">✓ Accepter</button>
      <button onClick={handleReject} className="btn-danger">✗ Refuser</button>
    </div>
  );
}
```

---

### Phase 3: OWNER ACCEPTE LA COMMANDE

```
[Owner clique sur "Accepter"]
        ↓
  [Appelle validateOrder(orderId)]
        ↓
  Status: PENDING → VALIDATED ✓
  tracking_code généré ✓
  validated_at timestamp ✓
        ↓
  Commande disparaît de Leads
  Apparaît dans Transactions
```

---

### Phase 4: CLIENT VER LA COMMANDE (Profil › Commands)

```
[Client profile /profile/user]
        ↓
  [Section "Mes Commandes"]
        ↓
  [Affiche toutes les commandes via getUserOrders()]
        ├─ PENDING: "En attente de validation"
        ├─ VALIDATED: QR Code + "Scanner pour confirmer"
        ├─ COMPLETED: ✓ Livrée
        └─ CANCELLED: ✗ Annulée
```

**Code requis (dans /profile/user):**
```typescript
import { getUserOrders } from '@/lib/actions/orders';

// Fetch user orders
const orders = await getUserOrders(userId);

function UserOrdersSection() {
  return (
    <div className="commands-section">
      <h2>Mes Commandes</h2>
      {orders.length === 0 ? (
        <p>Aucune commande</p>
      ) : (
        orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge-yellow">⏳ En attente</span>;
      case 'VALIDATED':
        return <span className="badge-blue">📍 Prête à livrer</span>;
      case 'COMPLETED':
        return <span className="badge-green">✓ Livrée</span>;
      case 'CANCELLED':
        return <span className="badge-red">✗ Annulée</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="order-card">
      <div className="header">
        <h4>{order.items.name}</h4>
        {getStatusBadge(order.status)}
      </div>

      <img src={order.items.main_image} alt={order.items.name} />

      <div className="details">
        <p>Commande #: {order.order_number}</p>
        <p>Quantité: {order.quantity}</p>
        <p>Total: {order.total_price}TB</p>
        <p>Lieu: {order.delivery_address}</p>
      </div>

      {order.status === 'PENDING' && (
        <p className="info">⏳ Le propriétaire vérifie votre commande...</p>
      )}

      {order.status === 'VALIDATED' && (
        <>
          <p className="info">📍 La commande est prête! Le propriétaire scanner le code QR pour confirmer la livraison.</p>
          <div className="qr-section">
            <QRCodeDisplay qrCode={order.tracking_code} />
            <p className="small">Code: {order.tracking_code}</p>
          </div>
        </>
      )}

      {order.status === 'COMPLETED' && (
        <p className="success">✓ Commande livrée le {new Date(order.completed_at).toLocaleDateString()}</p>
      )}

      {order.status === 'CANCELLED' && (
        <p className="error">✗ Commande annulée: {order.vendor_notes}</p>
      )}
    </div>
  );
}
```

---

### Phase 5: OWNER VER DANS TRANSACTIONS (Dashboard › Transactions)

```
[Owner dashboard /dashboard/[id]/transactions]
        ↓
  [Affiche VALIDATED orders via getValidatedOrdersForStore()]
        ↓
  [Order card avec bouton "Scanner QR"]
        ├─ Customer details
        ├─ Product + quantity
        ├─ Total price
        └─ Status: "En livraison"
        ↓
  [Clique sur "Scanner QR Code"]
        ↓
  [Ouvre QR Scanner]
```

**Code requis (dans /dashboard/[id]/transactions):**
```typescript
import { getValidatedOrdersForStore } from '@/lib/actions/orders';

// Fetch validated orders (waiting for delivery)
const validatedOrders = await getValidatedOrdersForStore(storeId);

function ValidatedOrdersSection() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  function handleScanClick(order: OrderRow) {
    setSelectedOrder(order);
    setShowScanner(true);
  }

  if (showScanner && selectedOrder) {
    return (
      <QRScannerModal 
        order={selectedOrder}
        onClose={() => setShowScanner(false)}
        onSuccess={() => {
          toast.success('Commande livrée!');
          setShowScanner(false);
        }}
      />
    );
  }

  return (
    <div className="validated-orders">
      <h3>Commandes Prêtes à Livrer</h3>
      {validatedOrders.map(order => (
        <div key={order.id} className="order-item">
          <h4>{order.customer_name}</h4>
          <p>📦 {order.items.name} × {order.quantity}</p>
          <p>💰 {order.total_price}TB</p>
          <p>📍 {order.delivery_address}</p>
          <p className="status">En livraison</p>
          
          <button 
            onClick={() => handleScanClick(order)}
            className="btn-scan"
          >
            📱 Scanner QR Code
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### Phase 6: OWNER SCANNE LE QR CODE

```
[Owner clique "Scanner QR Code"]
        ↓
  [QR Scanner ouvre]
        ↓
  [Owner scanne le code QR de la commande]
        ↓
  [Code scanné avec succès]
        ↓
  [Deux options:]
  ├─ ✓ Confirmé/Livré
  └─ ✗ Échoué
```

**Code QR Scanner Component:**
```typescript
import { QrScanner } from '@yudiel/react-qr-scanner';
import { validateOrderByQR } from '@/lib/actions/orders';

interface QRScannerModalProps {
  order: OrderRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function QRScannerModal({ order, onClose, onSuccess }: QRScannerModalProps) {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (result: any) => {
    if (result && result.getText()) {
      const code = result.getText();
      setScannedCode(code);
    }
  };

  const handleSuccess = async () => {
    if (!scannedCode) return;
    
    setIsProcessing(true);
    try {
      // appelle validateOrderByQR avec 'success'
      await validateOrderByQR(scannedCode, 'success');
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFailed = async () => {
    if (!scannedCode) return;
    
    setIsProcessing(true);
    try {
      // appelle validateOrderByQR avec 'failed'
      await validateOrderByQR(scannedCode, 'failed');
      toast.info('Commande marquée comme échouée');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="qr-scanner-modal">
      <div className="modal-content">
        <h3>Scanner le QR Code</h3>
        <p>Commande: {order.order_number}</p>
        <p>Client: {order.customer_name}</p>

        {!scannedCode ? (
          <QrScanner
            onDecode={handleScan}
            onError={(error) => console.log(error)}
            containerStyle={{ width: '100%' }}
          />
        ) : (
          <div className="scan-result">
            <p className="success">✓ Code scanné: {scannedCode}</p>
            <div className="action-buttons">
              <button
                onClick={handleSuccess}
                disabled={isProcessing}
                className="btn-success"
              >
                ✓ Confirmé - Livré
              </button>
              <button
                onClick={handleFailed}
                disabled={isProcessing}
                className="btn-danger"
              >
                ✗ Échoué
              </button>
              <button
                onClick={() => setScannedCode(null)}
                disabled={isProcessing}
                className="btn-secondary"
              >
                Scanner de nouveau
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn-close">Fermer</button>
      </div>
    </div>
  );
}
```

---

### Phase 7: COMMANDE LIVRÉE OU ÉCHOUÉE

```
✓ SUCCESS:                          ✗ FAILED:
  Status: VALIDATED                   Status: VALIDATED
        ↓                                   ↓
  validateOrderByQR('success')        validateOrderByQR('failed')
        ↓                                   ↓
  Status: COMPLETED ✓                Status: CANCELLED
  completed_at timestamp ✓             Order rejected
  Disparaît de Transactions           Customer notifié
```

**Mise à jour du marking:**
```typescript
// markOrderAsDelivered() - appelé si scan SUCCESS
async function markOrderAsDelivered(orderId: number) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();
  
  // Order disparaît de Transactions, reste dans historique
  // Client voit "✓ Livrée"
}

// markOrderAsFailed() - appelé si scan FAILED
async function markOrderAsFailed(orderId: number, reason?: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'CANCELLED',
      vendor_notes: reason || 'Livraison échouée',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();
  
  // Client reçoit notification
  // Peut contacteur owner via support
}
```

---

## 🗂️ FICHIERS À MODIFIE

### 1. **Product/Business Page** (`/app/merchants/business/[id]/page.tsx`)
- Ajouter formulaire de commande
- Appeler `createOrder()` au click

### 2. **User Profile** (`/app/profile/user/page.tsx`)
- Ajouter section "Mes Commandes"
- Afficher `getUserOrders()`
- Afficher QR code si VALIDATED

### 3. **Owner Dashboard - Leads** (`/app/dashboard/[id]/leads/page.tsx`)
- Afficher `getPendingOrdersForStore()`
- Boutons "Accepter" / "Refuser"
- Appeler `validateOrder()` ou `cancelOrder()`

### 4. **Owner Dashboard - Transactions** (`/app/dashboard/[id]/transactions/page.tsx`)
- Afficher `getValidatedOrdersForStore()`
- Ajouter section "Commandes Prêtes"
- Bouton "Scanner QR Code"
- Intégrer QR Scanner

### 5. **Components**
- `OrderCard.tsx` - Card pour user profile
- `OrderLeadCard.tsx` - Card pour leads page
- `OrderTransactionCard.tsx` - Card pour transactions
- `QRScannerModal.tsx` - Modal scanner

### 6. **Utilities**
- `qr-code.ts` - Générer QR code depuis tracking_code
- `order-utils.ts` - Helper functions

---

## 🔗 STATUTS ET TRANSITIONS

| Statut | Provenance | Action | Destination |
|--------|-----------|--------|-------------|
| PENDING | Client crée | Owner Accepte | VALIDATED |
| PENDING | Client crée | Owner Refuse | CANCELLED |
| VALIDATED | Owner Accepte | QR Scan SUCCESS | COMPLETED |
| VALIDATED | Owner Accepte | QR Scan FAILED | CANCELLED |
| COMPLETED | QR SUCCESS | - | Final (Historique) |
| CANCELLED | Owner/QR | - | Final (Historique) |

---

## 📱 STRUCTURE DES DONNÉES

Chaque commande enregistre:
- ✅ Customer details (name, phone, email)
- ✅ Product details (id, qty, price)
- ✅ Delivery address
- ✅ Order number (unique)
- ✅ Tracking code (QR) - généré à la validation
- ✅ Timestamps (created, validated, completed)
- ✅ Notes (customer + vendor)

---

## 🚀 PRIORITÉ D'IMPLÉMENTATION

1. ✅ `orders.ts` server actions - **DONE**
2. ⏳ Formulaire commande sur page produit
3. ⏳ Section commandes dans profil utilisateur
4. ⏳ Page Leads avec demandes de commande
5. ⏳ QR Code Scanner component
6. ⏳ Page Transactions avec commandes prêtes
7. ⏳ Génération QR code visuelle

