const express = require("express");
const router = express.Router();
const piezaController = require("../controllers/piezaController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas protegidas (solo usuarios autenticados)
router.use(authMiddleware);

router.get("/", piezaController.getAll);
router.post("/", piezaController.create);
router.put("/:id", piezaController.update);
router.delete("/:id", piezaController.remove);

module.exports = router;
