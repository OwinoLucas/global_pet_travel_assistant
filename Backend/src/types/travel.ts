/**
 * Country information for travel requirements
 */
export interface Country {
  id: number;
  name: string;
  code: string;
  region: string;
  flag_url?: string;
}

/**
 * Pet type (dog, cat, bird, etc.)
 */
export interface PetType {
  id: number;
  name: string;
  description: string;
}

/**
 * Requirements for bringing a pet to a specific country
 */
export interface Requirement {
  id: number;
  country: number;
  pet_type: number;
  description: string;
  details: string;
  documentation_needed: string[];
  validity_period: number; // In days
  created_at: string;
  updated_at: string;
  is_mandatory: boolean;
}

/**
 * Travel requirement with country and pet type details
 */
export interface DetailedRequirement extends Requirement {
  country_details: Country;
  pet_type_details: PetType;
}

/**
 * Params for filtering requirements
 */
export interface RequirementQueryParams {
  country?: number;
  pet_type?: number;
  is_mandatory?: boolean;
}

/**
 * User query to the AI assistant
 */
export interface UserQuery {
  id: number;
  user: number;
  origin_country: number;
  destination_country: number;
  pet_type: number;
  query: string;
  response: string;
  conversation_id?: string;
  feedback_rating?: number;
  feedback_comments?: string;
  created_at: string;
}

/**
 * Detailed user query with related entity details
 */
export interface DetailedUserQuery extends UserQuery {
  origin_country_details: Country;
  destination_country_details: Country;
  pet_type_details: PetType;
}

/**
 * Parameters for creating a new user query
 */
export interface CreateUserQueryRequest {
  origin_country: number;
  destination_country: number;
  pet_type: number;
  query: string;
  conversation_id?: string;
}

/**
 * Parameters for providing feedback on a query
 */
export interface QueryFeedbackRequest {
  feedback_rating: number;
  feedback_comments?: string;
}

