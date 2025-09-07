const mongoose = require('mongoose');

const pointageSchema = new mongoose.Schema({
  matricule: { type: String, required: true },
  date: { type: String, required: true },
  statut: { type: String, enum: ['Présent', 'Retard', 'Absent'], default: 'Absent' },
  heureArrivee: { type: String, default: '-' },
  heureDepart: { type: String, default: '-' },
  heuresTravaillees: { type: String, default: '-' },
  retard: { type: String, default: '-' },
}, { timestamps: true });

// Index unique par matricule + date
pointageSchema.index({ matricule: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', pointageSchema);