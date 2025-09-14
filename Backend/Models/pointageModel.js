const mongoose = require('mongoose');

const pointageSchema = new mongoose.Schema({
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
  },
  date: { type: String, required: true },
  statut: { type: String, enum: ['Présent', 'Retard', 'Absent'], default: 'Absent' },
  heureArrivee: { type: String, default: '-' },
  heureDepart: { type: String, default: '-' },
  heuresTravaillees: { type: String, default: '-' },
  retard: { type: String, default: '-' },
}, { timestamps: true });

// Index unique sur employe + date pour éviter les doublons
pointageSchema.index({ employe: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', pointageSchema);
