  const bcrypt = require("bcrypt");
  const Utilisateur = require("../Models/usersModel");
  const { createToken, maxAge } = require("../Utile/jwt");

  // Connexion
  const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await Utilisateur.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({ error: "Utilisateur non trouvé" });
      }

      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        return res.status(400).json({ error: "Mot de passe incorrect" });
      }

      // 🔑 Génère le token avec l’ID
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

  // Déconnexion
  const logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Déconnexion réussie" });
  };

  // Activer / désactiver un utilisateur
  const toggleActive = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = await Utilisateur.findById(id);

      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      utilisateur.isActive = !utilisateur.isActive;
      await utilisateur.save();

      res.status(200).json({ message: "Statut mis à jour", utilisateur });
    } catch (err) {
      console.error("Erreur toggleActive:", err.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

  module.exports = { signIn, logout, toggleActive };
