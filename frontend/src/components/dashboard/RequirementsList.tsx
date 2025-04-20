'use client';

import React, { useState, useMemo } from 'react';
import { Check, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Status } from '@/components/ui/StatusBadge';
import { useGetRequirementsQuery, useGetPetTypesQuery } from '@/store/api/travelApi';
import { Requirement as ApiRequirement } from '@/types/travel';
import { handleApiError } from '@/store/api';

// Requirement specific statuses
export type RequirementStatus = Extract<
  Status,
  'completed' | 'pending' | 'upcoming' | 'overdue'
>;

// Frontend requirement model
interface RequirementItemProps {
  requirement: ApiRequirement;
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
            <span>Due {formatDueDate(requirement.validity_period)}</span>
          </div>
        </div>
      </div>
      <div>
        <StatusBadge 
          status={requirement.details} 
          className="whitespace-nowrap"
        />
      </div>
    </div>
  );
};

// Helper function to determine requirement status based on validity period


// Fallback mock data when API is not available
const mockRequirements: ApiRequirement[] = [
  {
    id: 1,
    petName: 'Buddy',
    description: 'Rabies vaccination',
    dueDate: '2025-04-25',
    status: 'pending',
  },
  {
    id: 2,
    petName: 'Luna',
    description: 'EU Pet Passport application',
    dueDate: '2025-05-10',
    status: 'upcoming',
  },
  {
    id: 3,
    petName: 'Max',
    description: 'Microchip verification',
    dueDate: '2025-04-22',
    status: 'completed',
  },
  {
    id: 4,
    petName: 'Daisy',
    description: 'Tapeworm treatment',
    dueDate: '2025-04-18',
    status: 'overdue',
  },
];

interface RequirementItemProps {
  requirement: ApiRequirement;
}

// Helper function to determine requirement status based on validity period
const getRequirementStatus = (requirement: ApiRequirement): RequirementStatus => {
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
  const { data: requirements, isLoading, error } = useGetRequirementsQuery();
  const { data: petTypes } = useGetPetTypesQuery();
  
  // Convert API data to component format
  const formattedRequirements = useMemo(() => {
    if (!requirements) return null;
    
    return requirements.map(req => ({
      id: req.id,
      petName: petTypes?.find(pt => pt.id === req.pet_type)?.name || 'Pet',
      description: req.description,
      details: req.details,
      dueDate: new Date(Date.now() + req.validity_period * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: getRequirementStatus(req)
    }));
  }, [requirements, petTypes]);
  
  // Loading state
  if (isLoading) {
    return <RequirementsLoading />;
  }
  
  // Error state
  if (error) {
    return <RequirementsError error={error} />;
  }
  
  // Use mock data in development if no real data
  const displayRequirements = formattedRequirements || 
    (process.env.NODE_ENV === 'development' ? mockRequirements : []);
  
  return (
    <div className="space-y-1">
      {displayRequirements.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No upcoming requirements found.
        </div>
      ) : (
        displayRequirements.map((requirement) => (
          <RequirementItem key={requirement.id} requirement={requirement} />
        ))
      )}
    </div>
  );
};

export default RequirementsList;



