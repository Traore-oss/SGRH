const Conge = require("../Models/CongesModel");
const User = require("../Models/usersModel");
const nodemailer = require("nodemailer");

// ➕ Créer un congé
exports.creerConge = async (req, res) => {
  try {
    const { typeConge, dateDebut, dateFin, raison } = req.body;

    // Vérification des champs obligatoires
    if (!typeConge || !dateDebut || !dateFin) {
      return res.status(400).json({ message: "Tous les champs requis doivent être remplis" });
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (fin < debut) {
      return res.status(400).json({ message: "La date de fin doit être après la date de début" });
    }

    // ✅ Utilisateur connecté
    const employe = req.user;

    if (!employe) {
      return res.status(404).json({ message: "Utilisateur connecté introuvable" });
    }

    if (!employe.employer?.createdByrh) {
      return res.status(400).json({ message: "Cet employé n'a pas de RH assigné" });
    }

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
// === Récupérer tous les congés ===
exports.getAllConges = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    let conges;

    if (req.user.role === "Admin") {
      // ➡️ Admin : voir TOUS les congés
      conges = await Conge.find()
        .populate("employe", "nom prenom employer")
        .sort({ createdAt: -1 });
    } 
    else if (req.user.role === "RH") {
      // ➡️ RH : récupérer les congés de ses employés
      const employes = await User.find({
        "employer.createdByrh": req.user._id,
      }).select("_id");

      const employeIds = employes.map((emp) => emp._id);

      if (employeIds.length === 0) {
        return res.status(200).json([]);
      }

      conges = await Conge.find({ employe: { $in: employeIds } })
        .populate("employe", "nom prenom employer")
        .sort({ createdAt: -1 });
    } 
    else {
      // ➡️ Employé : uniquement ses congés
      conges = await Conge.find({ employe: req.user._id })
        .populate("employe", "nom prenom employer")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(conges);
  } catch (err) {
    return res.status(500).json({
      message: "Erreur lors de la récupération des congés",
      error: err.message,
    });
  }
};

// === Supprimer un congé (Admin) ===
exports.supprimerConge = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Accès refusé. Seul l'Admin peut supprimer un congé." });
    }

    const conge = await Conge.findByIdAndDelete(req.params.id);

    if (!conge) {
      return res.status(404).json({ message: "Congé introuvable" });
    }

    res.status(200).json({ message: "Congé supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du congé", error: err.message });
  }
};
