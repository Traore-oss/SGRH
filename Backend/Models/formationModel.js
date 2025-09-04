const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  formateur: { type: String, required: true },
  debut: { type: Date, required: true },
  fin: { type: Date, required: true },
  statut: {
    type: String,
    enum: ['Prévue', 'En cours', 'Terminée'],
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Formation', formationSchema);
