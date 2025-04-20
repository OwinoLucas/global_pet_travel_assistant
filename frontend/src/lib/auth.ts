import { AuthTokens } from '@/types/auth';

// Local storage keys
const ACCESS_TOKEN_KEY = 'pet_travel_access_token';
const REFRESH_TOKEN_KEY = 'pet_travel_refresh_token';
const USER_KEY = 'pet_travel_user';

/**
 * Store authentication tokens in localStorage
 */
export const storeTokens = (tokens: AuthTokens): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }
};

/**
 * Retrieve authentication tokens from localStorage
 */
export const getStoredTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (!access || !refresh) {
    return null;
  }
  
  return { access, refresh };
};

/**
 * Store user data in localStorage
 */
export const storeUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Retrieve user data from localStorage
 */
export const getStoredUser = (): any | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userStr = localStorage.getItem(USER_KEY);
  
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse stored user data:', e);
    return null;
  }
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Parse JWT token payload (without validation)
 */
export const parseJwt = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

/**
 * Check if access token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Authentication utilities for protecting routes
 */
export const authUtils = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.access) {
      return false;
    }
    
    return !isTokenExpired(tokens.access);
  },
  
  /**
   * Get authorization header with Bearer token
   */
  getAuthHeader: (): Record<string, string> | undefined => {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.access) {
      return undefined;
    }
    
    return {
      Authorization: `Bearer ${tokens.access}`,
    };
  },
};

