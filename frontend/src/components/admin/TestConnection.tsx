import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-adapter';

const TestConnection: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      // Try to ping the backend
      const response = await apiClient.get('/');
      setResult(`Connection successful! Status: ${response.status}`);
    } catch (error: any) {
      console.error('Connection test error:', error);
      
      if (error.response) {
        setResult(`Connection reached server but got error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setResult('Connection failed: No response received from server. Server might be down or CORS issues.');
      } else {
        setResult(`Connection setup error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-2">Backend Connection Test</h3>
      <Button 
        onClick={testBackendConnection}
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>
      {result && (
        <div className="p-3 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
};

export default TestConnection;
