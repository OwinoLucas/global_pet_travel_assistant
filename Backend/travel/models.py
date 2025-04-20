from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class Country(models.Model):
    """Model to store country-specific pet travel requirements."""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=3, unique=True)
    entry_requirements = models.TextField(blank=True)
    vaccination_requirements = models.TextField(blank=True)
    quarantine_requirements = models.TextField(blank=True)
    documentation_timeline = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "User Queries"
        ordering = ['-created_at']


class PetType(models.Model):
    """Model to store different types of pets and their requirements."""
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    general_requirements = models.TextField(blank=True)
    airline_policies = models.TextField(blank=True)
    carrier_requirements = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Pet(models.Model):
    """Model to store pet information for travel planning."""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets')
    name = models.CharField(max_length=100)
    type = models.ForeignKey(PetType, on_delete=models.PROTECT, related_name='pets')
    breed = models.CharField(max_length=100, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    microchip_id = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='pet_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.type.name})"
    
    class Meta:
        ordering = ['name']


class CountryPetRequirement(models.Model):
    """Model to store requirements specific to a pet type for a specific country."""
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='pet_requirements')
    pet_type = models.ForeignKey(PetType, on_delete=models.CASCADE, related_name='country_requirements')
    specific_requirements = models.TextField()
    additional_documents = models.TextField(blank=True)
    prohibited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('country', 'pet_type')
        ordering = ['country', 'pet_type']

    def __str__(self):
        return f"{self.pet_type.name} requirements for {self.country.name}"


class TravelPlan(models.Model):
    """Model to store travel plans for pets with requirements tracking."""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('ready', 'Ready to Travel'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic information
    name = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='travel_plans')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='travel_plans')
    
    # Locations
    origin_country = models.ForeignKey(
        Country, 
        on_delete=models.PROTECT, 
        related_name='origin_travel_plans'
    )
    destination_country = models.ForeignKey(
        Country, 
        on_delete=models.PROTECT, 
        related_name='destination_travel_plans'
    )
    
    # Dates
    departure_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    
    # Status and notes
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planning'
    )
    notes = models.TextField(blank=True)
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.pet.name} ({self.origin_country.name} to {self.destination_country.name})"
    
    def clean(self):
        # Validate dates
        if self.departure_date and self.departure_date < timezone.now().date():
            raise ValidationError({'departure_date': 'Departure date cannot be in the past.'})
        
        if self.return_date and self.departure_date and self.return_date < self.departure_date:
            raise ValidationError({'return_date': 'Return date must be after departure date.'})
        
        # Validate countries
        if self.origin_country == self.destination_country:
            raise ValidationError({'destination_country': 'Origin and destination countries must be different.'})
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def get_requirements(self):
        """Get all requirements for this travel plan."""
        return CountryPetRequirement.objects.filter(
            country=self.destination_country,
            pet_type=self.pet.type
        )
    
    def days_until_departure(self):
        """Calculate days remaining until departure."""
        if not self.departure_date:
            return None
        return (self.departure_date - timezone.now().date()).days
    
    class Meta:
        ordering = ['-departure_date', 'created_at']
        verbose_name = "Travel Plan"
        verbose_name_plural = "Travel Plans"


class TravelRequirement(models.Model):
    """Model to track completion status of requirements for a specific travel plan."""
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('not_applicable', 'Not Applicable'),
    ]
    
    travel_plan = models.ForeignKey(TravelPlan, on_delete=models.CASCADE, related_name='travel_requirements')
    requirement = models.ForeignKey(CountryPetRequirement, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    completion_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    proof_document = models.FileField(upload_to='requirement_proofs/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.requirement} - {self.get_status_display()}"
    
    def is_completed(self):
        return self.status == 'completed'
    
    def days_until_deadline(self):
        if not self.travel_plan.departure_date:
            return None
        return (self.travel_plan.departure_date - timezone.now().date()).days
    
    class Meta:
        unique_together = ('travel_plan', 'requirement')
        ordering = ['travel_plan', 'status', 'requirement']

class UserQuery(models.Model):
    """Model to store user questions and system responses with AI integration."""
    # Basic query and response fields
    query_text = models.TextField()
    response_text = models.TextField(blank=True)
    
    # Country and pet type references
    source_country = models.ForeignKey(
        Country, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='source_queries'
    )
    destination_country = models.ForeignKey(
        Country, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='destination_queries'
    )
    pet_type = models.ForeignKey(
        PetType, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # Conversation tracking fields
    conversation_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    parent_query = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='follow_up_queries'
    )
    
    # Feedback fields
    feedback_rating = models.IntegerField(null=True, blank=True)
    feedback_text = models.TextField(blank=True)
    
    # AI token usage tracking
    token_usage = models.JSONField(default=dict, blank=True)
    
    # Tracking and timestamp fields
    created_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Query: {self.query_text[:50]}..."

    class Meta:
        verbose_name_plural = "User Queries"
        ordering = ['-created_at']
