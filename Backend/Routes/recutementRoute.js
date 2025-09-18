const express = require("express");
const router = express.Router();
const { createOffre, getOffres, addCandidat, updateOffre, deleteOffre } = require("../Controller/RecurtementController");
const { requireAuth } = require("../midlewere/authmidleware");

router.get("/", requireAuth, getOffres);
router.post("/", requireAuth, createOffre);
router.post("/:offreId/candidats", addCandidat);
router.put("/:offreId", requireAuth, updateOffre);
router.delete("/:offreId", requireAuth, deleteOffre);

module.exports = router;
