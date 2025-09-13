const { log } = require("console");
const Conge = require("../Models/CongesModel");
const User = require("../Models/usersModel");
const nodemailer = require("nodemailer");

// ➕ Créer un congé
exports.creerConge = async (req, res) => {
  try {
    const { employeId, typeConge, dateDebut, dateFin, raison } = req.body;

    // Vérification des champs obligatoires
    const champsManquants = [];
    if (!employeId) champsManquants.push("employeId");
    if (!typeConge) champsManquants.push("typeConge");
    if (!dateDebut) champsManquants.push("dateDebut");
    if (!dateFin) champsManquants.push("dateFin");

    if (champsManquants.length > 0) {
      return res.status(400).json({ 
        message: `Champs obligatoires manquants: ${champsManquants.join(", ")}` 
      });
    }

    // Vérification des dates
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (fin < debut) {
      return res.status(400).json({ message: "La date de fin doit être après la date de début" });
    }

    // Vérification de l'employé
    const employe = await User.findById(employeId);
    if (!employe) {
      return res.status(404).json({ message: "Employé introuvable" });
    }

    // Vérification du RH responsable
    if (!employe.employer?.createdByrh) {
      return res.status(400).json({ message: "Cet employé n'a pas de RH assigné" });
    }

    // Création du congé
    const nouveauConge = new Conge({
      employe: employe._id,
      rh: employe.employer.createdByrh,
      typeConge,
      dateDebut: debut,
      dateFin: fin,
      motif: raison || "",
      etat: "en attente"
    });

    await nouveauConge.save();
    res.status(201).json({ message: "Congé créé avec succès", conge: nouveauConge });

  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du congé", error: err.message });
  }
};


// ✅ Approuver un congé
exports.approuverConge = async (req, res) => {
  try {
    const conge = await Conge.findByIdAndUpdate(
      req.params.id,
      { etat: "approuvé", dateValidation: Date.now() },
      { new: true }
    ).populate("employe rh", "nom prenom email");

    if (!conge) return res.status(404).json({ message: "Congé introuvable" });

    // envoyer email à l'employé
    await sendEmail(
      conge.employe.email,
      "Votre congé a été approuvé",
      `Bonjour ${conge.employe.nom}, votre congé a été approuvé par ${conge.rh.nom}.`
    );

    conge.emailEnvoye = true;
    await conge.save();

    res.status(200).json({ message: "Congé approuvé et email envoyé", conge });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l’approbation du congé", error: err.message });
  }
};

// ❌ Refuser un congé
exports.refuserConge = async (req, res) => {
  try {
    const conge = await Conge.findByIdAndUpdate(
      req.params.id,
      { etat: "refusé", dateValidation: Date.now() },
      { new: true }
    ).populate("employe rh", "nom prenom email");

    if (!conge) return res.status(404).json({ message: "Congé introuvable" });

    await sendEmail(
      conge.employe.email,
      "Votre congé a été refusé",
      `Bonjour ${conge.employe.nom}, votre congé a été refusé par ${conge.rh.nom}.`
    );

    conge.emailEnvoye = true;
    await conge.save();

    res.status(200).json({ message: "Congé refusé et email envoyé", conge });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du refus du congé", error: err.message });
  }
};

// Fonction pour envoyer email
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
};
// 🔄 Récupérer tous les congés
exports.getAllConges = async (req, res) => {
  try {
    // ID du RH connecté (via middleware JWT par ex.)
    const rhId = req.user._id;

    const conges = await Conge.find({ rh: rhId })
      .populate('employe', 'nom prenom employer')
      .populate('rh', 'nom prenom email'); // utile pour affichage

    res.status(200).json(conges);
  } catch (err) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération des congés", 
      error: err.message 
    });
  }
};

// 🔄 Récupérer les congés d’un employé
exports.getCongesEmploye = async (req, res) => {
  try {
    const employeId = req.user.employer?._id; // ID de l’employé connecté
    if (!employeId) {
      return res.status(400).json({ message: "Impossible de récupérer l'identifiant de l'employé" });
    }

    const conges = await Conge.find({ employe: employeId })
      .populate('employe', 'nom prenom matricule')
      .populate('rh', 'nom prenom email');

    res.status(200).json(conges);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération des congés",
      error: err.message
    });
  }
};
