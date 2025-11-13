# Secret Management Guide

This document provides guidance on managing secrets securely in the FastAPI backend boilerplate.

## Overview

Secrets include:
- Database passwords
- JWT signing keys
- API keys for external services
- Encryption keys
- TLS certificates

## Development Environment

### Using .env Files

For local development, use `.env` files:

```bash
# .env (never commit to version control)
JWT_SECRET_KEY=super-secret-key-change-in-production
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/db
REDIS_URL=redis://localhost:6379
```

### Best Practices for Development

1. **Use .env.example**: Provide a template without real secrets
2. **Add .env to .gitignore**: Prevent accidental commits
3. **Use strong defaults**: Generate secure random values
4. **Document requirements**: Explain what each secret is for

### Generating Secure Secrets

```python
# Generate a random JWT secret
import secrets
jwt_secret = secrets.token_urlsafe(32)
print(f"JWT_SECRET_KEY={jwt_secret}")

# Or use openssl
# openssl rand -hex 32
```

## Production Environment

### Environment Variables

Set secrets as environment variables in production:

```bash
export JWT_SECRET_KEY="your-production-secret"
export DATABASE_URL="postgresql://user:pass@prod-db:5432/db"
```

### Container Secrets

#### Docker Secrets (Docker Swarm)

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    secrets:
      - jwt_secret
      - db_password
    environment:
      - JWT_SECRET_KEY_FILE=/run/secrets/jwt_secret
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true
```

#### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  db-password: <base64-encoded-password>
```

```yaml
# deployment.yaml
spec:
  containers:
  - name: backend
    env:
    - name: JWT_SECRET_KEY
      valueFrom:
        secretKeyRef:
          name: backend-secrets
          key: jwt-secret
```

## Cloud Provider Secret Management

### AWS Secrets Manager

```python
import boto3
from botocore.exceptions import ClientError

def get_secret(secret_name, region_name):
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        return get_secret_value_response['SecretString']
    except ClientError as e:
        raise e

# Usage
jwt_secret = get_secret("prod/backend/jwt-secret", "us-east-1")
```

### Azure Key Vault

```python
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()
client = SecretClient(vault_url="https://vault.vault.azure.net/", credential=credential)

jwt_secret = client.get_secret("jwt-secret").value
```

### Google Secret Manager

```python
from google.cloud import secretmanager

def get_secret(project_id, secret_id, version_id="latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

jwt_secret = get_secret("my-project", "jwt-secret")
```

## Secret Rotation

### JWT Secrets

For JWT secrets, implement gradual rotation:

```python
# Support multiple JWT secrets for rotation
JWT_SECRETS = [
    "new-secret",  # Used for signing
    "old-secret"   # Still valid for verification
]

def verify_token(token):
    for secret in JWT_SECRETS:
        try:
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            return payload
        except jwt.InvalidTokenError:
            continue
    raise jwt.InvalidTokenError("Invalid token")
```

### Database Passwords

1. Create new user with new password
2. Update application configuration
3. Test connectivity
4. Remove old user

### Automated Rotation

```python
# Example rotation script
import schedule
import time
from datetime import datetime, timedelta

def rotate_jwt_secret():
    """Rotate JWT secret monthly"""
    new_secret = secrets.token_urlsafe(32)
    
    # Update secret in secret manager
    update_secret("jwt-secret", new_secret)
    
    # Trigger application restart
    restart_application()

# Schedule rotation
schedule.every().month.do(rotate_jwt_secret)
```

## Security Best Practices

### General Guidelines

1. **Principle of Least Privilege**: Only grant access to secrets that are needed
2. **Audit Access**: Log all secret access and modifications
3. **Regular Rotation**: Implement automated secret rotation
4. **Encryption at Rest**: Store secrets encrypted
5. **Network Security**: Use TLS for secret transmission

### Code Guidelines

```python
# ❌ Don't hardcode secrets
JWT_SECRET = "hardcoded-secret"

# ❌ Don't log secrets
logger.info(f"Using JWT secret: {jwt_secret}")

# ❌ Don't commit secrets
# export JWT_SECRET="secret-in-git-history"

# ✅ Use environment variables
JWT_SECRET = os.getenv("JWT_SECRET_KEY")

# ✅ Use secret management services
JWT_SECRET = get_secret_from_vault("jwt-secret")

# ✅ Validate secret presence
if not JWT_SECRET:
    raise ValueError("JWT_SECRET_KEY not found")
```

### Kubernetes Security

```yaml
# Use RBAC to limit secret access
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  resourceNames: ["backend-secrets"]
  verbs: ["get"]
```

## Monitoring and Alerting

### Secret Access Monitoring

```python
import logging
from datetime import datetime

def log_secret_access(secret_name, user_id):
    logger.info(
        "Secret accessed",
        extra={
            "secret_name": secret_name,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "secret_access"
        }
    )
```

### Alerts

Set up alerts for:
- Secret access outside business hours
- Failed secret retrievals
- Secret rotation failures
- Unauthorized access attempts

## Backup and Recovery

### Secret Backup Strategy

1. **Encrypted Backups**: Store backups encrypted
2. **Multiple Locations**: Use multiple backup locations
3. **Access Control**: Limit backup access
4. **Regular Testing**: Test backup restoration

### Disaster Recovery

1. **Emergency Access**: Maintain emergency secret access
2. **Recovery Procedures**: Document secret recovery steps
3. **Communication Plan**: Plan for breach notifications

## Compliance

### Common Requirements

- **GDPR**: Encryption of personal data at rest
- **SOC 2**: Access controls and audit logging
- **PCI DSS**: Secure key management
- **HIPAA**: Encryption and access controls

### Audit Trails

Maintain logs of:
- Secret creation and deletion
- Access to secrets
- Rotation events
- Failed access attempts

## Tools and Resources

### Secret Management Tools

- **HashiCorp Vault**: Open-source secret management
- **AWS Secrets Manager**: AWS managed service
- **Azure Key Vault**: Azure managed service
- **Google Secret Manager**: GCP managed service

### Development Tools

- **git-secrets**: Prevent committing secrets to Git
- **truffleHog**: Find secrets in Git history
- **detect-secrets**: Pre-commit hook for secret detection

### Example Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

## Migration Guide

### From Hardcoded to Environment Variables

1. Identify all hardcoded secrets
2. Move to environment variables
3. Update deployment configurations
4. Remove hardcoded values from code

### From Files to Secret Manager

1. Set up secret management service
2. Migrate secrets to service
3. Update application to use service
4. Remove secret files
5. Update deployment process