const mongoose = require('mongoose');

const SalaireSchema = new mongoose.Schema({
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
  nom: { type: String, required: true },
  salaireJournalier: { type: Number, required: true },
  joursTravailles: { type: Number, required: true },
  primes: { type: Number, default: 0 },
  retenues: { type: Number, default: 0 },
  absences: { type: Number, default: 0 },
  heuresSup: { type: Number, default: 0 },
  salaireNet: { type: Number }, // Calculé
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Salaire', SalaireSchema);
