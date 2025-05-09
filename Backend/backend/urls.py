from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Schema view for Swagger documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Global Pet Travel Assistant API",
        default_version="v1",
        description="API for accessing pet travel requirements worldwide",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@pettravel.example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # API endpoints
    path("api/", include([
        path("", include("travel.urls")),
        path("auth/", include("authentication.urls")),
    ])),
    
    # API documentation
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]
