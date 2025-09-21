const express = require("express");
const router = express.Router();
const upload = require("../midlewere/upload"); // middleware multer
const { requireAuth } = require("../midlewere/authmidleware");

const {
  createOffre,
  getOffres,
  addCandidat,
  updateOffre,
  deleteOffre,
  getCandidats,
  updateCandidatureStatus
} = require("../Controller/RecurtementController");

// === Offres ===
router.get("/", requireAuth, getOffres);
router.post("/", requireAuth, createOffre);
router.put("/:offreId", requireAuth, updateOffre);
router.delete("/:offreId", requireAuth, deleteOffre);

// === Candidats ===
router.post("/:offreId/candidats", upload.single("cv"), addCandidat);
router.get("/:offreId/candidats", requireAuth, getCandidats);
router.patch("/:offreId/candidats/:candidatId/status", requireAuth, updateCandidatureStatus);

module.exports = router;
