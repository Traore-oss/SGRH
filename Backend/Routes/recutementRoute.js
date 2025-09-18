const express = require("express");
const router = express.Router();
const recrutementController = require("../Controller/RecurtementController");

router.post("/", recrutementController.createOffre);
router.get("/", recrutementController.getOffres);
router.put("/:id", recrutementController.updateOffre);
router.delete("/:id", recrutementController.deleteOffre);
router.post("/:id/candidats", recrutementController.addCandidat);

module.exports = router;
