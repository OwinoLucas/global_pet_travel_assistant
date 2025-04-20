"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Types for pets (consistent with pet listing page)
interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Other';
  breed: string;
  age: number;
  weight: number;
  imageUrl: string;
  microchipped: boolean;
  microchipNumber?: string;
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
  // Additional fields for the detailed view
  birthdate?: string;
  color?: string;
  sex?: 'Male' | 'Female';
  neutered?: boolean;
  medicalNotes?: string;
  veterinarian?: {
    name: string;
    phone: string;
    address: string;
  };
}

// Types for travel history
interface TravelHistory {
  id: string;
  departureDate: string;
  returnDate?: string;
  originCountry: string;
  destinationCountry: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  documents: {
    id: string;
    name: string;
    uploadDate: string;
    fileUrl: string;
  }[];
}

// Types for health records
interface HealthRecord {
  id: string;
  date: string;
  type: 'Checkup' | 'Vaccination' | 'Procedure' | 'Test';
  description: string;
  provider: string;
  documents: {
    id: string;
    name: string;
    uploadDate: string;
    fileUrl: string;
  }[];
}

// Mock pet data (extended from the pets page)
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
    microchipNumber: '985112345678903',
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
    },
    birthdate: '2022-01-10',
    color: 'Golden',
    sex: 'Male',
    neutered: true,
    medicalNotes: 'Mild seasonal allergies in spring. No other known health issues.',
    veterinarian: {
      name: 'Dr. Sarah Williams',
      phone: '(555) 123-4567',
      address: '123 Vet Way, Boston, MA'
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
    microchipNumber: '985112345678904',
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
    },
    birthdate: '2023-03-15',
    color: 'Seal Point',
    sex: 'Female',
    neutered: true,
    medicalNotes: 'Sensitive stomach, requires special diet.',
    veterinarian: {
      name: 'Dr. James Wilson',
      phone: '(555) 234-5678',
      address: '456 Pet Clinic Dr, Boston, MA'
    }
  },
];

// Mock travel history
const MOCK_TRAVEL_HISTORY: Record<string, TravelHistory[]> = {
  '1': [
    {
      id: '101',
      departureDate: '2024-06-15',
      returnDate: '2024-07-20',
      originCountry: 'United States',
      destinationCountry: 'Canada',
      status: 'completed',
      documents: [
        {
          id: 'd1',
          name: 'Health Certificate.pdf',
          uploadDate: '2024-06-01',
          fileUrl: '#'
        },
        {
          id: 'd2',
          name: 'Rabies Certificate.pdf',
          uploadDate: '2024-05-28',
          fileUrl: '#'
        }
      ]
    },
    {
      id: '102',
      departureDate: '2025-05-15',
      returnDate: '2025-06-30',
      originCountry: 'United States',
      destinationCountry: 'United Kingdom',
      status: 'upcoming',
      documents: [
        {
          id: 'd3',
          name: 'Rabies Certificate.pdf',
          uploadDate: '2025-02-15',
          fileUrl: '#'
        }
      ]
    }
  ],
  '2': [
    {
      id: '201',
      departureDate: '2025-06-10',
      originCountry: 'United States',
      destinationCountry: 'France',
      status: 'upcoming',
      documents: []
    }
  ]
};

