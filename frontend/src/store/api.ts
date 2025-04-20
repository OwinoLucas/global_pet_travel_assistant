import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';

// Types for API errors
export interface ApiErrorResponse {
  status: number;
  data: {
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
    [key: string]: any;
  };
}

// Type to identify if an error is an API Error
export type ApiError = {
  status: number;
  data: any;
};

// Function to check if an error is an API error
export const isApiError = (error: any): error is ApiError => {
  return 'status' in error && 'data' in error;
};

// Define prepareHeaders function for authentication
const prepareHeaders = (headers: Headers, { getState }: { getState: () => unknown }) => {
  // Get token from state
  const token = (getState() as RootState).auth?.tokens;
  
  // If we have a token, add it to the headers
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('Content-Type', 'application/json');
  return headers;
};

// Base query with error handling
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/',
  prepareHeaders,
  credentials: 'include', // Include credentials for cookie-based auth if needed
});

// Enhanced base query with error handling and token refresh logic
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  // Execute the query
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle potential errors
  if (result.error) {
    const { status } = result.error as ApiError;
    
    // Handle unauthorized errors (401)
    if (status === 401) {
      // Get refresh token from storage
      const refreshToken = localStorage.getItem('refreshToken');
      
      // If refresh token exists, try to get a new access token
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResult = await baseQuery(
            { 
              url: 'api/auth/token/refresh/', 
              method: 'POST', 
              body: { refresh: refreshToken } 
            }, 
            api, 
            extraOptions
          );
          
          // If the refresh was successful, retry the original query
          if (refreshResult.data) {
            // Extract the new token
            const { access } = refreshResult.data as { access: string };
            
            // Store the new token
            localStorage.setItem('token', access);
            
            // Update the token in the Redux store
            api.dispatch({ 
              type: 'auth/setCredentials', 
              payload: { token: access } 
            });
            
            // Retry the original query with the new token
            return await baseQuery(args, api, extraOptions);
          } else {
            // If refresh failed, log out the user
            api.dispatch({ type: 'auth/logout' });
            
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        } catch (error) {
          // If refresh fails, log out the user
          api.dispatch({ type: 'auth/logout' });
        }
      } else {
        // If no refresh token, log out the user
        api.dispatch({ type: 'auth/logout' });
      }
    }
  }
  
  return result;
};

// Create the API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'Profile', 
    'Countries', 
    'PetTypes', 
    'Requirements', 
    'Queries'
  ],
  endpoints: (builder) => ({
    getPets: builder.query<any[], void>({
      query: () => 'api/pets/',
      providesTags: ['Profile'],
    }),
  }),
});

// Utility function for handling API errors in components
export const handleApiError = (error: unknown): string => {
  // API errors with status codes
  if (isApiError(error)) {
    const apiError = error as ApiError;
    
    // Handle specific status codes
    switch (apiError.status) {
      case 400:
        // Handle validation errors
        if (apiError.data?.errors) {
          const errorsObj = apiError.data.errors;
          const firstError = Object.values(errorsObj)[0];
          return Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
        return apiError.data?.detail || apiError.data?.message || 'Invalid request';
        
      case 401:
        return 'Authentication required. Please log in.';
        
      case 403:
        return 'You do not have permission to perform this action.';
        
      case 404:
        return 'The requested resource was not found.';
        
      case 500:
      case 502:
      case 503:
      case 504:
        return 'A server error occurred. Please try again later.';
        
      default:
        return apiError.data?.detail || apiError.data?.message || 'An error occurred.';
    }
  }
  
  // Network errors
  if (error instanceof Error) {
    return error.message;
  }
  
  // Unknown errors
  return 'An unknown error occurred. Please try again.';
};

// Export hooks
export const {
  // Utility hooks from RTK Query
  // These will be extended by the individual API slices
  useGetPetsQuery
} = api;

