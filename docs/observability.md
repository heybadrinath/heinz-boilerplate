# Observability Guide

This document explains how to set up and use the observability stack for the FastAPI backend.

## Overview

The observability stack includes:
- **OpenTelemetry**: Distributed tracing and metrics collection
- **Prometheus**: Metrics storage and alerting
- **Grafana**: Visualization and dashboards
- **Jaeger**: Distributed tracing visualization

## Architecture

```
FastAPI App → OpenTelemetry → OTEL Collector → Jaeger (traces) + Prometheus (metrics)
                                             ↓
                                           Grafana (visualization)
```

## Setup

### 1. Start Observability Services

```bash
docker-compose up -d otel-collector jaeger prometheus grafana
```

### 2. Verify Services

- Jaeger UI: http://localhost:16686
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

## Metrics

### Application Metrics

The FastAPI backend exposes the following metrics:

#### HTTP Metrics
- `http_requests_total`: Total HTTP requests counter
  - Labels: `method`, `endpoint`, `status_code`
- `http_request_duration_seconds`: HTTP request duration histogram
  - Labels: `method`, `endpoint`

#### Business Metrics
- `todo_created_total`: Total todos created counter

#### System Metrics
- Process CPU usage
- Memory usage
- Database connection pool metrics

### Accessing Metrics

1. **Raw metrics**: http://localhost:8000/metrics
2. **Prometheus UI**: http://localhost:9090
3. **Grafana dashboards**: http://localhost:3001

### Sample Prometheus Queries

```promql
# Request rate
rate(http_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])

# Todo creation rate
rate(todo_created_total[5m])
```

## Tracing

### How Tracing Works

The application automatically instruments:
- HTTP requests (FastAPI)
- Database queries (SQLAlchemy)
- Business logic spans

### Custom Spans

Add custom tracing to your code:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

async def my_function():
    with tracer.start_as_current_span("my_function") as span:
        span.set_attribute("custom.attribute", "value")
        # Your code here
```

### Viewing Traces

1. Go to Jaeger UI: http://localhost:16686
2. Select service: "fastapi-backend"
3. Click "Find Traces"

### Trace Examples

Common trace patterns you'll see:
- `http.request` → `service.todo.create` → `db.query.create`
- `http.request` → `service.auth.login` → `db.query.get_by_username`

## Grafana Dashboards

### Pre-configured Dashboard

The included dashboard shows:
- HTTP request rate and latency
- Error rates by status code
- Todo creation metrics
- System resource usage

### Importing Additional Dashboards

1. Go to Grafana: http://localhost:3001
2. Click "+" → Import
3. Use dashboard ID or JSON file

### Creating Custom Dashboards

1. Add new panel
2. Configure Prometheus data source
3. Write PromQL queries
4. Set visualization type

### Sample Dashboard JSON

The FastAPI dashboard is located at:
`observability/grafana/dashboards/fastapi-dashboard.json`

## Alerting

### Prometheus Alerting Rules

Create alerting rules in `observability/prometheus/alerts.yml`:

```yaml
groups:
  - name: fastapi-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
          description: Error rate is {{ $value }} errors per second

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High response time
          description: 95th percentile response time is {{ $value }} seconds
```

### Grafana Alerts

1. Go to Alerting → Alert Rules
2. Create new rule with PromQL query
3. Set evaluation interval and condition
4. Configure notification channels

## Troubleshooting

### Common Issues

1. **No traces appearing in Jaeger**
   - Check OTEL collector logs: `docker-compose logs otel-collector`
   - Verify OTEL_COLLECTOR_ENDPOINT in application config

2. **No metrics in Prometheus**
   - Check if `/metrics` endpoint is accessible
   - Verify Prometheus scrape configuration

3. **Grafana showing "No data"**
   - Check Prometheus data source configuration
   - Verify metric names in PromQL queries

### Debug Commands

```bash
# Check OTEL collector status
curl http://localhost:8888/debug/vars

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Test metrics endpoint
curl http://localhost:8000/metrics
```

### Log Analysis

View structured logs:
```bash
# Backend logs
docker-compose logs -f backend

# Filter for errors
docker-compose logs backend | grep ERROR

# Follow traces
docker-compose logs backend | grep request_id
```

## Performance Optimization

### Sampling

Configure trace sampling to reduce overhead:

```python
# In production, use lower sampling rates
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# Sample 10% of traces
sampler = TraceIdRatioBased(0.1)
```

### Metrics Optimization

- Use histogram buckets appropriate for your response times
- Avoid high-cardinality labels
- Aggregate metrics at collection time when possible

### Resource Limits

Monitor resource usage:
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## Production Considerations

### Security

- Use authentication for observability endpoints
- Scrub sensitive data from traces and logs
- Configure network policies

### Retention

- Set appropriate retention policies for metrics and traces
- Consider using remote storage for long-term retention

### Scaling

- Use horizontal pod autoscaling based on metrics
- Monitor resource usage of observability stack itself

### Backup

- Backup Grafana dashboards and configurations
- Export important Prometheus rules and configs