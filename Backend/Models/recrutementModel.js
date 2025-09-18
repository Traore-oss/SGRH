const mongoose = require("mongoose");

const candidatSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  cvUrl: { type: String },
  statutCandidature: {
    type: String,
    enum: ["En attente", "Retenu", "Rejeté"],
    default: "En attente",
  },
  dateCandidature: { type: Date, default: Date.now },
});

const recrutementSchema = new mongoose.Schema({
  rh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
    required: true,
  },
  poste: { type: String, required: true },
  description: { type: String, required: true },
  departement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Departement",
    required: false,
  },
  statut: {
    type: String,
    enum: ["Ouvert", "En cours", "Clôturé"],
    default: "Ouvert",
  },
  candidats: [candidatSchema],
  datePublication: { type: Date, default: Date.now },
});

// Index pour retrouver rapidement les offres par RH ou département
recrutementSchema.index({ rh: 1, departement: 1, datePublication: -1 });

module.exports = mongoose.model("Recrutement", recrutementSchema);
