# Agent Guidelines for Authelia Docker Setup

## Project Overview

This is a Docker-based authentication infrastructure consisting of:
- **Authelia** - Authentication/authorization server
- **LLDAP** - Lightweight LDAP server for user storage
- **Redis** - Session storage
- **Signup Service** - Custom Go backend + HTML/CSS/JS frontend for user registration

## Directory Structure

```
.                          # Root - Docker compose and config
├── config/                # Authelia configuration
├── lldap/                 # LLDAP data
├── redis/                 # Redis data
├── secrets/               # Passwords and keys (not in git)
├── signup/
│   ├── backend/           # Go service (main.go, Dockerfile)
│   └── frontend/          # Static HTML/CSS/JS
└── docker-compose.yml    # Container orchestration
```

## Build Commands

### Docker
```bash
# Build and start all services
docker-compose up -d

# Rebuild a specific service
docker-compose build signup
docker-compose up -d signup

# View logs
docker-compose logs -f authelia
docker-compose logs -f signup

# Stop all services
docker-compose down

# Full restart
docker-compose down && docker-compose up -d
```

### Signup Backend (Go)
```bash
cd signup/backend

# Download dependencies
go mod download

# Build
go build -o signup-service

# Run locally (requires Redis and LLDAP running)
go run main.go

# Run tests (if any)
go test ./...
```

### Frontend
No build step required - served as static files by Go backend.

## Code Style Guidelines

### Go (signup/backend)

**Formatting**
- Use `gofmt` or goimports
- Run `go mod tidy` after adding dependencies
- Enable Go modules (`go.mod`)

**Naming**
- Variables: `camelCase` (e.g., `lldapURL`, `serverPort`)
- Constants: `PascalCase` or `camelCase` (e.g., `MaxRetries`, `defaultPort`)
- Functions: `PascalCase` (e.g., `signupHandler`, `getEnvFile`)
- Packages: lowercase, single word (e.g., `main`)

**Types**
- Use explicit types; avoid `var x` without type
- Use `:=` for local variable declarations
- Prefix with package name for exports: `func SignupHandler...`

**Error Handling**
- Always handle errors; don't ignore with `_`
- Return errors with context: `fmt.Errorf("failed to connect: %w", err)`
- Check errors immediately after calls

**Imports**
- Standard library first, then third-party
- Group: stdlib, external, then project (if applicable)
- Use `go fmt` to organize

**Example Structure**
```go
package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "strings"

    "github.com/go-ldap/ldap/v3"
)

var (
    lldapURL = getEnvFile("LDAP_URL", "ldap://lldap:3890")
)

func signupHandler(w http.ResponseWriter, r *http.Request) {
    // Handle signup logic
}

func getEnvFile(key, defaultValue string) string {
    filePath := os.Getenv(key + "_FILE")
    if filePath != "" {
        data, err := os.ReadFile(filePath)
        if err != nil {
            log.Printf("Warning: failed to read %s: %v", filePath, err)
            return defaultValue
        }
        return strings.TrimSpace(string(data))
    }
    return os.Getenv(key)
}

func main() {
    http.HandleFunc("/api/signup", signupHandler)
    log.Printf("Starting signup service")
    http.ListenAndServe(":8080", nil)
}
```

### Frontend (HTML/CSS/JS)

**General**
- Keep HTML semantic
- Use CSS variables for theming
- Avoid inline styles

**CSS**
- Use CSS custom properties for colors/fonts
- Support dark mode via `prefers-color-scheme`
- Use flexbox/grid for layout
- Mobile-first responsive design

**JavaScript**
- Use modern ES6+ syntax
- Use `const`/`let` instead of `var`
- Use template literals for string interpolation
- Use `async/await` for fetch calls

**Example**
```javascript
const API_URL = '/api';

function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
}

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    // Handle result
});
```

### Docker

- Use specific image tags (not `latest` for production)
- Use multi-stage builds for Go services
- Mount secrets as read-only volumes
- Use `env_file` for environment variables
- Include health checks where supported

### Configuration Files

**YAML (Authelia)**
- Use 2-space indentation
- Comments for non-obvious settings
- Group related settings together

**Environment Variables**
- Use `UPPER_SNAKE_CASE`
- Use `_FILE` suffix for file-based secrets
- Document all variables in `.env` file

## Testing

Currently no tests exist in this project. When adding tests:

**Go**
```bash
# Run all tests
go test ./...

# Run specific test
go test -run TestSignupHandler -v

# Run with coverage
go test -cover ./...
```

**JavaScript (if adding)**
```bash
# Run tests with jest
npm test

# Run single test
npm test -- --testNamePattern="signup"
```

## Common Tasks

### Add new environment variable
1. Add to `.env` file with default value
2. Reference in docker-compose.yml with `${VAR_NAME}`
3. Read in code using `os.Getenv()` or custom function

### Add new service to Docker
1. Add service definition to `docker-compose.yml`
2. Create required config files
3. Add secrets to `secrets/` folder
4. Document in README

### Update Authelia config
1. Edit `config/configuration.yml`
2. Restart: `docker-compose restart authelia`
3. Check logs: `docker-compose logs authelia`

## Secrets Management

- Store secrets in `secrets/` directory (not committed to git)
- Use file-based secrets: `*_PASSWORD_FILE=/secrets/filename`
- Generate secrets: `./generate-secrets.sh`
- Redis certs: `./generate-certs.sh`

## Environment

- Docker for containerization
- Go 1.21+ for backend
- No build tools required for frontend (static files)
