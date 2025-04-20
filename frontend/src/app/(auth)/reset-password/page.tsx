'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/redux/hooks';
import { startAuth, authFailed } from '@/lib/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import { apiSlice } from '@/lib/api/apiSlice';

// Create API endpoints for password reset
const resetPasswordApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    resetPassword: builder.mutation<{ detail: string }, { token: string; password: string; password2: string }>({
      query: (data) => ({
        url: '/api/auth/password-reset/confirm/',
        method: 'POST',
        body: data,
      }),
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.detail || 'Failed to reset password. Please try again.',
          fieldErrors: response.data || {},
        };
      },
    }),
    validateResetToken: builder.query<{ detail: string }, string>({
      query: (token) => `/api/auth/password-reset/validate-token/${token}/`,
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.detail || 'Invalid or expired token. Please request a new password reset.',
        };
      },
    }),
  }),
});

export const { useResetPasswordMutation, useLazyValidateResetTokenQuery } = resetPasswordApi;

/**
 * Reset Password Page Component
 * 
 * Allows users to reset their password using a token received by email
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  // Get token from URL
  const token = searchParams.get('token');
  
  // API hooks
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const [validateToken, { isLoading: isValidatingToken }] = useLazyValidateResetTokenQuery();
  
  // Form state
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  
  // UI states
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Validate token when component mounts
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false);
        setGeneralError('No reset token provided. Please request a new password reset.');
        return;
      }

      try {
        await validateToken(token).unwrap();
        setTokenValid(true);
      } catch (error: any) {
        console.error('Token validation failed:', error);
        setTokenValid(false);
        setGeneralError(error.message || 'Invalid or expired token. Please request a new password reset.');
      }
    };

    checkToken();
  }, [token, validateToken]);

  // Countdown effect for redirect
  useEffect(() => {
    if (successMessage && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (successMessage && redirectCountdown === 0) {
      router.push('/login');
    }
  }, [successMessage, redirectCountdown, router]);

  /**
   * Validate password format
   */
  const validatePassword = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate password - match Django's validation requirements
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one special character';
    }
    
    // Validate password confirmation
    if (!password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (password !== password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset errors
    setErrors({});
    setGeneralError('');
    
    // Validate form
    if (!validatePassword()) return;

    try {
      // Start loading state
      dispatch(startAuth());

      // Submit to API
      const result = await resetPassword({
        token: token!,
        password,
        password2
      }).unwrap();

      // Show success message
      setSuccessMessage(
        result.detail || 'Your password has been reset successfully. Redirecting to login...'
      );
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      // Handle API error responses
      if (error.fieldErrors) {
        // Map backend field errors to form fields
        const fieldErrors: {[key: string]: string} = {};
        
        Object.entries(error.fieldErrors).forEach(([key, value]) => {
          const errorMessage = Array.isArray(value) ? value[0] : String(value);
          fieldErrors[key] = errorMessage;
        });
        
        setErrors(fieldErrors);
      } else {
        // Handle general error
        dispatch(authFailed(error.message || 'Password reset failed'));
        setGeneralError(error.message || 'Password reset failed. Please try again.');
      }
    }
  };

  // Loading state
  const isLoading = isValidatingToken || isResettingPassword;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Reset Your Password</h1>
          <p className="mt-2 text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {generalError && (
          <div className="p-4 mt-4 text-sm text-red-800 bg-red-100 rounded-md">
            {generalError}
            {!tokenValid && (
              <div className="mt-2">
                <Link href="/forgot-password" className="font-medium text-red-800 hover:text-red-900 underline">
                  Request a new password reset
                </Link>
              </div>
            )}
          </div>
        )}

        {successMessage && (
          <div className="p-4 mt-4 text-sm text-green-800 bg-green-100 rounded-md">
            {successMessage}
            <div className="mt-2">
              Redirecting to login page in {redirectCountdown} seconds...
            </div>
          </div>
        )}

        {tokenValid && !successMessage && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special characters.
              </p>
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className={`block w-full px-3 py-2 mt-1 placeholder-gray-400 border ${
                  errors.password2 ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.password2 && (
                <p className="mt-1 text-xs text-red-600">{errors.password2}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

