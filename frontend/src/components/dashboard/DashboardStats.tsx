'use client';

import React from 'react';
import { PawPrint, Map, FileText, CalendarClock } from 'lucide-react';
import { useGetPetsQuery } from '@/store/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, isLoading = false }) => {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-7 w-16 rounded-md bg-muted animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardStats: React.FC = () => {
  const { data: pets, isLoading: isPetsLoading, error: petsError } = useGetPetsQuery();
  
  // When in development or if the API isn't available yet, use mock data
  const useMockData = process.env.NODE_ENV === 'development' || petsError;
  
  // Mock loading state for demo purposes
  const isLoading = isPetsLoading && !useMockData;

  // Error handling
  if (petsError && !useMockData) {
    return (
      <div className="p-4 border border-destructive/30 bg-destructive/10 rounded-lg text-sm text-destructive">
        Failed to load dashboard statistics. Please try again later.
      </div>
    );
  }

  const petCount = useMockData ? 3 : (pets?.length || 0);
  const plansCount = useMockData ? 2 : 0; // Would be from an API in production
  const documentsCount = useMockData ? 8 : 0; // Would be from an API in production
  const deadlinesCount = useMockData ? 3 : 0; // Would be from an API in production

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Pets"
        value={petCount}
        icon={<PawPrint className="h-6 w-6 text-primary-foreground" />}
        color="bg-primary text-primary-foreground"
        isLoading={isLoading}
      />
      <StatCard
        title="Travel Plans"
        value={plansCount}
        icon={<Map className="h-6 w-6 text-secondary-foreground" />}
        color="bg-secondary text-secondary-foreground"
        isLoading={isLoading}
      />
      <StatCard
        title="Documents"
        value={documentsCount}
        icon={<FileText className="h-6 w-6 text-accent-foreground" />}
        color="bg-accent text-accent-foreground"
        isLoading={isLoading}
      />
      <StatCard
        title="Upcoming Deadlines"
        value={deadlinesCount}
        icon={<CalendarClock className="h-6 w-6 text-white" />}
        color="bg-warning text-white"
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardStats;
