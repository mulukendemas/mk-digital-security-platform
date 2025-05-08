from django.db import models
from django.contrib.auth.models import User

class UserRole(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='role')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['user__username']

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class ProductItem(models.Model):
    description = models.CharField(max_length=255)
    #category = models.ForeignKey(ProductCategory, related_name='items', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.description

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    items = models.JSONField(default=list)  # This will store the list of items
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Solution(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='solutions/', blank=True, null=True)
    features = models.JSONField(default=list)
    icon = models.CharField(max_length=100, blank=True, null=True)
    #benefits = models.JSONField(default=list)
    #target_markets = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class NewsArticle(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField()
    content = models.TextField()
    image = models.ImageField(upload_to='news/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    published_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Contact Messages"

class ContactInfo(models.Model):
    icon = models.CharField(max_length=50)
    title = models.CharField(max_length=100)
    details = models.JSONField()  # Store array of strings
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Contact Information"

class ContactDescription(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    background_image = models.ImageField(upload_to='contact/hero/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Contact Descriptions"

class NavigationItem(models.Model):
    title = models.CharField(max_length=100)
    path = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']


class HeroSection(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    button_text = models.CharField(max_length=50)
    button_link = models.CharField(max_length=200)
    background_image = models.ImageField(upload_to='hero/')

    class Meta:
        verbose_name_plural = "Hero Section"

    def __str__(self):
        return self.title

class Feature(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50)

    def __str__(self):
        return self.title

class TargetMarket(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='markets/')

    def __str__(self):
        return self.title

class WhyChooseUs(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50)

    class Meta:
        verbose_name_plural = "Why Choose Us"

    def __str__(self):
        return self.title

class AboutHero(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    background_image = models.ImageField(upload_to='about/hero/', blank=True, null=True)

    class Meta:
        verbose_name_plural = "About Hero Section"

    def __str__(self):
        return self.title or "About Hero Section"

class CompanyOverview(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    quote = models.TextField()
    quote_author = models.CharField(max_length=255)
    quote_position = models.CharField(max_length=255)

    class Meta:
        verbose_name_plural = "Company Overview"

    def __str__(self):
        return self.title

class MissionVision(models.Model):
    title = models.CharField(max_length=255)
    missionTitle = models.CharField(max_length=255)
    mission = models.TextField()
    visionTitle = models.CharField(max_length=255)
    vision = models.TextField()

    class Meta:
        verbose_name_plural = "Mission & Vision"

    def __str__(self):
        return self.title

class TeamMember(models.Model):
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    image = models.ImageField(upload_to='team/')

    class Meta:
        verbose_name_plural = "Team Members"

    def __str__(self):
        return self.name

class Partner(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='partners/', null=True, blank=True)

    class Meta:
        verbose_name_plural = "Partners"

    def __str__(self):
        return self.name

    @property
    def logo_url(self):
        if self.logo:
            return self.logo.url
        return None

class PartnersDescription(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Partner Descriptions"

class TeamDescription(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Team Descriptions"


class SiteSettings(models.Model):
    # General settings
    maintenanceMode = models.BooleanField(default=False)
    maintenanceMessage = models.TextField(blank=True, null=True, default="Site is currently under maintenance. Please check back later.")
    siteName = models.CharField(max_length=255, blank=True, null=True, default="MK Digital Security Solutions")
    siteDescription = models.CharField(max_length=255, blank=True, null=True, default="Digital Security for a Connected World")
    contactEmail = models.EmailField(blank=True, null=True, default="contact@example.com")

    # Security settings
    enableTwoFactorAuth = models.BooleanField(default=False)
    maxLoginAttempts = models.IntegerField(default=5)
    sessionTimeout = models.IntegerField(default=30)  # in minutes
    enableCaptcha = models.BooleanField(default=False)
    allowedIPs = models.JSONField(default=list, blank=True, null=True)

    # Password policy
    passwordPolicyMinLength = models.IntegerField(default=8)
    passwordPolicyRequireUppercase = models.BooleanField(default=True)
    passwordPolicyRequireLowercase = models.BooleanField(default=True)
    passwordPolicyRequireNumbers = models.BooleanField(default=True)
    passwordPolicyRequireSpecialChars = models.BooleanField(default=False)
    passwordPolicyExpiryDays = models.IntegerField(default=90)

    # Logo settings
    logo = models.CharField(max_length=255, blank=True, null=True)
    logoAlt = models.CharField(max_length=255, blank=True, null=True)
    logoWidth = models.IntegerField(blank=True, null=True, default=150)
    logoHeight = models.IntegerField(blank=True, null=True, default=50)
    favicon = models.CharField(max_length=255, blank=True, null=True)

    # Footer settings
    footerText = models.TextField(blank=True, null=True)
    footerLinks = models.JSONField(default=list, blank=True, null=True)
    copyrightText = models.CharField(max_length=255, blank=True, null=True)
    showSocialLinks = models.BooleanField(default=True)
    socialLinks = models.JSONField(default=list, blank=True, null=True)

    # Timestamps
    lastUpdated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return f"Site Settings (Last updated: {self.lastUpdated})"


class ProductDescription(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    hero_image = models.ImageField(upload_to='products/hero/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Product Descriptions"

    def __str__(self):
        return self.title


class SolutionDescription(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    hero_image = models.ImageField(upload_to='solutions/hero/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Solution Descriptions"

    def __str__(self):
        return self.title


class NewsDescription(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    hero_image = models.ImageField(upload_to='news/hero/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "News Descriptions"

    def __str__(self):
        return self.title


class Activity(models.Model):
    ACTION_CHOICES = (
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('login', 'Logged in'),
        ('logout', 'Logged out'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    content_type = models.CharField(max_length=100, blank=True, null=True)  # e.g., 'product', 'solution'
    object_id = models.CharField(max_length=100, blank=True, null=True)  # ID of the affected object
    details = models.TextField(blank=True, null=True)  # Additional details about the activity
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Activities"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} {self.get_action_display()} {self.content_type or ''} at {self.timestamp}"
