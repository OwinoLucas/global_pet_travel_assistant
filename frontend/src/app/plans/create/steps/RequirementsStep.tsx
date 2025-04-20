import React, { useState, useEffect } from 'react';
import { useGetRequirementsQuery } from '@/store/api/travelApi';
import { Check, AlertCircle, RefreshCw, Loader2, ChevronDown, ChevronUp, Calendar, FileText } from 'lucide-react';
import { handleApiError } from '@/store/api';
import { Requirement } from '@/types/travel';

interface RequirementsStepProps {
  formData: {
    pet: number;
    origin_country: number;
    destination_country: number;
    departure_date: string;
    [key: string]: any;
  };
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const RequirementsStep: React.FC<RequirementsStepProps> = ({
  formData,
  onChange,
  onNext,
  isValid,
  isLoading: formIsLoading,
}) => {
  // Fetch requirements based on destination country and pet type
  const { 
    data: requirements,
    isLoading: requirementsLoading,
    error: requirementsError,
    refetch: refetchRequirements
  } = useGetRequirementsQuery({ 
    country: formData.destination_country,
    pet_type: formData.pet
  });
  
  // Track which requirements have been expanded for details
  const [expandedRequirements, setExpandedRequirements] = useState<Record<number, boolean>>({});
  
  // Track which requirements the user has marked as reviewed
  const [reviewedRequirements, setReviewedRequirements] = useState<Record<number, boolean>>({});
  
  // Calculate days until departure
  const calculateDaysUntil = () => {
    if (!formData.departure_date) return null;
    
    const departureDate = new Date(formData.departure_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const differenceInTime = departureDate.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };
  
  const daysUntilDeparture = calculateDaysUntil();
  
  // Toggle a requirement's expanded state
  const toggleRequirement = (requirementId: number) => {
    setExpandedRequirements(prev => ({
      ...prev,
      [requirementId]: !prev[requirementId]
    }));
  };
  
  // Mark a requirement as reviewed
  const toggleReviewedRequirement = (requirementId: number) => {
    const newReviewedState = {
      ...reviewedRequirements,
      [requirementId]: !reviewedRequirements[requirementId]
    };
    
    setReviewedRequirements(newReviewedState);
    
    // Save reviewed requirements to form data
    if (requirements) {
      const reviewedIds = Object.entries(newReviewedState)
        .filter(([_, isReviewed]) => isReviewed)
        .map(([id, _]) => parseInt(id));
      
      onChange('reviewed_requirements', reviewedIds);
    }
  };
  
  // Mark all requirements as reviewed
  const markAllReviewed = () => {
    if (!requirements) return;
    
    const allReviewed: Record<number, boolean> = {};
    const allIds: number[] = [];
    
    requirements.forEach(req => {
      allReviewed[req.id] = true;
      allIds.push(req.id);
    });
    
    setReviewedRequirements(allReviewed);
    onChange('reviewed_requirements', allIds);
  };
  
  // Loading states
  const isLoading = formIsLoading || requirementsLoading;
  
  // Error handling
  if (requirementsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to load requirements</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {handleApiError(requirementsError)}
        </p>
        <button
          onClick={() => refetchRequirements()}
          className="text-sm font-medium text-primary flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading travel requirements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Travel Requirements</h2>
          <p className="text-muted-foreground">
            Review the requirements for bringing your pet to {formData.destination_country_name}.
          </p>
        </div>
        
        {/* Departure countdown */}
        {daysUntilDeparture !== null && (
          <div className="bg-muted px-4 py-2 rounded-md flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{daysUntilDeparture}</span> days until departure
            </span>
          </div>
        )}
      </div>

      {/* No requirements case */}
      {(!requirements || requirements.length === 0) ? (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="text-muted-foreground mb-3">
            No specific requirements found for this pet and destination.
          </p>
          <p className="text-sm text-muted-foreground">
            This could be due to missing data. You can continue with the travel plan creation,
            but we recommend checking official government resources for the most accurate information.
          </p>
        </div>
      ) : (
        <>
          {/* Requirements count summary */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Requirements Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {Object.values(reviewedRequirements).filter(Boolean).length} of {requirements.length} requirements reviewed
                </p>
              </div>
              <button 
                onClick={markAllReviewed}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                disabled={Object.values(reviewedRequirements).filter(Boolean).length === requirements.length}
              >
                <Check className="h-4 w-4" /> Mark all as reviewed
              </button>
            </div>
          </div>
          
          {/* Requirements list */}
          <div className="space-y-4">
            {requirements.map(requirement => (
              <RequirementItem
                key={requirement.id}
                requirement={requirement}
                isExpanded={!!expandedRequirements[requirement.id]}
                isReviewed={!!reviewedRequirements[requirement.id]}
                onToggleExpand={() => toggleRequirement(requirement.id)}
                onToggleReview={() => toggleReviewedRequirement(requirement.id)}
                daysUntilDeparture={daysUntilDeparture || 0}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Information box */}
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-2">Important Information</h3>
        <ul className="list-disc text-sm text-muted-foreground ml-5 space-y-1">
          <li>Requirements may change based on country regulations.</li>
          <li>Always verify with the official embassy or consulate of your destination country.</li>
          <li>Some requirements may have specific timing constraints before travel.</li>
          <li>You will be able to mark these requirements as completed after creating your travel plan.</li>
        </ul>
      </div>
    </div>
  );
};

// Individual requirement item component
interface RequirementItemProps {
  requirement: Requirement;
  isExpanded: boolean;
  isReviewed: boolean;
  onToggleExpand: () => void;
  onToggleReview: () => void;
  daysUntilDeparture: number;
}

const RequirementItem: React.FC<RequirementItemProps> = ({
  requirement,
  isExpanded,
  isReviewed,
  onToggleExpand,
  onToggleReview,
  daysUntilDeparture,
}) => {
  // Determine if the requirement has a deadline approaching
  const hasDeadline = requirement.validity_period > 0;
  const isUrgent = hasDeadline && daysUntilDeparture <= requirement.validity_period;
  
  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      isReviewed 
        ? 'border-primary/30 bg-primary/5' 
        : isUrgent 
          ? 'border-warning/30 bg-warning/5' 
          : 'border-border'
    }`}>
      {/* Header section (always visible) */}
      <div 
        className="p-4 flex items-center cursor-pointer hover:bg-muted/30"
        onClick={onToggleExpand}
      >
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center ${
              isReviewed 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-muted text-muted-foreground border border-border'
            }`}>
              {isReviewed ? <Check className="h-3 w-3" /> : null}
            </div>
            <div>
              <h3 className="font-medium">{requirement.description}</h3>
              {hasDeadline && (
                <p className={`text-sm flex items-center gap-1 ${
                  isUrgent ? 'text-warning' : 'text-muted-foreground'
                }`}>
                  <Calendar className="h-3 w-3" />
                  {isUrgent ? (
                    <span>Required within {requirement.validity_period} days of travel</span>
                  ) : (
                    <span>Required {requirement.validity_period} days before travel</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="ml-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Expanded details section */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border bg-card/50">
          <div className="ml-9 space-y-3">
            {/* Details */}
            {requirement.details && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Details</h4>
                <p className="text-sm text-muted-foreground">{requirement.details}</p>
              </div>
            )}
            
            {/* Documents needed */}
            {requirement.documentation_needed && requirement.documentation_needed.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Documentation Needed</h4>
                <ul className="list-disc ml-5 text-sm text-muted-foreground">
                  {requirement.documentation_needed.map((doc, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <FileText className="h-3 w-3 mt-1 flex-shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Review checkbox */}
            <div className="pt-2 border-t border-border mt-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReviewed}
                  onChange={onToggleReview}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm font-medium">
                  I have reviewed this requirement
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsStep;

"use client";

import React, { useEffect, useState } from 'react';
import { TravelPlanFormData } from '../page';

// Props interface for RequirementsStep
interface RequirementsStepProps {
  formData: TravelPlanFormData;
  updateFormData: (fieldName: string, value: any) => void;
  errors: Record<string, string>;
}

// Requirement type definition
interface Requirement {
  id: string;
  name: string;
  description: string;
  daysBeforeDeparture: number;
  dueDate: string | null;
  completed: boolean;
  documentRequired: boolean;
  documentUploaded?: boolean;
}

// Mock requirements generator based on countries
const generateRequirements = (
  originCountry: string,
  destinationCountry: string,
  departureDate: string
): Requirement[] => {
  const baseRequirements: Requirement[] = [
    {
      id: '1',
      name: 'Microchip',
      description: 'ISO-compatible microchip implantation for identification',
      daysBeforeDeparture: 90,
      dueDate: null,
      completed: false,
      documentRequired: false
    },
    {
      id: '2',
      name: 'Rabies Vaccination',
      description: 'Current rabies vaccination (must be administered after microchipping)',
      daysBeforeDeparture: 60,
      dueDate: null,
      completed: false,
      documentRequired: true
    },
    {
      id: '3',
      name: 'Health Certificate',
      description: 'USDA/APHIS or equivalent health certificate',
      daysBeforeDeparture: 10,
      dueDate: null,
      completed: false,
      documentRequired: true
    },
    {
      id: '4',
      name: 'Import Permit',
      description: 'Permission to bring your pet into the destination country',
      daysBeforeDeparture: 45,
      dueDate: null,
      completed: false,
      documentRequired: true
    }
  ];

  let countryRequirements: Requirement[] = [];

  if (['United Kingdom', 'Australia', 'New Zealand'].includes(destinationCountry)) {
    countryRequirements.push({
      id: '5',
      name: 'Rabies Titer Test',
      description: 'Blood test to confirm rabies antibodies (RNAT/FAVN test)',
      daysBeforeDeparture: 120,
      dueDate: null,
      completed: false,
      documentRequired: true
    });
  }

  if (['Australia', 'New Zealand'].includes(destinationCountry)) {
    countryRequirements.push({
      id: '6',
      name: 'Quarantine Reservation',
      description: 'Mandatory quarantine period booking',
      daysBeforeDeparture: 60,
      dueDate: null,
      completed: false,
      documentRequired: true
    });
  }

  if (['Japan', 'Singapore', 'Taiwan'].includes(destinationCountry)) {
    countryRequirements.push({
      id: '7',
      name: 'Advance Notification',
      description: 'Pre-arrival notification to animal quarantine service',
      daysBeforeDeparture: 40,
      dueDate: null,
      completed: false,
      documentRequired: true
    });
  }

  const allRequirements = [...baseRequirements, ...countryRequirements];

  if (departureDate) {
    const departureDateObj = new Date(departureDate);
    allRequirements.forEach(req => {
      const dueDate = new Date(departureDateObj);
      dueDate.setDate(dueDate.getDate() - req.daysBeforeDeparture);
      req.dueDate = dueDate.toISOString().split('T')[0];
    });
  }

  return allRequirements.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

const RequirementsStep: React.FC<RequirementsStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isGeneratingRequirements, setIsGeneratingRequirements] = useState(false);

  useEffect(() => {
    if (formData.originCountry && formData.destinationCountry && formData.departureDate) {
      setIsGeneratingRequirements(true);
      setTimeout(() => {
        const generated = generateRequirements(
          formData.originCountry,
          formData.destinationCountry,
          formData.departureDate
        );

        if (formData.requirements?.length > 0) {
          generated.forEach(req => {
            const existing = formData.requirements.find(r => r.id === req.id);
            if (existing) {
              req.completed = existing.completed;
              req.documentUploaded = existing.documentUploaded;
            }
          });
        }

        setRequirements(generated);
        updateFormData('requirements', generated);
        setIsGeneratingRequirements(false);
      }, 500);
    }
  }, [formData.originCountry, formData.destinationCountry, formData.departureDate]);

  const toggleRequirementStatus = (id: string) => {
    const updated = requirements.map(req =>
      req.id === id ? { ...req, completed: !req.completed } : req
    );
    setRequirements(updated);
    updateFormData('requirements', updated);
  };

  const markDocumentUploaded = (id: string) => {
    const updated = requirements.map(req =>
      req.id === id ? { ...req, documentUploaded: true } : req
    );
    setRequirements(updated);
    updateFormData('requirements', updated);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyles = (req: Requirement) => {
    if (req.completed) {
      return { badge: 'bg-green-100 text-green-800', text: 'Completed', icon: '✓' };
    }
    if (!req.dueDate) {
      return { badge: 'bg-gray-100 text-gray-800', text: 'Pending', icon: '⏱' };
    }

    const today = new Date();
    const due = new Date(req.dueDate);
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { badge: 'bg-red-100 text-red-800', text: 'Overdue', icon: '❗' };
    }
    if (daysLeft < 14) {
      return { badge: 'bg-amber-100 text-amber-800', text: 'Due Soon', icon: '⚠' };
    }
    return { badge: 'bg-blue-100 text-blue-800', text: 'Upcoming', icon: '📅' };
  };

  const canShowRequirements = formData.originCountry &&
                              formData.destinationCountry &&
                              formData.departureDate;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Travel Requirements</h2>
      <p className="text-muted-foreground">
        Below are the requirements for traveling with your pet from {formData.originCountry} to {formData.destinationCountry}.
        Complete all required items before your departure date.
      </p>

      {!canShowRequirements && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md">
          <p className="font-medium">Missing information</p>
          <p className="text-sm mt-1">
            Please complete the previous steps to view travel requirements.
            {!formData.originCountry && ' Origin country is required.'}
            {!formData.destinationCountry && ' Destination country is required.'}
            {!formData.departureDate && ' Departure date is required.'}
          </p>
        </div>
      )}

      {isGeneratingRequirements && (
        <div className="text-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
            <div className="h-3 w-36 bg-primary/10 rounded"></div>
          </div>
          <p className="text-muted-foreground mt-4">Generating requirements for your travel route...</p>
        </div>
      )}

      {!isGeneratingRequirements && requirements.length > 0 && (
        <div className="space-y-4">
          {requirements.map(requirement => {
            const status = getStatusStyles(requirement);
            return (
              <div
                key={requirement.id}
                className={`border ${requirement.completed ? 'border-green-200 bg-green-50/50' : 'border-border bg-card'}
                  rounded-lg p-4 shadow-sm transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => toggleRequirementStatus(requirement.id)}
                    className={`mt-1 h-5 w-5 rounded-md border flex-shrink-0 cursor-pointer ${
                      requirement.completed
                        ? 'bg-primary border-primary text-white flex items-center justify-center'
                        : 'border-muted-foreground/30 hover:border-primary/50'
                    }`}
                  >
                    {requirement.completed && <span className="text-xs">✓</span>}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-medium">{requirement.name}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${status.badge}`}>
                        <span>{status.icon}</span> {status.text}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {requirement.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-muted-foreground mr-1">Due:</span>
                        <span className={requirement.completed ? 'line-through text-muted-foreground/70' : ''}>
                          {formatDate(requirement.dueDate)}
                        </span>
                      </div>

                      {requirement.daysBeforeDeparture > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium text-muted-foreground mr-1">Timeline:</span>
                          <span>{requirement.daysBeforeDeparture} days before departure</span>
                        </div>
                      )}
                    </div>

                    {requirement.documentRequired && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium">Supporting Document</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            requirement.documentUploaded
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {requirement.documentUploaded ? 'Uploaded' : 'Required'}
                          </span>
                        </div>

                        {!requirement.documentUploaded ? (
                          <div className="border border-dashed border-border rounded-md p-4 text-center bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-2">
                              Upload documentation for this requirement
                            </p>
                            <button
                              type="button"
                              onClick={() => markDocumentUploaded(requirement.id)}
                              className="inline-flex items-center text-sm text-primary hover:text-primary-600 font-medium"
                            >
                              Upload Document
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center p-2 bg-green-50 border border-green-100 rounded-md">
                            <span className="text-green-700 mr-2">✓</span>
                            <span className="text-sm text-green-800">Document uploaded</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequirementsStep;
