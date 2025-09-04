const Formation = require('../Models/formationModel');

function definirStatut(debut, fin) {
  const aujourdHui = new Date();
  const debutDate = new Date(debut);
  const finDate = new Date(fin);
  if (finDate < aujourdHui) return "Terminée";
  if (debutDate > aujourdHui) return "Prévue";
  return "En cours";
}

// Créer une formation
exports.createFormation = async (req, res) => {
  try {
    const { titre, formateur, debut, fin } = req.body;

    if (!titre || !formateur || !debut || !fin) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const statut = definirStatut(debut, fin);

    const formation = new Formation({ titre, formateur, debut, fin, statut });
    await formation.save();

    res.status(201).json({ message: "Formation créée", formation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Récupérer toutes les formations
exports.getAllFormations = async (req, res) => {
  try {
    const formations = await Formation.find().sort({ debut: 1 });
    res.status(200).json(formations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Mettre à jour une formation
exports.updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, formateur, debut, fin } = req.body;

    if (!titre || !formateur || !debut || !fin) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const statut = definirStatut(debut, fin);

    const formation = await Formation.findByIdAndUpdate(
      id,
      { titre, formateur, debut, fin, statut },
      { new: true }
    );

    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    res.status(200).json({ message: "Formation mise à jour", formation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Supprimer une formation
exports.deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;

    const formation = await Formation.findByIdAndDelete(id);

    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    res.status(200).json({ message: "Formation supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
