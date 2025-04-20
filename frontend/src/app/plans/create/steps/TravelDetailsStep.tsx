import React, { useEffect, useState } from 'react';
import { useGetCountriesQuery } from '@/store/api/travelApi';
import { Country } from '@/types/travel';
import { handleApiError } from '@/store/api';
import { AlertCircle, RefreshCw, Loader2, Search, MapPin } from 'lucide-react';

interface TravelDetailsStepProps {
  formData: {
    origin_country: number;
    destination_country: number;
    [key: string]: any;
  };
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const TravelDetailsStep: React.FC<TravelDetailsStepProps> = ({
  formData,
  onChange,
  onNext,
  isValid,
  isLoading,
}) => {
  const { data: countries, isLoading: isCountriesLoading, error: countriesError, refetch: refetchCountries } = useGetCountriesQuery();
  
  // Local state for search filters
  const [originSearchTerm, setOriginSearchTerm] = useState('');
  const [destinationSearchTerm, setDestinationSearchTerm] = useState('');
  
  // Filtered countries based on search terms
  const filteredOriginCountries = countries?.filter(country => 
    country.name.toLowerCase().includes(originSearchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(originSearchTerm.toLowerCase())
  ) || [];
  
  const filteredDestinationCountries = countries?.filter(country => 
    country.name.toLowerCase().includes(destinationSearchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(destinationSearchTerm.toLowerCase())
  ) || [];
  
  // Update validation when selections change
  useEffect(() => {
    const isOriginSelected = formData.origin_country > 0;
    const isDestinationSelected = formData.destination_country > 0;
    const isDifferentCountries = formData.origin_country !== formData.destination_country;
    
    // Only valid if both are selected and they're different countries
    const isFormValid = isOriginSelected && isDestinationSelected && isDifferentCountries;
    
    // This would be passed from parent
    // setStepValid(isFormValid);
  }, [formData.origin_country, formData.destination_country]);

  // Handlers for selection
  const handleOriginSelect = (countryId: number) => {
    onChange('origin_country', countryId);
  };
  
  const handleDestinationSelect = (countryId: number) => {
    onChange('destination_country', countryId);
  };

  if (isCountriesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading countries...</p>
      </div>
    );
  }

  if (countriesError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load countries</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{handleApiError(countriesError)}</p>
        <button
          onClick={() => refetchCountries()}
          className="text-sm font-medium text-primary flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  // If no countries are available
  if (!countries || countries.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No Countries Available</h2>
        <p className="text-muted-foreground mb-4">
          There appears to be a problem with the country data. Please try again later.
        </p>
      </div>
    );
  }

  // Find selected countries for display
  const selectedOrigin = countries.find(c => c.id === formData.origin_country);
  const selectedDestination = countries.find(c => c.id === formData.destination_country);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Travel Details</h2>
      <p className="text-muted-foreground mb-6">
        Select the origin and destination countries for your pet's travel. This information will be used to determine the travel requirements.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Origin Country Selection */}
        <div>
          <h3 className="text-lg font-medium mb-3">Origin Country</h3>
          
          {/* Selected Origin Display */}
          {selectedOrigin && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedOrigin.name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrigin.code}</p>
              </div>
              <button 
                className="ml-auto text-sm text-muted-foreground hover:text-foreground"
                onClick={() => handleOriginSelect(0)}
              >
                Change
              </button>
            </div>
          )}

