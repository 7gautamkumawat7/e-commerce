import type { DeliveryLocation } from '../types.js';

export const DEFAULT_LOCATION: DeliveryLocation = {
  city: 'Mumbai',
  state: 'MH',
  postalCode: '400001',
  countryName: 'India',
  countryCode: 'IN',
  formatted: 'Mumbai 400001',
  source: 'preset'
};

export const POPULAR_CITIES: DeliveryLocation[] = [
  { city: 'Mumbai', state: 'MH', postalCode: '400001', countryName: 'India', countryCode: 'IN', formatted: 'Mumbai 400001', source: 'preset' },
  { city: 'Bengaluru', state: 'KA', postalCode: '560001', countryName: 'India', countryCode: 'IN', formatted: 'Bengaluru 560001', source: 'preset' },
  { city: 'Delhi', state: 'DL', postalCode: '110001', countryName: 'India', countryCode: 'IN', formatted: 'Delhi 110001', source: 'preset' },
  { city: 'New York', state: 'NY', postalCode: '10001', countryName: 'United States', countryCode: 'US', formatted: 'New York 10001', source: 'preset' },
  { city: 'London', state: 'ENG', postalCode: 'EC1A 1BB', countryName: 'United Kingdom', countryCode: 'GB', formatted: 'London EC1A', source: 'preset' },
  { city: 'San Francisco', state: 'CA', postalCode: '94102', countryName: 'United States', countryCode: 'US', formatted: 'San Francisco 94102', source: 'preset' },
  { city: 'Sydney', state: 'NSW', postalCode: '2000', countryName: 'Australia', countryCode: 'AU', formatted: 'Sydney 2000', source: 'preset' },
  { city: 'Tokyo', state: 'TK', postalCode: '100-0001', countryName: 'Japan', countryCode: 'JP', formatted: 'Tokyo 100-0001', source: 'preset' }
];

export async function fetchCurrentLocation(): Promise<{ success: boolean; location: DeliveryLocation; message: string }> {
  // 1. Try Browser GPS with Reverse Geocoding API
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      // Free, open, no-auth reverse geocoding API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (response.ok) {
        const data = await response.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
        const postalCode = data.postcode || '';
        const state = data.principalSubdivisionCode || data.principalSubdivision || '';
        const countryName = data.countryName || '';
        const countryCode = data.countryCode || '';
        const formatted = postalCode ? `${city} ${postalCode}` : `${city}, ${countryCode || countryName}`;

        const location: DeliveryLocation = {
          city,
          state,
          postalCode,
          countryName,
          countryCode,
          formatted,
          source: 'gps'
        };

        return {
          success: true,
          location,
          message: `📍 Detected location: ${formatted}`
        };
      }
    } catch (gpsError) {
      console.warn('GPS Geolocation unavailable or denied, falling back to IP Geolocation...', gpsError);
    }
  }

  // 2. Fallback to free IP-based Geolocation API
  try {
    const ipRes = await fetch('https://ipapi.co/json/');
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      const city = ipData.city || 'Your City';
      const postalCode = ipData.postal || '';
      const state = ipData.region_code || ipData.region || '';
      const countryName = ipData.country_name || '';
      const countryCode = ipData.country_code || '';
      const formatted = postalCode ? `${city} ${postalCode}` : `${city}, ${countryCode}`;

      const location: DeliveryLocation = {
        city,
        state,
        postalCode,
        countryName,
        countryCode,
        formatted,
        source: 'ip'
      };

      return {
        success: true,
        location,
        message: `🌐 Detected location via IP: ${formatted}`
      };
    }
  } catch (ipError) {
    console.warn('IP geolocation failed:', ipError);
  }

  return {
    success: false,
    location: DEFAULT_LOCATION,
    message: 'Could not automatically detect location. You can select your city manually.'
  };
}
