const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  // ==== Champs communs à tous les utilisateurs ====
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  genre: { type: String, enum: ["Homme", "Femme", "Autre"], required: true },
  date_naissance: { type: Date },
  telephone: { type: String },
  adresse: { type: String },
  photo: { type: String },
  role: { type: String, enum: ["Admin", "RH", "Employe"], required: true },
  isActive: { type: Boolean, default: true },

  // ==== Infos entreprises pour les RH ====
  rh: {
    type: {
      nomEntreprise: { type: String }
    },
    default: undefined,
    _id: false
  },

  // ==== Infos spécifiques aux employés ====
  employer: {
    type: {
      matricule: { type: String, unique: true, sparse: true },
      poste: { type: String },
      salaire: { type: Number, default: 0 },
      typeContrat: { type: String, enum: ["CDI", "CDD", "Stage", "Freelance"], default: "CDI" },
      statut: { type: String, enum: ["Actif", "Inactif", "Congé", "Suspendu"], default: "Actif" },
      departement: { type: mongoose.Schema.Types.ObjectId, ref: "Departement" },
      numeroCNSS: { type: String },
      numeroCIN: { type: String },
      banque: { type: String },
      numeroCompte: { type: String },
      date_embauche: { type: Date, default: Date.now },
      joursCongesRestants: { type: Number, default: 26 },
      derniereEvaluation: { type: Date },
      notes: { type: String },
            // 🔑 RH qui a créé l'employé
      createdByrh: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
    },
    default: undefined,
    _id: false
  }

}, {
  timestamps: true
});

// Hashage du mot de passe avant sauvegarde
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Utilisateur", userSchema);
