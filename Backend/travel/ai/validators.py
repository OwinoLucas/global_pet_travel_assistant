"""
Validators for the Global Pet Travel Assistant AI service.
This module contains functions to validate AI responses against
database records and ensure they meet quality standards.
"""

import logging
import re

logger = logging.getLogger(__name__)

# Required sections that should be present in AI responses
REQUIRED_SECTIONS = [
    "documentation",
    "vaccination",
    "quarantine",
    "timeline"
]

# Safety phrases that should be included when appropriate
SAFETY_DISCLAIMERS = [
    "consult with a veterinarian",
    "check with the embassy",
    "requirements may change",
    "official website",
    "verify all information"
]

def validate_response(response, context):
    """
    Main validation function that runs all checks on the AI response.
    
    Args:
        response (str): The AI-generated response text
        context (dict): The context data used to generate the response
        
    Returns:
        dict: Validation results including the potentially modified response
    """
    validation_result = {
        'is_valid': True,
        'response': response,
        'warnings': [],
        'errors': []
    }
    
    # Run each validation check
    section_check = validate_required_sections(response)
    contradiction_check = validate_no_contradictions(response, context)
    safety_check = validate_safety_disclaimers(response, context)
    
    # Combine validation results
    if not section_check['is_valid']:
        validation_result['is_valid'] = False
        validation_result['warnings'].extend(section_check['warnings'])
        validation_result['response'] = add_missing_sections(response, section_check['missing_sections'])
    
    if not contradiction_check['is_valid']:
        validation_result['is_valid'] = False
        validation_result['errors'].extend(contradiction_check['errors'])
        # If there are contradictions, we'll need to regenerate or fix the response
        validation_result['response'] = fix_contradictions(response, contradiction_check['contradictions'])
    
    if not safety_check['is_valid']:
        validation_result['is_valid'] = False
        validation_result['warnings'].extend(safety_check['warnings'])
        validation_result['response'] = add_safety_disclaimers(response)
    
    return validation_result

def validate_required_sections(response):
    """
    Checks if the response contains all required sections.
    
    Args:
        response (str): The AI-generated response text
        
    Returns:
        dict: Validation results with warnings and missing sections
    """
    result = {
        'is_valid': True,
        'warnings': [],
        'missing_sections': []
    }
    
    # Convert to lowercase for case-insensitive matching
    response_lower = response.lower()
    
    # Check for each required section
    for section in REQUIRED_SECTIONS:
        if section not in response_lower:
            result['is_valid'] = False
            result['missing_sections'].append(section)
            result['warnings'].append(f"Response is missing information about {section}")
    
    return result

def validate_no_contradictions(response, context):
    """
    Checks if the response contradicts the database information.
    
    Args:
        response (str): The AI-generated response text
        context (dict): The context data used to generate the response
        
    Returns:
        dict: Validation results with errors and contradictions
    """
    result = {
        'is_valid': True,
        'errors': [],
        'contradictions': []
    }
    
    # Skip if no country data is available
    if not context.get('country_data'):
        return result
    
    response_lower = response.lower()
    
    # Check for contradictions in country data
    for country in context.get('country_data', []):
        # Check if response contradicts vaccination requirements
        if country.get('vaccination_requirements'):
            key_vaccines = extract_key_terms(country['vaccination_requirements'])
            for vaccine in key_vaccines:
                # If a required vaccine is mentioned in the database but negated in the response
                negation_pattern = f"no {vaccine}|not require.*{vaccine}|{vaccine}.*not required"
                if vaccine.lower() in response_lower and re.search(negation_pattern, response_lower):
                    contradiction = {
                        'type': 'vaccination',
                        'country': country['name'],
                        'expected': f"Requires {vaccine}",
                        'found': f"Response suggests {vaccine} is not required"
                    }
                    result['is_valid'] = False
                    result['contradictions'].append(contradiction)
                    result['errors'].append(
                        f"Contradiction found: {country['name']} requires {vaccine}, "
                        f"but the response suggests it is not required."
                    )
        
        # Check if response contradicts quarantine requirements
        if country.get('quarantine_requirements'):
            if "quarantine" in country['quarantine_requirements'].lower():
                if "no quarantine" in response_lower or "not require quarantine" in response_lower:
                    contradiction = {
                        'type': 'quarantine',
                        'country': country['name'],
                        'expected': "Requires quarantine",
                        'found': "Response suggests no quarantine is required"
                    }
                    result['is_valid'] = False
                    result['contradictions'].append(contradiction)
                    result['errors'].append(
                        f"Contradiction found: {country['name']} requires quarantine, "
                        f"but the response suggests it is not required."
                    )
    
    # Check for contradictions in pet-specific requirements
    if context.get('country_pet_reqs'):
        pet_reqs = context['country_pet_reqs']
        # Check if the response contradicts prohibition information
        if pet_reqs.get('prohibited', False):
            if "allowed" in response_lower or "permitted" in response_lower:
                contradiction = {
                    'type': 'prohibition',
                    'country': pet_reqs['country'],
                    'pet_type': pet_reqs['pet_type'],
                    'expected': "This pet type is prohibited",
                    'found': "Response suggests the pet is allowed"
                }
                result['is_valid'] = False
                result['contradictions'].append(contradiction)
                result['errors'].append(
                    f"Contradiction found: {pet_reqs['pet_type']} is prohibited in {pet_reqs['country']}, "
                    f"but the response suggests it is allowed."
                )
    
    return result

