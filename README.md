# Global Pet Travel Assistant

## Project Overview

The Global Pet Travel Assistant is a comprehensive web application designed to simplify the complex process of international pet travel. Our platform provides pet owners with up-to-date, country-specific information on entry requirements, vaccination protocols, quarantine regulations, and necessary documentation for traveling with pets internationally.

By offering a centralized resource for pet travel regulations across different countries, we aim to reduce the stress and uncertainty associated with bringing pets on international journeys, ensuring a smooth experience for both pets and their owners.

## Key Features

### Country-Specific Information
- Detailed entry requirements for each country
- Vaccination requirements and timelines
- Quarantine policies and procedures
- Documentation checklists and submission timelines

### Pet Type Management
- Customized information based on pet species and types
- Species-specific travel regulations
- Airline policies for different types of pets
- Carrier requirements and recommendations

### Cross-Reference System
- Country-to-pet type specific requirements
- Identification of prohibited animals by country
- Special documentation requirements for specific animals
- Alternative options for restricted animals

### User Query System
- Interactive Q&A functionality
- Storage of previous queries and responses
- Context-aware answers based on source/destination countries
- Session-based query history

### AI-Powered Assistant
- Natural language query processing for pet travel requirements
- Context-aware responses based on database information
- Conversation history tracking for follow-up questions
- User feedback system for response quality
- Rate-limited API endpoints for stable performance

## AI System Architecture

The Global Pet Travel Assistant now features an AI-powered query processing system that provides accurate, context-aware responses to user questions about pet travel requirements.

### AI Components

1. **AI Service Layer** (`Backend/travel/ai/`)
   - `service.py`: Main AI service handling OpenAI integration
   - `prompts.py`: Structured prompt templates
   - `context_builder.py`: Database context assembly
   - `validators.py`: Response validation and quality control

### How the AI Works

1. **Query Processing**
   - User submits a query about pet travel requirements
   - System extracts relevant context (countries, pet types)
   - Context builder gathers related data from database
   - Prompt templates format data for AI processing

2. **AI Integration**
   - Queries processed using OpenAI's GPT-4 model
   - Custom prompt engineering ensures accurate responses
   - Response validation against database records
   - Automatic safety disclaimers and warnings

3. **Conversation Management**
   - Unique conversation IDs track related queries
   - Context maintained for follow-up questions
   - Token usage monitoring for optimization
   - User feedback collection for quality improvement

4. **Data Validation**
   - Responses checked against database records
   - Automatic correction of any inconsistencies
   - Required sections enforcement (documentation, vaccination, quarantine)
   - Safety disclaimers added when necessary

## AI Implementation Details

The AI implementation in the Global Pet Travel Assistant is built around several key components that work together to provide accurate and helpful responses to user queries.

### Core AI Service Implementation

- **OpenAI Integration**: The system uses OpenAI's GPT-4 model through the AIService class in `service.py`, which handles:
  - API authentication using environment-configured keys
  - Request formatting and response parsing
  - Error handling with exponential backoff (retries on rate limits or API errors)
  - Response processing and token usage tracking

- **Rate Limiting**: The service implements a custom rate-limiting decorator that:
  - Limits requests to 50 calls per minute to OpenAI's API
  - Uses a sliding window approach for more efficient rate management
  - Implements exponential backoff for retry logic
  - Provides detailed logging of rate limit events

### Context Building System

The `context_builder.py` module creates comprehensive context for AI queries by:

- **Dynamic Data Collection**: Automatically fetches data from multiple database models:
  - Country-specific information (entry requirements, vaccination rules)
  - Pet type details (species information, general requirements)
  - Country-pet specific requirements (prohibited animals, special documentation)
  - Previous conversation turns for follow-up questions

- **Structured Context Assembly**: Organizes retrieved data into a unified context object that:
  - Prioritizes most relevant information for the specific query
  - Includes critical warning flags for prohibited pets
  - Provides conversation history for maintaining context

### Prompt Engineering

The `prompts.py` module implements sophisticated prompt templates that:

- **Role Definition**: Uses a system prompt that positions the AI as a specialized pet travel assistant

