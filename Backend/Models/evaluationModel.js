// models/performanceModel.js
const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    employe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur', // référence au modèle des utilisateurs/employés
      required: true
    },
      rh: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
      },
    objectif: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    realisation: {
      type: String,
      enum: ['Non démarré', 'En cours', 'Terminé'],
      default: 'Non démarré'
    },
    evaluation: {
      type: String,
      enum: ['Excellent', 'Bon', 'Moyen', 'Insuffisant'],
      default: 'Moyen'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Performance', performanceSchema);
