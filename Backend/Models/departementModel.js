const mongoose = require('mongoose');

const departementSchema = new mongoose.Schema({
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