- **Context Formatting**: Transforms database data into structured sections:
  - Country data formatting with clear headings and sections
  - Pet type information with species-specific details
  - Country-pet requirement sections with highlighted warnings
  - Conversation history formatted chronologically

- **Dynamic User Prompts**: Builds context-aware user messages that:
  - Describe the specific travel scenario (source/destination/pet type)
  - Include all relevant formatted data sections
  - Provide clear instructions for response formatting

### Safety and Reliability Mechanisms

- **Response Validation**: The system validates AI outputs to ensure:
  - Consistency with database records
  - Inclusion of required information sections
  - Proper formatting and structure
  - No hallucinated or incorrect information

- **Fallback Responses**: In case of errors or failures:
  - The system provides generic but helpful guidance
  - Users receive safety-focused recommendations
  - Clear instructions for alternative information sources are provided

- **Warning Systems**: Special handling for critical information:
  - Explicit warnings for prohibited animals
  - Highlighted quarantine requirements
  - Emphasis on time-sensitive documentation needs

### Response Formatting

- **Structured Markdown**: All AI responses use consistent Markdown formatting:
  - Clear hierarchical headers for different information sections
  - Bulleted lists for requirements and steps
  - Highlighted warnings and important notes
  - Chronological organization of timeline-based information

- **Content Guidelines**: The AI follows specific content guidelines:
  - Explicitly acknowledges missing information rather than inventing details
  - Includes safety considerations where appropriate
  - Provides clear, actionable steps for pet owners
  - Maintains consistent tone and formatting across all responses

## Technical Stack

### Backend
- **Framework**: Django with Django REST Framework
- **API Documentation**: drf-yasg (Swagger)
- **Database**: SQLite (development) / MySQL (production)
- **Authentication**: Django's built-in authentication system
- **Environment Management**: python-decouple for environment variables
- **AI Integration**: OpenAI GPT-4
- **Caching**: Redis for rate limiting
- **Rate Limiting**: django-ratelimit

### Frontend
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Code Quality**: ESLint
- **API Communication**: Axios/Fetch
- **State Management**: React Context API / Redux

## Setup Instructions

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/OwinoLucas/global_pet_travel_assistant.git
   cd global_pet_travel_assistant
   ```

2. Set up a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r Backend/requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the Backend directory with the following variables:
   ```
   SECRET_KEY=your_secret_key
   DEBUG=True
   DATABASE_URL=your_database_url
   OPENAI_API_KEY=your_openai_api_key
   AI_SERVICE_MODEL=gpt-4
   AI_MAX_TOKENS=2000
   REDIS_URL=redis://localhost:6379/1
   ```

5. Run migrations:
   ```bash
   cd Backend
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with necessary environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
global_pet_travel_assistant/
├── Backend/
│   ├── backend/                  # Django project settings
│   ├── travel/                   # Main application
│   │   ├── ai/                   # AI integration components
│   │   │   ├── service.py        # AI service implementation
│   │   │   ├── prompts.py        # Prompt templates
│   │   │   ├── context_builder.py # Database context assembly
│   │   │   └── validators.py     # Response validation
│   │   ├── models.py             # Data models
│   │   ├── serializers.py        # API serializers
│   │   ├── views.py              # API views
│   │   └── urls.py               # API endpoints
│   ├── manage.py                 # Django management script
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js app directory
│   │   ├── components/           # Reusable React components
│   │   ├── styles/               # CSS and styling files
│   │   └── utils/                # Utility functions
│   ├── public/                   # Static files
│   ├── package.json              # Node.js dependencies
│   └── next.config.js            # Next.js configuration
└── README.md                     # Project documentation
```

## MVP (Minimum Viable Product)

The MVP for the Global Pet Travel Assistant includes:

1. A searchable database of country-specific pet travel requirements
2. Basic pet type information for common pets (dogs, cats)
3. A simple query interface for users to find information about specific travel routes
4. Administrator interface for managing country and pet data
5. AI-powered responses providing accurate, context-aware travel information
6. Mobile-responsive design for travelers on the go

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
