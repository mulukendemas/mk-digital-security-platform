
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useState, useEffect } from "react";
import { settingsService } from "@/lib/api-service";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg" | "xl" |  "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
}

export function Logo_white({ className, variant = "default", size = "7xl" }: LogoProps) {
  // Use both the context and direct API call as a fallback
  const { settings: contextSettings } = useSiteSettings();
  const [settings, setSettings] = useState(contextSettings);
  const [logoUrl, setLogoUrl] = useState<string>("/images/mkdss_white_logo.png"); // Default white logo
  const [logoAlt, setLogoAlt] = useState<string>("MK DSS Logo"); // Default alt text

  // Fetch settings directly if not available from context
  useEffect(() => {
    const fetchSettings = async () => {
      if (!contextSettings) {
        try {
          const data = await settingsService.getAll();
          if (data && data.length > 0) {
            setSettings(data[0]);
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      } else {
        setSettings(contextSettings);
      }
    };

    fetchSettings();
  }, [contextSettings]);

  // Update logo when settings change
  useEffect(() => {
    // For white logo, we'll use the logoWhite field with a different default
    if (settings?.logoWhite) {
      // Check if the logo is a full URL or a relative path
      if (settings.logoWhite.startsWith('http')) {
        setLogoUrl(settings.logoWhite);
      } else {
        // Assume it's a relative path
        setLogoUrl(settings.logoWhite);
      }
    } else if (settings?.logo) {
      // Fallback to regular logo if white logo is not set
      if (settings.logo.startsWith('http')) {
        setLogoUrl(settings.logo);
      } else {
        setLogoUrl(settings.logo);
      }
    }

    if (settings?.logoAlt) {
      setLogoAlt(settings.logoAlt);
    }
  }, [settings]);

  const sizeClasses = {
    sm: "h-12",
    md: "h-16",
    lg: "h-20",
    xl: "h-24",
    "2xl": "h-32",    // 2x large
    "3xl": "h-40",
    "4xl": "h-48",
    "5xl": "h-56",
    "6xl": "h-64",
    "7xl": "h-72",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center">
        {/* Main logo image */}
        <img
          src={logoUrl}
          alt={logoAlt}
          className={cn(sizeClasses[size])}
          style={{
            width: 'auto', // Let width adjust automatically based on height
            height: settings?.logoHeight ? `${settings.logoHeight}px` : sizeClasses[size],
            objectFit: 'contain',
            maxWidth: '100%', // Ensure it doesn't overflow its container
            minHeight: '3rem' // Ensure a minimum height
          }}
          onError={(e) => {
            // Fallback to a known working image
            e.currentTarget.src = '/images/mkdss_white_logo.png';
          }}
        />

        {/* Debug info removed */}
      </div>
    </div>
  );
}
