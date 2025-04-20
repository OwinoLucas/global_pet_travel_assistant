'use client';

import React, { useState, useMemo } from 'react';
import { Check, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Status } from '@/components/ui/StatusBadge';
import { useGetRequirementsQuery, useGetPetTypesQuery } from '@/store/api/travelApi';
import { Requirement } from '@/types/travel';
import { handleApiError } from '@/store/api';

// Requirement specific statuses
export type RequirementStatus = Extract<
  Status,
  'completed' | 'pending' | 'upcoming' | 'overdue'
>;
// Frontend requirement model with formatted data
interface FormattedRequirement {
  id: number;
  petName: string;
  description: string;
  details: string;
  validity_period: number;
  is_mandatory: boolean;
  status: RequirementStatus;
}

interface RequirementItemProps {
  requirement: FormattedRequirement;
}
const RequirementItem: React.FC<RequirementItemProps> = ({ requirement }) => {
  // Function to get the appropriate status icon
  const getStatusIcon = () => {
    switch (requirement.status) {
      case 'completed':
        return (
          <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
            <Check className="h-3 w-3 text-success" />
          </div>
        );
      case 'pending':
        return (
          <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center">
            <Clock className="h-3 w-3 text-warning" />
          </div>
        );
      case 'upcoming':
        return (
          <div className="w-5 h-5 rounded-full bg-info/20 flex items-center justify-center">
            <Clock className="h-3 w-3 text-info" />
          </div>
        );
      case 'overdue':
        return (
          <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="h-3 w-3 text-destructive" />
          </div>
        );
      default:
        return null;
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getStatusIcon()}</div>
        <div>
          <div className="font-medium text-foreground">{requirement.description}</div>
          <div className="text-sm text-muted-foreground">
            <span>For {requirement.petName}</span>
            <span className="mx-2">•</span>
            <span>Due {formatDueDate(new Date(Date.now() + requirement.validity_period * 24 * 60 * 60 * 1000).toISOString())}</span>
          </div>
        </div>
      </div>
      <div>
        <StatusBadge 
          status={requirement.status} 
          className="whitespace-nowrap"
        />
      </div>
    </div>
  );
};

// Helper function to determine requirement status based on validity period


// Fallback mock data when API is not available
const mockRequirements: Requirement[] = [
  {
    id: 1,
    country: 1,
    pet_type: 1,
    description: 'Rabies vaccination',
    details: 'Must be administered at least 21 days before travel',
    documentation_needed: ['Vaccination certificate'],
    validity_period: 30, // days
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_mandatory: true
  },
  {
    id: 2,
    country: 1,
    pet_type: 2,
    description: 'EU Pet Passport application',
    details: 'Required for travel within the EU',
    documentation_needed: ['Application form', 'Pet photos'],
    validity_period: 60, // days
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_mandatory: true
  },
  {
    id: 3,
    country: 2,
    pet_type: 1,
    description: 'Microchip verification',
    details: 'ISO standard microchip required',
    documentation_needed: ['Microchip certificate'],
    validity_period: 10, // days
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_mandatory: true
  },
  {
    id: 4,
    country: 3,
    pet_type: 1,
    description: 'Tapeworm treatment',
    details: 'Must be administered 1-5 days before travel',
    documentation_needed: ['Veterinary certificate'],
    validity_period: 5, // days
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_mandatory: true
  },
];

// Removed duplicate interface

// Helper function to determine requirement status based on validity period
const getRequirementStatus = (requirement: Requirement): RequirementStatus => {
  const today = new Date();
  const dueDate = new Date(today.getTime() + requirement.validity_period * 24 * 60 * 60 * 1000);
  
  // Simple logic for status - would be more complex in real app
  const daysDifference = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (requirement.is_mandatory) {
    if (daysDifference < 0) {
      return 'overdue';
    } else if (daysDifference < 7) {
      return 'pending';
    } else if (daysDifference < 30) {
      return 'upcoming';
    } else {
      return 'completed'; // Assume it's completed if due date is far away
    }
  } else {
    return 'upcoming';
  }
};

// Component for loading state
const RequirementsLoading: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between py-3 border-b border-border animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-muted rounded-full"></div>
          <div>
            <div className="h-4 w-40 bg-muted rounded"></div>
            <div className="h-3 w-28 bg-muted rounded mt-2"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-muted rounded"></div>
      </div>
    ))}
  </div>
);

// Component for error state
const RequirementsError: React.FC<{ error: any }> = ({ error }) => (
  <div className="text-center py-4 text-destructive">
    <div className="mb-2">Failed to load requirements</div>
    <div className="text-sm">{handleApiError(error)}</div>
    <button 
      onClick={() => window.location.reload()}
      className="mt-2 text-sm text-primary flex items-center gap-1 mx-auto"
    >
      <RefreshCw className="h-3 w-3" /> Try again
    </button>
  </div>
);

// Main component
const RequirementsList: React.FC = () => {
  // Get selected country/pet type from state or props
  // For demo, we'll fetch all requirements
  const { 
    data: requirements = [], // Provide default empty array
    isLoading, 
    error 
  } = useGetRequirementsQuery();
  
  const { 
    data: petTypes = [] // Provide default empty array
  } = useGetPetTypesQuery();
  
  // Convert API data to component format
  const formattedRequirements = useMemo(() => {
    const formatRequirement = (req: Requirement): FormattedRequirement => ({
      id: req.id,
      petName: petTypes.find(pt => pt.id === req.pet_type)?.name || 'Pet',
      description: req.description,
      details: req.details,
      validity_period: req.validity_period,
      is_mandatory: req.is_mandatory,
      status: getRequirementStatus(req)
    });

    // If we have requirements data, use it
    if (requirements.length > 0) {
      return requirements.map(formatRequirement);
    }
    
    // If in development and no requirements, use mock data
    if (process.env.NODE_ENV === 'development') {
      return mockRequirements.map(formatRequirement);
    }
    
    return [];
  }, [requirements, petTypes]);
  
  // Loading state
  if (isLoading) {
    return <RequirementsLoading />;
  }
  
  // Error state
  if (error) {
    return <RequirementsError error={error} />;
  }
  
  return (
    <div className="space-y-1">
      {formattedRequirements.map((requirement) => (
        <RequirementItem key={requirement.id} requirement={requirement} />
      ))}
      {formattedRequirements.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No upcoming requirements found.
        </div>
      )}
    </div>
  );
};

export default RequirementsList;



