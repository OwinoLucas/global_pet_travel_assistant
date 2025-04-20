from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.db import models
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django_ratelimit.decorators import ratelimit
import uuid
import logging

from .models import Country, PetType, CountryPetRequirement, UserQuery, Pet, TravelPlan, TravelRequirement
from .serializers import (
    CountrySerializer, PetTypeSerializer, 
    CountryPetRequirementSerializer, UserQuerySerializer,
    UserQueryResponseSerializer, UserQueryFeedbackSerializer,
    PetSerializer, TravelPlanSerializer, TravelPlanDetailSerializer,
    TravelRequirementSerializer, UserQueryCreateSerializer
)
from .ai.service import AIService

logger = logging.getLogger(__name__)


class CountryViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing Country instances"""
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['name', 'code']
    search_fields = ['name', 'code']

    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET'))
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search countries by name or code"""
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {"error": "Search query parameter 'q' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        countries = Country.objects.filter(
            models.Q(name__icontains=query) |
            models.Q(code__icontains=query)
        )
        serializer = self.get_serializer(countries, many=True)
        return Response(serializer.data)


class PetTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing PetType instances"""
    queryset = PetType.objects.all()
    serializer_class = PetTypeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['name', 'species']
    search_fields = ['name', 'species']

    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET'))
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search pet types by name or species"""
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {"error": "Search query parameter 'q' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pet_types = PetType.objects.filter(
            models.Q(name__icontains=query) |
            models.Q(species__icontains=query)
        )
        serializer = self.get_serializer(pet_types, many=True)
        return Response(serializer.data)


class CountryPetRequirementViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing CountryPetRequirement instances"""
    queryset = CountryPetRequirement.objects.all()
    serializer_class = CountryPetRequirementSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['country', 'pet_type', 'prohibited']

    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET'))
    @action(detail=False, methods=['get'])
    def get_requirements(self, request):
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
    """ViewSet for managing user queries and AI responses."""
    queryset = UserQuery.objects.all().order_by('-created_at')
    serializer_class = UserQuerySerializer
    permission_classes = [permissions.IsAuthenticated]


class PetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pets."""
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'breed']
    filterset_fields = ['type']
    
    def get_queryset(self):
        """Filter queryset to only return the authenticated user's pets."""
        return Pet.objects.filter(owner=self.request.user).order_by('name')


class TravelPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing travel plans."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'pet', 'origin_country', 'destination_country']
    search_fields = ['name', 'notes']
    ordering_fields = ['departure_date', 'return_date', 'created_at', 'name']
    ordering = ['-departure_date']
    
    def get_serializer_class(self):
        """Return different serializers based on the action."""
        if self.action == 'retrieve' or self.action == 'requirements':
            return TravelPlanDetailSerializer
        elif self.action == 'create' and hasattr(self, 'ai_service'):
            return UserQueryCreateSerializer
        elif hasattr(self, 'ai_service'):
            return UserQueryResponseSerializer
        return TravelPlanSerializer
    
    def get_queryset(self):
        """Filter queryset to only return the authenticated user's travel plans."""
        queryset = TravelPlan.objects.filter(owner=self.request.user)
        
        # Handle date range filtering
        departure_from = self.request.query_params.get('departure_from')
        departure_to = self.request.query_params.get('departure_to')
        
        if departure_from:
            queryset = queryset.filter(departure_date__gte=departure_from)
        if departure_to:
            queryset = queryset.filter(departure_date__lte=departure_to)
            
        # Handle upcoming/past filtering
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == 'true':
            queryset = queryset.filter(departure_date__gte=timezone.now().date())
        elif upcoming == 'false':
            queryset = queryset.filter(departure_date__lt=timezone.now().date())
            
        return queryset.select_related('pet', 'origin_country', 'destination_country')
    
    def perform_create(self, serializer):
        """Set the owner to the current user when creating a travel plan."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        """Get all requirements for a travel plan with their completion status."""
        travel_plan = self.get_object()
        serializer = self.get_serializer(travel_plan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_requirement(self, request, pk=None):
        """Update the status of a requirement for this travel plan."""
        travel_plan = self.get_object()
        requirement_id = request.data.get('requirement_id')
        
        if not requirement_id:
            return Response(
                {'detail': 'requirement_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            requirement = CountryPetRequirement.objects.get(id=requirement_id)
        except CountryPetRequirement.DoesNotExist:
            return Response(
                {'detail': 'Requirement not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Find or create the travel requirement entry
        travel_req, created = TravelRequirement.objects.get_or_create(
            travel_plan=travel_plan,
            requirement=requirement,
            defaults={'status': 'not_started'}
        )
        
        # Update the travel requirement with the provided data
        serializer = TravelRequirementSerializer(
            travel_req, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def upload_proof(self, request, pk=None):
        """Upload proof document for a requirement."""
        travel_plan = self.get_object()
        requirement_id = request.data.get('requirement_id')
        proof_document = request.data.get('proof_document')
        
        if not requirement_id or not proof_document:
            return Response(
                {'detail': 'requirement_id and proof_document are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            requirement = CountryPetRequirement.objects.get(id=requirement_id)
        except CountryPetRequirement.DoesNotExist:
            return Response(
                {'detail': 'Requirement not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Find or create the travel requirement entry
        travel_req, created = TravelRequirement.objects.get_or_create(
            travel_plan=travel_plan,
            requirement=requirement,
            defaults={'status': 'not_started'}
        )
        
        # Update with the uploaded document
        travel_req.proof_document = proof_document
        travel_req.save()
        
        serializer = TravelRequirementSerializer(
            travel_req,
            context={'request': request}
        )
        return Response(serializer.data)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize the AI service
        self.ai_service = AIService()
    
    
    @method_decorator(ratelimit(key='ip', rate='30/m', method='POST'))
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Initialize conversation ID if this is a new conversation
            conversation_id = request.data.get('conversation_id')
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            # Save the user query with conversation ID
            query = serializer.save(
                conversation_id=conversation_id,
                ip_address=self._get_client_ip(request),
                session_id=request.session.session_key or ''
            )
            
            # Process the query using our AI service
            result = self.ai_service.process_query(query)
            
            # Update the query with the AI response and token usage
            query.response_text = result['response_text']
            query.token_usage = result['token_usage']
            query.save()
            
            # Return the updated query with the response
            response_serializer = UserQueryResponseSerializer(query)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return Response(
                {"error": "Failed to process your query. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def follow_up(self, request):
        """Handle follow-up questions for an existing conversation"""
        serializer = UserQueryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        conversation_id = request.data.get('conversation_id')
        if not conversation_id:
            return Response(
                {"error": "conversation_id is required for follow-up questions"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find the parent query to link this as a follow-up
            parent_query_id = request.data.get('parent_query_id')
            parent_query = None
            if parent_query_id:
                try:
                    parent_query = UserQuery.objects.get(id=parent_query_id)
                except UserQuery.DoesNotExist:
                    pass
            
            # Create the follow-up query
            query = serializer.save(
                conversation_id=conversation_id,
                parent_query=parent_query,
                ip_address=self._get_client_ip(request),
                session_id=request.session.session_key or ''
            )
            
            # Process the follow-up query with conversation context
            result = self.ai_service.handle_follow_up(query, conversation_id)
            
            # Update the query with the response
            query.response_text = result['response_text']
            query.token_usage = result['token_usage']
            query.save()
            
            # Return the response
            response_serializer = UserQueryResponseSerializer(query)
            return Response(response_serializer.data)
            
        except Exception as e:
            logger.error(f"Error processing follow-up: {str(e)}")
            return Response(
                {"error": "Failed to process your follow-up question. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def conversation(self, request):
        """Get all queries in a conversation"""
        conversation_id = request.query_params.get('conversation_id')
        if not conversation_id:
            return Response(
                {"error": "conversation_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queries = UserQuery.objects.filter(conversation_id=conversation_id).order_by('created_at')
        serializer = UserQueryResponseSerializer(queries, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Submit feedback for a query response"""
        try:
            query = self.get_object()
            feedback_rating = request.data.get('rating')
            feedback_text = request.data.get('feedback_text', '')
            
            if feedback_rating is None:
                return Response(
                    {"error": "rating is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update the query with feedback
            query.feedback_rating = int(feedback_rating)
            query.feedback_text = feedback_text
            query.save()
            
            return Response({"status": "feedback received"})
            
        except Exception as e:
            logger.error(f"Error saving feedback: {str(e)}")
            return Response(
                {"error": "Failed to save feedback. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_client_ip(self, request):
        """Get the client IP address from the request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # If behind a proxy, get the real IP
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
