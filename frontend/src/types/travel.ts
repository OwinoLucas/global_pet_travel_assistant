/**
 * Country information for travel requirements
 */
export interface Country {
  id: number;
  name: string;
  code: string;
  flag_url?: string;
}

/**
 * Pet type (dog, cat, bird, etc.)
 */
export interface PetType {
  id: number;
  name: string;
  species?: string;
  description?: string;
}

/**
 * Pet information
 */
export interface Pet {
  id: number;
  name: string;
  type: 'dog' | 'cat' | 'ferret' | 'bird' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  microchip_number?: string;
  vaccination_status?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
/**
 * Travel plan status options
 */
export type TravelPlanStatus = 'planning' | 'ready' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Travel plan interface for trips with pets
 */
export interface TravelPlans {
  id: number;
  name: string;
  pet: number;
  pet_name: string;
  pet_image?: string;
  origin_country: number;
  origin_country_name: string;
  destination_country: number;
  destination_country_name: string;
  departure_date: string;
  return_date?: string;
  status: TravelPlanStatus;
  notes?: string;
  days_until_departure?: number;
  created_at: string;
  updated_at: string;
  requirements?: TravelRequirement[];
}

/**
 * Detailed travel plan with nested objects
 */
export interface DetailedTravelPlan extends Omit<TravelPlans, 'pet' | 'origin_country' | 'destination_country'> {
  pet: Pet;
  origin_country: Country;
  destination_country: Country;
}

/**
 * Travel requirement status options
 */
export type RequirementStatus = 'not_started' | 'in_progress' | 'completed' | 'not_applicable';

/**
 * Travel requirement for a specific plan
 */
export interface TravelRequirement {
  id?: number;
  requirement_id: number;
  description: string;
  status: RequirementStatus;
  completion_date?: string;
  notes?: string;
  has_proof: boolean;
}

// Travel requirements
export interface PetTravelRequirement {
  id: number;
  origin_country: number;
  destination_country: number;
  pet_type: string;
  requirement_type: 'vaccination' | 'certificate' | 'quarantine' | 'parasite' | 'microchip' | 'other';
  description: string;
  is_mandatory: boolean;
  valid_from?: string;
  valid_until?: string;
  documentation_url?: string;
  notes?: string;
}

// Travel document status
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';

/**
 * Parameters for creating a new travel plan
 */
export interface CreateTravelPlanRequest {
  name: string;
  pet: number;
  origin_country: number;
  destination_country: number;
  departure_date: string;
  return_date?: string;
  notes?: string;
}

/**
 * Parameters for updating an existing travel plan
 */
export interface UpdateTravelPlanRequest {
  name?: string;
  pet?: number;
  origin_country?: number;
  destination_country?: number;
  departure_date?: string;
  return_date?: string;
  status?: TravelPlanStatus;
  notes?: string;
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
 * Detailed requirement with country and pet type details
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
 * Parameters for updating a requirement's status
 */
export interface UpdateRequirementRequest {
  planId: number;
  requirementId: number;
  status: RequirementStatus;
  notes?: string;
  completionDate?: string;
}

/**
 * Parameters for uploading proof document
 */
export interface UploadProofRequest {
  planId: number;
  requirementId: number;
  proofDocument: File;
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




// Travel requirements
export interface PetTravelRequirement {
  id: number;
  origin_country: number;
  destination_country: number;
  pet_type: string;
  requirement_type: 'vaccination' | 'certificate' | 'quarantine' | 'parasite' | 'microchip' | 'other';
  description: string;
  is_mandatory: boolean;
  valid_from?: string;
  valid_until?: string;
  documentation_url?: string;
  notes?: string;
}



// Travel documents
export interface TravelDocument {
  id: number;
  pet: number;
  document_type: 'vaccination_certificate' | 'health_certificate' | 'import_permit' | 'parasite_treatment' | 'microchip_proof' | 'other';
  issue_date: string;
  expiry_date?: string;
  issuing_authority: string;
  document_number?: string;
  status: DocumentStatus;
  file_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Travel plan
export interface TravelPlan {
  id: number;
  pet: number;
  origin_country: number;
  destination_country: number;
  departure_date: string;
  return_date?: string;
  carrier?: string;
  notes?: string;
  status: 'planning' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  language: string;
}

// API response for error handling
export interface ApiError {
  status: number;
  data: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

