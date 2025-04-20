import { api } from '../api';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  UpdateProfileRequest,
  VerifyEmailRequest,
  MessageResponse,
  User
} from '@/types/auth';

/**
 * Authentication API slice with endpoints for auth operations
 */
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Registration endpoint
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: 'auth/register/',
        method: 'POST',
        body: credentials,
      }),
      // Invalidate relevant cache tags
      invalidatesTags: ['Profile'],
    }),

    // Login endpoint
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
      // Transform response to store tokens
      transformResponse: (response: AuthResponse) => {
        // Store tokens in local storage for persistence
        if (response.tokens.access) {
          localStorage.setItem('token', response.tokens.access);
        }
        if (response.tokens.refresh) {
          localStorage.setItem('refreshToken', response.tokens.refresh);
        }
        return response;
      },
      // Invalidate relevant cache tags
      invalidatesTags: ['Profile'],
    }),

    // Token refresh endpoint
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (refreshData) => ({
        url: 'auth/token/refresh/',
        method: 'POST',
        body: refreshData,
      }),
      // Transform response to store new token
      transformResponse: (response: RefreshTokenResponse) => {
        if (response.access) {
          localStorage.setItem('token', response.access);
        }
        return response;
      },
    }),

    // Token verification endpoint
    verifyToken: builder.mutation<{ valid: boolean }, { token: string }>({
      query: (tokenData) => ({
        url: 'auth/token/verify/',
        method: 'POST',
        body: tokenData,
      }),
    }),

    // Get user profile
    getProfile: builder.query<User, void>({
      query: () => 'auth/profile/',
      providesTags: ['Profile'],
    }),

    // Update user profile
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (profileData) => ({
        url: 'auth/profile/',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Change password
    changePassword: builder.mutation<MessageResponse, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: 'auth/profile/change-password/',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Request password reset
    requestPasswordReset: builder.mutation<MessageResponse, PasswordResetRequest>({
      query: (data) => ({
        url: 'auth/password/reset/',
        method: 'POST',
        body: data,
      }),
    }),

    // Confirm password reset
    confirmPasswordReset: builder.mutation<MessageResponse, PasswordResetConfirmRequest>({
      query: (data) => ({
        url: 'auth/password/reset/confirm/',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify email
    verifyEmail: builder.mutation<MessageResponse, VerifyEmailRequest>({
      query: (data) => ({
        url: 'auth/verify-email/',
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
      invalidatesTags: ['Profile'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useVerifyEmailMutation,
  useLogoutMutation,
} = authApi;
