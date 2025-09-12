const Rapport = require("../Models/rapportModel");

// === Générer un rapport et sauvegarder ===
exports.createRapport = async (req, res) => {
  try {
    const { type, periode, donnees, generePar } = req.body;

    const rapport = new Rapport({ type, periode, donnees, generePar });
    await rapport.save();

    res.status(201).json({ message: "Rapport généré ✅", rapport });
  } catch (error) {
    res.status(500).json({ message: "Erreur génération rapport", error: error.message });
  }
};

// === Lister tous les rapports ===
exports.getRapports = async (req, res) => {
  try {
    const rapports = await Rapport.find().populate("generePar", "nom prenom email");
    res.status(200).json(rapports);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération rapports", error: error.message });
  }
};

// === Obtenir un rapport par ID ===
exports.getRapportById = async (req, res) => {
  try {
    const rapport = await Rapport.findById(req.params.id).populate("generePar", "nom prenom");
    if (!rapport) return res.status(404).json({ message: "Rapport non trouvé" });
    res.status(200).json(rapport);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération rapport", error: error.message });
  }
};

// === Supprimer un rapport ===
exports.deleteRapport = async (req, res) => {
  try {
    const deleted = await Rapport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Rapport non trouvé" });
    res.status(200).json({ message: "Rapport supprimé ✅" });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression rapport", error: error.message });
  }
};
