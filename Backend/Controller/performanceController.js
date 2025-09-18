const Performance = require('../Models/evaluationModel');
const User = require('../Models/usersModel');

// ➕ Ajouter une performance
exports.ajouterPerformance = async (req, res) => {
  try {
    const { matricule, objectif, description, realisation, evaluation } = req.body;

    if (!matricule) return res.status(400).json({ message: "Le matricule est requis" });

    // Trouver l'employé
    const employeDoc = await User.findOne({
      "employer.matricule": matricule,
      ...(req.user.role !== "Admin" && { "employer.createdByrh": req.user._id }) // RH seulement
    });

    if (!employeDoc) return res.status(404).json({ message: "Employé introuvable ou non autorisé." });

    const performance = await Performance.create({
      employe: employeDoc._id,
      objectif,
      description,
      realisation: realisation || 'Non démarré',
      evaluation: evaluation || 'Moyen',
      createdByrh: req.user.role === "Admin" ? null : req.user._id // Admin peut créer sans être RH
    });

    res.status(201).json(performance);
  } catch (err) {
    console.error("Erreur ajouterPerformance:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Lister toutes les performances
exports.getAllPerformances = async (req, res) => {
  try {
    let performances;

    if (req.user.role === "Admin") {
      performances = await Performance.find()
        .populate({
          path: 'employe',
          select: 'nom prenom email employer.matricule employer.poste employer.departement',
        })
        .sort({ createdAt: -1 });
    } else {
      // RH : performances de ses employés
      const mesEmployes = await User.find({ "employer.createdByrh": req.user._id }).select('_id');

      performances = await Performance.find({ employe: { $in: mesEmployes } })
        .populate({
          path: 'employe',
          select: 'nom prenom email employer.matricule employer.poste employer.departement',
        })
        .sort({ createdAt: -1 });
    }

    res.status(200).json(performances);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Modifier une performance
exports.updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { objectif, description, realisation, evaluation } = req.body;

    const perf = await Performance.findById(id).populate('employe');
    if (!perf) return res.status(404).json({ message: "Performance non trouvée." });

    // Vérifier droits
    if (req.user.role !== "Admin" && !perf.employe?.employer?.createdByrh.equals(req.user._id)) {
      return res.status(403).json({ message: "Non autorisé à modifier cette performance" });
    }

    if (objectif !== undefined) perf.objectif = objectif;
    if (description !== undefined) perf.description = description;
    if (realisation !== undefined) perf.realisation = realisation;
    if (evaluation !== undefined) perf.evaluation = evaluation;

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

    let perf;

    if (req.user.role === "Admin") {
      perf = await Performance.findByIdAndDelete(id);
    } else {
      perf = await Performance.findOneAndDelete({ _id: id, createdByrh: req.user._id });
    }

    if (!perf) return res.status(404).json({ message: "Performance non trouvée ou non autorisée." });

    res.status(200).json({ message: "Performance supprimée avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Récupérer une performance par ID
exports.getPerformanceById = async (req, res) => {
  try {
    const perf = await Performance.findById(req.params.id).populate('employe');
    if (!perf) return res.status(404).json({ message: 'Performance non trouvée' });

    // Vérifier droits
    if (req.user.role !== "Admin" && !perf.employe?.employer?.createdByrh.equals(req.user._id)) {
      return res.status(403).json({ message: "Non autorisé à consulter cette performance" });
    }

    res.status(200).json(perf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
