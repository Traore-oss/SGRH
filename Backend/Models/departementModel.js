const mongoose = require('mongoose');

const departementSchema = new mongoose.Schema({
       rh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true
    },
  code_departement: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  chef: String,
  effectif: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Departement', departementSchema);