// src/routes/carRoutes.js

const express = require("express");
const router = express.Router();

const controller = require("../controllers/carController");
const requireAdmin = require("../middlewares/requireAdmin");

// -------------------------------------
// 🟦 RUTAS CARRUSEL (PONERLAS ARRIBA)
// -------------------------------------
router.put("/carrusel/:id", requireAdmin, controller.updateCarruselConfig);
router.put("/carrusel-mode", requireAdmin, controller.updateGlobalCarruselMode);

// -------------------------------------
// 🟦 RUTAS PÚBLICAS
// -------------------------------------
router.get("/", controller.getAllCars);
router.get("/:id", controller.getCarById);

// -------------------------------------
// 🔐 RUTAS SOLO ADMIN (crear, editar, borrar)
// -------------------------------------
router.post("/", requireAdmin, controller.createCar);
router.put("/:id", requireAdmin, controller.updateCar);
router.delete("/:id", requireAdmin, controller.deleteCar);

module.exports = router;
