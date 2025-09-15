const Formation = require('../Models/formationModel');

// Définir le statut en fonction des dates
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

    const rhId = req.user?._id; // RH connecté
    if (!rhId) return res.status(401).json({ message: "Utilisateur non authentifié." });

    const formation = new Formation({ titre, formateur, debut, fin, statut, rh: rhId });
    await formation.save();

    res.status(201).json({ message: "Formation créée", formation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Récupérer toutes les formations selon rôle
exports.getAllFormations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const userId = req.user._id;
    const role = req.user.role;

    let formations;
    if (role === 'Admin') {
      formations = await Formation.find().sort({ debut: 1 });
    } else if (role === 'RH') {
      formations = await Formation.find({ rh: userId }).sort({ debut: 1 });
    } else {
      return res.status(403).json({ message: "Accès refusé pour ce rôle" });
    }

    res.status(200).json({ formations });
  } catch (error) {
    console.error(error);
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

    const formation = await Formation.findById(id);
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    // Vérifier si l'utilisateur est Admin ou RH propriétaire
    if (req.user.role !== 'Admin' && formation.rh.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas la permission." });
    }

    const statut = definirStatut(debut, fin);

    formation.titre = titre;
    formation.formateur = formateur;
    formation.debut = debut;
    formation.fin = fin;
    formation.statut = statut;

    await formation.save();

    res.status(200).json({ message: "Formation mise à jour", formation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Supprimer une formation
exports.deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;

    const formation = await Formation.findById(id);
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    // Vérifier si l'utilisateur est Admin ou RH propriétaire
    if (req.user.role !== 'Admin' && formation.rh.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas la permission." });
    }

    await formation.remove();

    res.status(200).json({ message: "Formation supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
