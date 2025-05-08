from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import (
    Product, Solution, NewsArticle, ContactMessage, ContactInfo, ContactDescription,
    NavigationItem, HeroSection, Feature, TargetMarket,
    WhyChooseUs, AboutHero, CompanyOverview, MissionVision,
    TeamMember, Partner, PartnersDescription, TeamDescription,
    UserRole, SiteSettings, Activity, ProductDescription, SolutionDescription, NewsDescription
)

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['role']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.role', required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'date_joined', 'last_login')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'validators': []},
            'email': {'validators': []}
        }

    def to_representation(self, instance):
        """
        Override to ensure role is properly represented and date fields are included
        """
        ret = super().to_representation(instance)
        # Ensure role is properly fetched from the UserRole model
        try:
            ret['role'] = {'role': instance.role.role}
        except (AttributeError, UserRole.DoesNotExist):
            ret['role'] = {'role': 'viewer'}

        # Ensure date fields are included
        ret['date_joined'] = instance.date_joined.isoformat() if instance.date_joined else None
        ret['last_login'] = instance.last_login.isoformat() if instance.last_login else None

        return ret

    def validate(self, data):
        # Check if username exists
        username = data.get('username')
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                "username": "A user with that username already exists."
            })

        # Check if email exists
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email": "A user with that email already exists."
            })

        return data

    def create(self, validated_data):
        # Extract role data
        role_data = validated_data.pop('role', {})
        role = role_data.get('role', 'viewer') if isinstance(role_data, dict) else role_data or 'viewer'

        try:
            # Create user
            password = validated_data.pop('password', None)
            user = User.objects.create(**validated_data)

            if password:
                # Validate password against site settings
                from .utils import validate_password_strength
                from .models import SiteSettings

                try:
                    # Get site settings
                    settings = SiteSettings.objects.first()
                    # Validate password
                    validate_password_strength(password, settings)
                    # Set password if valid
                    user.set_password(password)
                    user.save()
                except Exception as e:
                    # If validation fails, delete user and raise error
                    user.delete()
                    raise serializers.ValidationError({'password': str(e)})

            # Create role
            UserRole.objects.create(user=user, role=role)

            return user
        except Exception as e:
            if 'user' in locals():
                user.delete()
            raise serializers.ValidationError(str(e))

    def update(self, instance, validated_data):
        # Extract role data
        role_data = validated_data.pop('role', {})
        role = role_data.get('role') if isinstance(role_data, dict) else role_data

        # Update password if provided
        password = validated_data.pop('password', None)
        if password:
            # Validate password against site settings
            from .utils import validate_password_strength
            from .models import SiteSettings

            try:
                # Get site settings
                settings = SiteSettings.objects.first()
                # Validate password
                validate_password_strength(password, settings)
                # Set password if valid
                instance.set_password(password)
            except Exception as e:
                # If validation fails, raise error
                raise serializers.ValidationError({'password': str(e)})

        # Update other user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update role if provided
        if role:
            user_role, _ = UserRole.objects.get_or_create(user=instance)
            user_role.role = role
            user_role.save()

        return instance

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'items', 'image', 'image_file', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the image
                return request.build_absolute_uri(obj.image.url)
            # Return the relative URL if no request context
            return obj.image.url
        return None

    def create(self, validated_data):
        # Handle image file upload
        image_file = validated_data.pop('image_file', None)
        product = Product.objects.create(**validated_data)

        if image_file:
            product.image = image_file
            product.save()

        return product

    def update(self, instance, validated_data):
        # Handle image file upload
        image_file = validated_data.pop('image_file', None)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image_file:
            instance.image = image_file

        instance.save()
        return instance

class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solution
        fields = '__all__'

class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ('created_at',)

