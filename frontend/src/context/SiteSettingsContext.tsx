import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '@/lib/api-service';
import { SiteSettings } from '@/lib/types';

// Define the context type
interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: Error | null;
  refetchSettings: () => Promise<void>;
}

// Create the context with a default value
const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: null,
  loading: true,
  error: null,
  refetchSettings: async () => {},
});

// Create a hook to use the context
export const useSiteSettings = () => useContext(SiteSettingsContext);

// Create the provider component
interface SiteSettingsProviderProps {
  children: ReactNode;
}

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      if (data && data.length > 0) {
        setSettings(data[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Provide the context value
  const value = {
    settings,
    loading,
    error,
    refetchSettings: fetchSettings,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
