// src/index.js
require('dotenv').config();
const app = require('./app');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;

// 🔒 Intentar cargar certificados SSL para HTTPS
const sslKeyPath = path.join(__dirname, '../ssl/key.pem');
const sslCertPath = path.join(__dirname, '../ssl/cert.pem');

let server;

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  // ✅ Certificados encontrados - usar HTTPS
  const options = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath)
  };

  server = https.createServer(options, app);

  server.listen(PORT, () => {
    console.log(`🔒 Servidor HTTPS escuchando en https://localhost:${PORT}`);
    console.log(`✅ Las cookies con secure: true funcionarán correctamente`);
  });
} else {
  // ⚠️  No hay certificados - usar HTTP (las cookies con secure: true NO funcionarán)
  server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`⚠️  Servidor HTTP escuchando en http://localhost:${PORT}`);
    console.log(`❌ ADVERTENCIA: Las cookies con secure: true NO funcionarán sin HTTPS`);
    console.log(`📝 Genera certificados SSL ejecutando: bash scripts/generate-ssl-cert.sh`);
  });
}
