
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
    initMap?: () => void; 
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
  const [isLoading, setIsLoading] = useState(false); // For individual prediction requests
  const [isApiLoading, setIsApiLoading] = useState(true); // For initial API script load
  
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const initializeGoogleMapsServices = useCallback(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
      setIsApiLoading(false); // API is ready
      console.log('Google Maps Places API services initialized for AddressAutocomplete.');
    } else {
      console.warn('Google Maps API not fully ready for service initialization in AddressAutocomplete.');
      // Optionally retry or keep isApiLoading true
    }
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.googleMapsApiLoaded) {
        initializeGoogleMapsServices();
      } else {
        window.addEventListener('googleMapsApiLoaded', initializeGoogleMapsServices);
        // Check if google object becomes available even if event was missed
        const timeoutId = setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places && !autocompleteServiceRef.current) {
             console.log("Google API became available after timeout, initializing services.");
             initializeGoogleMapsServices();
          } else if (!autocompleteServiceRef.current) {
            console.warn("Google API still not available after timeout for AddressAutocomplete.");
            setIsApiLoading(false); // Stop showing API loading indefinitely
          }
        }, 3000); // Wait for 3 seconds
        return () => {
          window.removeEventListener('googleMapsApiLoaded', initializeGoogleMapsServices);
          clearTimeout(timeoutId);
        };
      }
    }
  }, [initializeGoogleMapsServices]);


  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (isApiLoading || !autocompleteServiceRef.current || input.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        if (input.length >= 3 && (isApiLoading || !autocompleteServiceRef.current)) {
          console.warn("AddressAutocomplete: fetchSuggestions called but API services not ready.");
        }
        return;
      }
      setIsLoading(true); // Loading for this specific request

      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(-38.1, -57.7), 
        new window.google.maps.LatLng(-37.9, -57.5)  
      );

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'AR' },
          types: ['address'],
        },
        (predictions, status) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const mdpPredictions = predictions.filter(p => 
              p.description.toLowerCase().includes('mar del plata')
            );
            setSuggestions(mdpPredictions.length > 0 ? mdpPredictions : predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS && status !== window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
              console.error('Google Places AutocompleteService error: ' + status);
            }
          }
        }
      );
    },
    [isApiLoading] 
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


  if (typeof window !== 'undefined' && isApiLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label htmlFor={`${id}-loading`}>{label}</Label>}
        <div className="flex items-center p-2 border rounded-md text-muted-foreground text-sm h-10 bg-muted/50">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando API de direcciones...
        </div>
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
          onFocus={() => { if (inputValue && suggestions.length > 0 && !isApiLoading) setShowSuggestions(true);}}
          placeholder={placeholder}
          className="w-full"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls={`${id}-suggestions`}
          disabled={isApiLoading} // Disable input if API still loading after initial check
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {!isApiLoading && showSuggestions && suggestions.length > 0 && (
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
              aria-selected={false}
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
