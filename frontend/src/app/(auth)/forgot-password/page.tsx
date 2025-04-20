'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/redux/hooks';
import { startAuth, authFailed } from '@/lib/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import { apiSlice } from '@/lib/api/apiSlice';

// Create a new API endpoint for requesting password reset
const forgotPasswordApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestPasswordReset: builder.mutation<{ detail: string }, { email: string }>({
      query: (data) => ({
        url: '/api/auth/password-reset/',
        method: 'POST',
        body: data,
      }),
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.detail || 'Failed to request password reset. Please try again.',
        };
      },
    }),
  }),
});

export const { useRequestPasswordResetMutation } = forgotPasswordApi;

/**
 * Forgot Password Page Component
 * 
 * Provides a form for users to request a password reset
 */
export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const [requestPasswordReset, { isLoading }] = useRequestPasswordResetMutation();

  // Form state
  const [email, setEmail] = useState('');
  
  // UI states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset states
    setErrorMessage('');
    setSuccessMessage('');

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      // Start loading state
      dispatch(startAuth());

      // Call API to request password reset
      const result = await requestPasswordReset({ email }).unwrap();

      // Show success message
      setSuccessMessage(
        result.detail || 
        'If an account exists for this email, you will receive password reset instructions.'
      );
      setSubmitted(true);
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      
      // Set error message, but don't reveal if the email exists or not for security
      setErrorMessage(
        error.message || 
        'There was a problem processing your request. Please try again later.'
      );
      
      // Set error in Redux
      dispatch(authFailed(error.message || 'Password reset request failed'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Forgot your password?</h1>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 mt-4 text-sm text-red-800 bg-red-100 rounded-md">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 mt-4 text-sm text-green-800 bg-green-100 rounded-md">
            {successMessage}
          </div>
        )}

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-6 text-center">
            <p className="mb-4">Check your email for the reset link.</p>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setSubmitted(false)}
              className="w-full"
            >
              Try Another Email
            </Button>
          </div>
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

