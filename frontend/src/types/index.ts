// Pet related types
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

// Country related types
export interface Country {
  id: number;
  name: string;
  code: string;
  flag_url?: string;
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

