# 🔧 Configuración de Frontend para HTTPS

## Actualizar Variables de Entorno

Edita el archivo `.env.local` en el frontend para que apunte a HTTPS:

```bash
# JGLCars-frontend/.env.local
NEXT_PUBLIC_API_URL=https://localhost:4000/api
```

### Si el archivo no existe

Crea el archivo `.env.local` en la raíz del frontend:

**Ubicación**: `d:\Safaren\Trabajo\Mi_empresa\JGLCars-frontend\JGLCars-frontend\.env.local`

**Contenido**:
```
NEXT_PUBLIC_API_URL=https://localhost:4000/api
```

## Aceptar el Certificado SSL en el Navegador

### Paso 1: Iniciar el Backend

```bash
cd JGLCars-backend
npm run dev
```

Deberías ver:
```
🔒 Servidor HTTPS escuchando en https://localhost:4000
✅ Las cookies con secure: true funcionarán correctamente
```

### Paso 2: Visitar el Backend en el Navegador

1. Abre tu navegador (Chrome, Firefox, Edge, etc.)
2. Visita `https://localhost:4000`
3. Verás una advertencia de seguridad **"Tu conexión no es privada"** o similar
4. Haz clic en **"Avanzado"** o **"Advanced"**
5. Haz clic en **"Continuar a localhost (no seguro)"** o **"Proceed to localhost (unsafe)"**

✅ Ahora el navegador confiará en el certificado para esta sesión

### Paso 3: Iniciar el Frontend

```bash
cd JGLCars-frontend/JGLCars-frontend
npm run dev
```

### Paso 4: Probar la Autenticación

1. Abre el frontend en tu navegador (generalmente `http://localhost:3000`)
2. Intenta hacer login
3. Abre DevTools → Application → Cookies → `http://localhost:3000`
4. Deberías ver las cookies `accessToken` y `refreshToken`

## Solución de Problemas

### Las cookies no aparecen

**Problema**: No ves `accessToken` ni `refreshToken` en las cookies del navegador.

**Solución**: 
1. Verifica que el backend está corriendo en HTTPS (debe decir `🔒 Servidor HTTPS`)
2. Verifica que has aceptado el certificado SSL visitando `https://localhost:4000`
3. Verifica que `.env.local` tiene `NEXT_PUBLIC_API_URL=https://localhost:4000/api`
4. Revisa la consola del navegador para errores de CORS o SSL

### Error de CORS

**Problema**: Ves errores de CORS en la consola del navegador.

**Solución**:
- Asegúrate de que `http://localhost:3000` está en la lista `allowedOrigins` en `app.js`
- Revisa que el frontend está enviando `credentials: "include"` en las peticiones fetch

### Error de SSL/TLS

**Problema**: `ERR_CERT_AUTHORITY_INVALID` o similar.

**Solución**:
- DEBES visitar `https://localhost:4000` directamente en el navegador y aceptar el certificado
- Esto es necesario CADA VEZ que uses un navegador nuevo o en modo incógnito

## Verificación Final

Para verificar que todo funciona correctamente:

1. ✅ Backend corre en `https://localhost:4000`
2. ✅ Frontend corre en `http://localhost:3000`
3. ✅ Puedes hacer login exitosamente
4. ✅ Las cookies aparecen en DevTools
5. ✅ Los administradores pueden acceder a `/admin`
6. ✅ Al refrescar la página, la sesión se mantiene
