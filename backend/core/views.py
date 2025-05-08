from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    AllowAny,
    IsAuthenticated
)
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import (
    UserRole,
    Product,
    Solution,
    NewsArticle,
    ContactMessage,
    ContactInfo,
    ContactDescription,
    NavigationItem,
    HeroSection,
    Feature,
    TargetMarket,
    WhyChooseUs,
    AboutHero,
    CompanyOverview,
    MissionVision,
    TeamMember,
    Partner,
    PartnersDescription,
    TeamDescription,
    SiteSettings,
    Activity,
    ProductDescription,
    SolutionDescription,
    NewsDescription
)
from .serializers import (
    UserSerializer,
    ProductSerializer,
    SolutionSerializer,
    NewsArticleSerializer,
    ContactMessageSerializer,
    ContactInfoSerializer,
    ContactDescriptionSerializer,
    NavigationItemSerializer,
    HeroSectionSerializer,
    FeatureSerializer,
    TargetMarketSerializer,
    WhyChooseUsSerializer,
    AboutHeroSerializer,
    CompanyOverviewSerializer,
    MissionVisionSerializer,
    TeamMemberSerializer,
    PartnerSerializer,
    PartnersDescriptionSerializer,
    TeamDescriptionSerializer,
    SiteSettingsSerializer,
    ActivitySerializer,
    ProductDescriptionSerializer,
    SolutionDescriptionSerializer,
    NewsDescriptionSerializer
)
from .permissions import IsAdmin, IsEditorOrAdmin, IsViewerOrHigher, HasResourcePermission
from .utils import log_action, sanitize_input

# User related viewsets
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