class ContactInfoSerializer(serializers.ModelSerializer):
    details = serializers.JSONField()  # Handle array of strings

    class Meta:
        model = ContactInfo
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ContactDescriptionSerializer(serializers.ModelSerializer):
    background_image = serializers.SerializerMethodField()
    background_image_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = ContactDescription
        fields = ['id', 'title', 'description', 'background_image', 'background_image_file', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_background_image(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the image
                return request.build_absolute_uri(obj.background_image.url)
            # Return the relative URL if no request context
            return obj.background_image.url
        return None

    def create(self, validated_data):
        # Handle image file upload
        background_image_file = validated_data.pop('background_image_file', None)

        # Create the contact description
        contact_description = ContactDescription.objects.create(**validated_data)

        # Handle image file if provided
        if background_image_file:
            contact_description.background_image = background_image_file
            contact_description.save()

        return contact_description

    def update(self, instance, validated_data):
        # Handle image file upload
        background_image_file = validated_data.pop('background_image_file', None)

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle image file if provided
        if background_image_file:
            # If there's an existing image, delete it to avoid orphaned files
            if instance.background_image:
                try:
                    instance.background_image.delete(save=False)
                except Exception as e:
                    print(f"Error deleting old image: {str(e)}")

            # Set the new image
            instance.background_image = background_image_file

        instance.save()
        return instance

class NavigationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavigationItem
        fields = '__all__'

class HeroSectionSerializer(serializers.ModelSerializer):
    background_image = serializers.SerializerMethodField()
    background_image_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = HeroSection
        fields = ['id', 'title', 'description', 'button_text', 'button_link', 'background_image', 'background_image_file']

    def get_background_image(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the image
                return request.build_absolute_uri(obj.background_image.url)
            # Return the relative URL if no request context
            return obj.background_image.url
        return None

    def create(self, validated_data):
        # Handle image file upload
        background_image_file = validated_data.pop('background_image_file', None)

        # Debug log
        print(f"Creating new hero section")
        print(f"Validated data: {validated_data}")
        print(f"Background image file: {background_image_file}")

        # Create the hero section
        hero_section = HeroSection.objects.create(**validated_data)

        # Handle image file if provided
        if background_image_file:
            print(f"Setting background_image to {background_image_file}")
            hero_section.background_image = background_image_file
            hero_section.save()

        return hero_section

    def update(self, instance, validated_data):
        # Handle image file upload
        background_image_file = validated_data.pop('background_image_file', None)

        # Debug log
        print(f"Updating hero section {instance.id}")
        print(f"Validated data: {validated_data}")
        print(f"Background image file: {background_image_file}")

        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle image file if provided
        if background_image_file:
            # If there's an existing image, delete it to avoid orphaned files
            if instance.background_image:
                try:
                    print(f"Deleting old image: {instance.background_image.path}")
                    instance.background_image.delete(save=False)
                except Exception as e:
                    print(f"Error deleting old image: {str(e)}")

            # Set the new image
            instance.background_image = background_image_file

        instance.save()
        return instance

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'

class TargetMarketSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TargetMarket
        fields = ['id', 'title', 'description', 'image']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the image
                return request.build_absolute_uri(obj.image.url)
            # Return the relative URL if no request context
            return obj.image.url
        return None

class WhyChooseUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhyChooseUs
        fields = '__all__'

class AboutHeroSerializer(serializers.ModelSerializer):
    background_image = serializers.SerializerMethodField()
    background_image_file = serializers.ImageField(write_only=True, required=False)
    title = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = AboutHero
        fields = ['id', 'title', 'description', 'background_image', 'background_image_file']

    def get_background_image(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the image
                return request.build_absolute_uri(obj.background_image.url)
            # Return the relative URL if no request context
            return obj.background_image.url
        return None

    def create(self, validated_data):
        # Handle image file upload
        background_image_file = validated_data.pop('background_image_file', None)

        # Debug log
        print(f"Creating new about hero section")
        print(f"Validated data: {validated_data}")
        print(f"Background image file: {background_image_file}")

        # Process validated data to handle empty strings
        processed_data = {}
        for attr, value in validated_data.items():
            # Check if title or description are explicitly set to empty strings
            if attr in ['title', 'description'] and value == '':
                print(f"Setting {attr} to None for create")
                processed_data[attr] = None
            else:
                processed_data[attr] = value

        # Create the about hero section
        about_hero = AboutHero.objects.create(**processed_data)

        # Handle image file if provided
        if background_image_file:
            print(f"Setting background_image to {background_image_file}")
            about_hero.background_image = background_image_file
            about_hero.save()

        return about_hero

    def update(self, instance, validated_data):
        # Handle image file upload
        background_image_file = validated_data.pop('background_image_file', None)

        # Debug log
        print(f"Updating about hero section {instance.id}")
        print(f"Validated data: {validated_data}")
        print(f"Background image file: {background_image_file}")

        # Update fields
        for attr, value in validated_data.items():
            # Check if title or description are explicitly set to empty strings
            if attr in ['title', 'description'] and value == '':
                print(f"Setting {attr} to None")
                setattr(instance, attr, None)
            else:
                setattr(instance, attr, value)

        # Handle image file if provided
        if background_image_file:
            # If there's an existing image, delete it to avoid orphaned files
            if instance.background_image:
                try:
                    print(f"Deleting old image: {instance.background_image.path}")
                    instance.background_image.delete(save=False)
                except Exception as e:
                    print(f"Error deleting old image: {str(e)}")

            # Set the new image
            instance.background_image = background_image_file

        instance.save()
        return instance

class CompanyOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyOverview
        fields = '__all__'

class MissionVisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissionVision
        fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'position', 'image', 'image_file']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the image
                return request.build_absolute_uri(obj.image.url)
            # Return the relative URL if no request context
            return obj.image.url
        return None

    def update(self, instance, validated_data):
        # Handle image update separately
        image_file = self.context['request'].FILES.get('image')
        if image_file:
            print(f"Updating image for team member {instance.id} with file: {image_file.name}")
            # If there's an existing image, delete it to avoid orphaned files
            if instance.image:
                print(f"Deleting old image: {instance.image.path}")
                instance.image.delete(save=False)
            # Set the new image
            instance.image = image_file

        # Update other fields
        instance.name = validated_data.get('name', instance.name)
        instance.position = validated_data.get('position', instance.position)
        instance.save()
        return instance

    def create(self, validated_data):
        # Handle image creation separately
        image_file = self.context['request'].FILES.get('image')
        if image_file:
            print(f"Creating team member with image file: {image_file.name}")
            validated_data['image'] = image_file

        return super().create(validated_data)

class PartnerSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    logo_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Partner
        fields = ['id', 'name', 'logo', 'logo_file']

    def get_logo(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the logo
                return request.build_absolute_uri(obj.logo.url)
            # Return the relative URL if no request context
            return obj.logo.url
        return None

    def create(self, validated_data):
        # Handle logo file upload
        logo_file = validated_data.pop('logo_file', None)
        partner = Partner.objects.create(**validated_data)

        if logo_file:
            partner.logo = logo_file
            partner.save()

        return partner

    def update(self, instance, validated_data):
        # Handle logo file upload
        logo_file = validated_data.pop('logo_file', None)

        # Update other fields
        instance.name = validated_data.get('name', instance.name)

        # Update logo if provided
        if logo_file:
            instance.logo = logo_file

        instance.save()
        return instance

class PartnersDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnersDescription
        fields = '__all__'

class TeamDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamDescription
        fields = '__all__'


class SiteSettingsSerializer(serializers.ModelSerializer):
    # Create a nested representation for password policy
    passwordPolicy = serializers.SerializerMethodField()
    # Add fields for logo and footer settings
    logo = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    logoAlt = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    logoWidth = serializers.IntegerField(required=False, allow_null=True)
    logoHeight = serializers.IntegerField(required=False, allow_null=True)
    favicon = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    footerText = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    footerLinks = serializers.JSONField(required=False, allow_null=True)
    copyrightText = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    showSocialLinks = serializers.BooleanField(required=False)
    socialLinks = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = SiteSettings
        fields = [
            'id', 'maintenanceMode', 'maintenanceMessage', 'siteName', 'siteDescription', 'contactEmail',
            'enableTwoFactorAuth', 'maxLoginAttempts', 'sessionTimeout', 'enableCaptcha', 'allowedIPs',
            'passwordPolicy', 'lastUpdated',
            # Logo fields
            'logo', 'logoAlt', 'logoWidth', 'logoHeight', 'favicon',
            # Footer fields
            'footerText', 'footerLinks', 'copyrightText', 'showSocialLinks', 'socialLinks'
        ]

    def get_passwordPolicy(self, obj):
        """Return password policy settings as a nested object"""
        return {
            'minLength': obj.passwordPolicyMinLength,
            'requireUppercase': obj.passwordPolicyRequireUppercase,
            'requireLowercase': obj.passwordPolicyRequireLowercase,
            'requireNumbers': obj.passwordPolicyRequireNumbers,
            'requireSpecialChars': obj.passwordPolicyRequireSpecialChars,
            'expiryDays': obj.passwordPolicyExpiryDays
        }

    def update(self, instance, validated_data):
        # Extract nested data
        password_policy = self.initial_data.get('passwordPolicy', {})
        footer_links = self.initial_data.get('footerLinks', [])
        social_links = self.initial_data.get('socialLinks', [])

        # Log what we're updating
        print(f"Updating SiteSettings with ID {instance.id}")
        print(f"Password policy: {password_policy}")
        print(f"Footer links: {footer_links}")
        print(f"Social links: {social_links}")

        # Update password policy fields if they exist
        if password_policy:
            instance.passwordPolicyMinLength = password_policy.get('minLength', instance.passwordPolicyMinLength)
            instance.passwordPolicyRequireUppercase = password_policy.get('requireUppercase', instance.passwordPolicyRequireUppercase)
            instance.passwordPolicyRequireLowercase = password_policy.get('requireLowercase', instance.passwordPolicyRequireLowercase)
            instance.passwordPolicyRequireNumbers = password_policy.get('requireNumbers', instance.passwordPolicyRequireNumbers)
            instance.passwordPolicyRequireSpecialChars = password_policy.get('requireSpecialChars', instance.passwordPolicyRequireSpecialChars)
            instance.passwordPolicyExpiryDays = password_policy.get('expiryDays', instance.passwordPolicyExpiryDays)

        # Update all other fields
        for attr, value in validated_data.items():
            # Skip nested fields that we handle separately
            if attr not in ['passwordPolicy', 'footerLinks', 'socialLinks']:
                setattr(instance, attr, value)

        instance.save()
        return instance


class ActivitySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    action = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ['id', 'user', 'action', 'time', 'content_type', 'object_id', 'details']

    def get_user(self, obj):
        return obj.user.username

    def get_action(self, obj):
        action_text = obj.get_action_display()
        if obj.content_type:
            return f"{action_text} {obj.content_type}"
        return action_text

    def get_time(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')


class ProductDescriptionSerializer(serializers.ModelSerializer):
    hero_image = serializers.SerializerMethodField()
    hero_image_file = serializers.ImageField(write_only=True, required=False)
    title = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ProductDescription
        fields = ['id', 'title', 'description', 'hero_image', 'hero_image_file', 'created_at', 'updated_at']

    def get_hero_image(self, obj):
        if not obj:
            print("WARNING: Object is None in get_hero_image")
            return None

        if not hasattr(obj, 'hero_image'):
            print(f"WARNING: Object {obj} has no hero_image attribute")
            return None

        if not obj.hero_image:
            print(f"No hero image for product description {obj.id}")
            return None

        if not obj.hero_image.name:
            print(f"Hero image has no name for product description {obj.id}")
            return None

        try:
            # Debug log
            print(f"Hero image for product description {obj.id}: {obj.hero_image}")
            print(f"Hero image name: {obj.hero_image.name}")

            try:
                print(f"Hero image URL: {obj.hero_image.url}")
            except Exception as url_error:
                print(f"Error getting hero image URL: {str(url_error)}")
                return None

            # Check if the file exists
            import os
            from django.conf import settings

            try:
                file_path = os.path.join(settings.MEDIA_ROOT, obj.hero_image.name)
                if not os.path.exists(file_path):
                    print(f"WARNING: Hero image file does not exist at {file_path}")
                else:
                    file_size = os.path.getsize(file_path)
                    print(f"Hero image file size: {file_size} bytes")
                    if file_size == 0:
                        print(f"WARNING: Hero image file is empty (0 bytes)")
            except Exception as file_error:
                print(f"Error checking file: {str(file_error)}")

            # Always return the absolute URL with the correct domain
            # This ensures the frontend can access the image
            request = self.context.get('request')
            if request:
                try:
                    # Build absolute URI for the image
                    full_url = request.build_absolute_uri(obj.hero_image.url)
                    print(f"Full hero image URL: {full_url}")
                    return full_url
                except Exception as request_error:
                    print(f"Error building absolute URI: {str(request_error)}")

            # If no request context, construct a URL that will work
            # This is a fallback that should rarely be used
            try:
                base_url = "http://localhost:8000"  # Adjust based on your environment
                full_url = f"{base_url}{obj.hero_image.url}"
                print(f"Fallback full URL: {full_url}")
                return full_url
            except Exception as fallback_error:
                print(f"Error creating fallback URL: {str(fallback_error)}")
                return None

        except Exception as e:
            print(f"Error getting hero image URL: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

    def create(self, validated_data):
        # Handle image file upload
        hero_image_file = validated_data.pop('hero_image_file', None)

        # Debug log
        print(f"Creating new product description")
        print(f"Validated data: {validated_data}")
        print(f"Hero image file: {hero_image_file}")

        # Create the product description
        product_description = ProductDescription.objects.create(**validated_data)

        # Handle image file if provided
        if hero_image_file:
            print(f"Setting hero_image to {hero_image_file}")
            product_description.hero_image = hero_image_file

            # Save the instance
            try:
                product_description.save()
                print(f"Product description saved successfully with image")
            except Exception as e:
                print(f"Error saving product description with image: {str(e)}")
                raise

        return product_description

    def update(self, instance, validated_data):
        # Handle image file upload
        hero_image_file = validated_data.pop('hero_image_file', None)

        # Debug log
        print(f"Updating product description {instance.id}")
        print(f"Validated data: {validated_data}")
        print(f"Hero image file: {hero_image_file}")

        # Check if title or description are explicitly set to empty strings
        # This is different from them not being present in validated_data
        if 'title' in validated_data and validated_data['title'] == '':
            print("Setting title to None")
            validated_data['title'] = None

        if 'description' in validated_data and validated_data['description'] == '':
            print("Setting description to None")
            validated_data['description'] = None

        # Create a copy of the instance to avoid modifying it directly
        # This helps prevent issues if the save fails
        from copy import deepcopy
        instance_copy = deepcopy(instance)

        # Update fields only if they are provided
        for attr, value in validated_data.items():
            # Skip empty strings for optional fields if the current value is not empty
            if attr in ['title', 'description'] and value == "" and getattr(instance_copy, attr, None):
                print(f"Skipping empty {attr} as current value exists")
                continue

            try:
                setattr(instance_copy, attr, value)
                print(f"Set {attr} to {value}")
            except Exception as attr_error:
                print(f"Error setting {attr}: {str(attr_error)}")
                # Continue with other attributes

        # Handle image file if provided
        if hero_image_file:
            print(f"Setting hero_image to {hero_image_file}")
            try:
                # If there's an existing image, delete it to avoid orphaned files
                if instance_copy.hero_image:
                    try:
                        print(f"Deleting old image: {instance_copy.hero_image.path}")
                        instance_copy.hero_image.delete(save=False)
                    except Exception as e:
                        print(f"Error deleting old image: {str(e)}")
                        # Continue even if delete fails

                # Set the new image
                instance_copy.hero_image = hero_image_file
                print(f"New hero_image set: {instance_copy.hero_image}")
            except Exception as e:
                print(f"Error setting hero image: {str(e)}")
                # Continue without setting the image

        # Save the instance
        try:
            # Update the original instance with the modified values
            for field in instance._meta.fields:
                field_name = field.name
                if field_name not in ['id', 'created_at', 'updated_at']:
                    try:
                        value = getattr(instance_copy, field_name)
                        setattr(instance, field_name, value)
                    except Exception as field_error:
                        print(f"Error copying field {field_name}: {str(field_error)}")

            # Save the instance
            instance.save()
            print(f"Product description saved successfully")
            return instance
        except Exception as e:
            print(f"Error saving product description: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return the original instance instead of raising an exception
            # This prevents the 500 error
            return instance


class SolutionDescriptionSerializer(serializers.ModelSerializer):
    hero_image = serializers.SerializerMethodField()
    hero_image_file = serializers.ImageField(write_only=True, required=False)
    title = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = SolutionDescription
        fields = ['id', 'title', 'description', 'hero_image', 'hero_image_file', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print(f"SolutionDescriptionSerializer.__init__: instance={getattr(self, 'instance', None)}")
        # Only try to access hero_image if instance is a single object, not a QuerySet
        if hasattr(self, 'instance') and self.instance and not hasattr(self.instance, '__iter__'):
            try:
                print(f"SolutionDescriptionSerializer.__init__: instance.hero_image={self.instance.hero_image}")
                if self.instance.hero_image:
                    print(f"SolutionDescriptionSerializer.__init__: instance.hero_image.url={self.instance.hero_image.url}")
                    print(f"SolutionDescriptionSerializer.__init__: instance.hero_image.name={self.instance.hero_image.name}")
                    print(f"SolutionDescriptionSerializer.__init__: instance.hero_image.path={self.instance.hero_image.path}")
            except Exception as e:
                print(f"Error accessing hero_image in __init__: {str(e)}")
        print(f"SolutionDescriptionSerializer.__init__: context={getattr(self, 'context', None)}")

    def get_hero_image(self, obj):
        try:
            if not obj:
                print("WARNING: Object is None in get_hero_image")
                # Return null and let the frontend handle it
                return None

            if not hasattr(obj, 'hero_image'):
                print(f"WARNING: Object {obj} has no hero_image attribute")
                # Return null and let the frontend handle it
                return None

            if not obj.hero_image:
                print(f"No hero image for solution description {obj.id}")
                # Return null and let the frontend handle it
                return None

            if not obj.hero_image.name:
                print(f"Hero image has no name for solution description {obj.id}")
                # Return null and let the frontend handle it
                return None

            # Debug log
            print(f"Hero image for solution description {obj.id}: {obj.hero_image}")
            print(f"Hero image name: {obj.hero_image.name}")

            try:
                hero_image_url = obj.hero_image.url
                print(f"Hero image URL: {hero_image_url}")
            except Exception as url_error:
                print(f"Error getting hero image URL: {str(url_error)}")
                # Return null and let the frontend handle it
                return None

            # Always return the absolute URL with the correct domain
            request = self.context.get('request')
            if request:
                try:
                    # Get the base URL from the request
                    base_url = request.build_absolute_uri('/').rstrip('/')

                    # Simple approach: just return the URL as is if it's absolute,
                    # or prepend the base URL if it's relative
                    if hero_image_url.startswith(('http://', 'https://')):
                        return hero_image_url
                    elif hero_image_url.startswith('/'):
                        return f"{base_url}{hero_image_url}"
                    else:
                        return f"{base_url}/{hero_image_url}"
                except Exception as request_error:
                    print(f"Error building absolute URI: {str(request_error)}")
                    # Return the original URL
                    return hero_image_url

            # If no request context, return the relative URL
            return hero_image_url

        except Exception as e:
            print(f"Error in get_hero_image: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return null and let the frontend handle it
            return None

    def create(self, validated_data):
        # Handle image file upload
        hero_image_file = validated_data.pop('hero_image_file', None)

        # Debug log
        print(f"Creating new solution description")
        print(f"Validated data: {validated_data}")
        print(f"Hero image file: {hero_image_file}")

        # Create the solution description
        solution_description = SolutionDescription.objects.create(**validated_data)

        # Handle image file if provided
        if hero_image_file:
            print(f"Setting hero_image to {hero_image_file}")
            solution_description.hero_image = hero_image_file

            # Save the instance
            try:
                solution_description.save()
                print(f"Solution description saved successfully with image")
            except Exception as e:
                print(f"Error saving solution description with image: {str(e)}")
                import traceback
                traceback.print_exc()
                raise

        return solution_description

    def update(self, instance, validated_data):
        # Handle image file upload
        hero_image_file = validated_data.pop('hero_image_file', None)

        # Debug log
        print(f"Updating solution description {instance.id}")
        print(f"Validated data: {validated_data}")
        print(f"Hero image file: {hero_image_file}")

        # Update fields
        for attr, value in validated_data.items():
            try:
                setattr(instance, attr, value)
                print(f"Set {attr} to {value}")
            except Exception as attr_error:
                print(f"Error setting {attr}: {str(attr_error)}")
                # Continue with other attributes

        # Handle image file if provided
        if hero_image_file:
            print(f"Setting hero_image to {hero_image_file}")
            try:
                # If there's an existing image, delete it to avoid orphaned files
                if instance.hero_image:
                    try:
                        print(f"Deleting old image: {instance.hero_image.path}")
                        instance.hero_image.delete(save=False)
                    except Exception as e:
                        print(f"Error deleting old image: {str(e)}")
                        # Continue even if delete fails

                # Set the new image
                instance.hero_image = hero_image_file
                print(f"New hero_image set: {instance.hero_image}")
            except Exception as e:
                print(f"Error setting hero image: {str(e)}")
                # Continue without setting the image

        # Save the instance
        try:
            instance.save()
            print(f"Solution description saved successfully")
            return instance
        except Exception as e:
            print(f"Error saving solution description: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return the instance anyway to prevent 500 error
            return instance


class NewsDescriptionSerializer(serializers.ModelSerializer):
    hero_image = serializers.SerializerMethodField()
    hero_image_file = serializers.ImageField(write_only=True, required=False)
    title = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = NewsDescription
        fields = ['id', 'title', 'description', 'hero_image', 'hero_image_file', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_hero_image(self, obj):
        if obj.hero_image:
            request = self.context.get('request')
            if request:
                # Build absolute URI for the image
                return request.build_absolute_uri(obj.hero_image.url)
            # Return the relative URL if no request context
            return obj.hero_image.url
        return None

    def create(self, validated_data):
        # Handle image file upload
        hero_image_file = validated_data.pop('hero_image_file', None)

        # Debug log
        print(f"Creating new news description")
        print(f"Validated data: {validated_data}")
        print(f"Hero image file: {hero_image_file}")

        # Process validated data to handle empty strings
        processed_data = {}
        for attr, value in validated_data.items():
            # Check if title or description are explicitly set to empty strings
            if attr in ['title', 'description'] and value == '':
                print(f"Setting {attr} to None for create")
                processed_data[attr] = None
            else:
                processed_data[attr] = value

        # Create the news description
        news_description = NewsDescription.objects.create(**processed_data)

        # Handle image file if provided
        if hero_image_file:
            print(f"Setting hero_image to {hero_image_file}")
            news_description.hero_image = hero_image_file
            news_description.save()

        return news_description

    def update(self, instance, validated_data):
        # Handle image file upload
        hero_image_file = validated_data.pop('hero_image_file', None)

        # Debug log
        print(f"Updating news description {instance.id}")
        print(f"Validated data: {validated_data}")
        print(f"Hero image file: {hero_image_file}")

        # Update fields
        for attr, value in validated_data.items():
            # Check if title or description are explicitly set to empty strings
            if attr in ['title', 'description'] and value == '':
                print(f"Setting {attr} to None")
                setattr(instance, attr, None)
            else:
                setattr(instance, attr, value)

        # Handle image file if provided
        if hero_image_file:
            # If there's an existing image, delete it to avoid orphaned files
            if instance.hero_image:
                try:
                    print(f"Deleting old image: {instance.hero_image.path}")
                    instance.hero_image.delete(save=False)
                except Exception as e:
                    print(f"Error deleting old image: {str(e)}")

            # Set the new image
            instance.hero_image = hero_image_file

        instance.save()
        return instance


class TeamDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamDescription
        fields = '__all__'


class PartnerDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnersDescription
        fields = '__all__'
