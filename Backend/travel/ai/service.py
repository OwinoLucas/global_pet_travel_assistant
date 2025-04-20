"""
Main service for the Global Pet Travel Assistant AI functionality.
This module coordinates the AI components, handles API integration,
and provides the core logic for processing user queries.
"""

import logging
import time
import json
from functools import wraps
from django.conf import settings
from openai import OpenAI, APIError, RateLimitError
from .prompts import get_prompt_template
from .context_builder import build_context
from .validators import validate_response

logger = logging.getLogger(__name__)

# Decorator for rate limiting
def rate_limit(max_calls, time_frame):
    """
    Simple rate limiting decorator to prevent excessive API calls.
    
    Args:
        max_calls (int): Maximum number of calls allowed in the time frame
        time_frame (int): Time frame in seconds
        
    Returns:
        function: Decorated function with rate limiting
    """
    calls = []
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_time = time.time()
            # Remove calls that are outside the time frame
            while calls and current_time - calls[0] > time_frame:
                calls.pop(0)
            
            # Check if we've exceeded the rate limit
            if len(calls) >= max_calls:
                wait_time = calls[0] + time_frame - current_time
                logger.warning(f"Rate limit exceeded. Waiting {wait_time:.2f} seconds.")
                time.sleep(wait_time)
                # Refresh the current time after waiting
                current_time = time.time()
            
            # Add this call to the list
            calls.append(current_time)
            
            # Call the original function
            return func(*args, **kwargs)
        return wrapper
    return decorator

class AIService:
    """
    Service class for handling AI functionality in the Global Pet Travel Assistant.
    Coordinates context building, prompt generation, OpenAI API calls, and response validation.
    """
    
    def __init__(self):
        """Initialize the AI service with configuration from settings."""
        self.api_key = settings.OPENAI_API_KEY
        self.model = getattr(settings, 'AI_SERVICE', {}).get('MODEL', 'gpt-4')
        self.max_tokens = getattr(settings, 'AI_SERVICE', {}).get('MAX_TOKENS', 2000)
        self.temperature = getattr(settings, 'AI_SERVICE', {}).get('TEMPERATURE', 0.7)
        
        # Initialize the OpenAI client
        self.client = OpenAI(api_key=self.api_key)
        
        # Maximum retry attempts for API calls
        self.max_retries = 3
        
        logger.info(f"AIService initialized with model: {self.model}")
    
    def process_query(self, query_obj):
        """
        Process a user query and generate an AI response.
        
        Args:
            query_obj: UserQuery object containing the query information
            
        Returns:
            dict: Result containing the response text and metadata
        """
        try:
            # Build context from the query and database information
            context = build_context(query_obj)
            
            # Generate the prompt using the context
            prompt_data = get_prompt_template(
                query_obj.query_text,
                source_country=context.get('source_country'),
                destination_country=context.get('destination_country'),
                pet_type=context.get('pet_type'),
                country_data=context.get('country_data'),
                pet_data=context.get('pet_data'),
                country_pet_reqs=context.get('country_pet_reqs'),
                conversation_history=context.get('conversation_history')
            )
            
            # Get response from the AI model
            response_text, token_usage = self._get_ai_response(prompt_data)
            
            # Validate the response
            validation_result = validate_response(response_text, context)
            
            # Store token usage information
            query_obj.token_usage = token_usage
            
            result = {
                'response_text': validation_result['response'],
                'token_usage': token_usage,
                'is_valid': validation_result['is_valid'],
                'warnings': validation_result['warnings'],
                'errors': validation_result['errors']
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            # Return a fallback response
            return {
                'response_text': self._get_fallback_response(),
                'token_usage': {},
                'is_valid': False,
                'warnings': [],
                'errors': [str(e)]
            }
    
    @rate_limit(max_calls=50, time_frame=60)  # Limit to 50 calls per minute
    def _get_ai_response(self, prompt_data):
        """
        Get a response from the OpenAI API with retry logic.
        
        Args:
            prompt_data (dict): Prompt data containing system and user messages
            
        Returns:
            tuple: (response_text, token_usage)
        """
        retry_count = 0
        backoff_time = 1  # Start with 1 second backoff
        
        while retry_count < self.max_retries:
            try:
                messages = [
                    {"role": "system", "content": prompt_data['system']},
                    {"role": "user", "content": prompt_data['user']}
                ]
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=self.max_tokens,
                    temperature=self.temperature
                )
                
                # Extract the response text
                response_text = response.choices[0].message.content
                
                # Extract token usage
                token_usage = {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                }
                
                logger.info(f"AI response generated. Token usage: {token_usage['total_tokens']}")
                
                return response_text, token_usage
                
            except RateLimitError as e:
                retry_count += 1
                logger.warning(f"Rate limit error from OpenAI API: {str(e)}. Retry {retry_count}/{self.max_retries}")
                if retry_count < self.max_retries:
                    time.sleep(backoff_time)
                    backoff_time *= 2  # Exponential backoff
                else:
                    raise
                    
            except APIError as e:
                retry_count += 1
                logger.warning(f"API error from OpenAI: {str(e)}. Retry {retry_count}/{self.max_retries}")
                if retry_count < self.max_retries:
                    time.sleep(backoff_time)
                    backoff_time *= 2
                else:
                    raise
                    
            except Exception as e:
                logger.error(f"Unexpected error calling OpenAI API: {str(e)}")
                raise
        
        # If we've exhausted retries
        raise Exception("Failed to get response from OpenAI API after multiple retries")
    
    def handle_follow_up(self, current_query, conversation_id):
        """
        Handle a follow-up question in an existing conversation.
        
        Args:
            current_query: The current UserQuery object
            conversation_id: The ID of the conversation
            
        Returns:
            dict: Result containing the response text and metadata
        """
        # Ensure the query is part of the conversation
        current_query.conversation_id = conversation_id
        
        # Process the query with conversation history included
        return self.process_query(current_query)
    
    def _get_fallback_response(self):
        """
        Generate a fallback response when the AI service encounters an error.
        
        Returns:
            str: A generic fallback response
        """
        return """
        # Pet Travel Information
        
        I apologize, but I'm currently unable to provide specific information about your pet travel query. 
        
        ## General Pet Travel Guidelines
        
        - Most countries require pets to have a rabies vaccination
        - Health certificates issued by a veterinarian are commonly required
        - Microchipping is a standard requirement for international pet travel
        - Some countries enforce quarantine periods
        
        ## What You Can Do Now
        
        - Contact the embassy or consulate of your destination country
        - Visit the official government website of your destination country
        - Consult with a veterinarian who specializes in international pet travel
        - Check with your airline for their specific pet travel requirements
        
        Please try your query again later or contact customer support for assistance.
        """

