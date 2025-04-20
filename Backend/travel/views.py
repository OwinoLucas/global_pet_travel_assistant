from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Country, PetType, CountryPetRequirement, UserQuery
from .serializers import (
    CountrySerializer, 
    PetTypeSerializer, 
    CountryPetRequirementSerializer,
    UserQueryCreateSerializer,
    UserQueryResponseSerializer
)


class CountryViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing Country instances"""
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['name', 'code']
    search_fields = ['name', 'code', 'entry_requirements']


class PetTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing PetType instances"""
    queryset = PetType.objects.all()
    serializer_class = PetTypeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['name', 'species']
    search_fields = ['name', 'species', 'general_requirements']


class CountryPetRequirementViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing CountryPetRequirement instances"""
    queryset = CountryPetRequirement.objects.all()
    serializer_class = CountryPetRequirementSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['country', 'pet_type', 'prohibited']

    @action(detail=False, methods=['get'])
    def by_country_and_pet(self, request):
        """Get requirements by country and pet type"""
        country_id = request.query_params.get('country_id')
        pet_type_id = request.query_params.get('pet_type_id')
        
        if not country_id or not pet_type_id:
            return Response(
                {"error": "Both country_id and pet_type_id are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            requirement = CountryPetRequirement.objects.get(
                country_id=country_id, 
                pet_type_id=pet_type_id
            )
            serializer = self.get_serializer(requirement)
            return Response(serializer.data)
        except CountryPetRequirement.DoesNotExist:
            return Response(
                {"error": "No requirements found for this country and pet type"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class UserQueryViewSet(viewsets.ModelViewSet):
    """ViewSet for handling user queries and responses"""
    queryset = UserQuery.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['source_country', 'destination_country', 'pet_type']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserQueryCreateSerializer
        return UserQueryResponseSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Save the user query
        query = serializer.save()
        
        # Process the query to generate a response
        # This is where you would implement the actual query processing logic
        response_text = self._generate_pet_travel_response(query)
        
        # Update the query with the response
        query.response_text = response_text
        query.save()
        
        # Return the updated query with the response
        response_serializer = UserQueryResponseSerializer(query)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def _generate_pet_travel_response(self, query):
        """
        Generate a response for the user's pet travel query.
        In a real application, this would contain more sophisticated logic,
        possibly calling an external API or AI model.
        """
        # Simple mock implementation
        source = query.source_country.name if query.source_country else "unspecified source country"
        destination = query.destination_country.name if query.destination_country else "unspecified destination"
        pet_type = query.pet_type.name if query.pet_type else "pet"
        
        # For demo purposes, we'll return a structured response
        response = f"""
        # Travel Requirements for {pet_type} from {source} to {destination}

        ## Required Documents
        - Pet passport or health certificate
        - Rabies vaccination certificate (must be administered at least 21 days before travel)
        - Import permit from the destination country
        - Microchip documentation (ISO compliant)

        ## Vaccination Requirements
        - Rabies (required)
        - DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus) - recommended
        - Bordetella - recommended for kennel stays

        ## Quarantine Information
        Some countries require quarantine periods. Please check with the destination country's embassy for the most current requirements.

        ## Timeline
        - 6 months before travel: Begin researching requirements
        - 3 months before: Schedule veterinary appointment for health certificate
        - 1 month before: Confirm airline pet policies and reserve space
        - 1-2 weeks before: Final health check and documentation verification

        ## Additional Notes
        - Contact your airline for specific carrier requirements
        - Consider pet insurance for international travel
        - Prepare a travel kit with familiar items to reduce pet stress
        """
        return response
