const mongoose = require("mongoose");

const recrutementSchema = new mongoose.Schema({
       rh: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Utilisateur',
              required: true
            },
  poste: { type: String, required: true },
  description: { type: String, required: true },
  departement: { type: mongoose.Schema.Types.ObjectId, ref: "Departement" },
  statut: { 
    type: String, 
    enum: ["Ouvert", "En cours", "Clôturé"], 
    default: "Ouvert" 
  },
  candidats: [
    {
      nom: String,
      prenom: String,
      email: String,
      cvUrl: String,
      statutCandidature: {
        type: String,
        enum: ["En attente", "Retenu", "Rejeté"],
        default: "En attente"
      },
      dateCandidature: { type: Date, default: Date.now }
    }
  ],
  datePublication: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recrutement", recrutementSchema);
