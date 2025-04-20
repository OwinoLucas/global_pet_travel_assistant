import { api } from '../api';
import {
  Country,
  PetType,
  Requirement,
  RequirementQueryParams,
  DetailedRequirement,
  UserQuery,
  DetailedUserQuery,
  CreateUserQueryRequest,
  QueryFeedbackRequest
} from '@/types/travel';

/**
 * Travel API slice for accessing pet travel information
 * Provides endpoints for countries, pet types, requirements, and user queries
 */
export const travelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Country endpoints
    getCountries: builder.query<Country[], void>({
      query: () => 'api/v1/countries/',
      providesTags: ['Countries']
    }),
    
    getCountry: builder.query<Country, number>({
      query: (id) => `api/v1/countries/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Countries', id }]
    }),
    
    // Pet Type endpoints
    getPetTypes: builder.query<PetType[], void>({
      query: () => 'api/v1/pet-types/',
      providesTags: ['PetTypes']
    }),
    
    getPetType: builder.query<PetType, number>({
      query: (id) => `api/v1/pet-types/${id}/`,
      providesTags: (result, error, id) => [{ type: 'PetTypes', id }]
    }),
    
    // Requirements endpoints
    getRequirements: builder.query<Requirement[], RequirementQueryParams | void>({
      query: (params) => {
        // Build query string based on provided params
        const queryParams = new URLSearchParams();
        
        if (params) {
          if (params.country !== undefined) {
            queryParams.append('country', params.country.toString());
          }
          if (params.pet_type !== undefined) {
            queryParams.append('pet_type', params.pet_type.toString());
          }
          if (params.is_mandatory !== undefined) {
            queryParams.append('is_mandatory', params.is_mandatory.toString());
          }
        }
        
        const queryString = queryParams.toString();
        return `api/v1/requirements/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Requirements']
    }),
    
    getRequirement: builder.query<DetailedRequirement, number>({
      query: (id) => `api/v1/requirements/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Requirements', id }]
    }),
    
    // User Query endpoints
    getUserQueries: builder.query<UserQuery[], void>({
      query: () => 'api/v1/queries/',
      providesTags: ['Queries']
    }),
    
    getUserQuery: builder.query<DetailedUserQuery, number>({
      query: (id) => `api/v1/queries/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Queries', id }]
    }),
    
    createUserQuery: builder.mutation<UserQuery, CreateUserQueryRequest>({
      query: (query) => ({
        url: 'api/v1/queries/',
        method: 'POST',
        body: query
      }),
      invalidatesTags: ['Queries']
    }),
    
    provideQueryFeedback: builder.mutation<UserQuery, { id: number, feedback: QueryFeedbackRequest }>({
      query: ({ id, feedback }) => ({
        url: `api/v1/queries/${id}/`,
        method: 'PATCH',
        body: feedback
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Queries', id }]
    })
  })
});

// Export generated hooks
export const {
  // Country hooks
  useGetCountriesQuery,
  useGetCountryQuery,
  
  // Pet Type hooks
  useGetPetTypesQuery,
  useGetPetTypeQuery,
  
  // Requirements hooks
  useGetRequirementsQuery,
  useGetRequirementQuery,
  
  // User Query hooks
  useGetUserQueriesQuery,
  useGetUserQueryQuery,
  useCreateUserQueryMutation,
  useProvideQueryFeedbackMutation
} = travelApi;

