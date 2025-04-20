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

## Technical Stack

### Backend
- **Framework**: Django with Django REST Framework
- **API Documentation**: drf-yasg (Swagger)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Django's built-in authentication system
- **Environment Management**: python-decouple for environment variables

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
5. Mobile-responsive design for travelers on the go

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
