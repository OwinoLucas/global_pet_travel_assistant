'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccessful, setResendSuccessful] = useState(false);
  
  // Extract token from URL
  const token = searchParams.get('token') || '';
  const userEmail = searchParams.get('email') || '';
  
  // Verify token when component loads
  useEffect(() => {
    if (!token) {
      setVerificationState('error');
      setErrorMessage('No verification token provided. Please check your email for the correct link or request a new verification email.');
      return;
    }
    
    // Set email for resend verification
    if (userEmail) {
      setEmail(userEmail);
    }
    
    // In a real app, you would verify the token with an API call
    // For demo, we'll simulate this with a timeout
    const verifyToken = async () => {
      try {
        // Simulating API call to verify token
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo purposes, all tokens are valid except this test case
        if (token === 'invalid-token') {
          setVerificationState('error');
          setErrorMessage('Invalid or expired verification token. Please request a new verification email.');
          return;
        }
        
        // Verification successful
        setVerificationState('success');
        
        // In a real app, you would redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      } catch (error) {
        setVerificationState('error');
        setErrorMessage('Failed to verify your email. Please try again or request a new verification email.');
      }
    };
    
    verifyToken();
  }, [token, userEmail, router]);
  
  // Handle resend verification email
  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccessful(false);
    
    try {
      // In a real app, this would be an API call to resend the verification email
      // For demo purposes, we're simulating the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setResendSuccessful(true);
    } catch (error) {
      // Handle error
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };
  
  // Loading state
  if (verificationState === 'loading') {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verifying Your Email</h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we verify your email address
          </p>
        </div>
        
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Verifying...</span>
        </div>
      </div>
    );
  }
  
  // Success state
  if (verificationState === 'success') {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Email Verified</h1>
        </div>
        
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium">Your email has been successfully verified!</p>
              <p className="mt-1">
                You can now log in to your account. You will be redirected to the login page shortly.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-600 hover:underline"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }
  
  // Error state
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Email Verification Failed</h1>
      </div>
      
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium">Error</h3>
            <p>{errorMessage || 'Something went wrong with your email verification'}</p>
          </div>
        </div>
      </div>
      
      {email && (
        <div className="bg-card border border-border rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Resend Verification Email</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you didn't receive the verification email or if the link has expired, you can request a new one.
          </p>
          
          {resendSuccessful ? (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200 mb-4">
              <p>Verification email has been resent. Please check your inbox.</p>
            </div>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                'Resend Verification Email'
              )}
            </button>
          )}
        </div>
      )}
      
      <div className="text-center">
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary-600 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

