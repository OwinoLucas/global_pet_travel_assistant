import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useGetRequirementsQuery } from '@/store/api/travelApi';
import { AlertCircle, Calendar, Edit, MapPin, Paw, CheckCircle, Loader2 } from 'lucide-react';
import { Requirement } from '@/types/travel';

interface ReviewStepProps {
  formData: {
    name: string;
    pet: number;
    pet_name?: string;
    pet_image?: string;
    origin_country: number;
    origin_country_name?: string;
    destination_country: number;
    destination_country_name?: string;
    departure_date: string;
    return_date?: string;
    reviewed_requirements?: number[];
    [key: string]: any;
  };
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  onChange,
  onNext,
  isValid,
  isLoading: formIsLoading,
}) => {
  // Local state for plan name
  const [planName, setPlanName] = useState(formData.name || '');
  const [nameError, setNameError] = useState('');
  
  // Mark if requirements have been reviewed
  const requirementsReviewed = 
    formData.reviewed_requirements && 
    formData.reviewed_requirements.length > 0;

  // Fetch the requirements to verify if all have been reviewed
  const { 
    data: requirements, 
    isLoading: requirementsLoading 
  } = useGetRequirementsQuery({ 
    country: formData.destination_country,
    pet_type: formData.pet
  }, {
    // Skip if we don't have the necessary data yet
    skip: !formData.destination_country || !formData.pet
  });
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Check if all requirements have been reviewed
  const allRequirementsReviewed = React.useMemo(() => {
    if (!requirements || !formData.reviewed_requirements) {
      return false;
    }
    
    return requirements.length <= formData.reviewed_requirements.length;
  }, [requirements, formData.reviewed_requirements]);

  // Handle plan name input
  const handlePlanNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlanName(value);
    
    // Validate name
    if (!value.trim()) {
      setNameError('Please enter a name for your travel plan');
    } else if (value.length > 100) {
      setNameError('Plan name is too long (max 100 characters)');
    } else {
      setNameError('');
    }
    
    // Update form data
    onChange('name', value);
  };
  
  // Generate default plan name if empty
  useEffect(() => {
    if (!formData.name && formData.pet_name && formData.destination_country_name) {
      const defaultName = `${formData.pet_name}'s Trip to ${formData.destination_country_name}`;
      setPlanName(defaultName);
      onChange('name', defaultName);
    }
  }, [formData.pet_name, formData.destination_country_name, formData.name, onChange]);
  
  // Loading states
  const isLoading = formIsLoading || requirementsLoading;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Review Travel Plan</h2>
      <p className="text-muted-foreground mb-6">
        Review the details of your travel plan below. Make sure all information is correct before submitting.
      </p>
      
      {/* Plan Name */}
      <div className="bg-card border border-border rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">
          Travel Plan Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={planName}
          onChange={handlePlanNameChange}
          placeholder="Give your travel plan a name"
          className={`w-full px-3 py-2 border ${
            nameError ? 'border-destructive' : 'border-border'
          } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
        />
        {nameError && (
          <p className="text-destructive text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {nameError}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          This will help you identify this travel plan later.
        </p>
      </div>
      
      {/* Pet Details */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-medium flex items-center">
            <Paw className="h-4 w-4 mr-2" />
            Pet Information
          </h3>
        </div>
        
        <div className="p-4 flex items-center gap-4">
          <div className="h-16 w-16 relative rounded-full bg-muted overflow-hidden">
            {formData.pet_image ? (
              <Image
                src={formData.pet_image}
                alt={formData.pet_name || 'Pet'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                {formData.pet_name?.charAt(0) || 'P'}
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium">{formData.pet_name}</h4>
            <p className="text-sm text-muted-foreground">Pet ID: {formData.pet}</p>
          </div>
          
          <button
            onClick={onBack}
            className="ml-auto text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Edit className="h-3 w-3" /> Edit
          </button>
        </div>
      </div>
      
      {/* Travel Details */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Travel Information
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Origin and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Origin Country</h4>
              <p className="font-medium">{formData.origin_country_name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Destination Country</h4>
              <p className="font-medium">{formData.destination_country_name}</p>
            </div>
          </div>
          
          {/* Travel Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Departure Date
              </h4>
              <p className="font-medium">{formatDate(formData.departure_date)}</p>
            </div>
            
            {formData.return_date && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Return Date
                </h4>
                <p className="font-medium">{formatDate(formData.return_date)}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onBack}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Edit className="h-3 w-3" /> Edit
            </button>
          </div>
        </div>
      </div>
      
      {/* Requirements Summary */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-medium flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Requirements Status
          </h3>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading requirements...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {!requirements || requirements.length === 0 ? (
                <p className="text-muted-foreground">
                  No requirements found for this travel plan.
                </p>
              ) : (
                <>
                  <div className={`p-3 rounded-md border ${
                    allRequirementsReviewed 
                      ? 'bg-primary/5 border-primary/30 text-primary-foreground' 
                      : 'bg-warning/5 border-warning/30 text-warning-foreground'
                  }`}>
                    <div className="flex items-center">
                      {allRequirementsReviewed ? (
                        <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                      ) : (
                        <AlertCircle className="h-5 w-5 mr-2 text-warning" />
                      )}
                      <div>
                        <p className="font-medium">
                          {allRequirementsReviewed 
                            ? 'All requirements reviewed' 
                            : 'Not all requirements have been reviewed'
                          }
                        </p>
                        <p className="text-sm">
                          {formData.reviewed_requirements?.length || 0} of {requirements.length} requirements
                        </p>
                      </div>
                      
                      {!allRequirementsReviewed && (
                        <button
                          onClick={onBack}
                          className="ml-auto text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" /> Review Requirements
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {requirementsReviewed && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Requirements you've reviewed:</h4>
                      <ul className="ml-5 list-disc text-sm text-muted-foreground">
                        {requirements
                          .filter(req => formData.reviewed_requirements?.includes(req.id))
                          .slice(0, 3) // Only show first 3 to save space
                          .map(req => (
                            <li key={req.id}>{req.description}</li>
                          ))
                        }
                        {formData.reviewed_requirements && 
                          requirements.filter(req => formData.reviewed_requirements?.includes(req.id)).length > 3 && (
                            <li className="text-primary">
                              + {formData.reviewed_requirements.length - 3} more requirements
                            </li>
                          )
                        }
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Final validation */}
      {!isValid && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md">
          <h4 className="font-medium flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Please fix the following issues:
          </h4>
          <ul className="ml-6 mt-2 list-disc">
            {!planName.trim() && <li>Enter a name for your travel plan</li>}
            {!allRequirementsReviewed && <li>Review all travel requirements</li>}
          </ul>
        </div>
      )}
      
      {/* Final submission information */}
      <div className="bg-primary/5 border border-primary/30 p-4 rounded-md">
        <h4 className="font-medium text-primary mb-2">Ready to create your travel plan?</h4>
        <p className="text-sm text-muted-foreground">
          Review all information carefully. After submission, you'll be able to track your plan, 
          complete requirements, and upload documents from your dashboard.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { TravelPlanFormData } from '../page';

interface ReviewStepProps {
  formData: TravelPlanFormData;
  updateFormData: (fieldName: string, value: any) => void;
  errors: Record<string, string>;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const calculateRequirementsCompletion = () => {
    if (!formData.requirements || formData.requirements.length === 0) return 0;
    const completedCount = formData.requirements.filter(req => req.completed).length;
    return Math.round((completedCount / formData.requirements.length) * 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const documentStatus = () => {
    const docsRequired = formData.requirements.filter(req => req.documentRequired);
    if (docsRequired.length === 0) return { uploaded: 0, total: 0 };
    const docsUploaded = docsRequired.filter(req => req.documentUploaded).length;
    return { uploaded: docsUploaded, total: docsRequired.length };
  };

  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmed(e.target.checked);
    updateFormData('confirmed', e.target.checked);
  };

  const isPetComplete = !!formData.pet;
  const isRouteComplete = !!formData.originCountry && !!formData.destinationCountry;
  const isDatesComplete = !!formData.departureDate;
  const reqCompletion = calculateRequirementsCompletion();
  const docs = documentStatus();

  const generateWarnings = () => {
    const warnings = [];

    if (!isPetComplete) warnings.push('Please select a pet for this travel plan.');
    if (!isRouteComplete) warnings.push('Origin and destination countries are required.');
    if (!isDatesComplete) warnings.push('Departure date is required.');

    if (reqCompletion < 100) {
      warnings.push(`${formData.requirements.length - formData.requirements.filter(req => req.completed).length} requirement(s) are not marked as completed.`);
    }

    if (docs.uploaded < docs.total) {
      warnings.push(`${docs.total - docs.uploaded} document(s) are not uploaded.`);
    }

    return warnings;
  };

  const warnings = generateWarnings();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Your Travel Plan</h2>
      <p className="text-muted-foreground">
        Please review all the details of your pet travel plan before submission. You can go back to make changes if needed.
      </p>

      {/* Section Status Overview */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className={`p-4 rounded-lg text-center ${isPetComplete ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          <div className={`text-xl mb-1 ${isPetComplete ? 'text-green-600' : 'text-amber-600'}`}>
            {isPetComplete ? '✓' : '!'}
          </div>
          <h4 className="font-medium text-sm">Pet Info</h4>
        </div>

        <div className={`p-4 rounded-lg text-center ${isRouteComplete ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          <div className={`text-xl mb-1 ${isRouteComplete ? 'text-green-600' : 'text-amber-600'}`}>
            {isRouteComplete ? '✓' : '!'}
          </div>
          <h4 className="font-medium text-sm">Travel Route</h4>
        </div>

        <div className={`p-4 rounded-lg text-center ${isDatesComplete ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          <div className={`text-xl mb-1 ${isDatesComplete ? 'text-green-600' : 'text-amber-600'}`}>
            {isDatesComplete ? '✓' : '!'}
          </div>
          <h4 className="font-medium text-sm">Travel Dates</h4>
        </div>

        <div className={`p-4 rounded-lg text-center ${reqCompletion === 100 ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          <div className="text-xl mb-1 flex justify-center">
            <span className={reqCompletion === 100 ? 'text-green-600' : 'text-amber-600'}>
              {reqCompletion}%
            </span>
          </div>
          <h4 className="font-medium text-sm">Requirements</h4>
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="confirmation"
            className="mt-1 h-5 w-5 rounded border border-muted-foreground/30 text-primary focus:ring-primary"
            checked={confirmed}
            onChange={handleConfirmationChange}
          />
          <div>
            <label htmlFor="confirmation" className="font-medium text-foreground">
              I confirm that all information is correct
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              By submitting this form, you confirm that all the information provided is accurate and complete. 
              You understand that missing or incorrect information may result in travel delays or denial of entry for your pet.
            </p>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mt-4">
            <p className="font-medium">Important</p>
            <p className="text-sm mt-1">
              You can still submit your travel plan with warnings, but be aware that you'll need to address all outstanding items 
              before your pet's travel date.
            </p>
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md">
          <h3 className="font-medium">Please address the following before submission:</h3>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pet Information Section */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Pet Information</h3>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(new CustomEvent('goToStep', { detail: 0 }));
            }}
            className="text-sm text-primary hover:text-primary-600 transition-colors"
          >
            Edit
          </a>
        </div>

        {formData.pet ? (
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src={formData.pet.imageUrl}
                alt={formData.pet.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div>
              <h4 className="text-xl font-semibold">{formData.pet.name}</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
                <div className="flex items-center">
                  <span className="text-muted-foreground font-medium mr-2">Species:</span>
                  <span>{formData.pet.species}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground font-medium mr-2">Breed:</span>
                  <span>{formData.pet.breed}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground font-medium mr-2">Age:</span>
                  <span>{formData.pet.age} year{formData.pet.age !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No pet has been selected. Please go back to select a pet.
          </div>
        )}
      </div>

      {/* Travel Route Section */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Travel Route</h3>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(new CustomEvent('goToStep', { detail: 1 }));
            }}
            className="text-sm text-primary hover:text-primary-600 transition-colors"
          >
            Edit
          </a>
        </div>

        {isRouteComplete ? (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-8 mb-4">
              <div className="bg-primary-50 text-primary-800 px-4 py-3 rounded-md text-center font-medium">
                {formData.originCountry}
              </div>
              <div className="hidden md:block text-2xl text-muted-foreground">→</div>
              <div className="block md:hidden text-xl text-muted-foreground text-center">↓</div>
              <div className="bg-primary-50 text-primary-800 px-4 py-3 rounded-md text-center font-medium">
                {formData.destinationCountry}
              </div>
            </div>

            {formData.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Additional Notes:</h4>
                <p className="text-sm text-muted-foreground">{formData.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Travel route information is incomplete. Please go back to specify origin and destination.
          </div>
        )}
      </div>

      {/* Travel Dates Section */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Travel Dates</h3>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(new CustomEvent('goToStep', { detail: 2 }));
            }}
            className="text-sm text-primary hover:text-primary-600 transition-colors"
          >
            Edit
          </a>
        </div>

        {isDatesComplete ? (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Departure Date:</h4>
              <p className="font-medium">{formatDate(formData.departureDate)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Departure date is not set. Please go back to set a date.
          </div>
        )}
      </div>

      {/* Requirements Summary */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Requirements</h3>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(new CustomEvent('goToStep', { detail: 3 }));
            }}
            className="text-sm text-primary hover:text-primary-600 transition-colors"
          >
            Edit
          </a>
        </div>

        {formData.requirements && formData.requirements.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {formData.requirements.map((req, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {req.name}
                  {req.documentRequired && ' 📄'}
                </span>
                <span className={`text-sm ${req.completed ? 'text-green-600' : 'text-amber-600'}`}>
                  {req.completed ? 'Completed' : 'Incomplete'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No specific requirements listed.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
