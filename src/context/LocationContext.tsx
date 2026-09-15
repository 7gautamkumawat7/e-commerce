import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DeliveryLocation } from '../types.js';
import { fetchCurrentLocation, DEFAULT_LOCATION } from '../services/location.js';
import { useToast } from './ToastContext.js';

const LOCATION_STORAGE_KEY = 'shopcart_user_delivery_location';

interface LocationContextType {
  currentLocation: DeliveryLocation;
  isDetecting: boolean;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  detectLocation: () => Promise<DeliveryLocation>;
  selectLocation: (location: DeliveryLocation) => void;
  setCustomLocation: (city: string, postalCode: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation>(() => {
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(currentLocation));
    } catch (err) {
      console.error('Failed to save location:', err);
    }
  }, [currentLocation]);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  const detectLocation = async (): Promise<DeliveryLocation> => {
    setIsDetecting(true);
    showToast('📡 Detecting your current location...', 'info');

    const result = await fetchCurrentLocation();
    setIsDetecting(false);

    if (result.success) {
      setCurrentLocation(result.location);
      showToast(result.message, 'success');
      closeLocationModal();
      return result.location;
    } else {
      showToast(result.message, 'error');
      return currentLocation;
    }
  };

  const selectLocation = (location: DeliveryLocation) => {
    setCurrentLocation(location);
    showToast(`📍 Delivery location set to ${location.formatted}`, 'success');
    closeLocationModal();
  };

  const setCustomLocation = (city: string, postalCode: string) => {
    const loc: DeliveryLocation = {
      city: city.trim(),
      state: '',
      postalCode: postalCode.trim(),
      countryName: '',
      countryCode: '',
      formatted: postalCode.trim() ? `${city.trim()} ${postalCode.trim()}` : city.trim(),
      source: 'manual'
    };
    setCurrentLocation(loc);
    showToast(`📍 Delivery location updated to ${loc.formatted}`, 'success');
    closeLocationModal();
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isDetecting,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        detectLocation,
        selectLocation,
        setCustomLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
