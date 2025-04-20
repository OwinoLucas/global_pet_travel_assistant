"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Types for pet data
interface PetFormData {
  // Basic information
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Other';
  speciesOther?: string;
  breed: string;
  birthdate: string;
  sex: 'Male' | 'Female';
  color: string;
  weight: string;
  neutered: boolean;
  imageUrl: string;
  
  // Health information
  vaccinations: {
    rabies: boolean;
    rabiesDate?: string;
    distemper: boolean;
    distemperDate?: string;
    parvo: boolean;
    parvoDate?: string;
    other: { name: string; date: string }[];
  };
  medicalConditions: string;
  medications: string;
  allergies: string;
  lastCheckup: string;
  veterinarian: {
    name: string;
    phone: string;
    address: string;
  };
  
  // Travel documentation
  microchipped: boolean;
  microchipNumber?: string;
  microchipDate?: string;
  passport: boolean;
  passportNumber?: string;
  passportIssueDate?: string;
}

// Initial pet form data
const initialPetData: PetFormData = {
  name: '',
  species: 'Dog',
  breed: '',
  birthdate: '',
  sex: 'Male',
  color: '',
  weight: '',
  neutered: false,
  imageUrl: '/placeholder-pet.jpg',
  
  vaccinations: {
    rabies: false,
    distemper: false,
    parvo: false,
    other: []
  },
  medicalConditions: '',
  medications: '',
  allergies: '',
  lastCheckup: '',
  veterinarian: {
    name: '',
    phone: '',
    address: ''
  },
  
  microchipped: false,
  passport: false
};

// Steps configuration
const STEPS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'health', label: 'Health' },
  { id: 'travel', label: 'Travel Docs' },
  { id: 'review', label: 'Review' }
];

