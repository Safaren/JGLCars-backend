// src/index.js
require('dotenv').config();
const app = require('./app_old2');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
