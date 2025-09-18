const Recrutement = require("../Models/recrutementModel");
const nodemailer = require("nodemailer");

// Créer une offre
exports.createOffre = async (req, res) => {
  try {
    const rhId = req.user._id;
    const { poste, description, departement, statut } = req.body;

    if (!poste || !description) {
      return res.status(400).json({ message: "Poste et description sont requis." });
    }

    // ⚠ Vérifier si le departement est un ObjectId valide
    let departementId = null;
    if (departement) {
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(departement)) {
        departementId = departement;
      } else {
        return res.status(400).json({ message: "ID de département invalide" });
      }
    }

    const offre = new Recrutement({
      rh: rhId,
      poste,
      description,
      departement: departementId,
      statut
    });

    await offre.save();

    const lienCandidature = `${process.env.CLIENT_URL || "http://localhost:5173"}/candidature/${offre._id}`;

    // Envoi mail optionnel
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "candidats@example.com",
        subject: `Nouvelle offre : ${offre.poste}`,
        html: `<h2>Nouvelle offre publiée</h2>
               <p>${offre.description}</p>
               <p><a href="${lienCandidature}">Cliquez ici pour postuler</a></p>`,
      });
    }

    res.status(201).json({ message: "Offre créée ✅", offre, lienCandidature });
  } catch (error) {
    console.error("Erreur createOffre:", error);
    res.status(500).json({ message: "Erreur création offre", error: error.message });
  }
};

// Récupérer toutes les offres
exports.getOffres = async (req, res) => {
  try {
    const offres = await Recrutement.find()
      .populate("departement", "nom code_departement")
      .populate("rh", "nom prenom email");
    res.status(200).json(offres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des offres" });
  }
};

// Ajouter un candidat
exports.addCandidat = async (req, res) => {
  try {
    const { prenom, nom, email, cvUrl } = req.body;
    const { offreId } = req.params;

    const offre = await Recrutement.findById(offreId);
    if (!offre) return res.status(404).json({ message: "Offre non trouvée" });

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
