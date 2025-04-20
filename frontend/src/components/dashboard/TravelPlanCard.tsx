'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Calendar, ArrowRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Status } from '@/components/ui/StatusBadge';

// Travel plan specific statuses
export type TravelPlanStatus = Extract<
  Status, 
  'planning' | 'ready' | 'in_progress' | 'completed' | 'cancelled'
>;

interface TravelPlanCardProps {
  petName: string;
  petImage?: string;
  originCountry: string;
  destinationCountry: string;
  departureDate: string;
  returnDate?: string;
  status: TravelPlanStatus;
  className?: string;
  isLoading?: boolean;
}

const TravelPlanCard: React.FC<TravelPlanCardProps> = ({
  petName,
  petImage,
  originCountry,
  destinationCountry,
  departureDate,
  returnDate,
  status,
  className,
  isLoading = false,
}) => {
  // Default/fallback image for pets
  const defaultImage = 'https://via.placeholder.com/100?text=Pet';
  
  if (isLoading) {
    return (
      <div className={`bg-card rounded-lg border border-border shadow-sm overflow-hidden ${className}`}>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="px-4 py-3 bg-muted/50 border-t border-border">
          <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
            {petImage ? (
              <Image
                src={petImage}
                alt={petName}
                width={40}
                height={40}
                className="object-cover"
                onError={(e) => {
                  // If image fails to load, replace with default
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImage;
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-600">
                <PawPrintIcon className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-foreground">{petName}</h3>
            <StatusBadge status={status} size="sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="font-medium text-muted-foreground">{originCountry}</div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium text-muted-foreground">{destinationCountry}</div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
          <Calendar className="h-4 w-4" />
          <span>Departure: {formatDate(new Date(departureDate))}</span>
        </div>
        
        {returnDate && (
          <div className="flex items-center text-sm text-muted-foreground gap-1">
            <Calendar className="h-4 w-4" />
            <span>Return: {formatDate(new Date(returnDate))}</span>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-muted/50 border-t border-border">
        <Link 
          href="/plans/details" 
          className="text-sm font-medium text-primary hover:text-primary-600 transition-colors"
        >
          View details
        </Link>
      </div>
    </div>
  );
};

// Simple paw print icon as fallback
const PawPrintIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="11" cy="4" r="2"/>
    <circle cx="18" cy="8" r="2"/>
    <circle cx="20" cy="16" r="2"/>
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>
  </svg>
);

export default TravelPlanCard;


