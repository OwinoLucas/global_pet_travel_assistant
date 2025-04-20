
from rest_framework import serializers
from django.utils import timezone
from .models import Country, PetType, CountryPetRequirement, UserQuery, Pet, TravelPlan, TravelRequirement
import uuid
from .models import Country, PetType, CountryPetRequirement, UserQuery
import json


class CountrySerializer(serializers.ModelSerializer):
    """Serializer for Country model"""
    class Meta:
        model = Country
        fields = [
            'id', 'name', 'code', 'entry_requirements', 
            'vaccination_requirements', 'quarantine_requirements', 
            'documentation_timeline', 'created_at', 'updated_at'
        ]


class PetTypeSerializer(serializers.ModelSerializer):
    """Serializer for PetType model"""
    class Meta:
        model = PetType
        fields = [
            'id', 'name', 'species', 'general_requirements', 
            'airline_policies', 'carrier_requirements', 
            'created_at', 'updated_at'
        ]


class CountryPetRequirementSerializer(serializers.ModelSerializer):
    """Serializer for CountryPetRequirement model"""
    country_name = serializers.StringRelatedField(source='country', read_only=True)
    pet_type_name = serializers.StringRelatedField(source='pet_type', read_only=True)
    
    class Meta:
        model = CountryPetRequirement
        fields = [
            'id', 'country', 'country_name', 'pet_type', 'pet_type_name',
            'specific_requirements', 'additional_documents', 'prohibited',
            'created_at', 'updated_at'
        ]


class UserQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuery
        fields = '__all__'
        read_only_fields = ('response_text', 'created_at', 'token_usage')


class UserQueryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new UserQuery instances"""
    parent_query_id = serializers.PrimaryKeyRelatedField(
        queryset=UserQuery.objects.all(),
        source='parent_query',
        required=False,
        allow_null=True,
    )
    
    class Meta:
        model = UserQuery
        fields = [
            'query_text', 'source_country', 'destination_country', 
            'pet_type', 'conversation_id', 'parent_query_id'
        ]
        
    def validate(self, data):
        # For follow-up questions, ensure conversation_id is provided
        if data.get('parent_query') and not data.get('conversation_id'):
            raise serializers.ValidationError({
                "conversation_id": "Conversation ID is required for follow-up questions"
            })
        return data


class PetSerializer(serializers.ModelSerializer):
    type = PetTypeSerializer(read_only=True)
    type_id = serializers.PrimaryKeyRelatedField(
        source='type', write_only=True, queryset=PetType.objects.all()
    )
    owner_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Pet
        fields = [
            'id', 'name', 'type', 'type_id', 'owner', 'owner_info', 'breed', 
            'age', 'weight', 'microchip_id', 'image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'owner']
    
    def get_owner_info(self, obj):
        """Return basic owner information."""
        if obj.owner:
            return {
                'id': obj.owner.id,
                'username': obj.owner.username,
                'email': obj.owner.email,
                'first_name': obj.owner.first_name,
                'last_name': obj.owner.last_name,
            }
        return None
        
    def validate_age(self, value):
        """Validate that age is positive if provided."""
        if value is not None and value < 0:
            raise serializers.ValidationError("Age must be a positive number.")
        return value
        
    def validate_weight(self, value):
        """Validate that weight is positive if provided."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Weight must be greater than zero.")
        return value
    
    def create(self, validated_data):
        # Assign the current user as the owner
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class TravelRequirementSerializer(serializers.ModelSerializer):
    requirement_description = serializers.CharField(source='requirement.specific_requirements', read_only=True)
    
    class Meta:
        model = TravelRequirement
        fields = [
            'id', 'travel_plan', 'requirement', 'requirement_description',
            'status', 'completion_date', 'notes', 'proof_document',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        # Only allow completion_date to be set if status is 'completed'
        if data.get('status') != 'completed' and data.get('completion_date'):
            raise serializers.ValidationError({
                'completion_date': 'Completion date can only be set when status is completed.'
            })
        return data


class TravelPlanSerializer(serializers.ModelSerializer):
    # Read-only nested serializers
    pet_detail = PetSerializer(source='pet', read_only=True)
    origin_country_detail = CountrySerializer(source='origin_country', read_only=True)
    destination_country_detail = CountrySerializer(source='destination_country', read_only=True)
    
    # Write-only fields for related objects
    pet_id = serializers.PrimaryKeyRelatedField(
        source='pet', write_only=True, queryset=Pet.objects.all()
    )
    origin_country_id = serializers.PrimaryKeyRelatedField(
        source='origin_country', write_only=True, queryset=Country.objects.all()
    )
    destination_country_id = serializers.PrimaryKeyRelatedField(
        source='destination_country', write_only=True, queryset=Country.objects.all()
    )
    
    # Computed fields
    days_until_departure = serializers.SerializerMethodField()
    requirements_status = serializers.SerializerMethodField()
    
    class Meta:
        model = TravelPlan
        fields = [
            'id', 'name', 
            # Related objects with both read and write fields
            'pet', 'pet_id', 'pet_detail',
            'origin_country', 'origin_country_id', 'origin_country_detail',
            'destination_country', 'destination_country_id', 'destination_country_detail',
            # Basic fields
            'departure_date', 'return_date', 'status', 'notes',
            # Computed fields
            'days_until_departure', 'requirements_status',
            # Metadata
            'created_at', 'updated_at', 'owner'
        ]
        read_only_fields = ['created_at', 'updated_at', 'owner']
    
    def get_days_until_departure(self, obj):
        """Calculate and return days until departure."""
        return obj.days_until_departure()
    
    def get_requirements_status(self, obj):
        """Get summary of requirements completion status."""
        # Get all requirements for this travel plan
        travel_reqs = TravelRequirement.objects.filter(travel_plan=obj)
        
        # Count requirements by status
        total = travel_reqs.count()
        completed = travel_reqs.filter(status='completed').count()
        in_progress = travel_reqs.filter(status='in_progress').count()
        not_started = travel_reqs.filter(status='not_started').count()
        not_applicable = travel_reqs.filter(status='not_applicable').count()
        
        # If no requirements exist yet, check if we should create them
        if total == 0:
            # Get requirements for destination and pet type
            country_reqs = CountryPetRequirement.objects.filter(
                country=obj.destination_country,
                pet_type=obj.pet.type
            )
            total = country_reqs.count()
            
        # Calculate completion percentage
        completion_percentage = 0
        if total > 0:
            completion_percentage = (completed / total) * 100
            
        return {
            'total': total,
            'completed': completed,
            'in_progress': in_progress,
            'not_started': not_started,
            'not_applicable': not_applicable,
            'completion_percentage': round(completion_percentage, 1)
        }
    
    def validate(self, data):
        # Validate departure_date is in the future
        if data.get('departure_date') and data.get('departure_date') < timezone.now().date():
            raise serializers.ValidationError({
                'departure_date': 'Departure date cannot be in the past.'
            })
        
        # Validate return_date is after departure_date if provided
        if data.get('return_date') and data.get('departure_date') and data.get('return_date') < data.get('departure_date'):
            raise serializers.ValidationError({
                'return_date': 'Return date must be after departure date.'
            })
            
        # Validate origin and destination are different
        if data.get('origin_country') and data.get('destination_country') and data.get('origin_country') == data.get('destination_country'):
            raise serializers.ValidationError({
                'destination_country': 'Origin and destination countries must be different.'
            })
            
        return data
    
    def create(self, validated_data):
        # Assign the current user as the owner
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class TravelPlanDetailSerializer(TravelPlanSerializer):
    """Extended serializer that includes requirements."""
    requirements = serializers.SerializerMethodField()
    pet = PetSerializer(read_only=True)
    origin_country = CountrySerializer(read_only=True)
    destination_country = CountrySerializer(read_only=True)
    
    class Meta(TravelPlanSerializer.Meta):
        fields = TravelPlanSerializer.Meta.fields + ['requirements']
    
    def get_requirements(self, obj):
        """Get requirements with their completion status for this travel plan."""
        # First, get all requirements for the destination country and pet type
        country_requirements = CountryPetRequirement.objects.filter(
            country=obj.destination_country,
            pet_type=obj.pet.type
        )
        
        result = []
        for req in country_requirements:
            # Check if this requirement has a tracking entry for this travel plan
            travel_req = TravelRequirement.objects.filter(
                travel_plan=obj,
                requirement=req
            ).first()
            
            if travel_req:
                # If exists, use its data
                result.append({
                    'id': travel_req.id,
                    'requirement_id': req.id,
                    'description': req.specific_requirements,
                    'status': travel_req.status,
                    'completion_date': travel_req.completion_date,
                    'notes': travel_req.notes,
                    'has_proof': bool(travel_req.proof_document)
                })
            else:
                # If not, provide default data
                result.append({
                    'requirement_id': req.id,
                    'description': req.specific_requirements,
                    'status': 'not_started',
                    'completion_date': None,
                    'notes': '',
                    'has_proof': False
                })
                
        return result


class UserQueryResponseSerializer(serializers.ModelSerializer):
    """Serializer for retrieving UserQuery instances with responses"""
    source_country_name = serializers.StringRelatedField(source='source_country', read_only=True)
    destination_country_name = serializers.StringRelatedField(source='destination_country', read_only=True)
    pet_type_name = serializers.StringRelatedField(source='pet_type', read_only=True)
    parent_query = serializers.PrimaryKeyRelatedField(read_only=True)
    token_usage = serializers.JSONField(read_only=True, default=dict)
    
    class Meta:
        model = UserQuery
        fields = [
            'id', 'query_text', 'response_text', 
            'source_country', 'source_country_name',
            'destination_country', 'destination_country_name',
            'pet_type', 'pet_type_name',
            'conversation_id', 'parent_query',
            'token_usage', 'feedback_rating', 'feedback_text',
            'ip_address', 'session_id', 'created_at'
        ]
        
    def to_representation(self, instance):
        # Convert token_usage to a dictionary if it's stored as a string
        rep = super().to_representation(instance)
        if isinstance(rep.get('token_usage'), str):
            try:
                rep['token_usage'] = json.loads(rep['token_usage'])
            except (json.JSONDecodeError, TypeError):
                rep['token_usage'] = {}
        return rep


class UserQueryFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for submitting feedback on UserQuery responses"""
    class Meta:
        model = UserQuery
        fields = ['id', 'feedback_rating', 'feedback_text']
        read_only_fields = ['id']
        
    def validate_feedback_rating(self, value):
        if value is not None and not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

