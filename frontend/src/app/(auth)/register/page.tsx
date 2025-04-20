'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { useRegisterMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/features/authSlice';
import { RegisterRequest } from '@/types/auth';

// Password validation requirements
const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'number', label: 'One number', regex: /\d/ },
  { id: 'special', label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

// Form validation schema
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(30, { message: 'Username must be less than 30 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/\d/, { message: 'Password must contain at least one number' })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Password must contain at least one special character' }),
    password_confirm: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
    terms: z
      .boolean()
      .refine((val) => val === true, { message: 'You must accept the terms and conditions' }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Password strength tracking
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{[key: string]: boolean}>({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  
  // RTK Query register mutation
  const [registerUser, { isLoading }] = useRegisterMutation();
  
  // React Hook Form
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      terms: false,
    },
  });
  
  // Watch password for strength indicator
  const watchPassword = watch('password');
  
  // Update password strength indicators when password changes
  useEffect(() => {
    if (watchPassword) {
      setPasswordValue(watchPassword);
      
      // Check each requirement
      const updatedStrength = {
        length: passwordRequirements[0].regex.test(watchPassword),
        lowercase: passwordRequirements[1].regex.test(watchPassword),
        uppercase: passwordRequirements[2].regex.test(watchPassword),
        number: passwordRequirements[3].regex.test(watchPassword),
        special: passwordRequirements[4].regex.test(watchPassword),
      };
      
      setPasswordStrength(updatedStrength);
    }
  }, [watchPassword]);
  
  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      // Extract data needed for registration
      const registerData: RegisterRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
      };
      
      // Attempt registration
      const response = await registerUser(registerData).unwrap();
      
      // Store email in sessionStorage for login page
      sessionStorage.setItem('registerEmail', data.email);
      
      // Redirect to login page with success parameter
      router.push('/login?registered=true');
    } catch (error: any) {
      // Handle error responses from API
      if (error?.data?.detail) {
        setErrorMessage(error.data.detail);
      } else if (error?.data?.message) {
        setErrorMessage(error.data.message);
      } else if (error?.data?.errors) {
        // Join all errors into a string
        const errorMessages = Object.values(error.data.errors)
          .flat()
          .join(', ');
        setErrorMessage(errorMessages);
      } else {
        setErrorMessage('Failed to create account. Please try again.');
      }
    }
  };
  
  // Calculate password strength percentage
  const getPasswordStrengthPercentage = () => {
    const metRequirements = Object.values(passwordStrength).filter(Boolean).length;
    return (metRequirements / passwordRequirements.length) * 100;
  };
  
  const strengthPercentage = getPasswordStrengthPercentage();
  
  // Get color based on strength
  const getStrengthColor = () => {
    if (strengthPercentage <= 20) return 'bg-destructive';
    if (strengthPercentage <= 40) return 'bg-destructive/70';
    if (strengthPercentage <= 60) return 'bg-warning';
    if (strengthPercentage <= 80) return 'bg-accent';
    return 'bg-success';
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your information to create your account
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username field */}
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.username ? 'border-destructive' : ''
            }`}
            placeholder="johndoe"
            {...registerField('username')}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.email ? 'border-destructive' : ''
            }`}
            placeholder="name@example.com"
            {...registerField('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        {/* Password field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.password ? 'border-destructive' : ''
              }`}
              placeholder="••••••••"
              {...registerField('password')}
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

          {/* Password strength meter */}
          {watchPassword && (
            <div className="space-y-2 mt-2">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()}`}
                  style={{ width: `${strengthPercentage}%` }}
                />
              </div>
              <ul className="space-y-1">
                {passwordRequirements.map((req) => (
                  <li key={req.id} className="flex items-center text-xs">
                    {passwordStrength[req.id] ? (
                      <Check className="h-3.5 w-3.5 mr-2 text-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    )}
                    <span className={passwordStrength[req.id] ? 'text-success' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <label
            htmlFor="password_confirm"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="password_confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.password_confirm ? 'border-destructive' : ''
              }`}
              placeholder="••••••••"
              {...registerField('password_confirm')}
              disabled={isLoading}
            />
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
          {errors.password_confirm && (
            <p className="text-xs text-destructive mt-1">{errors.password_confirm.message}</p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...registerField('terms')}
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <Link
                href="/terms"
                className="text-primary hover:underline"
                target="_blank"
              >
                terms and conditions
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-destructive mt-1">{errors.terms.message}</p>
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
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Login link */}
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-600 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
