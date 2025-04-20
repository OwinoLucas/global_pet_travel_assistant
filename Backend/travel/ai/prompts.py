"""
Prompt templates for the Global Pet Travel Assistant AI service.
This module contains functions to generate context-aware prompts
based on user queries and available travel/pet data.
"""

def get_system_prompt():
    """
    Returns the base system prompt that defines the assistant's role
    and sets expectations for its responses.
    """
    return """
    You are a specialized assistant for the Global Pet Travel Assistant application.
    Your role is to provide accurate, helpful information about international pet travel requirements.
    
    When responding to user queries:
    1. Always base your answers on the factual data provided in the context
    2. Structure your responses in a clear, organized manner with headings and bullet points
    3. Include specific requirements for documents, vaccinations, quarantine, and timelines
    4. If information is missing from the context, acknowledge the limitation rather than making up details
    5. When appropriate, mention important safety considerations for pet travel
    6. Format your response with Markdown for readability
    
    Remember that your advice may impact the health and safety of pets during international travel,
    so accuracy and clarity are essential.
    """

def format_country_data(country_data):
    """
    Formats country-specific pet travel data into a structured context string.
    
    Args:
        country_data (dict): Dictionary containing country pet travel requirements
        
    Returns:
        str: Formatted country data as context
    """
    if not country_data:
        return "No country-specific data available."
    
    context = "## COUNTRY DATA\n\n"
    
    for country in country_data:
        context += f"### {country['name']} ({country['code']})\n"
        context += f"Entry Requirements: {country['entry_requirements']}\n"
        context += f"Vaccination Requirements: {country['vaccination_requirements']}\n"
        context += f"Quarantine Requirements: {country['quarantine_requirements']}\n"
        context += f"Documentation Timeline: {country['documentation_timeline']}\n\n"
    
    return context

def format_pet_data(pet_data):
    """
    Formats pet type data into a structured context string.
    
    Args:
        pet_data (dict): Dictionary containing pet type information
        
    Returns:
        str: Formatted pet data as context
    """
    if not pet_data:
        return "No pet-specific data available."
    
    context = "## PET TYPE DATA\n\n"
    
    context += f"### {pet_data['name']} ({pet_data['species']})\n"
    context += f"General Requirements: {pet_data['general_requirements']}\n"
    context += f"Airline Policies: {pet_data['airline_policies']}\n"
    context += f"Carrier Requirements: {pet_data['carrier_requirements']}\n\n"
    
    return context

def format_country_pet_requirements(country_pet_reqs):
    """
    Formats specific requirements for a pet type in a specific country.
    
    Args:
        country_pet_reqs (dict): Dictionary containing country-pet specific requirements
        
    Returns:
        str: Formatted country-pet requirements as context
    """
    if not country_pet_reqs:
        return "No specific country-pet requirements available."
    
    context = "## SPECIFIC REQUIREMENTS\n\n"
    
    context += f"### {country_pet_reqs['pet_type']} requirements for {country_pet_reqs['country']}\n"
    context += f"Specific Requirements: {country_pet_reqs['specific_requirements']}\n"
    context += f"Additional Documents: {country_pet_reqs['additional_documents']}\n"
    
    if country_pet_reqs.get('prohibited', False):
        context += "⚠️ **THIS PET TYPE IS PROHIBITED IN THIS COUNTRY** ⚠️\n\n"
    
    return context

def format_conversation_history(history):
    """
    Formats previous conversation turns to provide context for follow-up questions.
    
    Args:
        history (list): List of previous query-response pairs
        
    Returns:
        str: Formatted conversation history as context
    """
    if not history:
        return ""
    
    context = "## CONVERSATION HISTORY\n\n"
    
    for i, exchange in enumerate(history):
        context += f"User Query {i+1}: {exchange['query_text']}\n"
        context += f"Response {i+1}: {exchange['response_text']}\n\n"
    
    return context

def get_prompt_template(query_text, source_country=None, destination_country=None, 
                       pet_type=None, country_data=None, pet_data=None, 
                       country_pet_reqs=None, conversation_history=None):
    """
    Combines all context data and the user query into a complete prompt template.
    
    Args:
        query_text (str): The user's query text
        source_country (str, optional): Source country name
        destination_country (str, optional): Destination country name
        pet_type (str, optional): Type of pet
        country_data (dict, optional): Country-specific data
        pet_data (dict, optional): Pet type data
        country_pet_reqs (dict, optional): Country-pet specific requirements
        conversation_history (list, optional): Previous conversation exchanges
        
    Returns:
        dict: Complete formatted prompt for the AI model
    """
    # System prompt defines the assistant's role
    system_prompt = get_system_prompt()
    
    # Build the context from available data
    context_parts = []
    
    # Add formatted data if available
    if country_data:
        context_parts.append(format_country_data(country_data))
    
    if pet_data:
        context_parts.append(format_pet_data(pet_data))
    
    if country_pet_reqs:
        context_parts.append(format_country_pet_requirements(country_pet_reqs))
    
    if conversation_history:
        context_parts.append(format_conversation_history(conversation_history))
    
    # Combine all context parts
    full_context = "\n".join(context_parts)
    
    # Create travel context description
    travel_context = ""
    if source_country and destination_country and pet_type:
        travel_context = f"The user is asking about traveling with a {pet_type} from {source_country} to {destination_country}."
    elif destination_country and pet_type:
        travel_context = f"The user is asking about requirements for a {pet_type} entering {destination_country}."
    
    # Construct the user message with query and context
    user_message = f"""
    {travel_context}
    
    USER QUERY: {query_text}
    
    AVAILABLE DATA:
    {full_context}
    
    Based on the above data, provide a clear, accurate response about the pet travel requirements.
    Format your response with Markdown for readability.
    """
    
    # Return the complete prompt structure
    return {
        "system": system_prompt.strip(),
        "user": user_message.strip()
    }

