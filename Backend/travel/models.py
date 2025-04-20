from django.db import models
from django.utils import timezone

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
        verbose_name_plural = "Countries"
        ordering = ['name']

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

class UserQuery(models.Model):
    """Model to store user questions and system responses."""
    query_text = models.TextField()
    response_text = models.TextField()
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
    created_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Query: {self.query_text[:50]}..."

    class Meta:
        verbose_name_plural = "User Queries"
        ordering = ['-created_at']
