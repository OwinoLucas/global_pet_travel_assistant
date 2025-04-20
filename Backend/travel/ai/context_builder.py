"""
Context builder for the Global Pet Travel Assistant AI service.
This module fetches and formats data from our database models to
provide comprehensive context for the AI service.
"""

import logging
from ..models import Country, PetType, CountryPetRequirement, UserQuery

logger = logging.getLogger(__name__)

def get_country_data(source_country_id=None, destination_country_id=None):
    """
    Fetches country data from the database for the specified countries.
    
    Args:
        source_country_id (int, optional): ID of the source country
        destination_country_id (int, optional): ID of the destination country
        
    Returns:
        list: List of dictionaries containing country data
    """
    country_data = []
    
    try:
        # If both source and destination are the same, only fetch once
        if source_country_id and destination_country_id and source_country_id == destination_country_id:
            countries = Country.objects.filter(id=source_country_id)
        else:
            # Create a list of country IDs to fetch, filtering out None values
            country_ids = [id for id in [source_country_id, destination_country_id] if id]
            if country_ids:
                countries = Country.objects.filter(id__in=country_ids)
            else:
                countries = []
        
        # Format each country's data
        for country in countries:
            country_data.append({
                'name': country.name,
                'code': country.code,
                'entry_requirements': country.entry_requirements,
                'vaccination_requirements': country.vaccination_requirements,
                'quarantine_requirements': country.quarantine_requirements,
                'documentation_timeline': country.documentation_timeline
            })
            
    except Exception as e:
        logger.error(f"Error fetching country data: {str(e)}")
    
    return country_data

def get_pet_data(pet_type_id=None):
    """
    Fetches pet type data from the database.
    
    Args:
        pet_type_id (int, optional): ID of the pet type
        
    Returns:
        dict: Dictionary containing pet type data or None if not found
    """
    if not pet_type_id:
        return None
    
    try:
        pet_type = PetType.objects.get(id=pet_type_id)
        return {
            'name': pet_type.name,
            'species': pet_type.species,
            'general_requirements': pet_type.general_requirements,
            'airline_policies': pet_type.airline_policies,
            'carrier_requirements': pet_type.carrier_requirements
        }
    except PetType.DoesNotExist:
        logger.warning(f"Pet type with ID {pet_type_id} not found")
        return None
    except Exception as e:
        logger.error(f"Error fetching pet type data: {str(e)}")
        return None

def get_country_pet_requirements(country_id=None, pet_type_id=None):
    """
    Fetches specific requirements for a pet type in a specific country.
    
    Args:
        country_id (int, optional): ID of the country
        pet_type_id (int, optional): ID of the pet type
        
    Returns:
        dict: Dictionary containing country-pet specific requirements or None if not found
    """
    if not country_id or not pet_type_id:
        return None
    
    try:
        requirement = CountryPetRequirement.objects.get(country_id=country_id, pet_type_id=pet_type_id)
        
        # Get the country and pet type names for reference
        country_name = requirement.country.name
        pet_type_name = requirement.pet_type.name
        
        return {
            'country': country_name,
            'pet_type': pet_type_name,
            'specific_requirements': requirement.specific_requirements,
            'additional_documents': requirement.additional_documents,
            'prohibited': requirement.prohibited
        }
    except CountryPetRequirement.DoesNotExist:
        logger.warning(f"No specific requirements found for country ID {country_id} and pet type ID {pet_type_id}")
        return None
    except Exception as e:
        logger.error(f"Error fetching country-pet requirements: {str(e)}")
        return None

def get_conversation_history(query):
    """
    Fetches conversation history for the current session/conversation.
    
    Args:
        query (UserQuery): The current user query object
        
    Returns:
        list: List of previous query-response pairs in the same conversation
    """
    if not query or not hasattr(query, 'conversation_id'):
        return []
    
    try:
        # Get previous queries in the same conversation, excluding the current one
        # Order by created_at to get them in chronological order
        previous_queries = UserQuery.objects.filter(
            conversation_id=query.conversation_id
        ).exclude(
            id=query.id
        ).order_by('created_at')
        
        history = []
        for prev_query in previous_queries:
            history.append({
                'query_text': prev_query.query_text,
                'response_text': prev_query.response_text
            })
        
        return history
    except Exception as e:
        logger.error(f"Error fetching conversation history: {str(e)}")
        return []

def build_context(query, include_history=True):
    """
    Builds a comprehensive context for the AI service based on the user query.
    
    Args:
        query (UserQuery): The user query object
        include_history (bool): Whether to include conversation history
        
    Returns:
        dict: Dictionary containing all context data for the AI service
    """
    context = {
        'query_text': query.query_text,
        'source_country': query.source_country.name if query.source_country else None,
        'destination_country': query.destination_country.name if query.destination_country else None,
        'pet_type': query.pet_type.name if query.pet_type else None,
    }
    
    # Get country data
    source_country_id = query.source_country.id if query.source_country else None
    destination_country_id = query.destination_country.id if query.destination_country else None
    context['country_data'] = get_country_data(source_country_id, destination_country_id)
    
    # Get pet type data
    pet_type_id = query.pet_type.id if query.pet_type else None
    context['pet_data'] = get_pet_data(pet_type_id)
    
    # Get country-pet specific requirements if both country and pet type are specified
    if destination_country_id and pet_type_id:
        context['country_pet_reqs'] = get_country_pet_requirements(destination_country_id, pet_type_id)
    else:
        context['country_pet_reqs'] = None
    
    # Get conversation history if needed
    if include_history:
        context['conversation_history'] = get_conversation_history(query)
    else:
        context['conversation_history'] = []
    
    return context

