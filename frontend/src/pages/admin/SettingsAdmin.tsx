import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Lock, Globe, Loader2, Image, FileText } from "lucide-react";
import { toast } from "sonner";
import { settingsService } from "@/lib/api-service";
import { SiteSettings } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

const SettingsAdmin: React.FC = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('editor');

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    maintenanceMode: false,
    maintenanceMessage: 'Site is currently under maintenance. Please check back later.',
    siteName: 'MK Digital Security Solutions',
    siteDescription: 'Digital Security for a Connected World',
    contactEmail: 'contact@example.com',
    // Default security settings
    enableTwoFactorAuth: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expiryDays: 90
    },
    maxLoginAttempts: 5,
    sessionTimeout: 30, // 30 minutes
    allowedIPs: [],
    enableCaptcha: false,
    // Default logo settings
    logo: '/logo.svg',
    logoAlt: 'MK Digital Security Solutions',
    logoWidth: 150,
    logoHeight: 50,
    favicon: '/favicon.ico',
    // Default footer settings
    footerText: 'MK Digital Security Solutions provides comprehensive security solutions for businesses and organizations.',
    footerLinks: [
      { text: 'Privacy Policy', url: '/privacy-policy', category: 'legal', order: 1 },
      { text: 'Terms of Service', url: '/terms-of-service', category: 'legal', order: 2 },
      { text: 'Contact Us', url: '/contact', category: 'quick-links', order: 3 },
      { text: 'About Us', url: '/about', category: 'quick-links', order: 1 },
      { text: 'Products', url: '/products', category: 'quick-links', order: 2 },
      { text: 'Solutions', url: '/solutions', category: 'quick-links', order: 3 },
      { text: 'News', url: '/news', category: 'quick-links', order: 4 }
    ],
    copyrightText: '© 2023 MK Digital Security Solutions. All rights reserved.',
    showSocialLinks: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com/mkdss', icon: 'twitter' },
      { platform: 'linkedin', url: 'https://linkedin.com/company/mkdss', icon: 'linkedin' },
      { platform: 'facebook', url: 'https://facebook.com/mkdss', icon: 'facebook' },
      { platform: 'instagram', url: 'https://instagram.com/mkdss', icon: 'instagram' }
    ],
    // Default target markets
    targetMarkets: [
      { name: 'Government', url: '/solutions/government', order: 1 },
      { name: 'Banking and Finance', url: '/solutions/finance', order: 2 },
      { name: 'Telecommunication', url: '/solutions/telecom', order: 3 },
      { name: 'Enterprise', url: '/solutions/enterprise', order: 4 },
      { name: 'Education', url: '/solutions/education', order: 5 },
      { name: 'Transportation', url: '/solutions/transportation', order: 6 }
    ],
    // Default contact information
    contactInfo: {
      address: 'Addis Ababa, Ethiopia',
      phone: '+251 11 123 4567',
      email: 'info@mkdss.com',
      showGetInTouchButton: true
    }
  });

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsService.getAll();
        if (data && data.length > 0) {
          setSettings(data[0]);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log the settings being saved
      console.log('Saving settings:', JSON.stringify(settings, null, 2));

      // Create a copy of the settings to avoid reference issues
      const settingsToSave = JSON.parse(JSON.stringify(settings));

      let response;
      if (settingsToSave.id) {
        response = await settingsService.update(settingsToSave.id, settingsToSave);
      } else {
        response = await settingsService.create(settingsToSave);
      }

      console.log('Settings saved response:', response);
      setSettings(response);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceModeChange = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      maintenanceMode: checked
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNumberInputChange = (name: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handlePasswordPolicyChange = (field: string, value: any) => {
    setSettings(prev => {
      // Ensure passwordPolicy exists with default values if it doesn't
      const currentPolicy = prev.passwordPolicy || {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        expiryDays: 90
      };

      return {
        ...prev,
        passwordPolicy: {
          ...currentPolicy,
          [field]: value
        }
      };
    });
  };

  const handleAllowedIPsChange = (ips: string) => {
    const ipList = ips.split(',').map(ip => ip.trim()).filter(ip => ip !== '');
    setSettings(prev => ({
      ...prev,
      allowedIPs: ipList
    }));
  };

  // Handler for footer links
  const handleFooterLinksChange = (links: { text: string; url: string; category?: string; order?: number }[]) => {
    setSettings(prev => ({
      ...prev,
      footerLinks: links
    }));
  };

  // Handler for social links
  const handleSocialLinksChange = (links: { platform: string; url: string; icon?: string }[]) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: links
    }));
  };

  // Handler for file uploads
  const handleFileUpload = (name: string, file: File) => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append(name, file);

    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);

    // Update the settings with the URL
    setSettings(prev => ({
      ...prev,
      [name]: fileUrl
    }));

    // Show success toast
    toast.success(`File ${file.name} uploaded successfully!`);
  };

  return (
    <AdminLayout title="Settings">
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="site" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading settings...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="general-site-name">Site Name</Label>
                        <Input
                          id="general-site-name"
                          name="siteName"
                          placeholder="MK Digital Security Solutions"
                          value={settings.siteName || ''}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="general-site-description">Site Description</Label>
                        <Input
                          id="general-site-description"
                          name="siteDescription"
                          placeholder="Digital Security for a Connected World"
                          value={settings.siteDescription || ''}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="general-contact-email">Contact Email</Label>
                        <Input
                          id="general-contact-email"
                          name="contactEmail"
                          type="email"
                          placeholder="contact@example.com"
                          value={settings.contactEmail || ''}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                    {canEdit && (
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage your account settings and preferences.
                </p>
                <Button variant="outline">Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading security settings...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSettings} className="space-y-8">
                    {/* Authentication Settings */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Authentication</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="two-factor-auth" className="text-base">Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                              Require users to provide a verification code in addition to their password when logging in.
                            </p>
                          </div>
                          <Switch
                            id="two-factor-auth"
                            checked={settings.enableTwoFactorAuth || false}
                            onCheckedChange={(checked) => handleSwitchChange('enableTwoFactorAuth', checked)}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enable-captcha" className="text-base">CAPTCHA Protection</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable CAPTCHA on login and registration forms to prevent automated attacks.
                            </p>
                          </div>
                          <Switch
                            id="enable-captcha"
                            checked={settings.enableCaptcha || false}
                            onCheckedChange={(checked) => handleSwitchChange('enableCaptcha', checked)}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="max-login-attempts">Maximum Login Attempts</Label>
                          <Input
                            id="max-login-attempts"
                            type="number"
                            min="1"
                            max="10"
                            value={settings.maxLoginAttempts || 5}
                            onChange={(e) => handleNumberInputChange('maxLoginAttempts', e.target.value)}
                            disabled={!canEdit}
                          />
                          <p className="text-xs text-muted-foreground">
                            Number of failed login attempts before account is temporarily locked.
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                          <Input
                            id="session-timeout"
                            type="number"
                            min="5"
                            max="1440"
                            value={settings.sessionTimeout || 30}
                            onChange={(e) => handleNumberInputChange('sessionTimeout', e.target.value)}
                            disabled={!canEdit}
                          />
                          <p className="text-xs text-muted-foreground">
                            Time in minutes before an inactive user is automatically logged out.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Password Policy */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Password Policy</h3>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="min-password-length">Minimum Password Length</Label>
                          <Input
                            id="min-password-length"
                            type="number"
                            min="6"
                            max="32"
                            value={settings.passwordPolicy?.minLength || 8}
                            onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value, 10))}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="require-uppercase" className="text-base">Require Uppercase Letters</Label>
                          </div>
                          <Switch
                            id="require-uppercase"
                            checked={settings.passwordPolicy?.requireUppercase || false}
                            onCheckedChange={(checked) => handlePasswordPolicyChange('requireUppercase', checked)}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="require-lowercase" className="text-base">Require Lowercase Letters</Label>
                          </div>
                          <Switch
                            id="require-lowercase"
                            checked={settings.passwordPolicy?.requireLowercase || false}
                            onCheckedChange={(checked) => handlePasswordPolicyChange('requireLowercase', checked)}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="require-numbers" className="text-base">Require Numbers</Label>
                          </div>
                          <Switch
                            id="require-numbers"
                            checked={settings.passwordPolicy?.requireNumbers || false}
                            onCheckedChange={(checked) => handlePasswordPolicyChange('requireNumbers', checked)}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="require-special-chars" className="text-base">Require Special Characters</Label>
                          </div>
                          <Switch
                            id="require-special-chars"
                            checked={settings.passwordPolicy?.requireSpecialChars || false}
                            onCheckedChange={(checked) => handlePasswordPolicyChange('requireSpecialChars', checked)}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                          <Input
                            id="password-expiry"
                            type="number"
                            min="0"
                            max="365"
                            value={settings.passwordPolicy?.expiryDays || 90}
                            onChange={(e) => handlePasswordPolicyChange('expiryDays', parseInt(e.target.value, 10))}
                            disabled={!canEdit}
                          />
                          <p className="text-xs text-muted-foreground">
                            Number of days before users are required to change their password. Set to 0 to disable.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* IP Restrictions */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">IP Restrictions</h3>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                          <Textarea
                            id="allowed-ips"
                            placeholder="Enter comma-separated IP addresses (e.g., 192.168.1.1, 10.0.0.1)"
                            value={settings.allowedIPs?.join(', ') || ''}
                            onChange={(e) => handleAllowedIPsChange(e.target.value)}
                            disabled={!canEdit}
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Leave empty to allow all IP addresses. Enter specific IPs to restrict access.
                          </p>
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="mt-6"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Security Settings
                      </Button>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle>Logo Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading logo settings...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid gap-6">
                      {/* Regular Logo Preview */}
                      <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Regular Logo</h3>
                        <p className="text-sm text-muted-foreground mb-4">Used in the navbar and login page</p>
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                          <img
                            src={settings.logo || '/placeholder.svg'}
                            alt={settings.logoAlt || 'Logo'}
                            className="max-w-[200px] max-h-[100px] object-contain"
                          />
                        </div>
                        <div className="w-full">
                          <Label htmlFor="logo-upload">Upload Regular Logo</Label>
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('logo', e.target.files[0]);
                              }
                            }}
                            disabled={!canEdit}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      {/* White Logo Preview */}
                      <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                        <h3 className="text-lg font-medium mb-4">White Logo</h3>
                        <p className="text-sm text-muted-foreground mb-4">Used in the dashboard and footer</p>
                        <div className="bg-gray-800 p-4 rounded-lg mb-4">
                          <img
                            src={settings.logoWhite || '/placeholder-white.svg'}
                            alt={settings.logoAlt || 'White Logo'}
                            className="max-w-[200px] max-h-[100px] object-contain"
                          />
                        </div>
                        <div className="w-full">
                          <Label htmlFor="logo-white-upload">Upload White Logo</Label>
                          <Input
                            id="logo-white-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('logoWhite', e.target.files[0]);
                              }
                            }}
                            disabled={!canEdit}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      {/* Logo Settings */}
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="logo-alt">Logo Alt Text</Label>
                          <Input
                            id="logo-alt"
                            name="logoAlt"
                            placeholder="MK Digital Security Solutions"
                            value={settings.logoAlt || ''}
                            onChange={handleInputChange}
                            disabled={!canEdit}
                          />
                          <p className="text-xs text-muted-foreground">
                            Alternative text for the logo image for accessibility.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="logo-width">Logo Width (px)</Label>
                            <Input
                              id="logo-width"
                              type="number"
                              min="50"
                              max="500"
                              value={settings.logoWidth || 150}
                              onChange={(e) => handleNumberInputChange('logoWidth', e.target.value)}
                              disabled={!canEdit}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="logo-height">Logo Height (px)</Label>
                            <Input
                              id="logo-height"
                              type="number"
                              min="20"
                              max="200"
                              value={settings.logoHeight || 50}
                              onChange={(e) => handleNumberInputChange('logoHeight', e.target.value)}
                              disabled={!canEdit}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Favicon */}
                      <div className="grid gap-4">
                        <h3 className="text-lg font-medium">Favicon</h3>
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <img
                              src={settings.favicon || '/favicon.ico'}
                              alt="Favicon"
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="favicon-upload">Upload New Favicon</Label>
                            <Input
                              id="favicon-upload"
                              type="file"
                              accept="image/x-icon,image/png"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload('favicon', e.target.files[0]);
                                }
                              }}
                              disabled={!canEdit}
                              className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Recommended format: .ico or .png, 32x32 pixels.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="mt-6"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Logo Settings
                      </Button>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading footer settings...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid gap-6">
                      {/* Footer Text */}
                      <div className="grid gap-2">
                        <Label htmlFor="footer-text">Footer Text</Label>
                        <Textarea
                          id="footer-text"
                          name="footerText"
                          placeholder="Company description or tagline"
                          value={settings.footerText || ''}
                          onChange={handleInputChange}
                          rows={3}
                          disabled={!canEdit}
                        />
                      </div>

                      {/* Copyright Text */}
                      <div className="grid gap-2">
                        <Label htmlFor="copyright-text">Copyright Text</Label>
                        <Input
                          id="copyright-text"
                          name="copyrightText"
                          placeholder="© 2023 MK Digital Security Solutions. All rights reserved."
                          value={settings.copyrightText || ''}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                      </div>

                      {/* Footer Links - Tabs for different categories */}
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">Footer Links</Label>
                        </div>

                        <Tabs defaultValue="all">
                          <TabsList className="mb-4">
                            <TabsTrigger value="all">All Links</TabsTrigger>
                            <TabsTrigger value="quick-links">Quick Links</TabsTrigger>
                            <TabsTrigger value="legal">Legal</TabsTrigger>
                            <TabsTrigger value="other">Other</TabsTrigger>
                          </TabsList>

                          {/* All Links Tab */}
                          <TabsContent value="all">
                            {settings.footerLinks?.map((link, index) => (
                              <div key={index} className="grid grid-cols-7 gap-4 items-center mb-4">
                                <div className="col-span-2">
                                  <Input
                                    placeholder="Link Text"
                                    value={link.text}
                                    onChange={(e) => {
                                      const updatedLinks = [...(settings.footerLinks || [])];
                                      updatedLinks[index] = { ...link, text: e.target.value };
                                      handleFooterLinksChange(updatedLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => {
                                      const updatedLinks = [...(settings.footerLinks || [])];
                                      updatedLinks[index] = { ...link, url: e.target.value };
                                      handleFooterLinksChange(updatedLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Select
                                    value={link.category || 'other'}
                                    onValueChange={(value) => {
                                      const updatedLinks = [...(settings.footerLinks || [])];
                                      updatedLinks[index] = { ...link, category: value };
                                      handleFooterLinksChange(updatedLinks);
                                    }}
                                    disabled={!canEdit}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="quick-links">Quick Links</SelectItem>
                                      <SelectItem value="legal">Legal</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-1">
                                  <Input
                                    type="number"
                                    placeholder="Order"
                                    value={link.order || 0}
                                    onChange={(e) => {
                                      const updatedLinks = [...(settings.footerLinks || [])];
                                      updatedLinks[index] = { ...link, order: parseInt(e.target.value) };
                                      handleFooterLinksChange(updatedLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                {canEdit && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const updatedLinks = [...(settings.footerLinks || [])];
                                      updatedLinks.splice(index, 1);
                                      handleFooterLinksChange(updatedLinks);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}

                            {canEdit && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const updatedLinks = [...(settings.footerLinks || [])];
                                  updatedLinks.push({ text: '', url: '', category: 'other', order: 0 });
                                  handleFooterLinksChange(updatedLinks);
                                }}
                              >
                                Add Footer Link
                              </Button>
                            )}
                          </TabsContent>

                          {/* Quick Links Tab */}
                          <TabsContent value="quick-links">
                            {settings.footerLinks?.filter(link => link.category === 'quick-links').map((link, index) => (
                              <div key={index} className="grid grid-cols-6 gap-4 items-center mb-4">
                                <div className="col-span-2">
                                  <Input
                                    placeholder="Link Text"
                                    value={link.text}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, text: e.target.value };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, url: e.target.value };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Input
                                    type="number"
                                    placeholder="Order"
                                    value={link.order || 0}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, order: parseInt(e.target.value) };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                {canEdit && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks.splice(linkIndex, 1);
                                      handleFooterLinksChange(allLinks);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}

                            {canEdit && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const updatedLinks = [...(settings.footerLinks || [])];
                                  updatedLinks.push({ text: '', url: '', category: 'quick-links', order: 0 });
                                  handleFooterLinksChange(updatedLinks);
                                }}
                              >
                                Add Quick Link
                              </Button>
                            )}
                          </TabsContent>

                          {/* Legal Tab */}
                          <TabsContent value="legal">
                            {settings.footerLinks?.filter(link => link.category === 'legal').map((link, index) => (
                              <div key={index} className="grid grid-cols-6 gap-4 items-center mb-4">
                                <div className="col-span-2">
                                  <Input
                                    placeholder="Link Text"
                                    value={link.text}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, text: e.target.value };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, url: e.target.value };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Input
                                    type="number"
                                    placeholder="Order"
                                    value={link.order || 0}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, order: parseInt(e.target.value) };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                {canEdit && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks.splice(linkIndex, 1);
                                      handleFooterLinksChange(allLinks);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}

                            {canEdit && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const updatedLinks = [...(settings.footerLinks || [])];
                                  updatedLinks.push({ text: '', url: '', category: 'legal', order: 0 });
                                  handleFooterLinksChange(updatedLinks);
                                }}
                              >
                                Add Legal Link
                              </Button>
                            )}
                          </TabsContent>

                          {/* Other Tab */}
                          <TabsContent value="other">
                            {settings.footerLinks?.filter(link => link.category !== 'quick-links' && link.category !== 'legal').map((link, index) => (
                              <div key={index} className="grid grid-cols-6 gap-4 items-center mb-4">
                                <div className="col-span-2">
                                  <Input
                                    placeholder="Link Text"
                                    value={link.text}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, text: e.target.value };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, url: e.target.value };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Input
                                    type="number"
                                    placeholder="Order"
                                    value={link.order || 0}
                                    onChange={(e) => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks[linkIndex] = { ...link, order: parseInt(e.target.value) };
                                      handleFooterLinksChange(allLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                {canEdit && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const allLinks = [...(settings.footerLinks || [])];
                                      const linkIndex = allLinks.findIndex(l => l === link);
                                      allLinks.splice(linkIndex, 1);
                                      handleFooterLinksChange(allLinks);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}

                            {canEdit && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const updatedLinks = [...(settings.footerLinks || [])];
                                  updatedLinks.push({ text: '', url: '', category: 'other', order: 0 });
                                  handleFooterLinksChange(updatedLinks);
                                }}
                              >
                                Add Other Link
                              </Button>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Social Links */}
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="show-social-links" className="text-base">Show Social Links</Label>
                            <p className="text-sm text-muted-foreground">
                              Display social media links in the footer.
                            </p>
                          </div>
                          <Switch
                            id="show-social-links"
                            checked={settings.showSocialLinks || false}
                            onCheckedChange={(checked) => handleSwitchChange('showSocialLinks', checked)}
                            disabled={!canEdit}
                          />
                        </div>

                        {settings.showSocialLinks && (
                          <div className="space-y-4">
                            {settings.socialLinks?.map((link, index) => (
                              <div key={index} className="grid grid-cols-7 gap-4 items-center">
                                <div className="col-span-2">
                                  <Input
                                    placeholder="Platform (e.g., Twitter)"
                                    value={link.platform}
                                    onChange={(e) => {
                                      const updatedLinks = [...(settings.socialLinks || [])];
                                      updatedLinks[index] = { ...link, platform: e.target.value };
                                      handleSocialLinksChange(updatedLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    placeholder="URL"
                                    value={link.url}
                                    onChange={(e) => {
                                      const updatedLinks = [...(settings.socialLinks || [])];
                                      updatedLinks[index] = { ...link, url: e.target.value };
                                      handleSocialLinksChange(updatedLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Input
                                    placeholder="Icon"
                                    value={link.icon || ''}
                                    onChange={(e) => {
                                      const updatedLinks = [...(settings.socialLinks || [])];
                                      updatedLinks[index] = { ...link, icon: e.target.value };
                                      handleSocialLinksChange(updatedLinks);
                                    }}
                                    disabled={!canEdit}
                                  />
                                </div>
                                {canEdit && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const updatedLinks = [...(settings.socialLinks || [])];
                                      updatedLinks.splice(index, 1);
                                      handleSocialLinksChange(updatedLinks);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}

                            {canEdit && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const updatedLinks = [...(settings.socialLinks || [])];
                                  updatedLinks.push({ platform: '', url: '', icon: '' });
                                  handleSocialLinksChange(updatedLinks);
                                }}
                              >
                                Add Social Link
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Target Markets */}
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">Target Markets</Label>
                        </div>

                        {settings.targetMarkets?.map((market, index) => (
                          <div key={index} className="grid grid-cols-6 gap-4 items-center">
                            <div className="col-span-2">
                              <Input
                                placeholder="Market Name"
                                value={market.name}
                                onChange={(e) => {
                                  const updatedMarkets = [...(settings.targetMarkets || [])];
                                  updatedMarkets[index] = { ...market, name: e.target.value };
                                  setSettings(prev => ({ ...prev, targetMarkets: updatedMarkets }));
                                }}
                                disabled={!canEdit}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                placeholder="URL (optional)"
                                value={market.url || ''}
                                onChange={(e) => {
                                  const updatedMarkets = [...(settings.targetMarkets || [])];
                                  updatedMarkets[index] = { ...market, url: e.target.value };
                                  setSettings(prev => ({ ...prev, targetMarkets: updatedMarkets }));
                                }}
                                disabled={!canEdit}
                              />
                            </div>
                            <div className="col-span-1">
                              <Input
                                type="number"
                                placeholder="Order"
                                value={market.order || 0}
                                onChange={(e) => {
                                  const updatedMarkets = [...(settings.targetMarkets || [])];
                                  updatedMarkets[index] = { ...market, order: parseInt(e.target.value) };
                                  setSettings(prev => ({ ...prev, targetMarkets: updatedMarkets }));
                                }}
                                disabled={!canEdit}
                              />
                            </div>
                            {canEdit && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const updatedMarkets = [...(settings.targetMarkets || [])];
                                  updatedMarkets.splice(index, 1);
                                  setSettings(prev => ({ ...prev, targetMarkets: updatedMarkets }));
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}

                        {canEdit && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const updatedMarkets = [...(settings.targetMarkets || [])];
                              updatedMarkets.push({ name: '', order: 0 });
                              setSettings(prev => ({ ...prev, targetMarkets: updatedMarkets }));
                            }}
                          >
                            Add Target Market
                          </Button>
                        )}
                      </div>

                      {/* Contact Information */}
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">Contact Information</Label>
                        </div>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="contact-address">Address</Label>
                            <Textarea
                              id="contact-address"
                              placeholder="Enter your company address"
                              value={settings.contactInfo?.address || ''}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  contactInfo: {
                                    ...prev.contactInfo,
                                    address: e.target.value
                                  }
                                }));
                              }}
                              disabled={!canEdit}
                              rows={2}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="contact-phone">Phone</Label>
                            <Input
                              id="contact-phone"
                              placeholder="+251 11 123 4567"
                              value={settings.contactInfo?.phone || ''}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  contactInfo: {
                                    ...prev.contactInfo,
                                    phone: e.target.value
                                  }
                                }));
                              }}
                              disabled={!canEdit}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="contact-email">Email</Label>
                            <Input
                              id="contact-email"
                              type="email"
                              placeholder="info@example.com"
                              value={settings.contactInfo?.email || ''}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  contactInfo: {
                                    ...prev.contactInfo,
                                    email: e.target.value
                                  }
                                }));
                              }}
                              disabled={!canEdit}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="show-get-in-touch" className="text-base">Show "Get In Touch" Button</Label>
                              <p className="text-sm text-muted-foreground">
                                Display a call-to-action button in the footer.
                              </p>
                            </div>
                            <Switch
                              id="show-get-in-touch"
                              checked={settings.contactInfo?.showGetInTouchButton || false}
                              onCheckedChange={(checked) => {
                                setSettings(prev => ({
                                  ...prev,
                                  contactInfo: {
                                    ...prev.contactInfo,
                                    showGetInTouchButton: checked
                                  }
                                }));
                              }}
                              disabled={!canEdit}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="mt-6"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Footer Settings
                      </Button>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="site">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading settings...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSettings}>
                    <p className="text-muted-foreground mb-4">
                      Manage your site settings and preferences.
                    </p>
                    <div className="grid gap-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="maintenance-mode" className="text-base">Maintenance Mode</Label>
                            <p className="text-sm text-muted-foreground">
                              When enabled, the site will display a maintenance message to visitors.
                            </p>
                          </div>
                          <Switch
                            id="maintenance-mode"
                            checked={settings.maintenanceMode}
                            onCheckedChange={handleMaintenanceModeChange}
                            disabled={!canEdit}
                          />
                        </div>

                        {settings.maintenanceMode && (
                          <div className="grid gap-2">
                            <Label htmlFor="maintenance-message">Maintenance Message</Label>
                            <Textarea
                              id="maintenance-message"
                              name="maintenanceMessage"
                              placeholder="Site is currently under maintenance. Please check back later."
                              value={settings.maintenanceMessage || ''}
                              onChange={handleInputChange}
                              rows={3}
                              disabled={!canEdit}
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="site-name">Site Name</Label>
                        <Input
                          id="site-name"
                          name="siteName"
                          placeholder="MK Digital Security Solutions"
                          value={settings.siteName || ''}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="site-description">Site Description</Label>
                        <Input
                          id="site-description"
                          name="siteDescription"
                          placeholder="Digital Security for a Connected World"
                          value={settings.siteDescription || ''}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input
                          id="contact-email"
                          name="contactEmail"
                          type="email"
                          placeholder="contact@example.com"
                          value={settings.contactEmail || ''}
                          onChange={handleInputChange}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    {canEdit && (
                      <Button
                        className="mt-6"
                        type="submit"
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsAdmin;
