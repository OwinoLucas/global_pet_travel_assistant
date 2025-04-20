import React from 'react';
import { cn } from '@/lib/utils';

// Define all possible status values in the application
export type Status = 
  // Travel plan statuses
  | 'planning' 
  | 'ready' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'
  // Document statuses
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'expired'
  // Requirement statuses
  | 'upcoming' 
  | 'overdue';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      // Travel plan statuses
      case 'planning':
        return { 
          label: 'Planning', 
          bgColor: 'bg-primary-100', 
          textColor: 'text-primary-700' 
        };
      case 'ready':
        return { 
          label: 'Ready', 
          bgColor: 'bg-accent-100', 
          textColor: 'text-accent-700' 
        };
      case 'in_progress':
        return { 
          label: 'In Progress', 
          bgColor: 'bg-secondary-100', 
          textColor: 'text-secondary-700' 
        };
      case 'completed':
        return { 
          label: 'Completed', 
          bgColor: 'bg-success/20', 
          textColor: 'text-success' 
        };
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          bgColor: 'bg-destructive/10', 
          textColor: 'text-destructive' 
        };
      
      // Document statuses
      case 'pending':
        return { 
          label: 'Pending', 
          bgColor: 'bg-warning/20', 
          textColor: 'text-warning' 
        };
      case 'approved':
        return { 
          label: 'Approved', 
          bgColor: 'bg-success/20', 
          textColor: 'text-success' 
        };
      case 'rejected':
        return { 
          label: 'Rejected', 
          bgColor: 'bg-destructive/10', 
          textColor: 'text-destructive' 
        };
      case 'expired':
        return { 
          label: 'Expired', 
          bgColor: 'bg-muted', 
          textColor: 'text-muted-foreground' 
        };
      
      // Requirement statuses
      case 'upcoming':
        return { 
          label: 'Upcoming', 
          bgColor: 'bg-primary-100', 
          textColor: 'text-primary-700' 
        };
      case 'overdue':
        return { 
          label: 'Overdue', 
          bgColor: 'bg-destructive/10', 
          textColor: 'text-destructive' 
        };
      
      default:
        return { 
          label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '), 
          bgColor: 'bg-muted', 
          textColor: 'text-muted-foreground' 
        };
    }
  };

  const { label, bgColor, textColor } = getStatusConfig();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        bgColor,
        textColor,
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
