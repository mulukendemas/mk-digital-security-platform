import React from 'react';
import { SiteSettings } from '@/lib/types';

interface MaintenanceModeProps {
  settings: SiteSettings;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ settings }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {settings.siteName || 'Site'} is Under Maintenance
        </h1>
        <p className="text-gray-600 mb-6">
          {settings.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'}
        </p>
        <div className="text-sm text-gray-500">
          If you need immediate assistance, please contact us at{' '}
          <a
            href={`mailto:${settings.contactEmail || 'contact@example.com'}`}
            className="text-blue-600 hover:underline"
          >
            {settings.contactEmail || 'contact@example.com'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
