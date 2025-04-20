import React from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import TravelPlanCard from '@/components/dashboard/TravelPlanCard';
import RequirementsList from '@/components/dashboard/RequirementsList';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-700 mb-2">
            Welcome to Global Pet Travel Assistant
          </h1>
          <p className="text-primary-600 max-w-3xl">
            Plan your pet's international travels with ease. We help you navigate regulations,
            manage documents, and ensure your furry friends travel safely worldwide.
          </p>
        </div>
      </section>

      {/* Stats section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Overview</h2>
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
          <TravelPlanCard 
            petName="Buddy"
            petImage="/placeholder-pet.jpg"
            originCountry="United States"
            destinationCountry="Canada"
            departureDate="2025-05-15"
            status="planning"
          />
          <TravelPlanCard 
            petName="Luna"
            petImage="/placeholder-pet.jpg"
            originCountry="United Kingdom"
            destinationCountry="France"
            departureDate="2025-06-02"
            status="ready"
          />
          <TravelPlanCard 
            petName="Max"
            petImage="/placeholder-pet.jpg"
            originCountry="Germany"
            destinationCountry="Spain"
            departureDate="2025-04-28"
            status="in_progress"
          />
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
