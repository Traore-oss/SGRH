const Utilisateur = require("../Models/usersModel");
const nodemailer = require("nodemailer");

// === Transporteur email ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// === Générer matricule unique ===
async function generateMatricule() {
  let matricule;
  do {
    matricule = "EMP" + Math.floor(1000 + Math.random() * 9000);
  } while (await Utilisateur.findOne({ "employer.matricule": matricule }));
  return matricule;
}

// === Générer mot de passe aléatoire ===
function generateRandomPassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!$%*?";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

// === CREATE USER ===
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, role } = req.body;

    if (!nom || !prenom || !email || !role) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    if (await Utilisateur.findOne({ email })) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    let plainPassword = req.body.password;

    if (role === "Employe") {
      if (!req.user) return res.status(401).json({ message: "Vous devez être connecté en RH pour créer un employé." });

      req.body.employer = req.body.employer || {};
      req.body.employer.matricule = await generateMatricule();
      plainPassword = generateRandomPassword();
      req.body.password = plainPassword;
      req.body.employer.createdByrh = req.user._id;
      delete req.body.rh;

    } else if (role === "RH") {
      req.body.rh = req.body.rh || {};
      delete req.body.employer;
    } else if (role === "Admin") {
      delete req.body.rh;
      delete req.body.employer;
    }

    const newUser = new Utilisateur(req.body);
    await newUser.save();

    if (role === "Employe") {
      const htmlContent = `
        <h3>Bonjour ${prenom} ${nom}</h3>
        <p>Votre compte a été créé :</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Rôle: ${role}</li>
          <li>Matricule: ${newUser.employer.matricule}</li>
          <li>Mot de passe: ${plainPassword}</li>
        </ul>
        <p>Cordialement,<br/>L'équipe RH</p>
      `;
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Création de votre compte RH",
        html: htmlContent
      }).catch(err => console.warn("⚠️ Erreur envoi mail:", err.message));
    }

    res.status(201).json({ message: "Utilisateur créé ✅", utilisateur: newUser });

  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// === READ ALL USERS ===
exports.getUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "Admin") {
      users = await Utilisateur.find();
    } else if (req.user.role === "RH") {
      users = await Utilisateur.find({ "employer.createdByrh": req.user._id });
    } else {
      users = await Utilisateur.find({ _id: req.user._id });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error });
  }
};

// === READ ONE USER ===
exports.getUserById = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.params.id).populate("employer.departement");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération utilisateur", error: error.message });
  }
};

// === UPDATE USER ===
exports.updateUser = async (req, res) => {
  try {
    const { role, ...rest } = req.body;

    if (role === "Admin") {
      delete rest.rh;
      delete rest.employer;
    } else if (role === "RH") {
      delete rest.employer;
    } else if (role === "Employe") {
      delete rest.rh;
    }

    const updatedUser = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      { $set: { ...rest, role: role || rest.role } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({ message: "Utilisateur mis à jour ✅", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour", error: error.message });
  }
};
