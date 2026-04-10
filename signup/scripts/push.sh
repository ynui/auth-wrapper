#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SIGNUP_DIR="$(dirname "$SCRIPT_DIR")"

USERNAME="${DOCKER_USERNAME:-ynui12}"
IMAGE_NAME="${IMAGE_NAME:-signup-service}"
VERSION="${1:-latest}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"

TAG="${USERNAME}/${IMAGE_NAME}:${VERSION}"

echo "Setting up buildx..."
docker buildx create --use --name multiarch-builder 2>/dev/null || true
docker buildx inspect --bootstrap

echo "Logging in to Docker Hub..."
docker login

echo "Building ${TAG} for ${PLATFORMS}..."
docker buildx build --platform $PLATFORMS -t "$TAG" "${SIGNUP_DIR}" --push

echo "Done! Image: ${TAG}"
