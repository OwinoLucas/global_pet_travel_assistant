
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
    type_name = serializers.CharField(source='type.name', read_only=True)
    
    class Meta:
        model = Pet
        fields = [
            'id', 'name', 'type', 'type_name', 'breed', 'age', 
            'weight', 'microchip_id', 'image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'owner']
    
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
    pet_name = serializers.CharField(source='pet.name', read_only=True)
    pet_image = serializers.ImageField(source='pet.image', read_only=True)
    origin_country_name = serializers.CharField(source='origin_country.name', read_only=True)
    destination_country_name = serializers.CharField(source='destination_country.name', read_only=True)
    days_until_departure = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TravelPlan
        fields = [
            'id', 'name', 'pet', 'pet_name', 'pet_image', 
            'origin_country', 'origin_country_name', 
            'destination_country', 'destination_country_name',
            'departure_date', 'return_date', 'status', 'notes',
            'days_until_departure', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'owner', 'days_until_departure']
    
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

