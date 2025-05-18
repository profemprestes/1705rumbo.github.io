
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  id: string;
  label: string;
  initialValue?: string;
  onAddressSelected: (address: string) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: typeof google;
    googleMapsApiLoaded?: boolean;
    initMap?: () => void; // Ensure initMap is declared if used as callback globally
  }
}

export function AddressAutocomplete({
  id,
  label,
  initialValue = '',
  onAddressSelected,
  placeholder = 'Comienza a escribir una dirección...',
  className,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  
  // useRef for services to persist across re-renders without re-initializing
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const initializeGoogleMapsServices = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        if (!autocompleteServiceRef.current) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
        if (!geocoderRef.current) {
          geocoderRef.current = new window.google.maps.Geocoder();
        }
        setIsApiReady(true);
        // console.log('Google Maps Places API services initialized.');
      } else {
        // console.log('Google Maps API not ready yet for service initialization.');
      }
    };

    if (window.googleMapsApiLoaded) {
      // console.log('googleMapsApiLoaded event was already fired or window.google exists.');
      initializeGoogleMapsServices();
    } else {
      // console.log('Adding event listener for googleMapsApiLoaded.');
      window.addEventListener('googleMapsApiLoaded', initializeGoogleMapsServices);
    }

    return () => {
      // console.log('Cleaning up googleMapsApiLoaded event listener.');
      window.removeEventListener('googleMapsApiLoaded', initializeGoogleMapsServices);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!isApiReady || !autocompleteServiceRef.current || input.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        if (input.length >= 3 && !isApiReady) {
          // console.warn("AddressAutocomplete: fetchSuggestions called but API not ready.");
        }
        return;
      }
      setIsLoading(true);

      // Bounds for Mar del Plata (approximate)
      // Lat: -38.1 to -37.9, Lng: -57.7 to -57.5
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(-38.1, -57.7), 
        new window.google.maps.LatLng(-37.9, -57.5)  
      );

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'AR' },
          types: ['address'],
          // bounds: bounds, // Biasing, not strict filtering for AutocompleteService
          // location: new google.maps.LatLng(-38.0055, -57.5426), // Center of Mar del Plata
          // radius: 20000, // 20km radius
        },
        (predictions, status) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Further client-side filtering for Mar del Plata
            const mdpPredictions = predictions.filter(p => 
              p.description.toLowerCase().includes('mar del plata')
            );
            setSuggestions(mdpPredictions.length > 0 ? mdpPredictions : predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS && status !== window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
              // console.error('Google Places AutocompleteService error: ' + status);
            }
          }
        }
      );
    },
    [isApiReady] // Ensures fetchSuggestions is recreated if isApiReady changes
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    onAddressSelected(value); 
    if (value) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: google.maps.places.AutocompletePrediction) => {
    setInputValue(suggestion.description);
    onAddressSelected(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // This check helps avoid rendering the input if the API is not ready on the client.
  // `typeof window !== 'undefined'` ensures this check only runs on the client.
  if (typeof window !== 'undefined' && !isApiReady && !window.google?.maps?.places) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="flex items-center p-2 border rounded-md text-muted-foreground text-sm h-10">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando API de direcciones...
        </div>
        {/* Render a disabled input or placeholder to maintain layout consistency */}
        <Input type="text" id={id} value={initialValue} readOnly placeholder={placeholder} className="bg-muted/50 hidden"/>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 relative", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => { if (inputValue && suggestions.length > 0) setShowSuggestions(true);}}
          placeholder={placeholder}
          className="w-full"
          autoComplete="off" // Standard autocomplete off
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls={`${id}-suggestions`}
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id={`${id}-suggestions`}
          ref={suggestionsRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id || index}
              role="option"
              aria-selected={false} // Can be enhanced with keyboard navigation
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
