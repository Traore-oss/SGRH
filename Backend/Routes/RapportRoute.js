const express = require("express");
const router = express.Router();
const rapportController = require("../Controller/RapportControlle");

// CRUD Rapports
router.post("/", rapportController.createRapport);
router.get("/", rapportController.getRapports);
router.get("/:id", rapportController.getRapportById);
router.delete("/:id", rapportController.deleteRapport);

module.exports = router;
