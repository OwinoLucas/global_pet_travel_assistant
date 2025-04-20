// Authentication related types

// User profile type
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

// JWT Authentication tokens
export interface AuthTokens {
  access: string;
  refresh: string;
}

// Combined auth state with user and tokens
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request payload
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

// Login/Register response
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password reset confirmation
export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  password_confirm: string;
}

// Error response from API
export interface AuthError {
  status: number;
  data: {
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
  };
}

// Request to refresh token
export interface RefreshTokenRequest {
  refresh: string;
}

// Response from token refresh
export interface RefreshTokenResponse {
  access: string;
}

// Change password request
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Update profile request
export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

// Verify email request
export interface VerifyEmailRequest {
  token: string; // or verification_code depending on your backend
}

export interface MessageResponse {
  message: string;
}