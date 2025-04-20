'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Password validation schema with strength requirements
const passwordSchema = z
  .object({
    token: z.string().min(1, { message: 'Reset token is required' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+-]/, {
        message: 'Password must contain at least one special character',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof passwordSchema>;

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  // Extract token from URL
  const token = searchParams.get('token') || '';
  
  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      token: token,
      password: '',
      confirmPassword: '',
    },
  });
  
  // Current password value for password strength checks
  const password = watch('password', '');
  
  // Validate token when component loads
  useEffect(() => {
    if (!token) {
      setTokenError('No reset token provided. Please request a new password reset link.');
      return;
    }
    
    // In a real app, you would validate the token with an API call
    // For demo, we'll simulate this with a timeout
    const validateToken = async () => {
      try {
        // For demo purposes, all tokens are valid except this test case
        if (token === 'invalid-token') {
          setTokenError('Invalid or expired reset token. Please request a new password reset link.');
          return;
                   <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to login link */}
          <div className="mt-4 text-center text-sm">
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-600 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ResetPasswordPage;
token. Please try again or request a new password reset link.');
      }
    };
    
    validateToken();
  }, [token, setValue]);
};

export default ResetPasswordPage;
        
        setTokenValidated(true);
        setValue('token', token);
      } catch (error) {
        setTokenError('Failed to validate reset token. Please try again or request a new password reset link.');
      }
    };
    
    validateToken();
  }, [token, setValue]);
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // In a real application, this would be an API call to reset the password
      // For demo purposes, we're simulating the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setIsSubmitSuccessful(true);
      
      // In a real app, you would redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      // Handle error responses
      if (error?.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Password strength indicators
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: 'No password' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+-]/.test(password)) strength += 1;
    
    const levels = [
      { level: 0, text: 'Very weak' },
      { level: 1, text: 'Weak' },
      { level: 2, text: 'Fair' },
      { level: 3, text: 'Good' },
      { level: 4, text: 'Strong' },
      { level: 5, text: 'Very strong' },
    ];
    
    return levels[strength];
  };
  
  const passwordStrength = getPasswordStrength(password);
  
  // Password requirement checks
  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { text: 'At least one number', met: /[0-9]/.test(password) },
    { text: 'At least one special character', met: /[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+-]/.test(password) },
  ];
  
  // If token error, show error message
  if (tokenError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        </div>
        
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium">Error</h3>
              <p>{tokenError}</p>
              <div className="mt-4">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary hover:text-primary-600 hover:underline"
                >
                  Request a new password reset
                </Link>
              </div>
            </div>
          </div>
        </div>
        
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
  }
  
  // If token is still validating, show loading
  if (!tokenValidated && !tokenError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        </div>
        
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Validating reset link...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Create a new password for your account
        </p>
      </div>

      {/* Success message */}
      {isSubmitSuccessful ? (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium">Password reset successful!</p>
              <p className="mt-1">
                Your password has been updated. You will be redirected to the login page shortly.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Error message */}
          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden token field */}
            <input type="hidden" {...register('token')} />

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
              
              {/* Password strength indicator */}
              {password && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Password strength:</span>
                      <span 
                        className={`text-xs font-medium ${
                          passwordStrength.level < 3 
                            ? 'text-destructive' 
                            : passwordStrength.level < 4 
                              ? 'text-amber-500' 
                              : 'text-green-600'
                        }`}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          passwordStrength.level < 3 
                            ? 'bg-destructive' 
                            : passwordStrength.level < 4 
                              ? 'bg-amber-500' 
                              : 'bg-green-600'
                        }`}
                        style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Password requirements */}
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center">
                        {req.met ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                        )}
                        <span className={`text-xs ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 

