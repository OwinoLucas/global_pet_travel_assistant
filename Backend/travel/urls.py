from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CountryViewSet,
    PetTypeViewSet,
    CountryPetRequirementViewSet,
    UserQueryViewSet,
    PetViewSet,
    TravelPlanViewSet
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'countries', CountryViewSet)
router.register(r'pet-types', PetTypeViewSet)
router.register(r'requirements', CountryPetRequirementViewSet)
router.register(r'queries', UserQueryViewSet)
router.register(r'pets', PetViewSet, basename='pet')
router.register(r'travel-plans', TravelPlanViewSet, basename='travel-plan')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]

