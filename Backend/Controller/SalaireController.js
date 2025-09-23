const Paiement = require('../Models/SalaireModel');
const User = require('../Models/usersModel');
const Pointage = require('../Models/pointageModel'); // 🔹 Import correct
const { calculerSalaireNet } = require('../Utile/calculSalaire');

// 🔹 Vérifie droits sur paiement
const verifierDroitPaiement = (user, employeDoc) => {
  if (user.role === "Admin") return true;
  if (user.role === "RH" && employeDoc.employer?.createdByrh?.equals(user._id)) return true;
  if (user.role === "Employe" && employeDoc._id.equals(user._id)) return true;
  return false; 
};
// ➕ Créer paiement (Admin ou RH)
exports.creerPaiement = async (req, res) => {
  try {
    const { matricule, mois, primes = 0, retenues = 0, modePaiement, remarque } = req.body;

    if (req.user.role === "Employe")
      return res.status(403).json({ message: "Les employés ne peuvent pas créer de paiement." });

    if (!matricule) return res.status(400).json({ message: "Le matricule est requis" });

    // 🔹 Recherche employé via matricule (racine OU employer.matricule)
    const employeDoc = await User.findOne({
      $or: [
        { matricule }, // matricule racine
        { "employer.matricule": matricule } // matricule dans employer
      ],
      ...(req.user.role !== "Admin" && { "employer.createdByrh": req.user._id })
    });

    if (!employeDoc) return res.status(404).json({ message: "Employé introuvable ou non autorisé." });

    // 🔹 Calcul automatique salaire
    const salaireBase = employeDoc.employer?.salaire || 0;

    // 🔹 Récupérer pointages pour le mois pour heures sup et absences
    const pointages = await Pointage.find({
      employe: employeDoc._id,
      mois
    });

    const heuresSupplementaires = pointages.reduce((sum, p) => sum + (p.heuresSupplementaires || 0), 0);
    const absences = pointages.reduce((sum, p) => sum + (p.absences || 0), 0);

    const salaireNet = calculerSalaireNet(
      salaireBase,
      primes,
      heuresSupplementaires,
      retenues,
      absences
    );

    const paiement = new Paiement({
      employe: employeDoc._id,
      mois,
      salaireBase,
      primes,
      heuresSupplementaires,
      retenues,
      absences,
      salaireNet,
      modePaiement,
      remarque,
      datePaiement: new Date()
    });

    await paiement.save();
    res.status(201).json({ message: "Paiement créé avec succès", paiement });

  } catch (error) {
    console.error("Erreur création paiement:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// 🔹 Récupérer tous les paiements (selon rôle)
exports.getPaiements = async (req, res) => {
  try {
    let paiements = await Paiement.find().populate("employe", "nom prenom employer.matricule employer.createdByrh");

    if (req.user.role === "RH") {
      // RH → seulement ses employés
      paiements = paiements.filter(p => p.employe?.employer?.createdByrh?.equals(req.user._id));
    } else if (req.user.role === "Employe") {
      // Employé → seulement ses paiements
      paiements = paiements.filter(p => p.employe?._id.equals(req.user._id));
    }
    // Admin voit tout

    res.status(200).json(paiements);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Récupérer un paiement par ID
exports.getPaiementById = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id)
      .populate("employe", "nom prenom employer.matricule employer.createdByrh");
    if (!paiement) return res.status(404).json({ message: "Paiement non trouvé" });

    if (!verifierDroitPaiement(req.user, paiement.employe)) {
      return res.status(403).json({ message: "Non autorisé à voir ce paiement." });
    }

    res.status(200).json(paiement);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Mettre à jour un paiement (Admin ou RH sur ses employés uniquement)
exports.updatePaiement = async (req, res) => {
  try {
    if (req.user.role === "Employe")
      return res.status(403).json({ message: "Les employés ne peuvent pas modifier de paiement." });

    const paiementExistant = await Paiement.findById(req.params.id).populate("employe");
    if (!paiementExistant) return res.status(404).json({ message: "Paiement non trouvé" });

    if (!verifierDroitPaiement(req.user, paiementExistant.employe)) {
      return res.status(403).json({ message: "Non autorisé à modifier ce paiement." });
    }

    const { salaireBase, primes, heuresSupplementaires, retenues, absences } = req.body;
    const salaireNet = calculerSalaireNet(
      salaireBase ?? paiementExistant.salaireBase,
      primes ?? paiementExistant.primes,
      heuresSupplementaires ?? paiementExistant.heuresSupplementaires,
      retenues ?? paiementExistant.retenues,
      absences ?? paiementExistant.absences
    );

    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, salaireNet },
      { new: true }
    );

    res.status(200).json({ message: "Paiement mis à jour", paiement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 🔹 Supprimer un paiement (Admin ou RH sur ses employés uniquement)
exports.deletePaiement = async (req, res) => {
  try {
    if (req.user.role === "Employe")
      return res.status(403).json({ message: "Les employés ne peuvent pas supprimer de paiement." });

    const paiement = await Paiement.findById(req.params.id).populate("employe");
    if (!paiement) return res.status(404).json({ message: "Paiement non trouvé" });

    if (!verifierDroitPaiement(req.user, paiement.employe)) {
      return res.status(403).json({ message: "Non autorisé à supprimer ce paiement." });
    }

    await Paiement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Paiement supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
