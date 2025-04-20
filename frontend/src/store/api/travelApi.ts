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
  overrideExisting: true,
  endpoints: (builder) => ({
    // Country endpoints
    getCountries: builder.query<Country[], void>({
      query: () => 'travel/countries/',
      providesTags: [{ type: 'Countries' as const, id: 'LIST' }]
    }),
    
    getCountry: builder.query<Country, number>({
      query: (id) => `travel/countries/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Countries' as const, id }]
    }),
    
    // Pet Type endpoints
    getPetTypes: builder.query<PetType[], void>({
      query: () => 'travel/pet-types/',
      providesTags: [{ type: 'PetTypes' as const, id: 'LIST' }]
    }),
    
    getPetType: builder.query<PetType, number>({
      query: (id) => `travel/pet-types/${id}/`,
      providesTags: (result, error, id) => [{ type: 'PetTypes' as const, id }]
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
        return `travel/requirements/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Requirements' as const, id })),
              { type: 'Requirements' as const, id: 'LIST' }
            ]
          : [{ type: 'Requirements' as const, id: 'LIST' }]
    }),
    
    getRequirement: builder.query<DetailedRequirement, number>({
      query: (id) => `travel/requirements/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Requirements' as const, id }]
    }),
    
    // User Query endpoints
    getUserQueries: builder.query<UserQuery[], void>({
      query: () => 'travel/queries/',
      providesTags: [{ type: 'Queries' as const, id: 'LIST' }]
    }),
    
    getUserQuery: builder.query<DetailedUserQuery, number>({
      query: (id) => `travel/queries/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Queries' as const, id }]
    }),
    
    createUserQuery: builder.mutation<UserQuery, CreateUserQueryRequest>({
      query: (query) => ({
        url: 'travel/queries/',
        method: 'POST',
        body: query
      }),
      invalidatesTags: [{ type: 'Queries' as const, id: 'LIST' }]
    }),
    
    provideQueryFeedback: builder.mutation<UserQuery, { id: number, feedback: QueryFeedbackRequest }>({
      query: ({ id, feedback }) => ({
        url: `travel/queries/${id}/`,
        method: 'PATCH',
        body: feedback
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Queries' as const, id }]
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