# Public author information for news articles
class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow public access

    def get_queryset(self):
        # Only return minimal user information needed for displaying authors
        return User.objects.all().only('id', 'username', 'first_name', 'last_name')

    def create(self, request, *args, **kwargs):
        print("Received create data:", request.data)  # Debug log
        try:
            # Extract role from request data
            role_data = request.data.get('role', 'viewer')

            # Create user without role first
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Pass role to serializer context
            serializer.context['role'] = role_data
            user = serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except serializers.ValidationError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        print("Received update data:", request.data)  # Debug log
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Get the current role before update
        current_role = instance.role.role if hasattr(instance, 'role') else 'viewer'

        # If no role is provided in the request, use the current role
        if 'role' not in request.data:
            request.data['role'] = current_role

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'])
    def update_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')

        if not role:
            return Response(
                {'error': 'Role is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if role not in [choice[0] for choice in UserRole.ROLE_CHOICES]:
            return Response(
                {'error': 'Invalid role'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_role, _ = UserRole.objects.get_or_create(user=user)
        user_role.role = role
        user_role.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        # Prevent deleting the main admin user
        if user.id == 1:
            return Response(
                {'error': 'Cannot delete the main admin user'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def check_username(self, request):
        username = request.query_params.get('username')
        user_id = request.query_params.get('userId')  # For update checks

        if not username:
            return Response(
                {'error': 'Username parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        query = User.objects.filter(username=username)
        if user_id:  # If updating, exclude current user
            query = query.exclude(id=user_id)

        exists = query.exists()

        return Response({
            'username': username,
            'available': not exists
        })

# Product and Solution viewsets
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        print("Creating product with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log

        # Check if image_file is in the request
        if 'image_file' in request.FILES:
            print(f"Image file found: {request.FILES['image_file']}")
            print(f"Image file name: {request.FILES['image_file'].name}")
            print(f"Image file size: {request.FILES['image_file'].size}")
            print(f"Image file content type: {request.FILES['image_file'].content_type}")
        else:
            print("No image_file found in request.FILES")

            # Check if 'image' is in the request instead
            if 'image' in request.FILES:
                print(f"Found 'image' instead of 'image_file': {request.FILES['image']}")

        response = super().create(request, *args, **kwargs)
        print(f"Create response: {response.data}")
        return response

    def update(self, request, *args, **kwargs):
        print("Updating product with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log

        # Check if image_file is in the request
        if 'image_file' in request.FILES:
            print(f"Image file found: {request.FILES['image_file']}")
            print(f"Image file name: {request.FILES['image_file'].name}")
            print(f"Image file size: {request.FILES['image_file'].size}")
            print(f"Image file content type: {request.FILES['image_file'].content_type}")
        else:
            print("No image_file found in request.FILES")

            # Check if 'image' is in the request instead
            if 'image' in request.FILES:
                print(f"Found 'image' instead of 'image_file': {request.FILES['image']}")

        response = super().update(request, *args, **kwargs)
        print(f"Update response: {response.data}")
        return response

class SolutionViewSet(viewsets.ModelViewSet):
    queryset = Solution.objects.all()
    serializer_class = SolutionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# News related viewset
class NewsArticleViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.all()
    serializer_class = NewsArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# Contact related viewsets
class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        message.read = True
        message.save()
        return Response({'status': 'marked as read'})

    @action(detail=True, methods=['patch'])
    def mark_as_unread(self, request, pk=None):
        message = self.get_object()
        message.read = False
        message.save()
        return Response({'status': 'marked as unread'})

class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ContactDescriptionViewSet(viewsets.ModelViewSet):
    queryset = ContactDescription.objects.all()
    serializer_class = ContactDescriptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# Navigation and Hero sections
class NavigationItemViewSet(viewsets.ModelViewSet):
    queryset = NavigationItem.objects.all()
    serializer_class = NavigationItemSerializer
    permission_classes = [IsAuthenticated]

class HeroSectionViewSet(viewsets.ModelViewSet):
    queryset = HeroSection.objects.all()
    serializer_class = HeroSectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        print("Creating hero section with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log

        # Check if background_image_file is in the request
        if 'background_image_file' in request.FILES:
            print(f"Background image file found: {request.FILES['background_image_file']}")
            print(f"Background image file name: {request.FILES['background_image_file'].name}")
            print(f"Background image file size: {request.FILES['background_image_file'].size}")
            print(f"Background image file content type: {request.FILES['background_image_file'].content_type}")
        else:
            print("No background_image_file found in request.FILES")

            # Check if 'background_image' is in the request instead
            if 'background_image' in request.FILES:
                print(f"Found 'background_image' instead of 'background_image_file': {request.FILES['background_image']}")
                # Rename the field to match what the serializer expects
                request.FILES['background_image_file'] = request.FILES['background_image']

        response = super().create(request, *args, **kwargs)
        print(f"Create response: {response.data}")
        return response

    def update(self, request, *args, **kwargs):
        print("Updating hero section with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log

        # Check if background_image_file is in the request
        if 'background_image_file' in request.FILES:
            print(f"Background image file found: {request.FILES['background_image_file']}")
            print(f"Background image file name: {request.FILES['background_image_file'].name}")
            print(f"Background image file size: {request.FILES['background_image_file'].size}")
            print(f"Background image file content type: {request.FILES['background_image_file'].content_type}")
        else:
            print("No background_image_file found in request.FILES")

            # Check if 'background_image' is in the request instead
            if 'background_image' in request.FILES:
                print(f"Found 'background_image' instead of 'background_image_file': {request.FILES['background_image']}")
                # Rename the field to match what the serializer expects
                request.FILES['background_image_file'] = request.FILES['background_image']

        # Always use partial update to allow optional fields
        kwargs['partial'] = True

        response = super().update(request, *args, **kwargs)
        print(f"Update response: {response.data}")
        return response

# Feature and Target Market viewsets
class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class TargetMarketViewSet(viewsets.ModelViewSet):
    queryset = TargetMarket.objects.all()
    serializer_class = TargetMarketSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        return context

# Company Information viewsets
class WhyChooseUsViewSet(viewsets.ModelViewSet):
    queryset = WhyChooseUs.objects.all()
    serializer_class = WhyChooseUsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class AboutHeroViewSet(viewsets.ModelViewSet):
    queryset = AboutHero.objects.all()
    serializer_class = AboutHeroSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CompanyOverviewViewSet(viewsets.ModelViewSet):
    queryset = CompanyOverview.objects.all()
    serializer_class = CompanyOverviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class MissionVisionViewSet(viewsets.ModelViewSet):
    queryset = MissionVision.objects.all()
    serializer_class = MissionVisionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# Team related viewsets
class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        return context

class TeamDescriptionViewSet(viewsets.ModelViewSet):
    queryset = TeamDescription.objects.all()
    serializer_class = TeamDescriptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class PartnerDescriptionViewSet(viewsets.ModelViewSet):
    queryset = PartnersDescription.objects.all()
    serializer_class = PartnersDescriptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Site Settings viewset
class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        # Always return the first settings object or create one if none exists
        settings, created = SiteSettings.objects.get_or_create(pk=1)
        return settings


# Activity viewset
class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Activity.objects.all().select_related('user')
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Limit to the most recent 20 activities
        return Activity.objects.all().select_related('user').order_by('-timestamp')[:20]


# Product Description viewset
class ProductDescriptionViewSet(viewsets.ModelViewSet):
    queryset = ProductDescription.objects.all()
    serializer_class = ProductDescriptionSerializer
    permission_classes = [AllowAny]  # Allow public access for reading
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_resource_type(self):
        return 'product_description'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        return context

    def list(self, request, *args, **kwargs):
        try:
            print("ProductDescriptionViewSet.list: Listing all product descriptions")
            queryset = self.get_queryset()
            print(f"ProductDescriptionViewSet.list: Found {queryset.count()} product descriptions")

            # Create a simple response without using the serializer
            result = []
            for product in queryset:
                try:
                    item = {
                        'id': product.id,
                        'title': product.title,
                        'description': product.description,
                        'created_at': product.created_at.isoformat() if product.created_at else None,
                        'updated_at': product.updated_at.isoformat() if product.updated_at else None,
                    }

                    # Handle hero_image separately
                    if product.hero_image:
                        try:
                            # Get the base URL from the request
                            base_url = request.build_absolute_uri('/').rstrip('/')
                            # Construct the full URL
                            if product.hero_image.url.startswith(('http://', 'https://')):
                                item['hero_image'] = product.hero_image.url
                            else:
                                if product.hero_image.url.startswith('/'):
                                    item['hero_image'] = f"{base_url}{product.hero_image.url}"
                                else:
                                    item['hero_image'] = f"{base_url}/{product.hero_image.url}"
                            print(f"Hero image URL for product {product.id}: {item['hero_image']}")
                        except Exception as img_error:
                            print(f"Error handling hero_image for product {product.id}: {str(img_error)}")
                            item['hero_image'] = None
                    else:
                        item['hero_image'] = None
                        print(f"No hero image for product {product.id}")

                    result.append(item)
                    print(f"Added product {product.id} to result")
                except Exception as product_error:
                    print(f"Error processing product description {getattr(product, 'id', 'unknown')}: {str(product_error)}")

            print(f"Returning {len(result)} product descriptions")
            return Response(result)

        except Exception as e:
            print(f"Error in ProductDescriptionViewSet.list: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": "An error occurred while fetching product descriptions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            print(f"ProductDescriptionViewSet.retrieve: Retrieving product description with pk: {kwargs.get('pk')}")
            instance = self.get_object()
            print(f"ProductDescriptionViewSet.retrieve: Found product description: {instance.id}")

            # Create a response manually
            result = {
                'id': instance.id,
                'title': instance.title,
                'description': instance.description,
                'created_at': instance.created_at.isoformat() if instance.created_at else None,
                'updated_at': instance.updated_at.isoformat() if instance.updated_at else None,
            }

            # Handle hero_image separately
            if instance.hero_image:
                try:
                    # Get the base URL from the request
                    base_url = request.build_absolute_uri('/').rstrip('/')
                    # Construct the full URL
                    if instance.hero_image.url.startswith(('http://', 'https://')):
                        result['hero_image'] = instance.hero_image.url
                    else:
                        if instance.hero_image.url.startswith('/'):
                            result['hero_image'] = f"{base_url}{instance.hero_image.url}"
                        else:
                            result['hero_image'] = f"{base_url}/{instance.hero_image.url}"
                    print(f"Hero image URL for product {instance.id}: {result['hero_image']}")
                except Exception as img_error:
                    print(f"Error handling hero_image for product {instance.id}: {str(img_error)}")
                    result['hero_image'] = None
            else:
                result['hero_image'] = None
                print(f"No hero image for product {instance.id}")

            print(f"ProductDescriptionViewSet.retrieve: Returning result: {result}")
            return Response(result)

        except Exception as e:
            print(f"Error in ProductDescriptionViewSet.retrieve: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"An error occurred while retrieving product description: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required to create product descriptions"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        print("Creating product description with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log

        # Check if title and description are empty strings and convert them to None
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Handle title field
        if 'title' in mutable_data and mutable_data['title'] == '':
            print("Converting empty title to None")
            mutable_data['title'] = None

        # Handle description field
        if 'description' in mutable_data and mutable_data['description'] == '':
            print("Converting empty description to None")
            mutable_data['description'] = None

        # Replace the request data with our modified version
        request._full_data = mutable_data

        # Check if hero_image_file is in the request
        if 'hero_image_file' in request.FILES:
            print(f"Hero image file: {request.FILES['hero_image_file']}")
            print(f"Hero image file name: {request.FILES['hero_image_file'].name}")
            print(f"Hero image file size: {request.FILES['hero_image_file'].size}")
            print(f"Hero image file content type: {request.FILES['hero_image_file'].content_type}")

        try:
            response = super().create(request, *args, **kwargs)
            print(f"Create response: {response.data}")
            return response
        except Exception as e:
            print(f"Error creating product description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required to update product descriptions"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        print("Updating product description with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log

        # Check if title and description are empty strings and convert them to None
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Handle title field
        if 'title' in mutable_data and mutable_data['title'] == '':
            print("Converting empty title to None")
            mutable_data['title'] = None

        # Handle description field
        if 'description' in mutable_data and mutable_data['description'] == '':
            print("Converting empty description to None")
            mutable_data['description'] = None

        # Replace the request data with our modified version
        request._full_data = mutable_data

        # Check if hero_image_file is in the request
        if 'hero_image_file' in request.FILES:
            print(f"Hero image file: {request.FILES['hero_image_file']}")
            print(f"Hero image file name: {request.FILES['hero_image_file'].name}")
            print(f"Hero image file size: {request.FILES['hero_image_file'].size}")
            print(f"Hero image file content type: {request.FILES['hero_image_file'].content_type}")

        # Always use partial update to allow optional fields
        kwargs['partial'] = True

        # Get the instance
        instance = self.get_object()
        print(f"Found instance: {instance.id}")

        # Get the serializer
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        try:
            # Validate the data
            serializer.is_valid(raise_exception=False)
            if not serializer.is_valid():
                print(f"Validation errors: {serializer.errors}")
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save the instance
            self.perform_update(serializer)

            # Return the updated instance
            return Response(serializer.data)
        except Exception as e:
            print(f"Error updating product description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        instance = serializer.save()
        print(f"Created product description: {instance.id}")
        print(f"Hero image: {instance.hero_image}")

        # Log the action for audit purposes
        log_action(
            user=self.request.user,
            action_type='CREATE',
            resource_type='product_description',
            resource_id=instance.id
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        print(f"Updated product description: {instance.id}")
        print(f"Hero image: {instance.hero_image}")

        # Log the action for audit purposes
        log_action(
            user=self.request.user,
            action_type='UPDATE',
            resource_type='product_description',
            resource_id=instance.id
        )

    def destroy(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required to delete product descriptions"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            instance = self.get_object()
            print(f"Deleting product description: {instance.id}")

            # Delete the hero image if it exists
            if instance.hero_image:
                try:
                    print(f"Deleting hero image: {instance.hero_image.path}")
                    instance.hero_image.delete(save=False)
                except Exception as e:
                    print(f"Error deleting hero image: {str(e)}")

            # Delete the instance
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error deleting product description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_destroy(self, instance):
        # Log the action before deleting
        log_action(
            user=self.request.user,
            action_type='DELETE',
            resource_type='product_description',
            resource_id=instance.id
        )
        instance.delete()


# Solution Description viewset
class SolutionDescriptionViewSet(viewsets.ModelViewSet):
    queryset = SolutionDescription.objects.all()
    serializer_class = SolutionDescriptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        print(f"SolutionDescriptionViewSet.get_serializer_context: request={self.request}")
        return context

    def list(self, request, *args, **kwargs):
        try:
            print("SolutionDescriptionViewSet.list: Listing all solution descriptions")
            queryset = self.get_queryset()
            print(f"SolutionDescriptionViewSet.list: Found {queryset.count()} solution descriptions")

            # Create a simple response without using the serializer
            result = []
            for solution in queryset:
                try:
                    item = {
                        'id': solution.id,
                        'title': solution.title,
                        'description': solution.description,
                        'created_at': solution.created_at.isoformat() if solution.created_at else None,
                        'updated_at': solution.updated_at.isoformat() if solution.updated_at else None,
                    }

                    # Handle hero_image separately
                    if solution.hero_image:
                        try:
                            # Get the base URL from the request
                            base_url = request.build_absolute_uri('/').rstrip('/')
                            # Construct the full URL
                            if solution.hero_image.url.startswith(('http://', 'https://')):
                                item['hero_image'] = solution.hero_image.url
                            else:
                                if solution.hero_image.url.startswith('/'):
                                    item['hero_image'] = f"{base_url}{solution.hero_image.url}"
                                else:
                                    item['hero_image'] = f"{base_url}/{solution.hero_image.url}"
                        except Exception as img_error:
                            print(f"Error handling hero_image for solution {solution.id}: {str(img_error)}")
                            item['hero_image'] = None
                    else:
                        item['hero_image'] = None

                    result.append(item)
                    print(f"Added solution {solution.id} to result")
                except Exception as sol_error:
                    print(f"Error processing solution description {getattr(solution, 'id', 'unknown')}: {str(sol_error)}")

            print(f"Returning {len(result)} solution descriptions")
            return Response(result)

        except Exception as e:
            print(f"Error in SolutionDescriptionViewSet.list: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": "An error occurred while fetching solution descriptions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        print("Creating solution description with data:", request.data)
        print("Files:", request.FILES)

        # Check if hero_image_file is in the request
        if 'hero_image_file' in request.FILES:
            print(f"Hero image file: {request.FILES['hero_image_file']}")
            print(f"Hero image file name: {request.FILES['hero_image_file'].name}")
            print(f"Hero image file size: {request.FILES['hero_image_file'].size}")
            print(f"Hero image file content type: {request.FILES['hero_image_file'].content_type}")

        try:
            response = super().create(request, *args, **kwargs)
            print(f"Create response: {response.data}")
            return response
        except Exception as e:
            print(f"Error creating solution description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        print("Updating solution description with data:", request.data)
        print("Files:", request.FILES)

        # Check if hero_image_file is in the request
        if 'hero_image_file' in request.FILES:
            print(f"Hero image file: {request.FILES['hero_image_file']}")
            print(f"Hero image file name: {request.FILES['hero_image_file'].name}")
            print(f"Hero image file size: {request.FILES['hero_image_file'].size}")
            print(f"Hero image file content type: {request.FILES['hero_image_file'].content_type}")

        # Always use partial update to allow optional fields
        kwargs['partial'] = True

        try:
            response = super().update(request, *args, **kwargs)
            print(f"Update response: {response.data}")
            return response
        except Exception as e:
            print(f"Error updating solution description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        instance = serializer.save()
        print(f"Created solution description: {instance.id}")
        print(f"Hero image: {instance.hero_image}")

    def perform_update(self, serializer):
        instance = serializer.save()
        print(f"Updated solution description: {instance.id}")
        print(f"Hero image: {instance.hero_image}")


# News Description viewset
class NewsDescriptionViewSet(viewsets.ModelViewSet):
    queryset = NewsDescription.objects.all()
    serializer_class = NewsDescriptionSerializer
    permission_classes = [AllowAny]  # Allow public access for reading
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        return context

    def list(self, request, *args, **kwargs):
        try:
            print("NewsDescriptionViewSet.list: Listing all news descriptions")
            queryset = self.get_queryset()
            print(f"NewsDescriptionViewSet.list: Found {queryset.count()} news descriptions")

            # Create a simple response without using the serializer
            result = []
            for news in queryset:
                try:
                    item = {
                        'id': news.id,
                        'title': news.title,
                        'description': news.description,
                        'created_at': news.created_at.isoformat() if news.created_at else None,
                        'updated_at': news.updated_at.isoformat() if news.updated_at else None,
                    }

                    # Handle hero_image separately
                    if news.hero_image:
                        try:
                            # Get the base URL from the request
                            base_url = request.build_absolute_uri('/').rstrip('/')
                            # Construct the full URL
                            if news.hero_image.url.startswith(('http://', 'https://')):
                                item['hero_image'] = news.hero_image.url
                            else:
                                if news.hero_image.url.startswith('/'):
                                    item['hero_image'] = f"{base_url}{news.hero_image.url}"
                                else:
                                    item['hero_image'] = f"{base_url}/{news.hero_image.url}"
                            print(f"Hero image URL for news {news.id}: {item['hero_image']}")
                        except Exception as img_error:
                            print(f"Error handling hero_image for news {news.id}: {str(img_error)}")
                            item['hero_image'] = None
                    else:
                        item['hero_image'] = None
                        print(f"No hero image for news {news.id}")

                    result.append(item)
                    print(f"Added news {news.id} to result")
                except Exception as news_error:
                    print(f"Error processing news description {getattr(news, 'id', 'unknown')}: {str(news_error)}")

            print(f"Returning {len(result)} news descriptions")
            return Response(result)

        except Exception as e:
            print(f"Error in NewsDescriptionViewSet.list: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": "An error occurred while fetching news descriptions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            print(f"NewsDescriptionViewSet.retrieve: Retrieving news description with pk: {kwargs.get('pk')}")
            instance = self.get_object()
            print(f"NewsDescriptionViewSet.retrieve: Found news description: {instance.id}")

            # Create a response manually
            result = {
                'id': instance.id,
                'title': instance.title,
                'description': instance.description,
                'created_at': instance.created_at.isoformat() if instance.created_at else None,
                'updated_at': instance.updated_at.isoformat() if instance.updated_at else None,
            }

            # Handle hero_image separately
            if instance.hero_image:
                try:
                    # Get the base URL from the request
                    base_url = request.build_absolute_uri('/').rstrip('/')
                    # Construct the full URL
                    if instance.hero_image.url.startswith(('http://', 'https://')):
                        result['hero_image'] = instance.hero_image.url
                    else:
                        if instance.hero_image.url.startswith('/'):
                            result['hero_image'] = f"{base_url}{instance.hero_image.url}"
                        else:
                            result['hero_image'] = f"{base_url}/{instance.hero_image.url}"
                    print(f"Hero image URL for news {instance.id}: {result['hero_image']}")
                except Exception as img_error:
                    print(f"Error handling hero_image for news {instance.id}: {str(img_error)}")
                    result['hero_image'] = None
            else:
                result['hero_image'] = None
                print(f"No hero image for news {instance.id}")

            print(f"NewsDescriptionViewSet.retrieve: Returning result: {result}")
            return Response(result)

        except Exception as e:
            print(f"Error in NewsDescriptionViewSet.retrieve: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"An error occurred while retrieving news description: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required to create news descriptions"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        print("Creating news description with data:", request.data)
        print("Files:", request.FILES)

        # Check if title and description are empty strings and convert them to None
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Handle title field
        if 'title' in mutable_data and mutable_data['title'] == '':
            print("Converting empty title to None")
            mutable_data['title'] = None

        # Handle description field
        if 'description' in mutable_data and mutable_data['description'] == '':
            print("Converting empty description to None")
            mutable_data['description'] = None

        # Replace the request data with our modified version
        request._full_data = mutable_data

        # Check if hero_image_file is in the request
        if 'hero_image_file' in request.FILES:
            print(f"Hero image file: {request.FILES['hero_image_file']}")
            print(f"Hero image file name: {request.FILES['hero_image_file'].name}")
            print(f"Hero image file size: {request.FILES['hero_image_file'].size}")
            print(f"Hero image file content type: {request.FILES['hero_image_file'].content_type}")

        try:
            response = super().create(request, *args, **kwargs)
            print(f"Create response: {response.data}")
            return response
        except Exception as e:
            print(f"Error creating news description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required to update news descriptions"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        print("Updating news description with data:", request.data)
        print("Files:", request.FILES)

        # Check if title and description are empty strings and convert them to None
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Handle title field
        if 'title' in mutable_data and mutable_data['title'] == '':
            print("Converting empty title to None")
            mutable_data['title'] = None

        # Handle description field
        if 'description' in mutable_data and mutable_data['description'] == '':
            print("Converting empty description to None")
            mutable_data['description'] = None

        # Replace the request data with our modified version
        request._full_data = mutable_data

        # Check if hero_image_file is in the request
        if 'hero_image_file' in request.FILES:
            print(f"Hero image file: {request.FILES['hero_image_file']}")
            print(f"Hero image file name: {request.FILES['hero_image_file'].name}")
            print(f"Hero image file size: {request.FILES['hero_image_file'].size}")
            print(f"Hero image file content type: {request.FILES['hero_image_file'].content_type}")

        # Always use partial update to allow optional fields
        kwargs['partial'] = True

        try:
            response = super().update(request, *args, **kwargs)
            print(f"Update response: {response.data}")
            return response
        except Exception as e:
            print(f"Error updating news description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        instance = serializer.save()
        print(f"Created news description: {instance.id}")
        print(f"Hero image: {instance.hero_image}")

    def perform_update(self, serializer):
        instance = serializer.save()
        print(f"Updated news description: {instance.id}")
        print(f"Hero image: {instance.hero_image}")
        if instance.hero_image:
            print(f"Hero image URL: {instance.hero_image.url}")
        else:
            print("No hero image set")

    def destroy(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required to delete news descriptions"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            instance = self.get_object()
            print(f"Deleting news description: {instance.id}")

            # Delete the hero image if it exists
            if instance.hero_image:
                try:
                    print(f"Deleting hero image: {instance.hero_image.path}")
                    instance.hero_image.delete(save=False)
                except Exception as e:
                    print(f"Error deleting hero image: {str(e)}")

            # Delete the instance
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error deleting news description: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Partner related viewsets
class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Ensure request is included in the context
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        print("Creating partner with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        print("Updating partner with data:", request.data)  # Debug log
        print("Files:", request.FILES)  # Debug log
        return super().update(request, *args, **kwargs)

class PartnersDescriptionViewSet(viewsets.ModelViewSet):
    queryset = PartnersDescription.objects.all()
    serializer_class = PartnersDescriptionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
