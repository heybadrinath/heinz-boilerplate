import React, { useState, useEffect } from 'react';
import { Nav, Landing } from '@/components';

type ApiStatus = 'checking' | 'healthy' | 'unhealthy';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApiStatus(data.status === 'healthy' ? 'healthy' : 'unhealthy');
        } else {
          setApiStatus('unhealthy');
        }
      } catch (error) {
        console.error('Failed to check API health:', error);
        setApiStatus('unhealthy');
      }
    };

    checkApiHealth();
    
    // Check API health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Nav 
        items={[
          { label: 'Documentation', href: '/docs', active: false },
          { label: 'API', href: '/api', active: false },
          { label: 'GitHub', href: '#', active: false },
        ]} 
      />
      <Landing apiStatus={apiStatus} />
    </div>
  );
}