const mongoose = require('mongoose');

const congeSchema = new mongoose.Schema({
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
  typeConge: {
    type: String,
    enum: [
      'Congés payés',
      'Congé maladie',
      'Congé maternité',
      'Congé paternité',
      'Absence exceptionnelle'
    ],
    required: true
  },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  nbJours: { type: Number }, // ✅ calculé automatiquement
  motif: { type: String, default: '' },

  etat: { type: Boolean, default: null },
  commentaireResponsable: { type: String, default: '' },
  dateSoumission: { type: Date, default: Date.now },
  dateValidation: { type: Date, default: null }
}, {
  timestamps: true
});

// ✅ Calcul automatique du nombre de jours avant sauvegarde
congeSchema.pre('save', function (next) {
  if (this.dateDebut && this.dateFin) {
    const diffTime = Math.abs(this.dateFin - this.dateDebut);
    this.nbJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclut le jour de début
  }
  next();
});

module.exports = mongoose.model('Conge', congeSchema);
