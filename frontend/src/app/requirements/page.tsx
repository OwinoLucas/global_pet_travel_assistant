"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Types for requirements
type RequirementStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

interface Requirement {
  id: string;
  name: string;
  description: string;
  countries: {
    origin: string[];
    destination: string[];
  };
  documentRequired: boolean;
  documentUploaded?: boolean;
  status: RequirementStatus;
  dueDate?: string;
}

// Mock countries data
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
].sort((a, b) => a.name.localeCompare(b.name));

// Mock requirements data
const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: '1',
    name: 'Microchip',
    description: 'ISO compatible microchip implantation for identification',
    countries: {
      origin: ['All Countries'],
      destination: ['All Countries'],
    },
    documentRequired: false,
    status: 'pending',
  },
  {
    id: '2',
    name: 'Rabies Vaccination',
    description: 'Current rabies vaccination (must be administered after microchipping)',
    countries: {
      origin: ['All Countries'],
      destination: ['All Countries'],
    },
    documentRequired: true,
    documentUploaded: false,
    status: 'in_progress',
    dueDate: '2025-05-15',
  },
  {
    id: '3',
    name: 'Health Certificate',
    description: 'USDA/APHIS or equivalent health certificate',
    countries: {
      origin: ['United States', 'Canada', 'United Kingdom'],
      destination: ['All Countries'],
    },
    documentRequired: true,
    documentUploaded: true,
    status: 'completed',
    dueDate: '2025-04-30',
  },
  {
    id: '4',
    name: 'Import Permit',
    description: 'Permission to bring your pet into the destination country',
    countries: {
      origin: ['All Countries'],
      destination: ['Australia', 'New Zealand', 'Japan', 'United Kingdom'],
    },
    documentRequired: true,
    documentUploaded: false,
    status: 'overdue',
    dueDate: '2025-04-01',
  },
  {
    id: '5',
    name: 'Rabies Titer Test',
    description: 'Blood test to confirm rabies antibodies (RNAT/FAVN test)',
    countries: {
      origin: ['All Countries'],
      destination: ['United Kingdom', 'Australia', 'New Zealand', 'Japan'],
    },
    documentRequired: true,
    documentUploaded: false,
    status: 'pending',
    dueDate: '2025-06-15',
  },
  {
    id: '6',
    name: 'Parasite Treatment',
    description: 'Treatment for internal and external parasites',
    countries: {
      origin: ['All Countries'],
      destination: ['United Kingdom', 'Australia', 'New Zealand'],
    },
    documentRequired: true,
    documentUploaded: false,
    status: 'in_progress',
    dueDate: '2025-05-10',
  },
  {
    id: '7',
    name: 'Quarantine Booking',
    description: 'Booking for mandatory quarantine period',
    countries: {
      origin: ['All Countries'],
      destination: ['Australia', 'New Zealand'],
    },
    documentRequired: true,
    documentUploaded: false,
    status: 'pending',
    dueDate: '2025-06-20',
  },
];

