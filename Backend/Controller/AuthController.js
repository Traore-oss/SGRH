const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Utilisateur = require("../Models/usersModel");
const { createToken, maxAge } = require("../Utile/jwt");

// ----------------- SIGNUP RH -----------------
const createRH = async (req, res) => {
  try {
    const { nom, prenom, email, genre, password, nomEntreprise } = req.body;

    // 🔹 Vérification des champs obligatoires
    if (!nom || !prenom || !email || !password || !genre) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    // 🔹 Vérifie si l'utilisateur existe déjà
    const existUser = await Utilisateur.findOne({ email });
    if (existUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });

    // 🔹 Création du RH (le mot de passe sera hashé automatiquement par le hook pre "save")
    const newRH = new Utilisateur({
      nom,
      prenom,
      email,
      genre,
      password, // ⚡ en clair ici, pas de double hash
      role: "RH",
      isActive: true,
      rh: {
        nomEntreprise: nomEntreprise || ""
      }
    });

    await newRH.save();

    // 🔹 Génération du token JWT pour connexion immédiate
    const token = createToken(newRH._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // 🔹 Réponse JSON avec info RH
    res.status(201).json({
      message: "RH créé avec succès ✅",
      rhInfo: {
        _id: newRH._id,
        nom: newRH.nom,
        prenom: newRH.prenom,
        email: newRH.email,
        genre: newRH.genre,
        role: newRH.role,
        nomEntreprise: newRH.rh.nomEntreprise,
        token
      }
    });

  } catch (err) {
    console.error("Erreur createRH:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// ----------------- SIGNIN -----------------
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Utilisateur.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ error: "Utilisateur non trouvé" });

    if (!user.isActive) {
      return res.status(403).json({ error: "Compte désactivé, contactez l'administrateur" });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = createToken(user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Connexion réussie", user });
  } catch (err) {
    console.error("Erreur signIn:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ----------------- LOGOUT -----------------
const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({ message: "Déconnexion réussie" });
};

// ----------------- TOGGLE ACTIVE -----------------
const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await Utilisateur.findById(id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });

    utilisateur.isActive = !utilisateur.isActive;
    await utilisateur.save();

    return res.status(200).json({
      message: `Utilisateur ${utilisateur.isActive ? "activé" : "désactivé"} avec succès`,
      utilisateur
    });
  } catch (err) {
    console.error("Erreur toggleActive:", err.message);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ----------------- MOT DE PASSE OUBLIÉ -----------------
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Utilisateur.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const message = `Bonjour,\n\nCliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}\n\nLe lien est valide 1 heure.`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Réinitialisation du mot de passe",
      text: message,
    });

    res.status(200).json({ message: "Email de réinitialisation envoyé" });
  } catch (err) {
    console.error("Erreur forgotPassword:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ----------------- RESET PASSWORD -----------------
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Utilisateur.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Lien invalide ou expiré" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("Erreur resetPassword:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ----------------- VERIFY RESET TOKEN -----------------
const verifyResetToken = async (req, res) => {
  const { token } = req.params;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await Utilisateur.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Lien invalide ou expiré" });

    res.status(200).json({ message: "Token valide" });
  } catch (err) {
    console.error("Erreur verifyResetToken:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { 
  createRH,
  signIn, 
  logout, 
  toggleActive, 
  forgotPassword, 
  resetPassword, 
  verifyResetToken 
};
