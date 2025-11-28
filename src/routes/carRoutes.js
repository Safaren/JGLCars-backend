// src/routes/carRoutes.js

const express = require("express");
const router = express.Router();

const controller = require("../controllers/carController");
const requireAdmin = require("../middlewares/requireAdmin");
const auth = require("../middlewares/authMiddleware");

// -------------------------------------
// 🟦 RUTAS PÚBLICAS
// -------------------------------------
router.get("/", controller.getAllCars);
router.get("/:id", controller.getCarById);

// -------------------------------------
// 🔐 RUTAS SOLO ADMIN (crear, editar, borrar)
// -------------------------------------
router.post("/",requireAdmin, controller.createCar);  
router.put("/:id", requireAdmin, controller.updateCar);
router.delete("/:id",requireAdmin, controller.deleteCar);

router.put("/carrusel/:id", controller.updateCarruselConfig);


module.exports = router;
