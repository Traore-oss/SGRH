const Performance = require('../Models/evaluationModel');
const User = require('../Models/usersModel');

// 🔹 Ajouter une performance
exports.ajouterPerformance = async (req, res) => {
  try {
    const { matricule, objectif, description, realisation, evaluation } = req.body;

    // Trouver l'employé créé par le RH connecté
    const employeDoc = await User.findOne({
      "employer.matricule": matricule,
      "employer.createdByrh": req.user._id
    });

    if (!employeDoc) return res.status(404).json({ message: "Employé introuvable ou non autorisé." });

    const performance = await Performance.create({
      employe: employeDoc._id,
      objectif,
      description,
      realisation,
      evaluation,
      createdByrh: req.user._id
    });

    res.status(201).json(performance);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Lister toutes les performances du RH connecté
exports.getAllPerformances = async (req, res) => {
  try {
    const mesEmployes = await User.find({ "employer.createdByrh": req.user._id }).select('_id');

    const performances = await Performance.find({ employe: { $in: mesEmployes } })
      .populate({
        path: 'employe',
        select: 'nom prenom email employer.matricule employer.poste employer.departement',
      })
      .sort({ createdAt: -1 });

    res.status(200).json(performances);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Modifier une performance

exports.updatePerformance = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) 
      return res.status(401).json({ message: "Utilisateur non authentifié" });

    const { id } = req.params;
    const { objectif, description, realisation, evaluation } = req.body;

    // Récupérer la performance et peupler l'employé
    const perf = await Performance.findById(id).populate('employe');

    if (!perf) 
      return res.status(404).json({ message: "Performance non trouvée." });

    // Vérifier que l'employé appartient bien au RH connecté
    if (!perf.employe?.employer?.createdByrh.equals(req.user._id)) {
      return res.status(403).json({ message: "Non autorisé à modifier cette performance" });
    }

    // ⚠️ S'assurer que createdByrh existe
    if (!perf.createdByrh) {
      perf.createdByrh = req.user._id;
    }

    // Mettre à jour les champs si présents
    if (objectif !== undefined) perf.objectif = objectif;
    if (description !== undefined) perf.description = description;
    if (realisation !== undefined) perf.realisation = realisation;
    if (evaluation !== undefined) perf.evaluation = evaluation;

    // Sauvegarder la performance
    await perf.save();

    res.status(200).json(perf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Supprimer une performance
exports.deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const perf = await Performance.findOneAndDelete({ _id: id, createdByrh: req.user._id });
    if (!perf) return res.status(404).json({ message: "Performance non trouvée ou non autorisée." });

    res.status(200).json({ message: "Performance supprimée avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
exports.getPerformanceById = async (req, res) => {
  try {
    const perf = await Performance.findById(req.params.id).populate('employe');
    if (!perf) return res.status(404).json({ message: 'Performance non trouvée' });
    res.status(200).json(perf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

