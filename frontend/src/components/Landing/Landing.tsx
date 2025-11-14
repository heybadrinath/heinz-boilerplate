import React from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import styles from './Landing.module.css';

export interface LandingProps {
  /** API health status */
  apiStatus?: 'checking' | 'healthy' | 'unhealthy';
  /** CSS class name */
  className?: string;
  /** Observability service statuses */
  serviceStatuses?: {
    grafana?: 'checking' | 'healthy' | 'unhealthy';
    prometheus?: 'checking' | 'healthy' | 'unhealthy';
    jaeger?: 'checking' | 'healthy' | 'unhealthy';
  };
}

export const Landing: React.FC<LandingProps> = ({
  apiStatus = 'checking',
  className = '',
  serviceStatuses = {},
}) => {
  const containerClasses = [styles.container, className]
    .filter(Boolean)
    .join(' ');

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'healthy':
        return '#10b981';
      case 'unhealthy':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'healthy':
        return 'Backend API is healthy';
      case 'unhealthy':
        return 'Backend API is unavailable';
      default:
        return 'Checking backend status...';
    }
  };

  const getColor = (status?: 'checking' | 'healthy' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'unhealthy':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={containerClasses}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Heinz Boilerplate</h1>
        <p className={styles.subtitle}>
          Production-ready FastAPI + Next.js boilerplate with comprehensive
          observability stack for rapid application development.
        </p>
        <div className={styles.status}>
          <span
            className={styles.statusDot}
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
      </div>

      <div className={styles.content}>
        <Card title="Service Status & Quick Access" variant="elevated" padding="large">
          <div className={styles.features}>
            <div className={styles.featureSection}>
              <h4 className={styles.featureTitle}>Backend Services</h4>
              <div className={styles.serviceStatus}>
                <div className={styles.serviceItem}>
                  <span
                    className={styles.serviceDot}
                    style={{ backgroundColor: getStatusColor() }}
                  />
                  <span>FastAPI Backend: {getStatusText()}</span>
                </div>
              </div>
            </div>

            <div className={styles.featureSection}>
              <h4 className={styles.featureTitle}>Monitoring Stack</h4>
              <div className={styles.serviceStatus}>
                <div className={styles.serviceItem}>
                  <span
                    className={styles.serviceDot}
                    style={{ backgroundColor: getColor(serviceStatuses.grafana) }}
                  />
                  <span>Grafana: {serviceStatuses.grafana === 'healthy' ? 'Running' : serviceStatuses.grafana === 'unhealthy' ? 'Unavailable' : 'Checking...'}</span>
                </div>
                <div className={styles.serviceItem}>
                  <span
                    className={styles.serviceDot}
                    style={{ backgroundColor: getColor(serviceStatuses.prometheus) }}
                  />
                  <span>Prometheus: {serviceStatuses.prometheus === 'healthy' ? 'Running' : serviceStatuses.prometheus === 'unhealthy' ? 'Unavailable' : 'Checking...'}</span>
                </div>
                <div className={styles.serviceItem}>
                  <span
                    className={styles.serviceDot}
                    style={{ backgroundColor: getColor(serviceStatuses.jaeger) }}
                  />
                  <span>Jaeger: {serviceStatuses.jaeger === 'healthy' ? 'Running' : serviceStatuses.jaeger === 'unhealthy' ? 'Unavailable' : 'Checking...'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button 
              variant="primary" 
              size="large"
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`, '_blank')}
            >
              API Docs
            </Button>
            <Button 
              variant="outline" 
              size="large"
              onClick={() => window.open(process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001', '_blank')}
            >
              Grafana
            </Button>
            <Button 
              variant="outline" 
              size="large"
              onClick={() => window.open(process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090', '_blank')}
            >
              Prometheus
            </Button>
            <Button 
              variant="outline" 
              size="large"
              onClick={() => window.open(process.env.NEXT_PUBLIC_JAEGER_URL || 'http://localhost:16686', '_blank')}
            >
              Jaeger
            </Button>
            <Button 
              variant="secondary" 
              size="large"
              onClick={() => window.open('/test-results', '_blank')}
            >
              Test Results
            </Button>
          </div>
        </Card>

        {/* Rich details derived from README */}
        <Card title="Quick Start" variant="outlined" padding="large">
          <div style={{ display: 'grid', gap: 10 }}>
            <div><strong>Full Stack (Dev):</strong> <code>./start-app.sh dev</code> or <code>.\\start-app.ps1 -Dev</code></div>
            <div><strong>Backend Only:</strong> <code>./scripts/start-backend-dev.sh</code> or <code>scripts\\start-backend-dev.ps1</code></div>
            <div><strong>Skip Docker:</strong> <code>./scripts/bootstrap-backend.sh --skip-docker</code> or <code>scripts\\bootstrap-backend.ps1 -SkipDocker</code></div>
          </div>
        </Card>

        <Card title="Service Endpoints" variant="outlined" padding="large">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Backend API: <code>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</code></li>
            <li>API Docs: <code>{`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}</code></li>
            <li>Grafana: <code>{process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001'}</code></li>
            <li>Prometheus: <code>{process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090'}</code></li>
            <li>Jaeger: <code>{process.env.NEXT_PUBLIC_JAEGER_URL || 'http://localhost:16686'}</code></li>
          </ul>
        </Card>

        <Card title="Features Overview" variant="outlined" padding="large">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
            <div>
              <h4 style={{ margin: '0 0 6px' }}>Backend API</h4>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>FastAPI with async SQLAlchemy</li>
                <li>JWT auth (access/refresh)</li>
                <li>Alembic migrations</li>
                <li>Pydantic validation</li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px' }}>Observability</h4>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Prometheus metrics (/metrics)</li>
                <li>Grafana dashboards</li>
                <li>Jaeger tracing</li>
                <li>Structured JSON logs</li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px' }}>Security</h4>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>JWT tokens</li>
                <li>Password hashing (bcrypt)</li>
                <li>CORS configuration</li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px' }}>Testing</h4>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Unit & integration tests</li>
                <li>E2E tests (Playwright)</li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: '0 0 6px' }}>Deployment</h4>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Docker & Compose</li>
                <li>Helm charts</li>
                <li>CI/CD ready</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Architecture" variant="outlined" padding="large">
          <p style={{ marginTop: 0 }}>High-level architecture of the stack:</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Next.js frontend (this app)</li>
            <li>FastAPI backend</li>
            <li>PostgreSQL database</li>
            <li>Redis cache</li>
            <li>Observability: Prometheus, Grafana, Jaeger</li>
          </ul>
        </Card>

        <Card title="Monitoring Access" variant="outlined" padding="large">
          <p style={{ marginTop: 0 }}>Use these links to access monitoring tools:</p>
          <div className={styles.actions}>
            <Button variant="outline" onClick={() => window.open(process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001', '_blank')}>Open Grafana</Button>
            <Button variant="outline" onClick={() => window.open(process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090', '_blank')}>Open Prometheus</Button>
            <Button variant="outline" onClick={() => window.open(process.env.NEXT_PUBLIC_JAEGER_URL || 'http://localhost:16686', '_blank')}>Open Jaeger</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};