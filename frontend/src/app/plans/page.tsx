"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import TravelPlanCard from '@/components/dashboard/TravelPlanCard';

// Define types for filter and sort options
type FilterOption = 'all' | 'planning' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
type SortOption = 'newest' | 'oldest' | 'name' | 'departure';

// Mock Travel Plan data
const MOCK_TRAVEL_PLANS = [
  {
    id: '1',
    petName: 'Buddy',
    petImage: '/placeholder-pet.jpg',
    originCountry: 'United States',
    destinationCountry: 'Canada',
    departureDate: '2025-05-15',
    status: 'planning' as const,
  },
  {
    id: '2',
    petName: 'Luna',
    petImage: '/placeholder-pet.jpg',
    originCountry: 'United Kingdom',
    destinationCountry: 'France',
    departureDate: '2025-06-02',
    status: 'ready' as const,
  },
  {
    id: '3',
    petName: 'Max',
    petImage: '/placeholder-pet.jpg',
    originCountry: 'Germany',
    destinationCountry: 'Spain',
    departureDate: '2025-04-28',
    status: 'in_progress' as const,
  },
  {
    id: '4',
    petName: 'Charlie',
    petImage: '/placeholder-pet.jpg',
    originCountry: 'Australia',
    destinationCountry: 'New Zealand',
    departureDate: '2025-07-10',
    status: 'planning' as const,
  },
  {
    id: '5',
    petName: 'Bella',
    petImage: '/placeholder-pet.jpg',
    originCountry: 'Japan',
    destinationCountry: 'South Korea',
    departureDate: '2025-05-22',
    status: 'completed' as const,
  },
  {
    id: '6',
    petName: 'Daisy',
    petImage: '/placeholder-pet.jpg',
    originCountry: 'France',
    destinationCountry: 'Italy',
    departureDate: '2025-06-15',
    status: 'cancelled' as const,
  },
];

export default function TravelPlansPage() {
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter and sort the travel plans
  const filteredAndSortedPlans = MOCK_TRAVEL_PLANS
    .filter(plan => {
      // Status filter
      if (statusFilter !== 'all' && plan.status !== statusFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          plan.petName.toLowerCase().includes(query) ||
          plan.originCountry.toLowerCase().includes(query) ||
          plan.destinationCountry.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sorting logic
      switch (sortBy) {
        case 'newest':
          return new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime();
        case 'oldest':
          return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
        case 'name':
          return a.petName.localeCompare(b.petName);
        case 'departure':
          return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Travel Plans</h1>
            <p className="text-muted-foreground mt-1">Manage all your pet travel plans in one place</p>
          </div>
          <Link 
            href="/plans/create" 
            className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Create New Plan
          </Link>
        </div>
      </section>

      {/* Filter and Sort Section */}
      <section className="bg-card rounded-lg border border-border p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by pet, country..."
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-muted-foreground mb-1">
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterOption)}
            >
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="ready">Ready</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-muted-foreground mb-1">
              Sort By
            </label>
            <select
              id="sort"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Pet Name</option>
              <option value="departure">Departure Date</option>
            </select>
          </div>
        </div>
      </section>

      {/* Travel Plans Grid */}
      <section>
        {filteredAndSortedPlans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedPlans.map((plan) => (
              <TravelPlanCard
                key={plan.id}
                id={plan.id}
                petName={plan.petName}
                petImage={plan.petImage}
                originCountry={plan.originCountry}
                destinationCountry={plan.destinationCountry}
                departureDate={plan.departureDate}
                status={plan.status}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">No travel plans found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your filters to see more results."
                : "You haven't created any travel plans yet."}
            </p>
            <Link
              href="/plans/create"
              className="inline-flex items-center bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Create Your First Plan
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
