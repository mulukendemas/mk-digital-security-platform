from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    AuthorViewSet,
    ProductViewSet,
    SolutionViewSet,
    NewsArticleViewSet,
    ContactMessageViewSet,
    ContactInfoViewSet,
    ContactDescriptionViewSet,
    NavigationItemViewSet,
    HeroSectionViewSet,
    FeatureViewSet,
    TargetMarketViewSet,
    WhyChooseUsViewSet,
    AboutHeroViewSet,
    CompanyOverviewViewSet,
    MissionVisionViewSet,
    TeamMemberViewSet,
    PartnerViewSet,
    PartnersDescriptionViewSet,
    TeamDescriptionViewSet,
    SiteSettingsViewSet,
    ActivityViewSet,
    ProductDescriptionViewSet,
    SolutionDescriptionViewSet,
    NewsDescriptionViewSet
)
from .auth import LoginView, UserProfileView, PasswordResetRequestView, PasswordResetConfirmView

router = DefaultRouter()

# User Management
router.register(r'users', UserViewSet)
router.register(r'authors', AuthorViewSet)  # Public endpoint for author information

# Products and Solutions
router.register(r'products', ProductViewSet)
router.register(r'solutions', SolutionViewSet)

# News
router.register(r'news', NewsArticleViewSet)

# Contact Related
router.register(r'contact', ContactMessageViewSet)
router.register(r'contact-info', ContactInfoViewSet)
router.register(r'contact-descriptions', ContactDescriptionViewSet)

# Navigation and Hero Sections
router.register(r'navigation', NavigationItemViewSet)
router.register(r'hero-section', HeroSectionViewSet)
router.register(r'features', FeatureViewSet)

# Target Markets and Company Info
router.register(r'target-markets', TargetMarketViewSet)
router.register(r'why-choose-us', WhyChooseUsViewSet)
router.register(r'about-hero', AboutHeroViewSet)
router.register(r'company-overview', CompanyOverviewViewSet)
router.register(r'mission-vision', MissionVisionViewSet)

# Team and Partners
router.register(r'team-members', TeamMemberViewSet)
router.register(r'partners', PartnerViewSet)
router.register(r'partner-descriptions', PartnersDescriptionViewSet)
router.register(r'team-descriptions', TeamDescriptionViewSet)

# Site Settings
router.register(r'site-settings', SiteSettingsViewSet)

# Activity
router.register(r'activity', ActivityViewSet)

# Product Descriptions
router.register(r'product-descriptions', ProductDescriptionViewSet)

# Solution Descriptions
router.register(r'solution-descriptions', SolutionDescriptionViewSet)

# News Descriptions
router.register(r'news-descriptions', NewsDescriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
