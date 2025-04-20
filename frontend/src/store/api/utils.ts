// API error handling utility functions

/**
 * Handles common API error scenarios and returns user-friendly error messages
 * @param error The error object from the API response
 * @returns A user-friendly error message string
 */
export const handleApiError = (error: any): string => {
  // Handle network errors
  if (error.name === 'TypeError' || error.name === 'NetworkError' || error.message === 'Network request failed') {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Handle RTK Query errors
  if ('status' in error) {
    // Server is down or not responding
    if (error.status === 'FETCH_ERROR') {
      return 'Unable to connect to the server. Please try again later.';
    }

    // Server timeout
    if (error.status === 'TIMEOUT_ERROR') {
      return 'Request timed out. Please try again.';
    }

    // Parse error
    if (error.status === 'PARSING_ERROR') {
      return 'There was a problem processing the response. Please try again.';
    }

    // Custom error messages based on HTTP status codes
    if (typeof error.status === 'number') {
      switch (error.status) {
        case 400:
          return error.data?.message || 'Invalid request. Please check your information and try again.';
        case 401:
          return 'Authentication failed. Please check your credentials and try again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 422:
          return error.data?.message || 'Validation error. Please check your information and try again.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'Server error. Please try again later.';
        default:
          return error.data?.message || 'An unexpected error occurred. Please try again later.';
      }
    }
  }

  // If we received a response with an error message
  if (error.data && error.data.message) {
    return error.data.message;
  }

  // Handle serialized error objects
  if (typeof error === 'object' && error !== null) {
    if ('message' in error) {
      return error.message;
    }
  }

  // Fallback for any other type of error
  return 'An unexpected error occurred. Please try again.';
};

