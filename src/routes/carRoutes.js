const express = require("express");
const router = express.Router();

const controller = require("../controllers/carController");
const auth = require("../middlewares/authMiddleware");

// -------------------------------------
// 🟦 RUTAS PÚBLICAS
// -------------------------------------
router.get("/", controller.getAllCars);
router.get("/:id", controller.getCarById);

// -------------------------------------
// 🔐 RUTAS SOLO ADMIN (crear, editar, borrar)
// -------------------------------------
router.post("/", controller.createCar);  // sin auth
router.put("/:id", controller.updateCar);
router.delete("/:id", controller.deleteCar);

module.exports = router;
