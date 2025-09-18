const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur', // Référence directe à la collection Utilisateur
    required: true,
  },
  date: { 
    type: String, 
    required: true 
  },
  statut: { 
    type: String, 
    enum: ['Présent', 'Retard', 'Absent'], 
    default: 'Absent' 
  },
  heureArrivee: { 
    type: String, 
    default: '-' 
  },
  heureDepart: { 
    type: String, 
    default: '-' 
  },
  heuresTravaillees: { 
    type: String, 
    default: '-' 
  },
  retard: { 
    type: String, 
    default: '-' 
  },
}, { timestamps: true });

// Empêcher les doublons : un employé ne peut pas avoir deux pointages le même jour
attendanceSchema.index({ employe: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
