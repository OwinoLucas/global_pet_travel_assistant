'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useCreatePlanMutation, 
} from '@/store/api/plansApi';
import { useGetPetTypesQuery } from '@/store/api/travelApi';
import { 
  useGetCountriesQuery, 
} from '@/store/api/travelApi';
import { CreateTravelPlanRequest } from '@/types/travel';
import { handleApiError } from '@/store/api';
import { Check, ChevronRight, Loader2 } from 'lucide-react';

// Step components
import PetSelectionStep from './steps/PetSelectionStep';
import TravelDetailsStep from './steps/TravelDetailsStep';
import DateSelectionStep from './steps/DateSelectionStep';
import RequirementsStep from './steps/RequirementsStep';
import ReviewStep from './steps/ReviewStep';

// Step type definitions
type StepName = 'pet' | 'travel' | 'dates' | 'requirements' | 'review';

interface StepInfo {
  name: StepName;
  label: string;
  component: React.FC<StepProps>;
}

interface FormData extends CreateTravelPlanRequest {
  name: string;
  pet: number;
  origin_country: number;
  destination_country: number;
  departure_date: string;
  return_date?: string;
  notes?: string;
}

interface StepProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const STEPS: StepInfo[] = [
  { name: 'pet', label: 'Pet Selection', component: PetSelectionStep },
  { name: 'travel', label: 'Travel Details', component: TravelDetailsStep },
  { name: 'dates', label: 'Travel Dates', component: DateSelectionStep },
  { name: 'requirements', label: 'Requirements', component: RequirementsStep },
  { name: 'review', label: 'Review & Submit', component: ReviewStep },
];

const CreateTravelPlan: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    pet: 0,
    origin_country: 0,
    destination_country: 0,
    departure_date: '',
  });

  // Form validation state
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({
    0: false, // Pet selection initially invalid until selection
    1: false, // Travel details initially invalid
    2: false, // Dates initially invalid
    3: true,  // Requirements step is always valid (optional)
    4: true,  // Review step is always valid
  });

  // API hooks
  const [createPlan, { isLoading: isCreating, error: createError }] = useCreatePlanMutation();
  const { isLoading: isLoadingPetTypes } = useGetPetTypesQuery();
  const { isLoading: isLoadingCountries } = useGetCountriesQuery();
  
  // Derived loading state
  const isLoading = isCreating || isLoadingPetTypes || isLoadingCountries;

  // Handle form field changes
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step navigation
  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Set step validation status
  const setStepValid = (isValid: boolean) => {
    setStepValidation(prev => ({
      ...prev,
      [currentStep]: isValid
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const result = await createPlan(formData).unwrap();
      router.push(`/plans/${result.id}`);
    } catch (error) {
      console.error('Failed to create travel plan:', error);
      // Error is handled by the Review component
    }
  };

  // Current step component
  const CurrentStepComponent = STEPS[currentStep].component;
  const isCurrentStepValid = stepValidation[currentStep] || false;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Travel Plan</h1>
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.name}>
              <div 
                className={`flex flex-col items-center ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  index < currentStep 
                    ? 'bg-primary text-white' 
                    : index === currentStep
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-muted text-muted-foreground'
                }`}>
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs hidden sm:block">{step.label}</span>
              </div>
              
              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Current step content */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <CurrentStepComponent
          formData={formData}
          onChange={handleChange}
          onNext={goToNextStep}
          onBack={goToPreviousStep}
          isValid={isCurrentStepValid}
          isLoading={isLoading}
        />
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={goToPreviousStep}
          disabled={currentStep === 0 || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background 
            hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={isLastStep ? handleSubmit : goToNextStep}
          disabled={!isCurrentStepValid || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white 
            hover:bg-primary/90 transition-colors flex items-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isLastStep ? 'Creating...' : 'Loading...'}
            </>
          ) : (
            <>
              {isLastStep ? 'Create Travel Plan' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </>
          )}
        </button>
      </div>
      
      {/* Error display */}
      {createError && (
        <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {handleApiError(createError)}
        </div>
      )}
    </div>
  );
};

export default CreateTravelPlan;

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Form steps
import PetSelectionStep from './steps/PetSelectionStep';
import TravelDetailsStep from './steps/TravelDetailsStep';
import DateSelectionStep from './steps/DateSelectionStep';
import RequirementsStep from './steps/RequirementsStep';
import ReviewStep from './steps/ReviewStep';

