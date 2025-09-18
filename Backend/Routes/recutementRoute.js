const express = require("express");
const router = express.Router();
const upload = require("../midlewere/upload"); // <- notre middleware multer
const { createOffre, getOffres, addCandidat, updateOffre, deleteOffre, getCandidats } = require("../Controller/RecurtementController");
const { requireAuth } = require("../midlewere/authmidleware");

router.get("/", requireAuth, getOffres);
router.post("/", requireAuth, createOffre);

// Ici le fichier CV sera uploadé
router.post("/:offreId/candidats", upload.single("cv"), addCandidat);

router.put("/:offreId", requireAuth, updateOffre);
router.delete("/:offreId", requireAuth, deleteOffre);
// Récupérer les candidats d'une offre
router.get("/:offreId/candidats", requireAuth, getCandidats);

module.exports = router;
