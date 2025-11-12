import { defineProxy } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "cambiame";

// Definimos el proxy (reemplazo del middleware tradicional)
export default defineProxy(async (req) => {
  const { pathname } = req.nextUrl;

  // Rutas protegidas
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;

      // Verificamos rol
      if (payload.rol !== "Admin" && payload.rol !== "ADMIN") {
        const homeUrl = new URL("/", req.url);
        return NextResponse.redirect(homeUrl);
      }

      // Todo correcto: continuar
      return NextResponse.next();
    } catch (err) {
      console.error("Token inválido o expirado:", err);
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Si no es una ruta protegida, continúa
  return NextResponse.next();
});

// Configuración del matcher (igual que antes)
export const config = {
  matcher: ["/admin/:path*"],
};
