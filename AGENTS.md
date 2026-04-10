# Agent Guidelines

## Project Overview

Docker-based authentication infrastructure:
- **Authelia** - Authentication/authorization server
- **LLDAP** - Lightweight LDAP server for user storage  
- **Redis** - Session storage
- **Signup Service** - Go backend + HTML/CSS/JS frontend

## Directory Structure

```
.                          # Root - Docker compose
├── config/                # Authelia configuration
├── lldap/                 # LLDAP data
├── redis/                # Redis data
├── secrets/              # Passwords/keys (not in git)
├── signup/
│   ├── backend/          # Go service (main.go)
│   ├── frontend/         # Static HTML/CSS/JS
│   ├── scripts/          # Deployment scripts (push.sh)
│   └── Dockerfile        # Multi-stage build
└── docker-compose.yml
```

## Build Commands

### Docker
```bash
docker-compose up -d                    # Build & start all
docker-compose build signup              # Rebuild signup
docker-compose up -d signup              # Restart signup
docker-compose logs -f signup            # View logs
docker-compose down                      # Stop all
```

### Build & Push Image
```bash
# Local build (automatic with docker-compose up -d)
cd signup && docker build -t signup-service .

# Push to Docker Hub (multi-arch)
./signup/scripts/push.sh [version]       # Default: latest
```

### Go Backend
```bash
cd signup/backend

go mod tidy                              # Fix dependencies
go build -o signup-service              # Build binary
go run main.go                           # Run locally

go test ./...                           # Run all tests
go test -run TestName -v                # Run single test
go test -cover ./...                    # With coverage
```

### Linting
```bash
go fmt ./...                            # Format code
go vet ./...                            # Vet analysis
```

## Code Style

### Go

**Formatting**
- Use `gofmt` - run `go fmt ./...` before committing
- Run `go mod tidy` after adding dependencies

**Naming**
- Variables: `camelCase` (e.g., `lldapURL`, `serverPort`)
- Functions: `PascalCase` (e.g., `signupHandler`)
- Packages: lowercase, single word

**Types**
- Use explicit types
- Use `:=` for local variables

**Error Handling**
- Always handle errors - never ignore with `_`
- Return errors with context: `fmt.Errorf("failed to connect: %w", err)`
- Check errors immediately after calls

**Imports**
```go
import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "strings"

    "github.com/go-ldap/ldap/v3"
)
```

### Frontend (HTML/CSS/JS)

**CSS**
- Use CSS custom properties for colors
- Support dark mode via `prefers-color-scheme`
- Mobile-first responsive design

**JavaScript**
- Modern ES6+ syntax
- Use `const`/`let` not `var`
- Use `async/await` for fetch calls

## Common Tasks

### Add environment variable
1. Add to `.env` with default value
2. Reference in docker-compose.yml: `${VAR_NAME}`
3. Read in code using `os.Getenv()` or custom function

### Add new service
1. Add to `docker-compose.yml`
2. Create config files
3. Add secrets to `secrets/`

### Debug Authelia
```bash
docker-compose logs -f authelia
docker-compose restart authelia
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/signup | Create new user |
| GET | /health | Health check |

## Environment

- Docker for containerization
- Go 1.21+ for backend
- Frontend: static files served by Go

## Important Notes

- **LLDAP Password Handling**: Use LDAP Password Modify Extended Operation (RFC 3062) via `conn.PasswordModify()` - do NOT set password as plain attribute
- Secrets stored in `secrets/` with `_FILE` suffix (e.g., `LDAP_PASSWORD_FILE=/secrets/password`)
- Frontend files: use `.html` extension in URLs or add handlers in Go
