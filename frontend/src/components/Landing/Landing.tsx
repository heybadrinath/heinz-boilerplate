import React from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import styles from './Landing.module.css';

export interface LandingProps {
  /** API health status */
  apiStatus?: 'checking' | 'healthy' | 'unhealthy';
  /** CSS class name */
  className?: string;
}

export const Landing: React.FC<LandingProps> = ({
  apiStatus = 'checking',
  className = '',
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
        <Card title="Tech Stack Overview" variant="elevated" padding="large">
          <div className={styles.features}>
            <div className={styles.featureSection}>
              <h4 className={styles.featureTitle}>Backend Stack</h4>
              <ul className={styles.featureList}>
                <li>FastAPI with async/await support</li>
                <li>PostgreSQL with SQLAlchemy ORM</li>
                <li>Redis for caching and sessions</li>
                <li>Alembic for database migrations</li>
                <li>JWT authentication & authorization</li>
              </ul>
            </div>

            <div className={styles.featureSection}>
              <h4 className={styles.featureTitle}>Frontend Stack</h4>
              <ul className={styles.featureList}>
                <li>Next.js 14 with TypeScript</li>
                <li>Component library with Storybook</li>
                <li>Jest + React Testing Library</li>
                <li>PWA support with service worker</li>
                <li>CSS Modules for styling</li>
              </ul>
            </div>

            <div className={styles.featureSection}>
              <h4 className={styles.featureTitle}>Observability</h4>
              <ul className={styles.featureList}>
                <li>OpenTelemetry for distributed tracing</li>
                <li>Jaeger for trace visualization</li>
                <li>Prometheus metrics collection</li>
                <li>Grafana dashboards</li>
                <li>Structured logging</li>
              </ul>
            </div>

            <div className={styles.featureSection}>
              <h4 className={styles.featureTitle}>Development & Testing</h4>
              <ul className={styles.featureList}>
                <li>Docker Compose development setup</li>
                <li>Playwright end-to-end testing</li>
                <li>Code quality with SonarQube</li>
                <li>ESLint + Prettier configuration</li>
                <li>Kubernetes deployment ready</li>
              </ul>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" size="large">
              Get Started
            </Button>
            <Button variant="outline" size="large">
              View Documentation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};