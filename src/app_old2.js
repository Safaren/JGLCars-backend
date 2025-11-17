require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://jgl-cars-frontend.vercel.app",
  /.*\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.some((o) => typeof o === "string" ? o === origin : o.test(origin))) {
        return callback(null, true);
      }

      console.warn("⛔ Origen no permitido:", origin);
      callback(new Error("No permitido por CORS"));
    },
    credentials: true,
  })
);

// Preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    return res.sendStatus(200);
  }
  next();
});

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api", require("./routes/uploadRoutes"));
app.use("/api/favoritos", require("./routes/favoritoRoutes"));
app.use("/api/contacto", require("./routes/contactoRoutes"));
app.use("/api/piezas", require("./routes/piezaRoutes"));
app.use("/api/fotos-pieza", require("./routes/fotoPiezaRoutes"));
app.use("/api/fotos-car", require("./routes/fotoCarRoutes"));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API funcionando correctamente 🚀" });
});

module.exports = app;
