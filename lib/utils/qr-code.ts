/**
 * QR Code Utility Functions
 * Handles QR code generation, encoding, and validation for orders and bookings
 */

/**
 * Generate QR data string for an order
 * Format: ORD:ORDER_ID:TRACKING_CODE:TIMESTAMP
 */
export function generateOrderQRData(orderId: number, trackingCode: string): string {
  return `ORD:${orderId}:${trackingCode}:${Date.now()}`;
}

/**
 * Generate QR data string for a booking
 * Format: BK:BOOKING_ID:BOOKING_NUMBER:TIMESTAMP
 */
export function generateBookingQRData(bookingId: number, bookingNumber: string): string {
  return `BK:${bookingId}:${bookingNumber}:${Date.now()}`;
}

/**
 * Parse QR code data
 * Extracts type, ID, code, and timestamp from QR string
 */
export function parseQRData(qrData: string) {
  const [type, id, code, timestamp] = qrData.split(':');

  return {
    type: type as 'ORD' | 'BK',
    id: parseInt(id),
    code: code,
    timestamp: parseInt(timestamp),
    isExpired: Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000, // 24 hours
  };
}

/**
 * Validate QR code format and expiration
 */
export function validateQRCode(qrData: string): { valid: boolean; error?: string } {
  try {
    const parsed = parseQRData(qrData);

    if (!parsed.type || !['ORD', 'BK'].includes(parsed.type)) {
      return { valid: false, error: 'Format de code invalide' };
    }

    if (isNaN(parsed.id) || isNaN(parsed.timestamp)) {
      return { valid: false, error: 'Code QR corrompu' };
    }

    if (parsed.isExpired) {
      return { valid: false, error: 'Code QR expiré (>24h)' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Erreur lors du parsing du code QR' };
  }
}

/**
 * Generate a user-friendly QR token
 * Short format suitable for display and manual entry if needed
 */
export function generateQRToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${random}${timestamp.toString(36).toUpperCase()}`;
}

/**
 * Format QR token for display
 * Adds visual separation for easier reading
 * Example: "ABC123-DEF456"
 */
export function formatQRTokenForDisplay(token: string): string {
  // Split into groups of 6
  return token.match(/.{1,6}/g)?.join('-') ?? token;
}

/**
 * Clean QR token for comparison
 * Removes all non-alphanumeric characters
 */
export function cleanQRToken(token: string): string {
  return token.replace(/[^A-Z0-9]/g, '').toUpperCase();
}

/**
 * Compare two QR tokens (case-insensitive, ignores formatting)
 */
export function compareQRTokens(token1: string, token2: string): boolean {
  return cleanQRToken(token1) === cleanQRToken(token2);
}

/**
 * Get QR code URL using a QR service API
 * Using qrserver.com free API
 * 
 * @param data - The data to encode (order number, tracking code, etc.)
 * @param size - Size of the QR code image (200-300 recommended)
 */
export function getQRCodeImageUrl(data: string, size: number = 250): string {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
}

/**
 * Alternative: Get QR code from another provider (ZXing)
 */
export function getQRCodeImageUrlZXing(data: string, size: number = 250): string {
  const encodedData = encodeURIComponent(data);
  return `https://zxing.org/w/chart?cht=qr&chs=${size}x${size}&chld=L&choe=UTF-8&chl=${encodedData}`;
}

/**
 * Generate a complete QR code object for display
 */
export interface QRCodeObject {
  data: string;        // Raw data
  displayValue: string; // Formatted for display
  imageUrl: string;    // QR code image URL
  type: 'ORDER' | 'BOOKING';
}

export function generateQRCodeObject(
  id: number,
  trackingCode: string,
  type: 'ORDER' | 'BOOKING'
): QRCodeObject {
  const data = type === 'ORDER'
    ? generateOrderQRData(id, trackingCode)
    : generateBookingQRData(id, trackingCode);

  return {
    data,
    displayValue: trackingCode,
    imageUrl: getQRCodeImageUrl(trackingCode, 300),
    type,
  };
}

/**
 * Get time remaining until QR code expires (24 hours)
 * Returns human-readable string
 */
export function getQRExpirationTime(createdAtTimestamp: number): string {
  const expiresAt = createdAtTimestamp + 24 * 60 * 60 * 1000;
  const now = Date.now();
  const timeLeft = expiresAt - now;

  if (timeLeft <= 0) {
    return 'Expiré';
  }

  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m restantes`;
  }
  return `${minutes}m restantes`;
}

/**
 * Check if QR code is close to expiration (within 1 hour)
 */
export function isQRCodeExpiringSoon(createdAtTimestamp: number): boolean {
  const expiresAt = createdAtTimestamp + 24 * 60 * 60 * 1000;
  const now = Date.now();
  const timeLeft = expiresAt - now;

  return timeLeft < 60 * 60 * 1000; // Less than 1 hour
}
