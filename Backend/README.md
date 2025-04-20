# Global Pet Travel Assistant - Backend

## AI Implementation Guide

### Overview
The backend implements an AI-powered query processing system using OpenAI's GPT-4 model to provide accurate, context-aware responses about pet travel requirements.

### AI Components Structure

```
travel/ai/
├── service.py         # Main AI service handling OpenAI integration
├── prompts.py        # Structured prompt templates
├── context_builder.py # Database context assembly
└── validators.py     # Response validation
```

### Component Details

#### 1. AI Service (`service.py`)
- Handles OpenAI API integration with retry logic
- Manages conversation context and follow-up questions
- Implements rate limiting and token usage tracking
- Provides fallback responses for error cases

#### 2. Prompt Templates (`prompts.py`)
- Implements system prompts defining AI assistant behavior
- Formats country and pet data into structured context
- Generates conversation-aware prompts
- Ensures consistent response formatting

#### 3. Context Builder (`context_builder.py`)
- Fetches relevant data from database models:
  * Country requirements
  * Pet type information
  * Specific country-pet requirements
- Maintains conversation history
- Optimizes context for token efficiency

#### 4. Validators (`validators.py`)
- Validates AI responses against database records
- Ensures inclusion of required sections:
  * Documentation requirements
  * Vaccination information
  * Quarantine policies
  * Timeline recommendations
- Adds safety disclaimers when needed
- Corrects any inconsistencies with stored data

### API Endpoints

#### Query Processing
```http
POST /api/v1/queries/
Content-Type: application/json

{
  "query_text": "What are the requirements for traveling with a dog from USA to UK?",
  "source_country": 1,
  "destination_country": 2,
  "pet_type": 1
}
```

#### Follow-up Questions
```http
POST /api/v1/queries/follow-up/
Content-Type: application/json

{
  "query_text": "What specific vaccines are needed?",
  "conversation_id": "uuid",
  "parent_query_id": 1
}
```

#### Conversation History
```http
GET /api/v1/queries/conversation/?conversation_id=uuid
```

#### Response Feedback
```http
POST /api/v1/queries/{id}/feedback/
Content-Type: application/json

{
  "rating": 5,
  "feedback_text": "Very helpful and accurate information!"
}
```

### Environment Setup

Required environment variables:
```env
OPENAI_API_KEY=your_openai_api_key
AI_SERVICE_MODEL=gpt-4
AI_MAX_TOKENS=2000
REDIS_URL=redis://localhost:6379/1
```

### Rate Limiting

The API implements rate limiting through Redis:
- New queries: 30/minute per IP
- Follow-up questions: 30/minute per IP
- Conversation retrieval: 60/minute per IP
- Feedback submission: 30/minute per IP

### Error Handling

The system implements comprehensive error handling:
1. API Failures:
   - Automatic retries with exponential backoff
   - Fallback responses for service disruptions
2. Validation Errors:
   - Detailed error messages for invalid inputs
   - Automatic correction of response inconsistencies
3. Rate Limiting:
   - Clear error messages when limits exceeded
   - Retry-After headers included in responses

### Testing the AI Integration

1. Start the development server:
```bash
python manage.py runserver
```

2. Make a test query:
```bash
curl -X POST http://localhost:8000/api/v1/queries/ \
  -H "Content-Type: application/json" \
  -d '{
    "query_text": "What are the requirements for traveling with a dog from USA to UK?",
    "source_country": 1,
    "destination_country": 2,
    "pet_type": 1
  }'
```

### Maintenance and Updates

The AI system requires regular maintenance:
1. Monitor token usage through OpenAI dashboard
2. Update prompt templates as requirements change
3. Review and update validation rules
4. Monitor feedback for response quality
5. Update rate limits based on usage patterns

- **Database**: SQLite (development) / MySQL (production)
