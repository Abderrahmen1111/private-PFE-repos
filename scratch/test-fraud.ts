import { analyzeFraud, FraudContext } from '../lib/actions/fraud-detection';

async function testFraud() {
  const mockOrderContext: FraudContext = {
    customer_id: '00000000-0000-0000-0000-000000000000',
    store_id: 1,
    item_id: 1,
    quantity: 25,
    total: 1500,
    delivery_address: 'Too short',
    entity_type: 'ORDER',
  };

  const mockBookingContext: FraudContext = {
    customer_id: '00000000-0000-0000-0000-000000000000',
    store_id: 1,
    item_id: 1,
    total: 50,
    entity_type: 'BOOKING',
  };

  console.log('--- Starting Fraud Analysis Test (Order) ---');
  try {
    const orderAnalysis = await analyzeFraud(mockOrderContext);
    console.log('Order Result:', JSON.stringify(orderAnalysis, null, 2));

    console.log('\n--- Starting Fraud Analysis Test (Booking) ---');
    const bookingAnalysis = await analyzeFraud(mockBookingContext);
    console.log('Booking Result:', JSON.stringify(bookingAnalysis, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

// Note: This script needs a valid Supabase environment and OpenRouter key to run fully.
// testFraud();
