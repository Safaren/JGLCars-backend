const express = require("express");
const router = express.Router();
const { getEnums } = require("../controllers/metaController");

router.get("/enums", getEnums);

module.exports = router;
