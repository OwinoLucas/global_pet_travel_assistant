import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthResponse, LoginRequest, RegisterRequest, PasswordResetRequest, PasswordResetConfirmRequest } from '@/types/auth';
import { getStoredTokens } from '@/lib/auth';

// Auth-related API endpoints
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/`,
    prepareHeaders: (headers) => {
      // Get tokens from storage
      const tokens = getStoredTokens();
      
      // Add authorization header if we have a token
      if (tokens && tokens.access) {
        headers.set('Authorization', `Bearer ${tokens.access}`);
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Register endpoint
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'register/',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // Refresh token endpoint
    refreshToken: builder.mutation<{ access: string }, { refresh: string }>({
      query: (refreshToken) => ({
        url: 'token/refresh/',
        method: 'POST',
        body: refreshToken,
      }),
    }),
    
    // Verify token endpoint
    verifyToken: builder.mutation<void, { token: string }>({
      query: (token) => ({
        url: 'token/verify/',
        method: 'POST',
        body: token,
      }),
    }),
    
    // Request password reset
    requestPasswordReset: builder.mutation<{ detail: string }, PasswordResetRequest>({
      query: (data) => ({
        url: 'password/reset/',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Confirm password reset
    confirmPasswordReset: builder.mutation<{ detail: string }, PasswordResetConfirmRequest>({
      query: (data) => ({
        url: 'password/reset/confirm/',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Get current user profile
    getProfile: builder.query<any, void>({
      query: () => 'profile/',
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useGetProfileQuery,
} = authApi;

