import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/lib/api-service";
import { defaultPasswordPolicy, PasswordPolicy } from "@/lib/password-validator";

/**
 * Hook to fetch the password policy from site settings
 * @returns The password policy from site settings or a default policy if not available
 */
export function usePasswordPolicy() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      try {
        // Get the first site settings object (there should only be one)
        const response = await settingsService.getAll();
        return response[0];
      } catch (error) {
        console.error("Error fetching site settings:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract password policy from settings or use default
  const passwordPolicy: PasswordPolicy = settings?.passwordPolicy || defaultPasswordPolicy;

  return {
    passwordPolicy,
    isLoading,
    error,
  };
}
