
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
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
      setIsApiReady(true);
    } else {
      // Wait for custom event if API loads after initial check
      const handleApiLoad = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          geocoder.current = new window.google.maps.Geocoder();
          setIsApiReady(true);
        }
      };
      window.addEventListener('googleMapsApiLoaded', handleApiLoad);
      return () => {
        window.removeEventListener('googleMapsApiLoaded', handleApiLoad);
      };
    }
  }, []);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setIsLoading(true);

      // Bounds for Mar del Plata (approximate)
      // Lat: -38.1 to -37.9, Lng: -57.7 to -57.5
      // More specific bounds might be needed, or rely on componentRestrictions and session token.
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(-38.1, -57.7), // Southwest corner
        new window.google.maps.LatLng(-37.9, -57.5)  // Northeast corner
      );

      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'AR' },
          types: ['address'],
          // bounds: bounds, // Can make it too restrictive sometimes
          // location: new google.maps.LatLng(-38.0055, -57.5426), // Center of Mar del Plata
          // radius: 20000, // 20km radius
        },
        (predictions, status) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Further filter for Mar del Plata if needed, though componentRestrictions and biasing should help
            const mdpPredictions = predictions.filter(p => 
              p.description.toLowerCase().includes('mar del plata')
            );
            setSuggestions(mdpPredictions.length > 0 ? mdpPredictions : predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            console.error('PlacesServiceStatus: ' + status);
          }
        }
      );
    },
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    onAddressSelected(value); // Update parent with raw input as user types
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


  if (!isApiReady && !window.google?.maps?.places) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center p-2 border rounded-md text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando API de Google Maps...
        </div>
        <Input type="text" id={id} value={inputValue} readOnly placeholder="Esperando API..." className="bg-muted/50"/>
      </div>
    );
  }


  return (
    <div className={cn("space-y-2 relative", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        ref={inputRef}
        type="text"
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => { if (inputValue && suggestions.length > 0) setShowSuggestions(true);}}
        placeholder={placeholder}
        className="w-full"
        autoComplete="off"
      />
      {isLoading && <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-muted-foreground" />}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id || index}
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
