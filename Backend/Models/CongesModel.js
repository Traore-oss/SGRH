const mongoose = require("mongoose");
const congeSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur", required: true },
  typeConge: { type: String, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  motif: { type: String },
  etat: { type: String, enum: ["en attente", "approuvé", "refusé"], default: "en attente" },
  commentaireResponsable: { type: String },
  dateValidation: { type: Date },
  emailEnvoye: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Conge", congeSchema);
