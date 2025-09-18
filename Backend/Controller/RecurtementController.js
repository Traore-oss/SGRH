const Recrutement = require("../Models/recrutementModel");

// Créer une offre
const nodemailer = require("nodemailer");
const Recrutement = require("../Models/recrutementModel");

// Créer une offre
exports.createOffre = async (req, res) => {
  try {
    const offre = new Recrutement(req.body);
    await offre.save();

    // Lien unique de candidature
    const lienCandidature = `${process.env.CLIENT_URL || "http://localhost:5173"}/candidature/${offre._id}`;

    // --- Exemple d’envoi d’email avec Nodemailer ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "candidats@example.com", // ⚠️ liste des destinataires ou RH
      subject: `Nouvelle offre : ${offre.poste}`,
      html: `
        <h2>Nouvelle offre publiée</h2>
        <p>${offre.description}</p>
        <p><a href="${lienCandidature}">Cliquez ici pour postuler</a></p>
      `,
    });

    res.status(201).json({
      message: "Offre créée ✅",
      offre,
      lienCandidature,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur création offre", error: error.message });
  }
};


// Lister toutes les offres
exports.getOffres = async (req, res) => {
  try {
    const offres = await Recrutement.find().populate("departement");
    res.status(200).json(offres);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération offres", error: error.message });
  }
};

// Modifier une offre
exports.updateOffre = async (req, res) => {
  try {
    const updated = await Recrutement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Offre mise à jour ✅", updated });
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour", error: error.message });
  }
};

// Supprimer une offre
exports.deleteOffre = async (req, res) => {
  try {
    await Recrutement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Offre supprimée ✅" });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression", error: error.message });
  }
};

// Ajouter un candidat
exports.addCandidat = async (req, res) => {
  try {
    const offre = await Recrutement.findById(req.params.id);
    if (!offre) return res.status(404).json({ message: "Offre non trouvée" });
    offre.candidats.push(req.body);
    await offre.save();
    res.status(200).json({ message: "Candidature ajoutée ✅", offre });
  } catch (error) {
    res.status(500).json({ message: "Erreur ajout candidat", error: error.message });
  }
};