// Mock health records
const MOCK_HEALTH_RECORDS: Record<string, HealthRecord[]> = {
  '1': [
    {
      id: 'h1',
      date: '2025-03-15',
      type: 'Checkup',
      description: 'Annual wellness examination',
      provider: 'Dr. Sarah Williams',
      documents: [
        {
          id: 'hd1',
          name: 'Wellness Report.pdf',
          uploadDate: '2025-03-15',
          fileUrl: '#'
        }
      ]
    },
    {
      id: 'h2',
      date: '2024-10-05',
      type: 'Vaccination',
      description: 'Rabies (3-year)',
      provider: 'Dr. Sarah Williams',
      documents: [
        {
          id: 'hd2',
          name: 'Rabies Certificate.pdf',
          uploadDate: '2024-10-05',
          fileUrl: '#'
        }
      ]
    },
    {
      id: 'h3',
      date: '2024-08-12',
      type: 'Test',
      description: 'Heartworm test - Negative',
      provider: 'Dr. Sarah Williams',
      documents: [
        {
          id: 'hd3',
          name: 'Test Results.pdf',
          uploadDate: '2024-08-12',
          fileUrl: '#'
        }
      ]
    }
  ],
  '2': [
    {
      id: 'h4',
      date: '2025-02-20',
      type: 'Checkup',
      description: 'Annual wellness examination',
      provider: 'Dr. James Wilson',
      documents: [
        {
          id: 'hd4',
          name: 'Wellness Report.pdf',
          uploadDate: '2025-02-20',
          fileUrl: '#'
        }
      ]
    },
    {
      id: 'h5',
      date: '2024-09-15',
      type: 'Vaccination',
      description: 'Rabies, FVRCP',
      provider: 'Dr. James Wilson',
      documents: [
        {
          id: 'hd5',
          name: 'Vaccination Record.pdf',
          uploadDate: '2024-09-15',
          fileUrl: '#'
        }
      ]
    }
  ]
};

// Travel requirement checklist
const TRAVEL_REQUIREMENTS = [
  { id: 'req1', name: 'Microchip', description: 'ISO compatible microchip implantation' },
  { id: 'req2', name: 'Rabies Vaccination', description: 'Valid rabies vaccination (administered after microchipping)' },
  { id: 'req3', name: 'Pet Passport', description: 'Valid pet passport or equivalent documentation' },
  { id: 'req4', name: 'Health Certificate', description: 'Veterinary health certificate (typically required 10 days before travel)' },
  { id: 'req5', name: 'Import Permit', description: 'Required for some countries before travel' },
  { id: 'req6', name: 'Parasite Treatment', description: 'Treatment for internal and external parasites' },
  { id: 'req7', name: 'Blood Tests', description: 'Rabies titer test (required for some countries)' },
];

