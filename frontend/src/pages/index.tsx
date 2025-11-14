import React, { useState, useEffect } from 'react';
import { Nav, Landing } from '@/components';

type ServiceStatus = 'checking' | 'healthy' | 'unhealthy';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<ServiceStatus>('checking');
  const [serviceStatuses, setServiceStatuses] = useState({
    grafana: 'checking' as ServiceStatus,
    prometheus: 'checking' as ServiceStatus,
    jaeger: 'checking' as ServiceStatus,
  });

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
          setApiStatus(data.status === 'ok' ? 'healthy' : 'unhealthy');
        } else {
          setApiStatus('unhealthy');
        }
      } catch (error) {
        console.error('Failed to check API health:', error);
        setApiStatus('unhealthy');
      }
    };

    const checkService = async (url: string): Promise<ServiceStatus> => {
      try {
        // Try to reach the service without CORS preflight. If the fetch resolves, assume healthy.
        await fetch(url, { method: 'GET', mode: 'no-cors' });
        return 'healthy';
      } catch (error) {
        console.error(`Failed to check service at ${url}:`, error);
        return 'unhealthy';
      }
    };

    const checkAllServices = async () => {
      // Check API health
      await checkApiHealth();

      // Check monitoring services directly
      const grafanaUrl = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001';
      const prometheusUrl = process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090';
      const jaegerUrl = process.env.NEXT_PUBLIC_JAEGER_URL || 'http://localhost:16686';
      const [grafanaStatus, prometheusStatus, jaegerStatus] = await Promise.all([
        checkService(grafanaUrl),
        checkService(prometheusUrl),
        checkService(jaegerUrl),
      ]);

      setServiceStatuses({
        grafana: grafanaStatus,
        prometheus: prometheusStatus,
        jaeger: jaegerStatus,
      });
    };

    checkAllServices();

    // Check all services every 30 seconds
    const interval = setInterval(checkAllServices, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Nav 
        items={[
          { label: 'API Docs', href: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`, active: false },
          { label: 'Grafana', href: process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001', active: false },
          { label: 'Prometheus', href: process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090', active: false },
          { label: 'Jaeger', href: process.env.NEXT_PUBLIC_JAEGER_URL || 'http://localhost:16686', active: false },
          { label: 'Test Results', href: '/test-results', active: false },
        ]} 
      />
      <Landing apiStatus={apiStatus} serviceStatuses={serviceStatuses} />
    </div>
  );
}