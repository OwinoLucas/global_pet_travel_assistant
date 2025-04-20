'use client';

import React from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import TravelPlanCard from '@/components/dashboard/TravelPlanCard';
import RequirementsList from '@/components/dashboard/RequirementsList';
import { useGetPlansQuery } from '@/store/api/plansApi';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  // Fetch recent travel plans with upcoming=true to get future travels
  const { 
    data: travelPlans, 
    isLoading: isLoadingPlans, 
    error: plansError,
    refetch: refetchPlans
  } = useGetPlansQuery({ upcoming: true });
  
  // Get the 3 most recent travel plans
  const recentPlans = React.useMemo(() => {
    if (!travelPlans) return [];
    // Sort by departure date (ascending) and take the first 3
    return [...travelPlans]
      .sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime())
      .slice(0, 3);
  }, [travelPlans]);
  
  // Use the dev/mock data flag when no API data is available
  const useMockData = process.env.NODE_ENV === 'development' || plansError;
  
  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Global Pet Travel Assistant</h1>
        <p className="text-muted-foreground max-w-3xl">
          Plan your pet's travel with ease. Find country-specific requirements, create travel plans,
          and manage all your documents in one place.
        </p>
      </section>
      
      {/* Dashboard stats */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Dashboard</h2>
        <DashboardStats />
      </section>
      
      {/* Recent travel plans */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Travel Plans</h2>
          <a href="/plans" className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">
            View all plans
          </a>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingPlans ? (
            // Loading placeholders
            <>
              <TravelPlanCard isLoading />
              <TravelPlanCard isLoading />
              <TravelPlanCard isLoading />
            </>
          ) : plansError && !useMockData ? (
            // Error state with retry button
            <div className="col-span-full">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
                <p className="text-destructive mb-2">Failed to load travel plans</p>
                <button 
                  onClick={() => refetchPlans()}
                  className="text-sm text-primary inline-flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            </div>
          ) : recentPlans.length > 0 || useMockData ? (
            // Display actual travel plans or mock data in development
            recentPlans.length > 0 ? (
              // Real API data
              recentPlans.map(plan => (
                <TravelPlanCard 
                  key={plan.id}
                  plan={plan}
                />
              ))
            ) : (
              // Mock data for development
              <>
                <TravelPlanCard 
                  plan={{
                    id: 1,
                    name: 'Summer vacation',
                    pet: 1,
                    pet_name: 'Buddy',
                    pet_image: '/pet.webp',
                    origin_country: 1,
                    origin_country_name: 'United States',
                    destination_country: 2,
                    destination_country_name: 'Canada',
                    departure_date: '2025-05-15',
                    status: 'planning',
                    created_at: '2025-04-01T00:00:00Z',
                    updated_at: '2025-04-01T00:00:00Z'
                  }}
                />
                <TravelPlanCard 
                  plan={{
                    id: 2,
                    name: 'European vacation',
                    pet: 2,
                    pet_name: 'Luna',
                    pet_image: '/pet.webp',
                    origin_country: 3,
                    origin_country_name: 'United Kingdom',
                    destination_country: 4,
                    destination_country_name: 'France',
                    departure_date: '2025-06-02',
                    status: 'ready',
                    created_at: '2025-04-02T00:00:00Z',
                    updated_at: '2025-04-02T00:00:00Z'
                  }}
                />
                <TravelPlanCard 
                  plan={{
                    id: 3,
                    name: 'Spring break',
                    pet: 3,
                    pet_name: 'Max',
                    pet_image: '/pet.webp',
                    origin_country: 5,
                    origin_country_name: 'Germany',
                    destination_country: 6,
                    destination_country_name: 'Spain',
                    departure_date: '2025-04-28',
                    status: 'in_progress',
                    created_at: '2025-04-03T00:00:00Z',
                    updated_at: '2025-04-03T00:00:00Z'
                  }}
                />
              </>
            )
          ) : (
            // No plans available
            <div className="col-span-full">
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-muted-foreground">No upcoming travel plans found</p>
                <a 
                  href="/plans/create" 
                  className="text-sm font-medium text-primary hover:text-primary-600 transition-colors mt-2 inline-block"
                >
                  Create your first plan
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming requirements */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Upcoming Requirements</h2>
          <a href="/requirements" className="text-sm font-medium text-primary hover:text-primary-600 transition-colors">
            View all requirements
          </a>
        </div>
        
        <div className="bg-card rounded-lg border border-border shadow-sm p-4">
          <RequirementsList />
        </div>
      </section>
    </div>
  );
}