export default function PetDetailsPage() {
  const params = useParams();
  const petId = params.id as string;
  const router = useRouter();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [travelHistory, setTravelHistory] = useState<TravelHistory[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'travel' | 'health' | 'readiness'>('info');
  
  const [readinessInfo, setReadinessInfo] = useState<{
    icon: string;
    label: string;
    bg: string;
    text: string;
  }>({
    icon: '',
    label: '',
    bg: '',
    text: ''
  });

  const getAgeText = (birthdate: string) => {
    const ageInMillis = new Date().getTime() - new Date(birthdate).getTime();
    const ageInYears = ageInMillis / (1000 * 3600 * 24 * 365);
    return `${Math.floor(ageInYears)} years`;
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  useEffect(() => {
    const fetchData = () => {
      const petData = MOCK_PETS.find(pet => pet.id === petId);
      if (petData) {
        setPet(petData);
        setTravelHistory(MOCK_TRAVEL_HISTORY[petId] || []);
        setHealthRecords(MOCK_HEALTH_RECORDS[petId] || []);
        
        // Set readiness status
        const travelReady = petData.travelReadiness;
        if (travelReady === 'ready') {
          setReadinessInfo({
            icon: '✅',
            label: 'Travel Ready',
            bg: 'bg-green-100',
            text: 'text-green-800'
          });
        } else if (travelReady === 'incomplete') {
          setReadinessInfo({
            icon: '⚠️',
            label: 'Travel Info Incomplete',
            bg: 'bg-yellow-100',
            text: 'text-yellow-800'
          });
        } else {
          setReadinessInfo({
            icon: '❌',
            label: 'Not Ready',
            bg: 'bg-red-100',
            text: 'text-red-800'
          });
        }

        setLoading(false);
      } else {
        router.push('/404');
      }
    };

    fetchData();
  }, [petId, router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4">
        <Image src={pet!.imageUrl} alt={pet!.name} width={100} height={100} className="rounded-full" />
        <div>
          <h2 className="text-2xl font-semibold">{pet!.name}</h2>
          <p>{pet!.breed} ({getAgeText(pet!.birthdate!)})</p>
          <p>{pet!.species}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="tabs">
          <button onClick={() => setActiveTab('info')} className={`tab ${activeTab === 'info' ? 'active' : ''}`}>Info</button>
          <button onClick={() => setActiveTab('travel')} className={`tab ${activeTab === 'travel' ? 'active' : ''}`}>Travel</button>
          <button onClick={() => setActiveTab('health')} className={`tab ${activeTab === 'health' ? 'active' : ''}`}>Health</button>
          <button onClick={() => setActiveTab('readiness')} className={`tab ${activeTab === 'readiness' ? 'active' : ''}`}>Readiness</button>
        </div>
        
        <div className="mt-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <p><strong>Age:</strong> {getAgeText(pet!.birthdate!)}</p>
              <p><strong>Sex:</strong> {pet!.sex || 'Unknown'}</p>
              <p><strong>Color:</strong> {pet!.color || 'Unknown'}</p>
              <p><strong>Weight:</strong> {pet!.weight} kg</p>
              <p><strong>Microchipped:</strong> {pet!.microchipped ? `Yes (${pet!.microchipNumber})` : 'No'}</p>
              <p><strong>Vaccinations:</strong> Rabies ({pet!.vaccinations.rabies ? '✔' : '✖'}), Distemper ({pet!.vaccinations.distemper ? '✔' : '✖'}), Parvo ({pet!.vaccinations.parvo ? '✔' : '✖'}), Other: {pet!.vaccinations.other.join(', ')}</p>
              <p><strong>Last Checkup:</strong> {formatDate(pet!.lastCheckup)}</p>
              <p><strong>Medical Notes:</strong> {pet!.medicalNotes || 'None'}</p>
              <p><strong>Veterinarian:</strong> {pet!.veterinarian?.name} – {pet!.veterinarian?.phone}</p>
              <p><strong>Owner:</strong> {pet!.owner.name} ({pet!.owner.email})</p>
            </div>
          )}

          {activeTab === 'travel' && (
            <div className="space-y-4">
              {travelHistory.length > 0 ? (
                travelHistory.map(trip => (
                  <div key={trip.id} className="border p-4 rounded-md shadow-sm">
                    <p><strong>From:</strong> {trip.originCountry} → {trip.destinationCountry}</p>
                    <p><strong>Departure:</strong> {formatDate(trip.departureDate)}</p>
                    <p><strong>Return:</strong> {trip.returnDate ? formatDate(trip.returnDate) : 'N/A'}</p>
                    <p><strong>Status:</strong> {trip.status}</p>
                    <div>
                      <strong>Documents:</strong>
                      <ul className="list-disc list-inside">
                        {trip.documents.length > 0 ? trip.documents.map(doc => (
                          <li key={doc.id}>
                            <a href={doc.fileUrl} className="text-primary hover:underline">{doc.name}</a> ({formatDate(doc.uploadDate)})
                          </li>
                        )) : <li>No documents</li>}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <p>No travel history found for this pet.</p>
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-4">
              {healthRecords.length > 0 ? (
                healthRecords.map(record => (
                  <div key={record.id} className="border p-4 rounded-md shadow-sm">
                    <p><strong>Date:</strong> {formatDate(record.date)}</p>
                    <p><strong>Type:</strong> {record.type}</p>
                    <p><strong>Description:</strong> {record.description}</p>
                    <p><strong>Provider:</strong> {record.provider}</p>
                    <div>
                      <strong>Documents:</strong>
                      <ul className="list-disc list-inside">
                        {record.documents.length > 0 ? record.documents.map(doc => (
                          <li key={doc.id}>
                            <a href={doc.fileUrl} className="text-primary hover:underline">{doc.name}</a> ({formatDate(doc.uploadDate)})
                          </li>
                        )) : <li>No documents</li>}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <p>No health records found for this pet.</p>
              )}
            </div>
          )}

          {activeTab === 'readiness' && (
            <div className={`p-4 rounded-md ${readinessInfo.bg} ${readinessInfo.text}`}>
              <p className="text-lg font-semibold">{readinessInfo.icon} {readinessInfo.label}</p>
              <div className="mt-4 space-y-2">
                <h4 className="font-bold">Checklist:</h4>
                <ul className="list-disc list-inside text-foreground">
                  {TRAVEL_REQUIREMENTS.map(req => (
                    <li key={req.id}>
                      <strong>{req.name}:</strong> {req.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
