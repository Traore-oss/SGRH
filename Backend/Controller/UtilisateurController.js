const Utilisateur = require("../Models/usersModel");
const Departement = require("../Models/departementModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// 🔹 Transporteur email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 🔹 Générer matricule unique
async function generateMatricule() {
  let matricule;
  do {
    matricule = "EMP" + Math.floor(1000 + Math.random() * 9000);
  } while (await Utilisateur.findOne({ matricule }));
  return matricule;
}

// 🔹 Créer le premier admin
exports.createFirstAdmin = async (req, res) => {
  try {
    const adminExists = await Utilisateur.findOne({ role: "Admin" });
    if (adminExists)
      return res.status(403).json({ error: "Un administrateur existe déjà" });

    const { email, nom, prenom, genre } = req.body;
    if (!email || !nom || !prenom || !genre)
      return res.status(400).json({ error: "Tous les champs sont requis" });

    const plainPassword = crypto.randomBytes(4).toString("hex");

    const admin = await Utilisateur.create({
      email,
      nom,
      prenom,
      genre,
      password: plainPassword,
      role: "Admin",
      isActive: true,
      date_naissance: new Date("1990-01-01"),
      telephone: "0000000000",
      adresse: "Non spécifiée"
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Votre compte Admin SGRH",
      html: `<h3>Bonjour ${prenom} ${nom}</h3>
             <p>Votre compte administrateur a été créé avec succès.</p>
             <ul>
               <li>Email: ${email}</li>
               <li>Matricule: ${admin.matricule}</li>
               <li>Mot de passe: ${plainPassword}</li>
               <li>Rôle: Admin</li>
             </ul>`
    });

    res.status(201).json({
      message: "Administrateur créé et email envoyé avec succès",
      matricule: admin.matricule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Créer un employé
exports.creerEmployer = async (req, res) => {
  try {
    const {
      email, nom, prenom, genre, date_naissance,
      telephone, adresse, poste, departement,
      salaire, typeContrat, statut, roleType
    } = req.body;

    // Validation des champs obligatoires
    const requiredFields = ['email', 'nom', 'prenom', 'genre', 'date_naissance', 'roleType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: "Champs obligatoires manquants.",
        missingFields 
      });
    }

    if (await Utilisateur.findOne({ email })) return res.status(409).json({ error: "Email déjà utilisé." });
    if (telephone && await Utilisateur.findOne({ telephone })) return res.status(409).json({ error: "Téléphone déjà utilisé." });

    let departementObj = null;
    if (roleType !== "Admin" && roleType !== "rh" && departement) {
      departementObj = await Departement.findById(departement);
      if (!departementObj) return res.status(404).json({ error: "Département introuvable." });
    }

    const finalMatricule = await generateMatricule();
    const plainPassword = crypto.randomBytes(4).toString("hex");
    const numericSalary = typeof salaire === "string" ? parseInt(salaire.replace(/\D/g, "")) || 0 : salaire || 0;

    const newUser = await Utilisateur.create({
      nom,
      prenom,
      genre,
      role: roleType,
      email,
      date_naissance,
      telephone,
      adresse,
      poste,
      departement: departementObj ? departementObj._id : null,
      matricule: finalMatricule,
      salaire: numericSalary,
      typeContrat: typeContrat || "CDI",
      statut: statut || "Actif",
      password: plainPassword,
      photo: req.file ? req.file.filename : null,
      isActive: true
    });

    // 🔹 Envoi email avec mot de passe
    if (email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Votre compte RH",
        html: `<h3>Bonjour ${prenom} ${nom}</h3>
               <p>Votre compte a été créé.</p>
               <ul>
                 <li>Email: ${email}</li>
                 <li>Matricule: ${finalMatricule}</li>
                 <li>Mot de passe: ${plainPassword}</li>
                 <li>Rôle: ${roleType}</li>
               </ul>`
      });
    }

    res.status(201).json(newUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 🔹 Récupérer tous les employés
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Utilisateur.find({ role: { $in: ["Employer", "Manager","rh","Admin"] } })
      .select("nom prenom email matricule poste departement salaire typeContrat statut isActive role photo date_naissance telephone adresse ville codePostal numeroCNSS numeroCIN banque numeroCompte personneContact telephoneUrgence statutMarital joursCongesRestants derniereEvaluation notes")
      .populate("departement", "nom code_departement");
    res.status(200).json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Modifier
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Utilisateur.findById(id);
    if (!employee) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (updateData.departement) {
      const departementObj = await Departement.findById(updateData.departement);
      if (!departementObj) return res.status(404).json({ error: "Département introuvable" });
      employee.departement = departementObj._id;
    }

    if (updateData.roleType) {
      employee.role = updateData.roleType;
    }

    if (updateData.salaire && typeof updateData.salaire === "string") {
      updateData.salaire = parseInt(updateData.salaire.replace(/\D/g, ""));
    }

    Object.assign(employee, updateData);
    await employee.save();
    res.status(200).json(employee);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Activer / Désactiver
exports.activateEmployee = async (req, res) => {
  try {
    const employee = await Utilisateur.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Utilisateur non trouvé" });
    employee.isActive = true;
    await employee.save();
    res.status(200).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deactivateEmployee = async (req, res) => {
  try {
    const employee = await Utilisateur.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Utilisateur non trouvé" });
    employee.isActive = false;
    await employee.save();
    res.status(200).json(employee);   
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};