def validate_safety_disclaimers(response, context):
    """
    Checks if the response includes necessary safety disclaimers.
    
    Args:
        response (str): The AI-generated response text
        context (dict): The context data used to generate the response
        
    Returns:
        dict: Validation results with warnings
    """
    result = {
        'is_valid': True,
        'warnings': []
    }
    
    response_lower = response.lower()
    
    # Count how many safety disclaimers are included
    disclaimer_count = 0
    for disclaimer in SAFETY_DISCLAIMERS:
        if disclaimer in response_lower:
            disclaimer_count += 1
    
    # We want at least one safety disclaimer in the response
    if disclaimer_count == 0:
        result['is_valid'] = False
        result['warnings'].append(
            "Response is missing safety disclaimers recommending users to verify information "
            "with official sources or consult with professionals."
        )
    
    return result

def add_missing_sections(response, missing_sections):
    """
    Adds template text for missing sections to the response.
    
    Args:
        response (str): The original AI response
        missing_sections (list): List of missing section names
        
    Returns:
        str: The augmented response with added sections
    """
    # Templates for missing sections
    section_templates = {
        "documentation": """
## Required Documentation
- Pet passport or health certificate
- Import permit (where applicable)
- Rabies vaccination certificate
- Additional health certificates as required by the destination country

Please check with the embassy or consulate of your destination country for the most up-to-date documentation requirements.
        """,
        
        "vaccination": """
## Vaccination Requirements
- Rabies vaccination (must be administered at least 21 days before travel)
- Additional vaccinations may be required depending on the destination country
- Microchipping usually must be done before vaccinations for the vaccinations to be valid

Consult with a veterinarian to ensure your pet's vaccinations meet the requirements for travel.
        """,
        
        "quarantine": """
## Quarantine Information
Some countries require quarantine periods for incoming pets. The length and conditions vary by country.

Always check the latest quarantine regulations with official sources before planning your trip.
        """,
        
        "timeline": """
## Recommended Timeline
- 6+ months before travel: Research requirements and begin planning
- 3-4 months before: Schedule veterinary appointments and begin vaccination process if needed
- 30-60 days before: Obtain necessary health certificates and documentation
- 7-14 days before: Final veterinary check-up and document verification

This timeline may vary based on specific country requirements.
        """
    }
    
    # Add each missing section to the end of the response
    augmented_response = response
    for section in missing_sections:
        if section in section_templates:
            augmented_response += f"\n{section_templates[section]}"
    
    # Add a note that these sections were automatically added
    if missing_sections:
        augmented_response += "\n\n---\n*Note: Some sections of this response were automatically added to provide complete information.*"
    
    return augmented_response

def add_safety_disclaimers(response):
    """
    Adds safety disclaimers to the response.
    
    Args:
        response (str): The original AI response
        
    Returns:
        str: The response with added safety disclaimers
    """
    disclaimer = """

## Important Disclaimers
- Requirements for pet travel may change without notice. Always verify information with official sources.
- Consult with a veterinarian before traveling with your pet to ensure they are fit for travel.
- Check with the embassy or consulate of your destination country for the most current requirements.
- This information is provided as guidance only and should not be considered legal advice.
- Airlines may have additional requirements beyond country regulations.
    """
    
    augmented_response = response + disclaimer
    
    # Add a note that the disclaimer was automatically added
    augmented_response += "\n\n---\n*Note: Safety disclaimers were automatically added to this response.*"
    
    return augmented_response

def fix_contradictions(response, contradictions):
    """
    Attempts to fix contradictions in the response or adds warnings.
    
    Args:
        response (str): The original AI response
        contradictions (list): List of contradiction dictionaries
        
    Returns:
        str: The modified response with contradictions addressed
    """
    modified_response = response
    
    # Add a warning section about the contradictions
    if contradictions:
        warning_section = "\n\n## ⚠️ Important Corrections ⚠️\n"
        
        for contradiction in contradictions:
            if contradiction['type'] == 'vaccination':
                warning_section += f"- **{contradiction['country']}** requires {contradiction['expected'].lower()}. Please disregard any contrary information.\n"
            
            elif contradiction['type'] == 'quarantine':
                warning_section += f"- **{contradiction['country']}** has quarantine requirements. Please disregard any information suggesting no quarantine is needed.\n"
            
            elif contradiction['type'] == 'prohibition':
                warning_section += f"- **{contradiction['pet_type']}** pets are **PROHIBITED** in {contradiction['country']}. Please disregard any information suggesting they are allowed.\n"
        
        modified_response += warning_section
        modified_response += "\nPlease refer to official sources for the most accurate and up-to-date information."
    
    return modified_response

def extract_key_terms(text):
    """
    Extracts key terms from text for validation comparison.
    
    Args:
        text (str): The text to extract terms from
        
    Returns:
        list: List of extracted key terms
    """
    # This is a simplified implementation
    # In a real application, this might use NLP techniques
    
    # Common vaccination names
    vaccines = ["rabies", "distemper", "hepatitis", "parvovirus", 
                "parainfluenza", "bordetella", "leptospirosis"]
    
    # Check if any of these terms are in the text
    found_terms = []
    for vaccine in vaccines:
        if vaccine.lower() in text.lower():
            found_terms.append(vaccine)
    
    return found_terms

