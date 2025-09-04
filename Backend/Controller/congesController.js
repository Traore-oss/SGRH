// controllers/congeController.js
const Conge = require('../Models/CongesModel');
const User = require('../Models/usersModel');
const nodemailer = require('nodemailer');

// Config du service d'envoi d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 📌 Créer un congé (avec calcul automatique du nbJours)
exports.creerConge = async (req, res) => {
  try {
    const { matricule, typeConge, dateDebut, dateFin, motif } = req.body;

    // Vérification des champs obligatoires
    if (!matricule || !dateDebut || !dateFin) {
      return res.status(400).json({ message: "Matricule et dates obligatoires" });
    }

    // Vérification de l'employé par matricule
    const employe = await User.findOne({ matricule });
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (fin < debut) return res.status(400).json({ message: "La date de fin ne peut pas être avant la date de début" });

    // Calcul du nombre de jours inclusif
    const diffTime = Math.abs(fin - debut);
    const nbJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Création du congé
    const newConge = await Conge.create({
      employe: employe._id,
      typeConge,
      dateDebut: debut,
      dateFin: fin,
      nbJours,
      motif
    });

    res.status(201).json({ 
      message: "Demande de congé créée avec succès",
      conge: newConge
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Récupérer tous les congés (Admin)
exports.getAllConges = async (req, res) => {
  try {
    const conges = await Conge.find().populate('employe', 'nom prenom email matricule');
    res.status(200).json(conges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Récupérer un congé par ID
exports.getCongeById = async (req, res) => {
  try {
    const conge = await Conge.findById(req.params.id).populate('employe', 'nom prenom email matricule');
    if (!conge) return res.status(404).json({ message: "Congé non trouvé" });
    res.status(200).json(conge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Mettre à jour un congé
exports.updateEtatConge = async (req, res) => {
  try {
    const conge = await Conge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!conge) return res.status(404).json({ message: "Congé non trouvé" });
    res.status(200).json({ message: "Congé mis à jour", conge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Supprimer un congé
exports.supprimerConge = async (req, res) => {
  try {
    const conge = await Conge.findByIdAndDelete(req.params.id);
    if (!conge) return res.status(404).json({ message: "Congé non trouvé" });
    res.status(200).json({ message: "Congé supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Approver un congé
exports.approuverConge = async (req, res) => {
  try {
    const conge = await Conge.findById(req.params.id).populate('employe', 'nom prenom email matricule');
    if (!conge) return res.status(404).json({ message: "Congé non trouvé" });
    if (!conge.employe) return res.status(400).json({ message: "Aucun employé lié à ce congé" });

    conge.isApproved = true;
    await conge.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: conge.employe.email,
      subject: "Votre demande de congé a été approuvée",
      text: `Bonjour ${conge.employe.nom},\n\nVotre demande de congé du ${conge.dateDebut.toLocaleDateString()} au ${conge.dateFin.toLocaleDateString()} a été approuvée.\n\nCordialement,\nL'équipe RH`
    });

    res.status(200).json({ message: "Congé approuvé et email envoyé", conge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Refuser un congé
exports.refuserConge = async (req, res) => {
  try {
    const conge = await Conge.findById(req.params.id).populate('employe', 'nom prenom email matricule');
    if (!conge) return res.status(404).json({ message: "Congé non trouvé" });
    if (!conge.employe) return res.status(400).json({ message: "Aucun employé lié à ce congé" });

    conge.isApproved = false;
    await conge.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: conge.employe.email,
      subject: "Votre demande de congé a été refusée",
      text: `Bonjour ${conge.employe.nom},\n\nVotre demande de congé du ${conge.dateDebut.toLocaleDateString()} au ${conge.dateFin.toLocaleDateString()} a été refusée.\n\nCordialement,\nL'équipe RH`
    });

    res.status(200).json({ message: "Congé refusé et email envoyé", conge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
