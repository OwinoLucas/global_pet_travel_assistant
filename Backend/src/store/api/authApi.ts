import { api } from '../api';
import {
  AuthResponse,
  ChangePasswordRequest,
  LoginCredentials,
  ProfileUpdateRequest,
  RegisterCredentials,
  ResetPasswordConfirm,
  ResetPasswordRequest,
  TokenRefreshRequest,
  User,
  VerifyTokenRequest
} from '@/types/auth';

/**
 * Authentication API slice
 * Provides endpoints for authentication, profile management, and password operations
 */
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication endpoints
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: 'api/auth/register/',
        method: 'POST',
        body: credentials,
      }),
      // Invalidate relevant cache tags
      invalidatesTags: ['Profile'],
    }),

    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: 'api/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      // Transform response
      transformResponse: (response: AuthResponse) => {
        // Store tokens in local storage for persistence
        if (response.access) {
          localStorage.setItem('token', response.access);
        }
        if (response.refresh) {
          localStorage.setItem('refreshToken', response.refresh);
        }
        return response;
      },
      // Invalidate relevant cache tags
      invalidatesTags: ['Profile'],
    }),

    // Token management
    refreshToken: builder.mutation<{ access: string }, TokenRefreshRequest>({
      query: (refreshData) => ({
        url: 'api/auth/token/refresh/',
        method: 'POST',
        body: refreshData,
      }),
      // Transform response
      transformResponse: (response: { access: string }) => {
        // Store the new token
        if (response.access) {
          localStorage.setItem('token', response.access);
        }
        return response;
      },
    }),

    verifyToken: builder.mutation<{ valid: boolean }, VerifyTokenRequest>({
      query: (tokenData) => ({
        url: 'api/auth/token/verify/',
        method: 'POST',
        body: tokenData,
      }),
    }),

    // Profile management
    getProfile: builder.query<User, void>({
      query: () => 'api/auth/profile/',
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<User, ProfileUpdateRequest>({
      query: (profileData) => ({
        url: 'api/auth/profile/',
        method: 'PATCH',
        body: profileData,
      }),
      // Invalidate relevant cache tags
      invalidatesTags: ['Profile'],
    }),

    changePassword: builder.mutation<{ detail: string }, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: 'api/auth/profile/change-password/',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Password management
    forgotPassword: builder.mutation<{ detail: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: 'api/auth/password/reset/',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<{ detail: string }, ResetPasswordConfirm>({
      query: (data) => ({
        url: 'api/auth/password/reset/confirm/',
        method: 'POST',
        body: data,
      }),
    }),

    // Logout (client-side only)
    logout: builder.mutation<void, void>({
      queryFn: () => {
        // Remove tokens from storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return { data: undefined };
      },
      // Invalidate all cache
      invalidatesTags: ['Profile'],
    }),
  }),
});

// Export generated hooks
export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;

