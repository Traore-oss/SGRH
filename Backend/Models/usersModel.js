const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
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
  matricule: { type: String, required: false, unique: true },
  isActive: { type: Boolean, default: true },

  rh: {
    type: { nomEntreprise: { type: String } },
    default: undefined,
    _id: false
  },

  employer: {
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
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
      createdByrh: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" },
    },
    default: undefined
  },

  // ⚡ Champs pour mot de passe oublié
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }

}, { timestamps: true });

// 🔑 Hash du mot de passe avant sauvegarde
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
