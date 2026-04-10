# Authelia Docker

Docker-based authentication infrastructure with Authelia, LLDAP, Redis, and signup portal.

## Quick Start

```bash
# Generate secrets
./generate-secrets.sh --all

# Start services
docker-compose up -d
```

## Services

| Service  | URL | Description |
|----------|-----|-------------|
| Authelia | http://localhost:9091 | Authentication portal |
| Signup | http://localhost:8081 | User registration |
| LLDAP | http://localhost:17170 | LDAP admin |
| Redis | localhost:6379 | Session storage |

## Configuration

### Environment Variables (.env)
All service configuration is in `.env` file:
- Authelia secrets
- Redis password
- LLDAP settings
- Signup service params

### Secrets
Store sensitive data in `secrets/` directory:
- `session_secret` - Authelia session
- `jwt_secret` - Password reset tokens
- `storage_key` - Database encryption
- `lldap_admin_password` - LDAP admin
- `lldap_jwt_secret` - LLDAP JWT
- `redis_password` - Redis auth

Generate secrets:
```bash
./generate-secrets.sh
```

## Development

### Rebuild Services
```bash
# Rebuild signup service
docker-compose build signup
docker-compose up -d signup
```

### Logs
```bash
docker-compose logs -f authelia
docker-compose logs -f signup
docker-compose logs -f lldap
```

### Certificates
Generate Redis TLS certs:
```bash
./generate-certs.sh
```

## Signup Service

### Backend (Go)
Location: `signup/backend/`
- `main.go` - HTTP server with LDAP integration
- Uses LDAP Password Modify Extended Operation (RFC 3062) for secure password handling

Build locally:
```bash
cd signup && docker build -t signup-service .
```

Push to Docker Hub:
```bash
./signup/scripts/push.sh [version]  # Default: latest
```

### Frontend
Location: `signup/frontend/`
- `index.html` - Landing page (Sign Up / Sign In buttons)
- `signup.html` - Registration form
- `success.html` - Registration success page
- `style.css` - Styling (includes dark mode)
- `script.js` - Form submission logic

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/signup | Create new user |
| GET | /health | Health check |

## Production Considerations

- Add reverse proxy (Traefik/Nginx) with HTTPS
- Configure firewall to limit exposed ports
- Enable Redis TLS (requires Authelia update for full support)
- Set up backups for `config/`, `lldap/`, `redis/`
