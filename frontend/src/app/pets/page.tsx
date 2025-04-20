"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Define types for pets
interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Other';
  breed: string;
  age: number;
  weight: number;
  imageUrl: string;
  microchipped: boolean;
  vaccinations: {
    rabies: boolean;
    distemper: boolean;
    parvo: boolean;
    other: string[];
  };
  lastCheckup: string;
  travelReadiness: 'ready' | 'incomplete' | 'not_started';
  owner: {
    name: string;
    email: string;
  };
}

// Mock data for pets
const MOCK_PETS: Pet[] = [
  {
    id: '1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 30,
    imageUrl: '/placeholder-pet.jpg',
    microchipped: true,
    vaccinations: {
      rabies: true,
      distemper: true,
      parvo: true,
      other: ['Bordetella', 'Leptospirosis']
    },
    lastCheckup: '2025-03-15',
    travelReadiness: 'ready',
    owner: {
      name: 'John Smith',
      email: 'john@example.com'
    }
  },
  {
    id: '2',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 2,
    weight: 4,
    imageUrl: '/placeholder-pet.jpg',
    microchipped: true,
    vaccinations: {
      rabies: true,
      distemper: true,
      parvo: false,
      other: ['FeLV']
    },
    lastCheckup: '2025-02-20',
    travelReadiness: 'incomplete',
    owner: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com'
    }
  },
  {
    id: '3',
    name: 'Max',
    species: 'Dog',
    breed: 'German Shepherd',
    age: 4,
    weight: 35,
    imageUrl: '/placeholder-pet.jpg',
    microchipped: false,
    vaccinations: {
      rabies: true,
      distemper: true,
      parvo: true,
      other: []
    },
    lastCheckup: '2025-01-10',
    travelReadiness: 'incomplete',
    owner: {
      name: 'Michael Brown',
      email: 'michael@example.com'
    }
  },
  {
    id: '4',
    name: 'Bella',
    species: 'Cat',
    breed: 'Maine Coon',
    age: 1,
    weight: 5,
    imageUrl: '/placeholder-pet.jpg',
    microchipped: true,
    vaccinations: {
      rabies: false,
      distemper: true,
      parvo: false,
      other: ['FeLV', 'FIV']
    },
    lastCheckup: '2025-03-05',
    travelReadiness: 'not_started',
    owner: {
      name: 'Emma Wilson',
      email: 'emma@example.com'
    }
  },
  {
    id: '5',
    name: 'Charlie',
    species: 'Dog',
    breed: 'Beagle',
    age: 5,
    weight: 12,
    imageUrl: '/placeholder-pet.jpg',
    microchipped: true,
    vaccinations: {
      rabies: true,
      distemper: true,
      parvo: true,
      other: ['Bordetella']
    },
    lastCheckup: '2025-02-10',
    travelReadiness: 'ready',
    owner: {
      name: 'David Miller',
      email: 'david@example.com'
    }
  },
  {
    id: '6',
    name: 'Daisy',
    species: 'Bird',
    breed: 'Cockatiel',
    age: 2,
    weight: 0.1,
    imageUrl: '/placeholder-pet.jpg',
    microchipped: false,
    vaccinations: {
      rabies: false,
      distemper: false,
      parvo: false,
      other: ['Polyomavirus']
    },
    lastCheckup: '2025-03-20',
    travelReadiness: 'not_started',
    owner: {
      name: 'Olivia Taylor',
      email: 'olivia@example.com'
    }
  }
];

export default function PetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [readinessFilter, setReadinessFilter] = useState<string>('all');
  const [filteredPets, setFilteredPets] = useState<Pet[]>(MOCK_PETS);

  useEffect(() => {
    let results = [...MOCK_PETS];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(pet =>
        pet.name.toLowerCase().includes(query) ||
        pet.breed.toLowerCase().includes(query)
      );
    }

    if (speciesFilter !== 'all') {
      results = results.filter(pet => pet.species.toLowerCase() === speciesFilter);
    }

    if (readinessFilter !== 'all') {
      results = results.filter(pet => pet.travelReadiness === readinessFilter);
    }

    setFilteredPets(results);
  }, [searchQuery, speciesFilter, readinessFilter]);

  const getReadinessInfo = (status: Pet['travelReadiness']) => {
    switch (status) {
      case 'ready':
        return {
          label: 'Ready to Travel',
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: '✓'
        };
      case 'incomplete':
        return {
          label: 'Requirements Incomplete',
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          icon: '⚠'
        };
      case 'not_started':
        return {
          label: 'Not Started',
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: '❓'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Pets</h1>
            <p className="text-muted-foreground mt-1">Manage your pets' profiles and travel documentation</p>
          </div>
          <Link 
            href="/pets/create" 
            className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Add New Pet
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card rounded-lg border border-border p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or breed..."
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="species" className="block text-sm font-medium text-muted-foreground mb-1">Species</label>
            <select
              id="species"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
            >
              <option value="all">All Species</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="bird">Birds</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="readiness" className="block text-sm font-medium text-muted-foreground mb-1">Travel Readiness</label>
            <select
              id="readiness"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="ready">Ready to Travel</option>
              <option value="incomplete">Requirements Incomplete</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>
      </section>

      {/* Pet Cards */}
      <section>
        {filteredPets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPets.map((pet) => {
              const readinessInfo = getReadinessInfo(pet.travelReadiness);

              return (
                <div key={pet.id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={pet.imageUrl}
                      alt={pet.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <h2 className="text-xl font-bold">{pet.name}</h2>
                        <p className="text-sm text-white/80">{pet.breed}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Species:</span>{' '}
                          <span className="font-medium">{pet.species}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Age:</span>{' '}
                          <span className="font-medium">{pet.age} year{pet.age !== 1 ? 's' : ''}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Last Checkup:</span>{' '}
                          <span className="font-medium">{formatDate(pet.lastCheckup)}</span>
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${readinessInfo.bg} ${readinessInfo.text}`}>
                        <span className="text-xs">{readinessInfo.icon}</span>
                        {readinessInfo.label}
                      </span>
                    </div>
                    <div className="flex space-x-2 mb-4">
                      <div className={`text-xs px-2 py-1 rounded-full ${pet.microchipped ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {pet.microchipped ? 'Microchipped' : 'No Microchip'}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${pet.vaccinations.rabies ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pet.vaccinations.rabies ? 'Rabies Vaccination' : 'No Rabies Vaccination'}
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-border pt-4">
                      <Link href={`/pets/${pet.id}`} className="text-primary hover:text-primary-600 text-sm font-medium">View Details</Link>
                      <Link href={`/plans/create?petId=${pet.id}`} className="text-primary hover:text-primary-600 text-sm font-medium">Create Travel Plan</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">No pets found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search to see more results.</p>
            <Link 
              href="/pets/create" 
              className="inline-block bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Add a Pet
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
