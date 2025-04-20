from rest_framework import serializers
from .models import Country, PetType, CountryPetRequirement, UserQuery


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


class UserQueryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating UserQuery instances"""
    class Meta:
        model = UserQuery
        fields = [
            'id', 'query_text', 'source_country', 'destination_country', 
            'pet_type', 'ip_address', 'session_id', 'created_at'
        ]


class UserQueryResponseSerializer(serializers.ModelSerializer):
    """Serializer for retrieving UserQuery instances with responses"""
    source_country_name = serializers.StringRelatedField(source='source_country', read_only=True)
    destination_country_name = serializers.StringRelatedField(source='destination_country', read_only=True)
    pet_type_name = serializers.StringRelatedField(source='pet_type', read_only=True)
    
    class Meta:
        model = UserQuery
        fields = [
            'id', 'query_text', 'response_text', 
            'source_country', 'source_country_name',
            'destination_country', 'destination_country_name',
            'pet_type', 'pet_type_name',
            'created_at'
        ]

