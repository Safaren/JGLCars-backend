#!/bin/bash

# Script para generar certificado SSL autofirmado para localhost
# Este certificado permite usar HTTPS en desarrollo local

echo "🔐 Generando certificado SSL para localhost..."

# Navegar al directorio raíz del proyecto
cd "$(dirname "$0")/.." || exit 1

# Crear directorio para certificados si no existe
mkdir -p ssl

# Generar clave privada y certificado autofirmado
openssl req -x509 \
  -newkey rsa:4096 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -days 365 \
  -nodes \
  -subj "/C=ES/ST=State/L=City/O=JGLCars/OU=Development/CN=localhost"

echo "✅ Certificados generados en ./ssl/"
echo "   - ssl/key.pem (clave privada)"
echo "   - ssl/cert.pem (certificado público)"
echo ""
echo "⚠️  IMPORTANTE: Tu navegador mostrará una advertencia de seguridad"
echo "   porque el certificado es autofirmado. Esto es NORMAL para desarrollo."
echo "   Solo tienes que aceptar el riesgo y continuar."

