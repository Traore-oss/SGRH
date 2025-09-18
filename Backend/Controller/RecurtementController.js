const Recrutement = require("../Models/recrutementModel");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

// Créer une offre avec envoi du mail
exports.createOffre = async (req, res) => {
  try {
    const rhId = req.user._id;
    const { poste, description, departement, statut } = req.body;

    if (!poste || !description) {
      return res.status(400).json({ message: "Poste et description sont requis." });
    }

    // Vérification du département
    let departementId = null;
    if (departement) {
      if (mongoose.Types.ObjectId.isValid(departement)) {
        departementId = departement;
      } else {
        return res.status(400).json({ message: "ID de département invalide" });
      }
    }

    // Création de l'offre
    const offre = new Recrutement({
      rh: rhId,
      poste,
      description,
      departement: departementId,
      statut
    });

    await offre.save();

    // Génération du lien de candidature
    const lienCandidature = `${process.env.CLIENT_URL || "http://localhost:5173"}/candidature/${offre._id}`;

    // Configuration de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // ou autre service SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Options du mail
    const mailOptions = {
      from: `"SGRH" <${process.env.EMAIL_USER}>`,
      to: req.user.email, // envoi au RH qui crée l'offre
      subject: "Nouvelle offre de recrutement",
      html: `
        <h3>Une nouvelle offre a été créée !</h3>
        <p><strong>Poste :</strong> ${poste}</p>
        <p><strong>Description :</strong> ${description}</p>
        <p>Pour consulter et gérer les candidatures, cliquez sur le lien :</p>
        <a href="${lienCandidature}" target="_blank">Voir l'offre et candidatures</a>
      `,
    };

    // Envoi du mail
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Offre créée ✅ et mail envoyé au RH",
      offre,
      lienCandidature
    });

  } catch (error) {
    console.error("Erreur createOffre:", error);
    res.status(500).json({ message: "Erreur création offre", error: error.message });
  }
};


// Récupérer toutes les offres (filtrées selon le rôle)
exports.getOffres = async (req, res) => {
  try {
    let query = {};

    // ⚡ Si c'est un RH → il ne voit que ses offres
    if (req.user.role === "RH") {
      query.rh = req.user._id;
    }

    // ⚡ Si Admin → il voit tout (pas de filtre)
    // ⚡ Tu peux étendre si Employé doit voir aussi seulement les offres visibles publiquement

    const offres = await Recrutement.find(query)
      .populate("departement", "nom code_departement")
      .populate("rh", "nom prenom email");

    res.status(200).json(offres);
  } catch (err) {
    console.error("Erreur getOffres:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des offres" });
  }
};


// Ajouter un candidat
exports.addCandidat = async (req, res) => {
  try {
    const { prenom, nom, email } = req.body;
    const { offreId } = req.params;

    console.log("Paramètre offreId reçu :", offreId); // ← debug

    if (!offreId) return res.status(400).json({ message: "Offre introuvable." });

    const offre = await Recrutement.findById(offreId);
    if (!offre) return res.status(404).json({ message: "Offre non trouvée" });

    let cvUrl = "";
    if (req.file) {
      cvUrl = `${req.protocol}://${req.get("host")}/uploads/cv/${req.file.filename}`;
    }

    offre.candidats.push({ prenom, nom, email, cvUrl, statutCandidature: "En attente" });
    await offre.save();

    res.status(200).json({ message: "Candidat ajouté ✅", offre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'ajout du candidat" });
  }
};


// Modifier une offre
exports.updateOffre = async (req, res) => {
  try {
    const { offreId } = req.params;
    const updatedData = req.body;

    const updatedOffre = await Recrutement.findByIdAndUpdate(offreId, updatedData, { new: true });
    res.status(200).json({ message: "Offre mise à jour ✅", updated: updatedOffre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'offre" });
  }
};

// Supprimer une offre
exports.deleteOffre = async (req, res) => {
  try {
    const { offreId } = req.params;
    await Recrutement.findByIdAndDelete(offreId);
    res.status(200).json({ message: "Offre supprimée ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression de l'offre" });
  }
};
// Récupérer la liste des candidats pour une offre donnée
exports.getCandidats = async (req, res) => {
  try {
    const { offreId } = req.params;

    if (!offreId) return res.status(400).json({ message: "Offre introuvable." });

    const offre = await Recrutement.findById(offreId).populate("departement", "nom code_departement").populate("rh", "nom prenom email");
    if (!offre) return res.status(404).json({ message: "Offre non trouvée." });

    res.status(200).json({ candidats: offre.candidats });
  } catch (err) {
    console.error("Erreur getCandidats:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des candidats" });
  }
};
