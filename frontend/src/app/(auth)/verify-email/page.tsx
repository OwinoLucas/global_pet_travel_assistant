'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/redux/hooks';
import { authFailed } from '@/lib/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import { apiSlice } from '@/lib/api/apiSlice';

// Create API endpoints for email verification
const emailVerificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    verifyEmail: builder.mutation<{ detail: string }, string>({
      query: (token) => ({
        url: `/api/auth/email/verify/${token}/`,
        method: 'POST',
      }),
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.detail || 'Email verification failed. Please try again.',
        };
      },
    }),
    resendVerificationEmail: builder.mutation<{ detail: string }, { email: string }>({
      query: (data) => ({
        url: '/api/auth/email/resend-verification/',
        method: 'POST',
        body: data,
      }),
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.detail || 'Failed to resend verification email. Please try again.',
        };
      },
    }),
  }),
});

export const { 
  useVerifyEmailMutation, 
  useResendVerificationEmailMutation 
} = emailVerificationApi;

/**
 * Email Verification Page Component
 * 
 * Verifies a user's email using a token received by email
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  // Get token and email from URL
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  // API hooks
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();
  
  // UI states
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('No verification token provided. Please check your email link or request a new verification email.');
        return;
      }

      try {
        const result = await verifyEmail(token).unwrap();
        setVerificationStatus('success');
        setSuccessMessage(result.detail || 'Email verified successfully! You can now login to your account.');
      } catch (error: any) {
        console.error('Email verification failed:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Email verification failed. The link may be invalid or expired.');
        dispatch(authFailed(error.message || 'Email verification failed'));
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, verifyEmail, dispatch]);

  // Countdown effect for redirect after successful verification
  useEffect(() => {
    if (verificationStatus === 'success' && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (verificationStatus === 'success' && redirectCountdown === 0) {
      router.push('/login');
    }
  }, [verificationStatus, redirectCountdown, router]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  /**
   * Handle resend verification email
   */
  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage('Email address is required to resend verification.');
      return;
    }

    try {
      const result = await resendVerificationEmail({ email }).unwrap();
      setSuccessMessage(result.detail || 'Verification email has been resent. Please check your inbox.');
      setResendCooldown(60); // Set cooldown to 60 seconds
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      setErrorMessage(error.message || 'Failed to resend verification email. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Email Verification</h1>
          {verificationStatus === 'pending' && (
            <p className="mt-2 text-gray-600">
              Verifying your email address...
            </p>
          )}
          {verificationStatus === 'success' && (
            <p className="mt-2 text-gray-600">
              Your email has been verified successfully.
            </p>
          )}
          {verificationStatus === 'error' && (
            <p className="mt-2 text-gray-600">
              There was a problem verifying your email.
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="p-4 mt-4 text-sm text-red-800 bg-red-100 rounded-md">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 mt-4 text-sm text-green-800 bg-green-100 rounded-md">
            {successMessage}
            {verificationStatus === 'success' && (
              <div className="mt-2">
                Redirecting to login page in {redirectCountdown} seconds...
              </div>
            )}
          </div>
        )}

        {verificationStatus === 'pending' && isVerifying && (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {verificationStatus === 'error' && email && (
          <div className="mt-6">
            <p className="mb-4 text-center text-gray-700">
              If you need a new verification email, click the button below:
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={isResending}
              className="w-full"
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0 
                ? `Resend Email (${resendCooldown}s)` 
                : 'Resend Verification Email'}
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

