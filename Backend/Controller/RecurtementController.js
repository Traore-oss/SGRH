const Recrutement = require("../Models/recrutementModel");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

// ==================== Création d'une offre ====================
exports.createOffre = async (req, res) => {
  try {
    const rhId = req.user._id;
    const { poste, description, departement, statut } = req.body;

    if (!poste || !description) {
      return res.status(400).json({ message: "Poste et description sont requis." });
    }

    let departementId = null;
    if (departement) {
      if (!mongoose.Types.ObjectId.isValid(departement)) {
        return res.status(400).json({ message: "ID de département invalide" });
      }
      departementId = departement;
    }

    const offre = new Recrutement({
      rh: rhId,
      poste,
      description,
      departement: departementId,
      statut
    });

    await offre.save();

    // Lien candidature
    const lienCandidature = `${process.env.CLIENT_URL || "http://localhost:5173"}/candidature/${offre._id}`;

    // Envoi mail au RH
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"SGRH" <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: "Nouvelle offre de recrutement",
      html: `
        <h3>Une nouvelle offre a été créée !</h3>
        <p><strong>Poste :</strong> ${poste}</p>
        <p><strong>Description :</strong> ${description}</p>
        <p>Pour gérer les candidatures, cliquez sur :</p>
        <a href="${lienCandidature}" target="_blank">Voir l'offre</a>
      `,
    });

    res.status(201).json({ message: "Offre créée ✅ et mail envoyé au RH", offre, lienCandidature });
  } catch (err) {
    console.error("Erreur createOffre:", err);
    res.status(500).json({ message: "Erreur création offre", error: err.message });
  }
};

// ==================== Récupérer toutes les offres ====================
exports.getOffres = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "RH") query.rh = req.user._id;

    const offres = await Recrutement.find(query)
      .populate("departement", "nom code_departement")
      .populate("rh", "nom prenom email");

    res.status(200).json(offres);
  } catch (err) {
    console.error("Erreur getOffres:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des offres" });
  }
};

// ==================== Ajouter un candidat et récupérer son ID ====================
exports.addCandidat = async (req, res) => {
  try {
    const { prenom, nom, email } = req.body;
    const { offreId } = req.params;

    if (!offreId) return res.status(400).json({ message: "Offre introuvable." });

    const offre = await Recrutement.findById(offreId);
    if (!offre) return res.status(404).json({ message: "Offre non trouvée" });

    let cvUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/cv/${req.file.filename}`
      : "";

    const newCandidat = { prenom, nom, email, cvUrl, statutCandidature: "En attente" };
    const addedCandidat = offre.candidats.create(newCandidat);
    offre.candidats.push(addedCandidat);

    await offre.save();

    res.status(201).json({
      message: "Candidat ajouté ✅",
      candidat: {
        _id: addedCandidat._id,
        prenom: addedCandidat.prenom,
        nom: addedCandidat.nom,
        email: addedCandidat.email,
        statutCandidature: addedCandidat.statutCandidature,
        cvUrl: addedCandidat.cvUrl,
        dateCandidature: addedCandidat.dateCandidature,
      },
    });
  } catch (err) {
    console.error("Erreur addCandidat:", err);
    res.status(500).json({ message: "Erreur lors de l'ajout du candidat", error: err.message });
  }
};

// ==================== Modifier une offre ====================
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
// ==================== Supprimer une offre ====================
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

// ==================== Récupérer les candidats d'une offre ====================
exports.getCandidats = async (req, res) => {
  try {
    const { offreId } = req.params;

    if (!offreId) return res.status(400).json({ message: "Offre introuvable." });

    const offre = await Recrutement.findById(offreId)
      .populate("departement", "nom code_departement")
      .populate("rh", "nom prenom email");

    if (!offre) return res.status(404).json({ message: "Offre non trouvée." });

    res.status(200).json({ candidats: offre.candidats });
  } catch (err) {
    console.error("Erreur getCandidats:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des candidats" });
  }
};
// ==================== Accepter ou refuser une candidature ====================
exports.updateCandidatureStatus = async (req, res) => {
  try {
    const { offreId, candidatId } = req.params;
    const { statut } = req.body;

    if (!["Accepté", "Refusé"].includes(statut)) {
      return res.status(400).json({ message: "Statut invalide. Utilisez 'Accepté' ou 'Refusé'." });
    }

    const offre = await Recrutement.findById(offreId);
    if (!offre) return res.status(404).json({ message: "Offre non trouvée" });

    // Recherche du candidat
    const candidatIndex = offre.candidats.findIndex(c => c._id.toString() === candidatId);
    if (candidatIndex === -1) return res.status(404).json({ message: "Candidat introuvable" });

    // Mise à jour du statut
    offre.candidats[candidatIndex].statutCandidature = statut;
    await offre.save();

    // Envoi mail au candidat
    const candidat = offre.candidats[candidatIndex];
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"SGRH" <${process.env.EMAIL_USER}>`,
      to: candidat.email,
      subject: `Votre candidature pour le poste ${offre.poste}`,
      html: `
        <p>Bonjour ${candidat.prenom},</p>
        <p>Votre candidature pour le poste <strong>${offre.poste}</strong> a été <strong>${statut}</strong>.</p>
        ${statut === "Accepté"
          ? "<p>Félicitations ! Nous vous contacterons prochainement.</p>"
          : "<p>Merci pour votre candidature, nous vous souhaitons bonne continuation.</p>"
        }
        <p>Cordialement,</p>
        <p>L'équipe SGRH</p>
      `,
    });

    res.status(200).json({ message: `Candidature ${statut.toLowerCase()} ✅ et mail envoyé`, candidat });
  } catch (err) {
    console.error("Erreur updateCandidatureStatus:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut de candidature", error: err.message });
  }
};
