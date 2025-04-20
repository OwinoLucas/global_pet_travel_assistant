'use client';

import React, { useState } from 'react';
import { Check, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Status } from '@/components/ui/StatusBadge';

// Requirement specific statuses
export type RequirementStatus = Extract<
  Status,
  'completed' | 'pending' | 'upcoming' | 'overdue'
>;

interface Requirement {
  id: number;
  petName: string;
  description: string;
  dueDate: string;
  status: RequirementStatus;
}

// Mock data - In production, this would come from an API
const mockRequirements: Requirement[] = [
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
  requirement: Requirement;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ requirement }) => {
  const getStatusIcon = () => {
    switch (requirement.status) {
      case 'completed':
        return <Check className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'upcoming':
        return <Clock className="h-5 w-5 text-primary" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
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
            <span>Due {formatDueDate(requirement.dueDate)}</span>
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

const RequirementsList: React.FC = () => {
  return (
    <div className="space-y-1">
      {mockRequirements.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No upcoming requirements found.
        </div>
      ) : (
        mockRequirements.map((requirement) => (
          <RequirementItem key={requirement.id} requirement={requirement} />
        ))
      )}
    </div>
  );
};

export default RequirementsList;

