"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '@/store/features/auth/authSlice';
import { useLoginMutation } from '@/store/api/authApi';
import { LoginRequest, AuthResponse } from '@/types/auth';
import { RootState } from '@/store';
import { handleApiError } from '@/store/api/utils';
import { Loader2 } from 'lucide-react';

// Types for login form state
interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Types for validation errors
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  // Set up form state
  const [formData, setFormData] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get auth state from Redux store
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Use the login mutation hook from our API
  const [login, { isLoading, error: loginApiError }] = useLoginMutation();
  
  // If already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  // Handle API errors
  useEffect(() => {
    if (loginApiError) {
      setLoginError(handleApiError(loginApiError));
    } else {
      setLoginError(null);
    }
  }, [loginApiError]);
  
  // Check for registration success and pre-fill email
  useEffect(() => {
    const registered = searchParams.get('registered') === 'true';
    const registeredEmail = sessionStorage.getItem('registerEmail');
    
    if (registered && registeredEmail) {
      setSuccessMessage('Account created successfully! Please log in with your credentials.');
      
      // Pre-fill email field
      setFormData(prev => ({
        ...prev,
        email: registeredEmail,
        password: '' // Ensure password field is empty
      }));
      
      // Clean up stored email
      sessionStorage.removeItem('registerEmail');
    }
    
    // Clear success message on cleanup
    return () => {
      setSuccessMessage(null);
    };
  }, [searchParams]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Update form data with new values
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear errors when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };
  
  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Clear any previous errors
    setLoginError(null);
    
    try {
      // Create login request data
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };
      
      // Call the login API
      const result: AuthResponse = await login(loginData).unwrap();
      
      // Update auth state in Redux with the response data
      dispatch(
        setAuth({
          user: result.user,
          tokens: {
            access: result.tokens.access,
            refresh: result.tokens.refresh,
          },
        })
      );
      
      
      // Redirect to dashboard will happen automatically via useEffect when isAuthenticated changes
      
    } catch (error) {
      // Error is handled by useEffect watching loginApiError
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start pt-6 sm:px-6 lg:px-8 bg-muted/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative h-20 w-20">
            <Image
              src="/logo.svg"
              alt="Global Pet Travel Assistant"
              fill
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Log in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Or{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-600">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md" role="alert">
              <p>{successMessage}</p>
            </div>
          )}
          
          {/* General error message */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              <p>{loginError}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit} method="post" noValidate>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-border'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-600">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className={`block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-border'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 border-border rounded text-primary focus:ring-primary"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  disabled={isLoading}
                >
                  <span>Google</span>
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  disabled={isLoading}
                >
                  <span>Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

