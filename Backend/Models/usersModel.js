const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const isEmail = require("validator/lib/isEmail");
const crypto = require("crypto");

const utilisateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, minlength: 3, maxlength: 50, trim: true },
    prenom: { type: String, required: true, minlength: 3, maxlength: 100, trim: true },
    genre: { type: String, required: true, trim: true },
    date_naissance: { 
      type: Date, 
      required: true,
      validate: {
        validator: function(value) {
          const today = new Date();
          const age = today.getFullYear() - value.getFullYear();
          const monthDiff = today.getMonth() - value.getMonth();
          const dayDiff = today.getDate() - value.getDate();
          if (age > 18) return true;
          if (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0))) return true;
          return false;
        },
        message: "Un employé doit avoir au moins 18 ans."
      }
    },
    email: { type: String, required: true, unique: true, validate: [isEmail, 'Email invalide'], lowercase: true, trim: true },
    telephone: { type: String, required: true, unique: true, trim: true },
    adresse: { type: String, required: true, trim: true },
    ville: { type: String, trim: true },
    codePostal: { type: String, trim: true },
    photo: { type: String },
    password: { type: String, select: false },
    role: { type: String, enum: ["Admin","rh", "Manager", "Employer"], required: true },
    isActive: { type: Boolean, default: true },
    statut: { type: String, enum: ["Actif", "Inactif", "Suspendu"], default: "Actif" },
    matricule: { type: String, trim: true, unique: true },
    poste: { type: String, trim: true },
    departement: { type: mongoose.Schema.Types.ObjectId, ref: "Departement" },
    salaire: { type: Number, default: 0 },
    typeContrat: { type: String, enum: ["CDI", "CDD", "Stage", "Freelance"], default: "CDI" },
    date_embauche: { type: Date, default: Date.now },
    statutMarital: { type: String, enum: ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf/Veuve"], default: "Célibataire" },
    numeroCNSS: { type: String, trim: true },
    numeroCIN: { type: String, trim: true },
    banque: { type: String, trim: true },
    numeroCompte: { type: String, trim: true },
    personneContact: { type: String, trim: true },
    telephoneUrgence: { type: String, trim: true },
    joursCongesRestants: { type: Number, default: 25 },
    derniereEvaluation: { type: Date },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

// 🔒 Hash mot de passe avant sauvegarde
utilisateurSchema.pre("save", async function(next) {
  if (this.password && this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (!this.matricule) {
    this.matricule = "EMP" + crypto.randomBytes(3).toString("hex").toUpperCase();
  }
  next();
});

// 🔑 Vérifier le mot de passe
utilisateurSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Utilisateur", utilisateurSchema);