// Types for the travel plan form
export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  imageUrl: string;
};

export type TravelPlanFormData = {
  pet: Pet | null;
  originCountry: string;
  destinationCountry: string;
  departureDate: string;
  returnDate: string | null;
  requirements: {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    dueDate: string | null;
  }[];
  notes: string;
};

// Initial form data
const initialFormData: TravelPlanFormData = {
  pet: null,
  originCountry: '',
  destinationCountry: '',
  departureDate: '',
  returnDate: null,
  requirements: [],
  notes: '',
};

// Steps configuration
const STEPS = [
  { id: 'pet', label: 'Pet Selection' },
  { id: 'travel', label: 'Origin & Destination' },
  { id: 'dates', label: 'Travel Dates' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'review', label: 'Review' },
];

export default function CreateTravelPlanPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TravelPlanFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Update form data
  const updateFormData = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    
    // Clear error for this field if it exists
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Validate current step before proceeding
  const validateStep = () => {
    let valid = true;
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Pet Selection
        if (!formData.pet) {
          errors.pet = 'Please select a pet for this travel plan';
          valid = false;
        }
        break;
      case 1: // Travel Details
        if (!formData.originCountry) {
          errors.originCountry = 'Origin country is required';
          valid = false;
        }
        if (!formData.destinationCountry) {
          errors.destinationCountry = 'Destination country is required';
          valid = false;
        }
        break;
      case 2: // Date Selection
        if (!formData.departureDate) {
          errors.departureDate = 'Departure date is required';
          valid = false;
        }
        break;
      case 3: // Requirements
        // We'll assume requirements are optional or auto-generated
        break;
      case 4: // Review
        // Final validation before submission
        if (!formData.pet) errors.pet = 'Pet is required';
        if (!formData.originCountry) errors.originCountry = 'Origin country is required';
        if (!formData.destinationCountry) errors.destinationCountry = 'Destination country is required';
        if (!formData.departureDate) errors.departureDate = 'Departure date is required';
        valid = Object.keys(errors).length === 0;
        break;
    }

    setFormErrors(errors);
    return valid;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        // Submit the form
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
    // Here you would typically call an API to save the travel plan
    console.log('Submitting travel plan:', formData);
    
    // For now, just redirect to the plans page with a success message
    router.push('/plans?success=true');
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PetSelectionStep 
                 formData={formData} 
                 updateFormData={updateFormData} 
                 errors={formErrors} 
               />;
      case 1:
        return <TravelDetailsStep 
                 formData={formData} 
                 updateFormData={updateFormData} 
                 errors={formErrors} 
               />;
      case 2:
        return <DateSelectionStep 
                 formData={formData} 
                 updateFormData={updateFormData} 
                 errors={formErrors} 
               />;
      case 3:
        return <RequirementsStep 
                 formData={formData} 
                 updateFormData={updateFormData} 
                 errors={formErrors} 
               />;
      case 4:
        return <ReviewStep 
                 formData={formData} 
                 updateFormData={updateFormData} 
                 errors={formErrors} 
               />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Create Travel Plan</h1>
            <p className="text-muted-foreground mt-1">Plan your pet's travel journey step by step</p>
          </div>
          <Link
            href="/plans"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </section>

      {/* Progress Indicator */}
      <section className="bg-card rounded-lg border border-border p-4">
        <div className="flex justify-between mb-1">
          {STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className="flex flex-col items-center"
              style={{ width: `${100 / STEPS.length}%` }}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  index < currentStep 
                    ? 'bg-primary text-white' 
                    : index === currentStep 
                      ? 'bg-primary-100 text-primary-600 border-2 border-primary' 
                      : 'bg-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className={`text-xs mt-1 text-center ${
                index <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-1 bg-muted-foreground/20 mt-3">
          <div 
            className="absolute h-1 bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </section>

      {/* Step Content */}
      <section className="bg-card rounded-lg border border-border p-6">
        {renderStepContent()}
      </section>

      {/* Navigation Buttons */}
      <section className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded-md font-medium ${
            currentStep === 0 
              ? 'bg-muted-foreground/20 text-muted-foreground cursor-not-allowed' 
              : 'bg-muted text-foreground hover:bg-muted/80 transition-colors'
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {currentStep === STEPS.length - 1 ? 'Submit Plan' : 'Next Step'}
        </button>
      </section>
    </div>
  );
}

