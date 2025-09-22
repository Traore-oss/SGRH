const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
  employe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Utilisateur", 
    required: true 
  },

  mois: { type: String, required: true }, // exemple: "2025-09"
  salaireBase: { type: Number, required: true },
  primes: { type: Number, default: 0 },
  heuresSupplementaires: { type: Number, default: 0 },
  retenues: { type: Number, default: 0 },
  absences: { type: Number, default: 0 },

  salaireNet: { type: Number, required: true },

  statut: { 
    type: String, 
    enum: ["En attente", "Payé", "Annulé"], 
    default: "En attente" 
  },

  modePaiement: { 
    type: String, 
    enum: ["Virement", "Espèces", "Chèque", "Orange Money","Mobile Money"], 
    default: "Virement" 
  },

  datePaiement: { type: Date },
  remarque: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Paiement", paiementSchema);
