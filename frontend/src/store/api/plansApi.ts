import { api } from '../api';
import {
  TravelPlan,
  CreateTravelPlanRequest,
  UpdateTravelPlanRequest,
  TravelPlanStatus
} from '@/types/travel';

/**
 * API slice for travel plans management
 * Provides endpoints for CRUD operations on travel plans and requirements management
 */
export const plansApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all travel plans
    getPlans: builder.query<TravelPlan[], void | { status?: TravelPlanStatus; upcoming?: boolean }>({
      query: (params) => {
        // Build the query string based on provided filters
        const queryParams = new URLSearchParams();
        
        if (params) {
          if (params.status) {
            queryParams.append('status', params.status);
          }
          if (params.upcoming !== undefined) {
            queryParams.append('upcoming', params.upcoming.toString());
          }
        }
        
        const queryString = queryParams.toString();
        return `travel/plans/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'TravelPlans' as const, id })),
              { type: 'TravelPlans' as const, id: 'LIST' }
            ]
          : [{ type: 'TravelPlans' as const, id: 'LIST' }]
    }),
    
    // Get a single travel plan by ID
    getPlanById: builder.query<TravelPlan, number>({
      query: (id) => `travel/plans/${id}/`,
      providesTags: (result, error, id) => [{ type: 'TravelPlans' as const, id }]
    }),
    
    // Create a new travel plan
    createPlan: builder.mutation<TravelPlan, CreateTravelPlanRequest>({
      query: (plan) => ({
        url: 'travel/plans/',
        method: 'POST',
        body: plan,
      }),
      invalidatesTags: [{ type: 'TravelPlans' as const, id: 'LIST' }]
    }),
    
    // Update an existing travel plan
    updatePlan: builder.mutation<TravelPlan, { id: number; plan: UpdateTravelPlanRequest }>({
      query: ({ id, plan }) => ({
        url: `travel/plans/${id}/`,
        method: 'PATCH',
        body: plan,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TravelPlans' as const, id },
        { type: 'TravelPlans' as const, id: 'LIST' }
      ]
    }),
    
    // Delete a travel plan
    deletePlan: builder.mutation<void, number>({
      query: (id) => ({
        url: `travel/plans/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'TravelPlans' as const, id: 'LIST' }]
    }),
    
    // Get all requirements for a travel plan
    getPlanRequirements: builder.query<TravelPlan, number>({
      query: (id) => `travel/plans/${id}/requirements/`,
      providesTags: (result, error, id) => [
        { type: 'TravelPlans' as const, id },
        { type: 'Requirements' as const, id: `plan-${id}` }
      ]
    }),
    
    // Update a requirement status for a travel plan
    updateRequirement: builder.mutation<
      any,
      { 
        planId: number; 
        requirementId: number; 
        status: string; 
        notes?: string;
        completionDate?: string;
      }
    >({
      query: ({ planId, requirementId, status, notes, completionDate }) => ({
        url: `travel/plans/${planId}/update_requirement/`,
        method: 'POST',
        body: { 
          requirement_id: requirementId, 
          status, 
          notes,
          completion_date: completionDate
        },
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: 'Requirements' as const, id: `plan-${planId}` },
        { type: 'TravelPlans' as const, id: planId }
      ]
    }),
    
    // Upload a proof document for a requirement
    uploadProof: builder.mutation<
      any,
      { 
        planId: number; 
        requirementId: number; 
        proofDocument: File;
      }
    >({
      query: ({ planId, requirementId, proofDocument }) => {
        // Use FormData to handle file uploads
        const formData = new FormData();
        formData.append('requirement_id', requirementId.toString());
        formData.append('proof_document', proofDocument);
        
        return {
          url: `travel/plans/${planId}/upload_proof/`,
          method: 'POST',
          body: formData,
          // Don't set Content-Type header, browser will set it with boundary
          formData: true,
        };
      },
      invalidatesTags: (result, error, { planId }) => [
        { type: 'Requirements' as const, id: `plan-${planId}` },
        { type: 'TravelPlans' as const, id: planId }
      ]
    })
  })
});

// Export hooks for usage in functional components
export const {
  // Travel plans hooks
  useGetPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  
  // Requirements hooks
  useGetPlanRequirementsQuery,
  useUpdateRequirementMutation,
  useUploadProofMutation,
} = plansApi;