export default function CreatePetPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [petData, setPetData] = useState<PetFormData>(initialPetData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update pet data
  const updatePetData = (fieldName: string, value: any) => {
    // Handle nested properties
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      setPetData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PetFormData],
          [child]: value
        }
      }));
    } else {
      setPetData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
    
    // Clear error for this field if it exists
    if (errors[fieldName]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // File upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, this would upload to a server
      // For now, we'll use a local URL
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      updatePetData('imageUrl', imageUrl);
    }
  };

  // Add vaccination to other vaccinations list
  const addOtherVaccination = (name: string, date: string) => {
    if (!name || !date) return;
    
    const updatedVaccinations = {
      ...petData.vaccinations,
      other: [...petData.vaccinations.other, { name, date }]
    };
    
    updatePetData('vaccinations', updatedVaccinations);
  };

  // Remove vaccination from other vaccinations list
  const removeOtherVaccination = (index: number) => {
    const updatedVaccinations = {
      ...petData.vaccinations,
      other: petData.vaccinations.other.filter((_, i) => i !== index)
    };
    
    updatePetData('vaccinations', updatedVaccinations);
  };

  // Validate current step before proceeding
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!petData.name.trim()) newErrors.name = 'Pet name is required';
        if (!petData.breed.trim()) newErrors.breed = 'Breed is required';
        if (!petData.birthdate) newErrors.birthdate = 'Birthdate is required';
        if (petData.species === 'Other' && !petData.speciesOther?.trim()) {
          newErrors.speciesOther = 'Please specify the species';
        }
        if (!petData.weight) newErrors.weight = 'Weight is required';
        break;
        
      case 1: // Health
        if (petData.vaccinations.rabies && !petData.vaccinations.rabiesDate) {
          newErrors['vaccinations.rabiesDate'] = 'Rabies vaccination date is required';
        }
        if (!petData.lastCheckup) newErrors.lastCheckup = 'Last checkup date is required';
        break;
        
      case 2: // Travel Docs
        if (petData.microchipped && !petData.microchipNumber?.trim()) {
          newErrors.microchipNumber = 'Microchip number is required';
        }
        if (petData.passport && !petData.passportNumber?.trim()) {
          newErrors.passportNumber = 'Passport number is required';
        }
        break;
        
      case 3: // Review
        // Just make sure basic info is complete
        if (!petData.name.trim()) newErrors.name = 'Pet name is required';
        if (!petData.breed.trim()) newErrors.breed = 'Breed is required';
        if (!petData.birthdate) newErrors.birthdate = 'Birthdate is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        handleSubmit();
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/pets');
      }, 2000);
    }, 1500);
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return '';
    
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} year${age !== 1 ? 's' : ''}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pet Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                    Pet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                    value={petData.name}
                    onChange={(e) => updatePetData('name', e.target.value)}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                {/* Species */}
                <div>
                  <label htmlFor="species" className="block text-sm font-medium text-muted-foreground mb-1">
                    Species <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="species"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
                    value={petData.species}
                    onChange={(e) => updatePetData('species', e.target.value)}
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
  
                {/* Species Other */}
                {petData.species === 'Other' && (
                  <div>
                    <label htmlFor="speciesOther" className="block text-sm font-medium text-muted-foreground mb-1">
                      Specify Species <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="speciesOther"
                      className={`w-full px-3 py-2 border ${errors.speciesOther ? 'border-red-300' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                      value={petData.speciesOther || ''}
                      onChange={(e) => updatePetData('speciesOther', e.target.value)}
                    />
                    {errors.speciesOther && <p className="text-red-500 text-xs mt-1">{errors.speciesOther}</p>}
                  </div>
                )}
                
                {/* Breed */}
                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-muted-foreground mb-1">
                    Breed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="breed"
                    className={`w-full px-3 py-2 border ${errors.breed ? 'border-red-300' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                    value={petData.breed}
                    onChange={(e) => updatePetData('breed', e.target.value)}
                  />
                  {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
                </div>
  
                {/* Birthdate */}
                <div>
                  <label htmlFor="birthdate" className="block text-sm font-medium text-muted-foreground mb-1">
                    Birthdate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="birthdate"
                    className={`w-full px-3 py-2 border ${errors.birthdate ? 'border-red-300' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                    value={petData.birthdate}
                    onChange={(e) => updatePetData('birthdate', e.target.value)}
                  />
                  {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>}
                </div>
  
                {/* Sex */}
                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-muted-foreground mb-1">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sex"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
                    value={petData.sex}
                    onChange={(e) => updatePetData('sex', e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
  
                {/* Color */}
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-muted-foreground mb-1">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="color"
                    className={`w-full px-3 py-2 border ${errors.color ? 'border-red-300' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                    value={petData.color}
                    onChange={(e) => updatePetData('color', e.target.value)}
                  />
                  {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
                </div>
  
                {/* Weight */}
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-muted-foreground mb-1">
                    Weight <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="weight"
                    className={`w-full px-3 py-2 border ${errors.weight ? 'border-red-300' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                    value={petData.weight}
                    onChange={(e) => updatePetData('weight', e.target.value)}
                  />
                  {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                </div>
  
                {/* Neutered */}
                <div className="col-span-full">
                  <label htmlFor="neutered" className="text-sm font-medium text-muted-foreground">
                    Neutered <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        id="neutered"
                        className="form-checkbox"
                        checked={petData.neutered}
                        onChange={(e) => updatePetData('neutered', e.target.checked)}
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {/* Step 2: Health */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Health Information</h2>
  
              {/* Vaccinations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vaccinations</h3>
  
                {/* Rabies */}
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="rabies"
                    className="form-checkbox"
                    checked={petData.vaccinations.rabies}
                    onChange={(e) => updatePetData('vaccinations.rabies', e.target.checked)}
                  />
                  <label htmlFor="rabies" className="text-sm">Rabies</label>
                  {petData.vaccinations.rabies && (
                    <div>
                      <label htmlFor="rabiesDate" className="text-sm font-medium text-muted-foreground">Date</label>
                      <input
                        type="date"
                        id="rabiesDate"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        value={petData.vaccinations.rabiesDate || ''}
                        onChange={(e) => updatePetData('vaccinations.rabiesDate', e.target.value)}
                      />
                      {errors['vaccinations.rabiesDate'] && <p className="text-red-500 text-xs mt-1">{errors['vaccinations.rabiesDate']}</p>}
                    </div>
                  )}
                </div>
  
                {/* Distemper */}
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="distemper"
                    className="form-checkbox"
                    checked={petData.vaccinations.distemper}
                    onChange={(e) => updatePetData('vaccinations.distemper', e.target.checked)}
                  />
                  <label htmlFor="distemper" className="text-sm">Distemper</label>
                  {petData.vaccinations.distemper && (
                    <div>
                      <label htmlFor="distemperDate" className="text-sm font-medium text-muted-foreground">Date</label>
                      <input
                        type="date"
                        id="distemperDate"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        value={petData.vaccinations.distemperDate || ''}
                        onChange={(e) => updatePetData('vaccinations.distemperDate', e.target.value)}
                      />
                    </div>
                  )}
                </div>
  
                {/* Parvo */}
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="parvo"
                    className="form-checkbox"
                    checked={petData.vaccinations.parvo}
                    onChange={(e) => updatePetData('vaccinations.parvo', e.target.checked)}
                  />
                  <label htmlFor="parvo" className="text-sm">Parvo</label>
                  {petData.vaccinations.parvo && (
                    <div>
                      <label htmlFor="parvoDate" className="text-sm font-medium text-muted-foreground">Date</label>
                      <input
                        type="date"
                        id="parvoDate"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        value={petData.vaccinations.parvoDate || ''}
                        onChange={(e) => updatePetData('vaccinations.parvoDate', e.target.value)}
                      />
                    </div>
                  )}
                </div>
  
                {/* Add Other Vaccinations */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Other Vaccinations</h4>
                  {petData.vaccinations.other.map((vacc, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span>{vacc.name} - {formatDate(vacc.date)}</span>
                      <button
                        type="button"
                        onClick={() => removeOtherVaccination(index)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOtherVaccination('New Vaccine', '2025-01-01')}
                    className="text-primary hover:text-primary-600 text-xs mt-2"
                  >
                    Add Other Vaccination
                  </button>
                </div>
              </div>
            </div>
          )}
  
          {/* Step 3: Travel Docs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Travel Documentation</h2>
  
              {/* Microchipped */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="microchipped"
                  className="form-checkbox"
                  checked={petData.microchipped}
                  onChange={(e) => updatePetData('microchipped', e.target.checked)}
                />
                <label htmlFor="microchipped" className="text-sm">Microchipped</label>
                {petData.microchipped && (
                  <div>
                    <label htmlFor="microchipNumber" className="text-sm font-medium text-muted-foreground">Microchip Number</label>
                    <input
                      type="text"
                      id="microchipNumber"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={petData.microchipNumber || ''}
                      onChange={(e) => updatePetData('microchipNumber', e.target.value)}
                    />
                  </div>
                )}
              </div>
  
              {/* Passport */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="passport"
                  className="form-checkbox"
                  checked={petData.passport}
                  onChange={(e) => updatePetData('passport', e.target.checked)}
                />
                <label htmlFor="passport" className="text-sm">Passport</label>
                {petData.passport && (
                  <div>
                    <label htmlFor="passportNumber" className="text-sm font-medium text-muted-foreground">Passport Number</label>
                    <input
                      type="text"
                      id="passportNumber"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={petData.passportNumber || ''}
                      onChange={(e) => updatePetData('passportNumber', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
  
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handlePrevious}
              className="text-sm font-medium text-primary hover:text-primary-600"
              disabled={currentStep === 0}
            >
              Previous
            </button>
            <button
              type="submit"
              className="text-sm font-medium text-primary hover:text-primary-600"
            >
              {currentStep === 2 ? 'Submit' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}  
