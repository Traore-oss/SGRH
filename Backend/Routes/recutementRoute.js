const express = require("express");
const router = express.Router();
const recrutementController = require("../Controller/RecurtementController");

// CRUD Recrutement
router.post("/", recrutementController.createOffre);
router.get("/", recrutementController.getOffres);
router.get("/:id", recrutementController.getOffreById);
router.put("/:id", recrutementController.updateOffre);
router.delete("/:id", recrutementController.deleteOffre);

// Candidature
router.post("/:id/candidats", recrutementController.addCandidat);

module.exports = router;
