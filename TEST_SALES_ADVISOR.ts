/**
 * Test API - Sales Recommendations
 * Run this locally to test the implementation:
 * 
 * USAGE:
 * 1. Replace STORE_ID with an actual store ID
 * 2. Make sure you're authenticated in your browser
 * 3. Open browser console and run:
 * 
 *    fetch('/api/dashboard/123/sales-recommendations')
 *      .then(r => r.json())
 *      .then(d => console.log(d))
 * 
 * Or use curl:
 * 
 *    curl -X GET http://localhost:3000/api/dashboard/123/sales-recommendations \
 *      -H "Cookie: [your-session-cookie]"
 */

export const TEST_API = {
  endpoint: '/api/dashboard/:storeId/sales-recommendations',
  method: 'GET',
  auth: 'Required (store owner)',
  
  exampleRequest: `
    fetch('/api/dashboard/1/sales-recommendations')
      .then(r => r.json())
      .then(data => console.log('Recommendations:', data.recommendations))
  `,

  expectedResponse: {
    success: true,
    recommendations: [
      {
        type: 'dormant_product',
        title: 'Relancer T-shirt blanc',
        description: '237 vues mais seulement 8 ventes (ratio: 29.6)...',
        suggestedDiscount: 15,
        targetItems: [42],
        targetItemNames: ['T-shirt blanc'],
        urgency: 'high',
        estimatedImpact: 'Hausse conversions 20-30%',
        confidence: 0.92
      }
    ],
    summary: {
      totalItems: 45,
      totalOrders: 128,
      totalBookings: 23
    }
  }
};

// Quick component test
export const TEST_COMPONENT = `
'use client';
import AIAdvisorSection from '@/components/dashboard/AIAdvisorSection';

export default function TestPage() {
  return (
    <div className="p-8">
      <AIAdvisorSection storeId={1} />
    </div>
  );
}
`;
