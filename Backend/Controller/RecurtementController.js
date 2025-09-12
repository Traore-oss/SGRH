const Recrutement = require("../Models/recrutementModel");

// === Créer une offre de recrutement ===
exports.createOffre = async (req, res) => {
  try {
    const offre = new Recrutement(req.body);
    await offre.save();
    res.status(201).json({ message: "Offre créée ✅", offre });
  } catch (error) {
    res.status(500).json({ message: "Erreur création offre", error: error.message });
  }
};

// === Lister toutes les offres ===
exports.getOffres = async (req, res) => {
  try {
    const offres = await Recrutement.find().populate("departement");
    res.status(200).json(offres);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération offres", error: error.message });
  }
};

// === Détails d’une offre ===
exports.getOffreById = async (req, res) => {
  try {
    const offre = await Recrutement.findById(req.params.id).populate("departement");
    if (!offre) return res.status(404).json({ message: "Offre non trouvée" });
    res.status(200).json(offre);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération offre", error: error.message });
  }
};

// === Ajouter une candidature à une offre ===
exports.addCandidat = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, cvUrl } = req.body;

    const offre = await Recrutement.findById(id);
    if (!offre) return res.status(404).json({ message: "Offre non trouvée" });

    offre.candidats.push({ nom, prenom, email, cvUrl });
    await offre.save();

    res.status(200).json({ message: "Candidature ajoutée ✅", offre });
  } catch (error) {
    res.status(500).json({ message: "Erreur ajout candidature", error: error.message });
  }
};

// === Mettre à jour une offre ===
exports.updateOffre = async (req, res) => {
  try {
    const updated = await Recrutement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Offre non trouvée" });
    res.status(200).json({ message: "Offre mise à jour ✅", updated });
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour", error: error.message });
  }
};

// === Supprimer une offre ===
exports.deleteOffre = async (req, res) => {
  try {
    const deleted = await Recrutement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Offre non trouvée" });
    res.status(200).json({ message: "Offre supprimée ✅" });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression", error: error.message });
  }
};
