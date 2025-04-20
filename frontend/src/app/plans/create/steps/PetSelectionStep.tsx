import React, { useEffect } from 'react';
import Image from 'next/image';
import { Pet } from '@/types/travel';
import { useGetPetsQuery } from '@/store/api/travelApi'; // Assuming travelApi has pets endpoints
import { handleApiError } from '@/store/api';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface PetSelectionStepProps {
  formData: {
    pet: number;
    [key: string]: any;
  };
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const PetSelectionStep: React.FC<PetSelectionStepProps> = ({
  formData,
  onChange,
  onNext,
  isValid,
  isLoading,
}) => {
  const { data: pets, isLoading: isPetsLoading, error: petsError, refetch: refetchPets } = useGetPetsQuery();

  // Validate form when pets are loaded or selection changes
  useEffect(() => {
    if (pets && formData.pet) {
      // Check if selected pet exists in the list
      const selectedPetExists = pets.some(pet => pet.id === formData.pet);
      if (selectedPetExists) {
        setStepValid(true);
      }
    }
  }, [pets, formData.pet]);

  // Helper function to set step validity
  const setStepValid = (valid: boolean) => {
    // This would be passed down from the parent component
  };

  // Handler for pet selection
  const handlePetSelect = (petId: number) => {
    onChange('pet', petId);
  };

  if (isPetsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your pets...</p>
      </div>
    );
  }

  if (petsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load pets</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{handleApiError(petsError)}</p>
        <button
          onClick={() => refetchPets()}
          className="text-sm font-medium text-primary flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  // If no pets are available, show an empty state with a link to create a pet
  if (!pets || pets.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No Pets Found</h2>
        <p className="text-muted-foreground mb-4">
          You need to add a pet before creating a travel plan.
        </p>
        <a
          href="/pets/create"
          className="bg-primary text-white px-4 py-2 rounded-md font-medium"
        >
          Add a Pet
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select a Pet for Travel</h2>
      <p className="text-muted-foreground mb-6">
        Choose which pet will be traveling with you. The travel requirements will be tailored to this pet.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.pet === pet.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handlePetSelect(pet.id)}
          >
            <div className="flex items-start gap-3">
              <div className="relative w-16 h-16 overflow-hidden rounded-full bg-muted flex-shrink-0">
                {pet.image ? (
                  <Image
                    src={pet.image}
                    alt={pet.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    {pet.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pet.type_name || 'Pet'} {pet.breed ? `• ${pet.breed}` : ''}
                </p>
                {pet.age && (
                  <p className="text-sm text-muted-foreground">Age: {pet.age} years</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Validation message if needed */}
      {!isValid && formData.pet === 0 && (
        <p className="text-destructive text-sm mt-4">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          Please select a pet to continue
        </p>
      )}
    </div>
  );
};

export default PetSelectionStep;

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TravelPlanFormData, Pet } from '../page';

// Props interface for the PetSelectionStep component
interface PetSelectionStepProps {
  formData: TravelPlanFormData;
  updateFormData: (fieldName: string, value: any) => void;
  errors: Record<string, string>;
}

// Mock data for pets
const MOCK_PETS: Pet[] = [
  {
    id: '1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    imageUrl: '/placeholder-pet.jpg',
  },
  {
    id: '2',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 2,
    imageUrl: '/placeholder-pet.jpg',
  },
  {
    id: '3',
    name: 'Max',
    species: 'Dog',
    breed: 'German Shepherd',
    age: 4,
    imageUrl: '/placeholder-pet.jpg',
  },
  {
    id: '4',
    name: 'Bella',
    species: 'Cat',
    breed: 'Maine Coon',
    age: 1,
    imageUrl: '/placeholder-pet.jpg',
  },
  {
    id: '5',
    name: 'Charlie',
    species: 'Dog',
    breed: 'Beagle',
    age: 5,
    imageUrl: '/placeholder-pet.jpg',
  },
];

const PetSelectionStep: React.FC<PetSelectionStepProps> = ({ 
  formData, 
  updateFormData, 
  errors 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<string>('all');

  // Filter pets based on search term and species filter
  const filteredPets = MOCK_PETS.filter(pet => {
    // Apply species filter
    if (filterSpecies !== 'all' && pet.species.toLowerCase() !== filterSpecies.toLowerCase()) {
      return false;
    }
    
    // Apply search term filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      return (
        pet.name.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Handle pet selection
  const handlePetSelection = (pet: Pet) => {
    updateFormData('pet', pet);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select a Pet</h2>
      <p className="text-muted-foreground">
        Choose which pet will be traveling. This information will be used to determine the travel requirements.
      </p>

      {/* Error message */}
      {errors.pet && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errors.pet}
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name or breed..."
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="species" className="block text-sm font-medium text-muted-foreground mb-1">
            Filter by Species
          </label>
          <select
            id="species"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
          >
            <option value="all">All Species</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
          </select>
        </div>
      </div>

      {/* Pet Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPets.length > 0 ? (
          filteredPets.map((pet) => (
            <div 
              key={pet.id}
              onClick={() => handlePetSelection(pet)}
              className={`border ${formData.pet?.id === pet.id ? 'border-primary bg-primary-50' : 'border-border bg-card'} 
                rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={pet.imageUrl}
                    alt={pet.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{pet.name}</h3>
                  
                  <div className="mt-1 space-y-1 text-sm">
                    <p className="flex items-center gap-1">
                      <span className="font-medium text-muted-foreground">Species:</span> 
                      <span>{pet.species}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="font-medium text-muted-foreground">Breed:</span> 
                      <span>{pet.breed}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="font-medium text-muted-foreground">Age:</span> 
                      <span>{pet.age} year{pet.age !== 1 ? 's' : ''}</span>
                    </p>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {formData.pet?.id === pet.id && (
                  <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center p-8 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-2">No pets found matching your criteria.</p>
            <p className="text-sm">Try adjusting your filters or add a new pet.</p>
          </div>
        )}
      </div>
      
      {/* Add New Pet Link */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground mb-2">Don't see your pet?</p>
        <Link
          href="/pets/create"
          className="text-primary hover:underline font-medium"
        >
          Add a New Pet
        </Link>
      </div>
    </div>
  );
};

export default PetSelectionStep;

