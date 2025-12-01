# 🔒 Configuración HTTPS para Desarrollo Local

## ¿Por qué necesitas HTTPS en localhost?

Las cookies con `sameSite: "none"` **requieren** `secure: true`, lo que significa que **solo funcionan con HTTPS**.

Sin HTTPS, los navegadores modernos (Chrome, Firefox, Safari) **rechazan** estas cookies automáticamente.

## Generar Certificados SSL

### Opción 1: Usando el script (Recomendado)

```bash
cd JGLCars-backend
bash scripts/generate-ssl-cert.sh
```

### Opción 2: Manual con OpenSSL

```bash
cd JGLCars-backend
mkdir -p ssl

openssl req -x509 \
  -newkey rsa:4096 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -days 365 \
  -nodes \
  -subj "/C=ES/ST=State/L=City/O=JGLCars/OU=Development/CN=localhost"
```

## Iniciar el servidor

```bash
npm run dev
```

Si los certificados están en `ssl/`, verás:
```
🔒 Servidor HTTPS escuchando en https://localhost:4000
✅ Las cookies con secure: true funcionarán correctamente
```

Si NO hay certificados, verás:
```
⚠️  Servidor HTTP escuchando en http://localhost:4000
❌ ADVERTENCIA: Las cookies con secure: true NO funcionarán sin HTTPS
```

## Aceptar el certificado autofirmado en el navegador

1. Abre `https://localhost:4000` en tu navegador
2. Verás una advertencia de seguridad ⚠️ (ES NORMAL)
3. Haz clic en "Avanzado" o "Advanced"
4. Haz clic en "Continuar a localhost (inseguro)" o "Proceed to localhost (unsafe)"

**Esto es completamente seguro para desarrollo local**. La advertencia aparece porque el certificado está autofirmado, no porque haya un problema de seguridad real.

## Configurar el Frontend

Asegúrate de que tu frontend esté apuntando a `https://localhost:4000`:

```bash
# JGLCars-frontend/.env.local
NEXT_PUBLIC_API_URL=https://localhost:4000/api
```

## Notas Importantes

- ✅ Los certificados SSL son solo para **desarrollo local**
- ✅ Ya están en `.gitignore`, no se subirán a Git
- ✅ En **producción** (Vercel), usarás HTTPS automáticamente
- ⚠️  Necesitas aceptar el certificado en el navegador **cada vez** que uses un navegador nuevo