export default function RequirementsPage() {
  const [originCountry, setOriginCountry] = useState<string>('');
  const [destinationCountry, setDestinationCountry] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredRequirements, setFilteredRequirements] = useState<Requirement[]>(MOCK_REQUIREMENTS);

  // Filter requirements based on selected criteria
  useEffect(() => {
    let results = [...MOCK_REQUIREMENTS];
    
    // Filter by origin country
    if (originCountry) {
      results = results.filter(req => 
        req.countries.origin.includes('All Countries') || 
        req.countries.origin.includes(originCountry)
      );
    }
    
    // Filter by destination country
    if (destinationCountry) {
      results = results.filter(req => 
        req.countries.destination.includes('All Countries') || 
        req.countries.destination.includes(destinationCountry)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      results = results.filter(req => req.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(req => 
        req.name.toLowerCase().includes(query) || 
        req.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredRequirements(results);
  }, [originCountry, destinationCountry, statusFilter, searchQuery]);

  // Mark document as uploaded
  const handleDocumentUpload = (id: string) => {
    // In a real app, this would integrate with an API
    setFilteredRequirements(prev => 
      prev.map(req => 
        req.id === id 
          ? { ...req, documentUploaded: true } 
          : req
      )
    );
  };

  // Update requirement status
  const updateRequirementStatus = (id: string, status: RequirementStatus) => {
    // In a real app, this would integrate with an API
    setFilteredRequirements(prev => 
      prev.map(req => 
        req.id === id 
          ? { ...req, status } 
          : req
      )
    );
  };

  // Get status display info
  const getStatusInfo = (status: RequirementStatus) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pending', 
          bg: 'bg-gray-100', 
          text: 'text-gray-800',
          icon: '⏱' 
        };
      case 'in_progress':
        return { 
          label: 'In Progress', 
          bg: 'bg-blue-100', 
          text: 'text-blue-800',
          icon: '🔄' 
        };
      case 'completed':
        return { 
          label: 'Completed', 
          bg: 'bg-green-100', 
          text: 'text-green-800',
          icon: '✓' 
        };
      case 'overdue':
        return { 
          label: 'Overdue', 
          bg: 'bg-red-100', 
          text: 'text-red-800',
          icon: '❗' 
        };
      default:
        return { 
          label: 'Unknown', 
          bg: 'bg-gray-100', 
          text: 'text-gray-800',
          icon: '?' 
        };
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-700 mb-2">
            Travel Requirements
          </h1>
          <p className="text-primary-600 max-w-3xl">
            View and manage all the necessary requirements for international pet travel. 
            Filter by country to see specific regulations and track your progress.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-card rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Filter Requirements</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Origin Country Filter */}
          <div>
            <label htmlFor="originCountry" className="block text-sm font-medium text-muted-foreground mb-1">
              Origin Country
            </label>
            <select
              id="originCountry"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
            >
              <option value="">All Origin Countries</option>
              {COUNTRIES.map(country => (
                <option key={`origin-${country.code}`} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Country Filter */}
          <div>
            <label htmlFor="destinationCountry" className="block text-sm font-medium text-muted-foreground mb-1">
              Destination Country
            </label>
            <select
              id="destinationCountry"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
            >
              <option value="">All Destination Countries</option>
              {COUNTRIES.map(country => (
                <option key={`dest-${country.code}`} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
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
              onChange={(e) => setStatusFilter(e.target.value as RequirementStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search requirements..."
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Requirements List */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Requirements ({filteredRequirements.length})</h2>
        
        {filteredRequirements.length > 0 ? (
          <div className="space-y-4">
            {filteredRequirements.map((requirement) => {
              const statusInfo = getStatusInfo(requirement.status);
              
              return (
                <div 
                  key={requirement.id} 
                  className="bg-card border border-border rounded-lg p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-lg font-semibold">{requirement.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          <span className="text-xs">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">
                        {requirement.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                        <div>
                          <span className="font-medium text-muted-foreground">Origin:</span>{' '}
                          <span>{requirement.countries.origin.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Destination:</span>{' '}
                          <span>{requirement.countries.destination.join(', ')}</span>
                        </div>
                        {requirement.dueDate && (
                          <div>
                            <span className="font-medium text-muted-foreground">Due Date:</span>{' '}
                            <span>{formatDate(requirement.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      <label className="text-sm font-medium">Status</label>
                      <select
                        className="px-2 py-1 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        value={requirement.status}
                        onChange={(e) => updateRequirementStatus(requirement.id, e.target.value as RequirementStatus)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>

                      {/* Upload Document Button (if required) */}
                      {requirement.documentRequired && !requirement.documentUploaded && (
                        <button
                          className="mt-2 px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-600"
                          onClick={() => handleDocumentUpload(requirement.id)}
                        >
                          Upload Document
                        </button>
                      )}

                      {/* Document Uploaded Status */}
                      {requirement.documentUploaded && (
                        <span className="text-sm text-green-600">Document Uploaded</span>
                      )}

                      {/* Due Date (if available) */}
                      {requirement.dueDate && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          <strong>Due Date:</strong> {formatDate(requirement.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No requirements match the selected filters.</p>
        )}
      </section>
    </div>
  );
}
                

