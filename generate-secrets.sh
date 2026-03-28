#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_DIR="$SCRIPT_DIR/secrets"
mkdir -p "$SECRETS_DIR"

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all            Generate all secrets"
    echo "  --session        Generate Authelia session secret"
    echo "  --jwt            Generate Authelia JWT secret"
    echo "  --storage        Generate Authelia storage encryption key"
    echo "  --lldap-jwt      Generate LLDAP JWT secret"
    echo "  --lldap-pass     Generate LLDAP admin password"
    echo "  --redis-pass     Generate Redis password"
    echo "  --help           Show this help message"
}

GENERATE_SESSION=false
GENERATE_JWT=false
GENERATE_STORAGE=false
GENERATE_LLDAP_JWT=false
GENERATE_LLDAP_PASS=false
GENERATE_REDIS_PASS=false

if [ $# -eq 0 ] || [ "$1" = "--help" ]; then
    usage
    exit 1
fi

for arg in "$@"; do
    case $arg in
        --all)
            GENERATE_SESSION=true
            GENERATE_JWT=true
            GENERATE_STORAGE=true
            GENERATE_LLDAP_JWT=true
            GENERATE_LLDAP_PASS=true
            GENERATE_REDIS_PASS=true
            ;;
        --session)      GENERATE_SESSION=true ;;
        --jwt)          GENERATE_JWT=true ;;
        --storage)      GENERATE_STORAGE=true ;;
        --lldap-jwt)    GENERATE_LLDAP_JWT=true ;;
        --lldap-pass)   GENERATE_LLDAP_PASS=true ;;
        --redis-pass)   GENERATE_REDIS_PASS=true ;;
        --help)         usage; exit 0 ;;
        *)
            echo "Unknown option: $arg"
            usage
            exit 1
            ;;
    esac
done

generate_secret() {
    local file="$1"
    local value="$2"
    local label="$3"
    echo "$value" > "$SECRETS_DIR/$file"
    chmod 600 "$SECRETS_DIR/$file"
    echo "$label saved"
}

if [ "$GENERATE_SESSION" = true ]; then
    generate_secret "session_secret" "$(openssl rand -base64 64 | tr -d '\n')" "Authelia session secret"
fi

if [ "$GENERATE_JWT" = true ]; then
    generate_secret "jwt_secret" "$(openssl rand -base64 64 | tr -d '\n')" "Authelia JWT secret"
fi

if [ "$GENERATE_STORAGE" = true ]; then
    generate_secret "storage_key" "$(openssl rand -base64 32 | tr -d '\n')" "Authelia storage encryption key"
fi

if [ "$GENERATE_LLDAP_JWT" = true ]; then
    generate_secret "lldap_jwt_secret" "$(openssl rand -hex 32)" "LLDAP JWT secret"
fi

if [ "$GENERATE_LLDAP_PASS" = true ]; then
    generate_secret "lldap_admin_password" "$(openssl rand -base64 24 | tr -d '\n')" "LLDAP admin password"
fi

if [ "$GENERATE_REDIS_PASS" = true ]; then
    generate_secret "redis_password" "$(openssl rand -base64 20 | tr -dc 'a-zA-Z0-9' | head -c 24)" "Redis password"
fi

echo "Secrets saved to $SECRETS_DIR/"