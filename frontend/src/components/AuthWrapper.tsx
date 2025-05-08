import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { RouterProvider } from 'react-router-dom';
import MaintenanceMode from './MaintenanceMode';
import { SiteSettings } from '@/lib/types';

interface AuthWrapperProps {
  router: any;
  showMaintenanceMode: boolean | undefined;
  settings: SiteSettings | null;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  router,
  showMaintenanceMode,
  settings
}) => {
  return (
    <AuthProvider>
      {showMaintenanceMode && settings ? (
        <MaintenanceMode settings={settings} />
      ) : (
        <RouterProvider router={router} />
      )}
    </AuthProvider>
  );
};

export default AuthWrapper;
