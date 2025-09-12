const mongoose = require("mongoose");

const rapportSchema = new mongoose.Schema({
       employe: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Utilisateur',
          required: true
        },
        rh: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Utilisateur',
          required: true
        },
  type: { type: String, enum: ["Presence", "Salaire", "Conge"], required: true },
  periode: { type: String, required: true }, // ex: "Août 2025"
  donnees: { type: Object, required: true }, // JSON brut du rapport
  generePar: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
  dateGeneration: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Rapport", rapportSchema);