          {/* Origin Search */}
          {(!selectedOrigin || formData.origin_country === 0) && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for a country..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
                  value={originSearchTerm}
                  onChange={(e) => setOriginSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Origin Country List */}
              <div className="h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {filteredOriginCountries.length > 0 ? (
                  filteredOriginCountries.map(country => (
                    <div
                      key={country.id}
                      className="p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleOriginSelect(country.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{country.name}</p>
                          <p className="text-sm text-muted-foreground">{country.code}</p>
                        </div>
                        {formData.origin_country === country.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No countries found matching "{originSearchTerm}"
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Validation Error */}
          {!isValid && formData.origin_country === 0 && (
            <p className="text-destructive text-sm mt-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Please select an origin country
            </p>
          )}
        </div>
        
        {/* Destination Country Selection */}
        <div>
          <h3 className="text-lg font-medium mb-3">Destination Country</h3>
          
          {/* Selected Destination Display */}
          {selectedDestination && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedDestination.name}</p>
                <p className="text-sm text-muted-foreground">{selectedDestination.code}</p>
              </div>
              <button 
                className="ml-auto text-sm text-muted-foreground hover:text-foreground"
                onClick={() => handleDestinationSelect(0)}
              >
                Change
              </button>
            </div>
          )}

          {/* Destination Search */}
          {(!selectedDestination || formData.destination_country === 0) && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for a country..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg"
                  value={destinationSearchTerm}
                  onChange={(e) => setDestinationSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Destination Country List */}
              <div className="h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {filteredDestinationCountries.length > 0 ? (
                  filteredDestinationCountries.map(country => (
                    <div
                      key={country.id}
                      className={`p-3 cursor-pointer ${
                        formData.origin_country === country.id 
                          ? 'bg-muted/30 text-muted-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => formData.origin_country !== country.id && handleDestinationSelect(country.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{country.name}</p>
                          <p className="text-sm text-muted-foreground">{country.code}</p>
                        </div>
                        {formData.destination_country === country.id && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        {formData.origin_country === country.id && (
                          <span className="text-sm text-muted-foreground">Origin country</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No countries found matching "{destinationSearchTerm}"
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Validation Errors */}
          {!isValid && formData.destination_country === 0 && (
            <p className="text-destructive text-sm mt-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Please select a destination country
            </p>
          )}
          
          {formData.origin_country > 0 && formData.destination_country > 0 && 
           formData.origin_country === formData.destination_country && (
            <p className="text-destructive text-sm mt-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Origin and destination countries must be different
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelDetailsStep;

"use client";

import React, { useEffect, useState } from 'react';
import { TravelPlanFormData } from '../page';

// Props interface for TravelDetailsStep
interface TravelDetailsStepProps {
  formData: TravelPlanFormData;
  updateFormData: (fieldName: string, value: any) => void;
  errors: Record<string, string>;
}

// Mock list of countries (simplified for demo purposes)
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'RU', name: 'Russia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
].sort((a, b) => a.name.localeCompare(b.name));

const TravelDetailsStep: React.FC<TravelDetailsStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [countryError, setCountryError] = useState<string | null>(null);

  // Handle country changes
  const handleOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrigin = e.target.value;
    updateFormData('originCountry', newOrigin);
    
    // Validate that origin and destination are different
    if (newOrigin && formData.destinationCountry && newOrigin === formData.destinationCountry) {
      setCountryError('Origin and destination countries must be different');
    } else {
      setCountryError(null);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDestination = e.target.value;
    updateFormData('destinationCountry', newDestination);
    
    // Validate that origin and destination are different
    if (newDestination && formData.originCountry && newDestination === formData.originCountry) {
      setCountryError('Origin and destination countries must be different');
    } else {
      setCountryError(null);
    }
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData('notes', e.target.value);
  };

  // Check for validation errors on mount or when countries change
  useEffect(() => {
    if (formData.originCountry && 
        formData.destinationCountry && 
        formData.originCountry === formData.destinationCountry) {
      setCountryError('Origin and destination countries must be different');
    } else {
      setCountryError(null);
    }
  }, [formData.originCountry, formData.destinationCountry]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Travel Details</h2>
      <p className="text-muted-foreground">
        Select the origin and destination countries for your pet's travel. This will determine the specific travel requirements.
      </p>

      {/* Combined error message */}
      {(countryError || errors.originCountry || errors.destinationCountry) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {countryError || errors.originCountry || errors.destinationCountry}
        </div>
      )}

      {/* Country Selection Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Origin Country */}
        <div>
          <label htmlFor="originCountry" className="block text-sm font-medium text-foreground mb-1">
            Origin Country <span className="text-red-500">*</span>
          </label>
          <select
            id="originCountry"
            className={`w-full px-3 py-2 border ${
              errors.originCountry || countryError ? 'border-red-300 focus:ring-red-500' : 'border-border focus:ring-primary'
            } rounded-md focus:outline-none focus:ring-1 bg-card`}
            value={formData.originCountry}
            onChange={handleOriginChange}
          >
            <option value="">Select origin country</option>
            {COUNTRIES.map(country => (
              <option key={`origin-${country.code}`} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            The country your pet is currently in
          </p>
        </div>

        {/* Destination Country */}
        <div>
          <label htmlFor="destinationCountry" className="block text-sm font-medium text-foreground mb-1">
            Destination Country <span className="text-red-500">*</span>
          </label>
          <select
            id="destinationCountry"
            className={`w-full px-3 py-2 border ${
              errors.destinationCountry || countryError ? 'border-red-300 focus:ring-red-500' : 'border-border focus:ring-primary'
            } rounded-md focus:outline-none focus:ring-1 bg-card`}
            value={formData.destinationCountry}
            onChange={handleDestinationChange}
          >
            <option value="">Select destination country</option>
            {COUNTRIES.map(country => (
              <option key={`dest-${country.code}`} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            The country your pet will be traveling to
          </p>
        </div>
      </div>

      {/* Travel Route Visualization */}
      {formData.originCountry && formData.destinationCountry && !countryError && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mt-4">
          <h3 className="font-medium text-primary-700 mb-2">Travel Route</h3>
          <div className="flex items-center">
            <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-md">
              {formData.originCountry}
            </div>
            <div className="px-3">→</div>
            <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-md">
              {formData.destinationCountry}
            </div>
          </div>
          <p className="mt-3 text-sm text-primary-700">
            <span className="font-medium">Note:</span> Requirements will be based on this specific travel route.
          </p>
        </div>
      )}

      {/* Notes Section */}
      <div className="mt-6">
        <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
          Additional Notes <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={4}
          placeholder="Add any specific details about this travel plan..."
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
          value={formData.notes}
          onChange={handleNotesChange}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Include any special considerations or requirements for this travel
        </p>
      </div>

      {/* Travel Information */}
      <div className="bg-muted rounded-lg p-4 mt-6">
        <h3 className="font-medium mb-2">Travel Requirements Information</h3>
        <p className="text-sm text-muted-foreground">
          Each country has specific requirements for pets entering their borders. These may include:
        </p>
        <ul className="list-disc text-sm text-muted-foreground ml-5 mt-2 space-y-1">
          <li>Vaccinations (rabies, etc.)</li>
          <li>Microchipping</li>
          <li>Health certificates</li>
          <li>Blood tests</li>
          <li>Quarantine periods</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          After selecting your countries, we'll provide a detailed list of requirements specific to your travel route.
        </p>
      </div>
    </div>
  );
};

export default TravelDetailsStep;

