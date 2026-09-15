import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext.js';
import { POPULAR_CITIES } from '../services/location.js';

export const LocationModal: React.FC = () => {
  const {
    currentLocation,
    isDetecting,
    isLocationModalOpen,
    closeLocationModal,
    detectLocation,
    selectLocation,
    setCustomLocation
  } = useLocation();

  const [cityInput, setCityInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');

  if (!isLocationModalOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setCustomLocation(cityInput, pincodeInput);
    setCityInput('');
    setPincodeInput('');
  };

  return (
    <div className="modal-overlay open" id="location-modal-overlay" onClick={closeLocationModal}>
      <div
        className="location-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="close-modal-btn"
          aria-label="Close location selector"
          onClick={closeLocationModal}
        >
          ✕
        </button>

        <div className="location-modal-header">
          <span className="loc-icon-large">📍</span>
          <h2>Choose Your Delivery Location</h2>
          <p>
            Delivery options and speeds may vary based on your selected address.
          </p>
        </div>

        {/* Current Location Badge */}
        <div className="current-location-box">
          <div className="current-loc-left">
            <span className="pulse-dot"></span>
            <div>
              <small>CURRENT LOCATION</small>
              <strong>{currentLocation.formatted}</strong>
              {currentLocation.countryName && (
                <span> ({currentLocation.countryName})</span>
              )}
            </div>
          </div>
          <span className="source-pill">{currentLocation.source.toUpperCase()}</span>
        </div>

        {/* 1. Auto Detect Button */}
        <button
          className="auto-detect-btn"
          onClick={() => detectLocation()}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <>
              <span className="loc-spinner"></span>
              <span>Fetching Real GPS Location & Pincode...</span>
            </>
          ) : (
            <>
              <span>🎯</span>
              <span>Auto-Detect Current Location (GPS / Free API)</span>
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>OR SELECT POPULAR CITIES</span>
        </div>

        {/* 2. Popular Cities Grid */}
        <div className="popular-cities-grid">
          {POPULAR_CITIES.map((city, idx) => (
            <button
              key={idx}
              className={`city-pill ${
                currentLocation.city === city.city ? 'active' : ''
              }`}
              onClick={() => selectLocation(city)}
            >
              <strong>{city.city}</strong>
              <small>{city.postalCode}</small>
            </button>
          ))}
        </div>

        <div className="auth-divider">
          <span>OR ENTER CUSTOM CITY / PINCODE</span>
        </div>

        {/* 3. Manual Pincode & City Entry */}
        <form className="manual-loc-form" onSubmit={handleManualSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="City (e.g. Chicago, Paris, Pune)"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Postal / Zip Code (e.g. 60601)"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value)}
            />
          </div>
          <button type="submit" className="primary-button loc-submit-btn">
            Apply Location
          </button>
        </form>
      </div>
    </div>
  );
};
