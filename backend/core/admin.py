from django.contrib import admin
from .models import ContactMessage, ContactInfo, ContactDescription

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'read', 'created_at')
    list_filter = ('read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'order', 'created_at')
    list_editable = ('order',)
    search_fields = ('title', 'details')
    ordering = ('order',)

@admin.register(ContactDescription)
class ContactDescriptionAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
