import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PetTravelRequirement, Country, Pet, TravelDocument } from '../types';

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/', 
    credentials: 'include',
  }),
  tagTypes: ['Pet', 'Country', 'TravelDocument', 'Requirement'],
  endpoints: (builder) => ({
    // Pets
    getPets: builder.query<Pet[], void>({
      query: () => 'pets/',
      providesTags: ['Pet'],
    }),
    getPet: builder.query<Pet, number>({
      query: (id) => `pets/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Pet', id }],
    }),
    addPet: builder.mutation<Pet, Partial<Pet>>({
      query: (pet) => ({
        url: 'pets/',
        method: 'POST',
        body: pet,
      }),
      invalidatesTags: ['Pet'],
    }),
    updatePet: builder.mutation<Pet, Partial<Pet> & { id: number }>({
      query: ({ id, ...pet }) => ({
        url: `pets/${id}/`,
        method: 'PATCH',
        body: pet,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Pet', id }],
    }),
    
    // Countries
    getCountries: builder.query<Country[], void>({
      query: () => 'countries/',
      providesTags: ['Country'],
    }),
    
    // Travel Requirements
    getTravelRequirements: builder.query<
      PetTravelRequirement[],
      { originCountry: string; destinationCountry: string; petType: string }
    >({
      query: ({ originCountry, destinationCountry, petType }) => 
        `requirements/?origin=${originCountry}&destination=${destinationCountry}&pet_type=${petType}`,
      providesTags: ['Requirement'],
    }),
    
    // Travel Documents
    getTravelDocuments: builder.query<TravelDocument[], number>({
      query: (petId) => `documents/?pet_id=${petId}`,
      providesTags: ['TravelDocument'],
    }),
    addTravelDocument: builder.mutation<TravelDocument, Partial<TravelDocument>>({
      query: (document) => ({
        url: 'documents/',
        method: 'POST',
        body: document,
      }),
      invalidatesTags: ['TravelDocument'],
    }),
    updateTravelDocument: builder.mutation<
      TravelDocument,
      Partial<TravelDocument> & { id: number }
    >({
      query: ({ id, ...document }) => ({
        url: `documents/${id}/`,
        method: 'PATCH',
        body: document,
      }),
      invalidatesTags: ['TravelDocument'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPetsQuery,
  useGetPetQuery,
  useAddPetMutation,
  useUpdatePetMutation,
  useGetCountriesQuery,
  useGetTravelRequirementsQuery,
  useGetTravelDocumentsQuery,
  useAddTravelDocumentMutation,
  useUpdateTravelDocumentMutation,
} = api;

