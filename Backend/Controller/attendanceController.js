const Attendance = require('../Models/pointageModel');
const User = require('../Models/usersModel');
const mongoose = require("mongoose");


// attendanceController.js
exports.getAttendances = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    let employeIds = [];

    if (req.user.role === "RH") {
      // RH : récupérer tous les employés qu'il a créés
      const employes = await User.find({ "employer.createdByrh": req.user._id }).select("_id");
      employeIds = employes.map(emp => emp._id);
    } else {
      // Employé : récupérer uniquement sa propre présence
      employeIds = [req.user._id];
    }

    const { date } = req.query;

    // Construire le filtre correctement
    const filter = { employe: { $in: employeIds } }; // <-- utiliser 'employe', pas 'matricule'
    if (date) filter.date = date;

    const attendances = await Attendance.find(filter)
      .populate("employe", "nom prenom"); // <-- peupler 'employe'

    res.json(attendances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// exports.updatePresence = async (req, res) => {
//   try {
//     // Récupérer l'ID envoyé (soit employeId soit id)
//     const employeId = req.body.employeId || req.body.id;
//     const { date, checked } = req.body;

//     if (!employeId || !mongoose.Types.ObjectId.isValid(employeId)) {
//       return res.status(400).json({ message: "ID employé invalide" });
//     }

//     // Trouver l'employé par son _id
//     const employe = await User.findById(employeId);
//     if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

//     // Vérifier les permissions
//     if (req.user.role === "RH") {
//       // Vérifier si ce RH a créé cet employé
//       if (!employe.employer?.createdByrh.equals(req.user._id)) {
//         return res.status(403).json({ message: "Vous ne pouvez pas modifier cet employé" });
//       }
//     } else if (!req.user._id.equals(employeId)) {
//       return res.status(403).json({ message: "Non autorisé" });
//     }

//     // Trouver ou créer l'enregistrement de présence
//     let record = await Attendance.findOne({ employe: employeId, date });
//     if (!record) {
//       record = new Attendance({ employe: employeId, date });
//     }

//     const now = new Date();

//     if (checked) {
//       record.heureArrivee = now.toTimeString().slice(0, 8);

//       const limite = new Date(`${date}T08:00:00`);
//       const diffSec = Math.floor((now - limite) / 1000);

//       if (diffSec > 0) {
//         record.statut = "Retard";
//         const totalMinutes = Math.floor(diffSec / 60);
//         const hours = Math.floor(totalMinutes / 60);
//         const minutes = totalMinutes % 60;
//         record.retard = `${hours}h${minutes}m`;
//       } else {
//         record.statut = "Présent";
//         record.retard = "-";
//       }
//     } else {
//       record.statut = "Absent";
//       record.heureArrivee = "-";
//       record.heureDepart = "-";
//       record.heuresTravaillees = "-";
//       record.retard = "-";
//     }

//     await record.save();
//     res.json(record);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.updatePresence = async (req, res) => {
  try {
    const employeId = req.body.employeId || req.body.id;
    const { date, checked } = req.body;

    if (!employeId || !mongoose.Types.ObjectId.isValid(employeId)) {
      return res.status(400).json({ message: "ID employé invalide" });
    }

    const employe = await User.findById(employeId);
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

    // Vérification permissions
    if (req.user.role === "RH") {
      if (!employe.employer?.createdByrh.equals(req.user._id)) {
        return res.status(403).json({ message: "Vous ne pouvez pas modifier cet employé" });
      }
    } else if (!req.user._id.equals(employeId)) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Trouver ou créer l'enregistrement de présence
    let record = await Attendance.findOne({ employe: employeId, date });
    if (!record) {
      record = new Attendance({ employe: employeId, date });
    }

    const now = new Date();

    if (checked) {
      record.heureArrivee = now.toTimeString().slice(0, 8);

      const limite = new Date(`${date}T08:00:00`);
      const diffSec = Math.floor((now - limite) / 1000);

      if (diffSec > 0) {
        record.statut = "Retard";
        const totalMinutes = Math.floor(diffSec / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        record.retard = `${hours}h${minutes}m`;
      } else {
        record.statut = "Présent";
        record.retard = "-";
      }
    } else {
      record.statut = "Absent";
      record.heureArrivee = "-";
      record.heureDepart = "-";
      record.heuresTravaillees = "-";
      record.retard = "-";
    }

    await record.save();

    // Peupler l'employé avant d'envoyer
    await record.populate("employe", "_id nom prenom matricule");
    res.json(record);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// exports.setDeparture = async (req, res) => {
//   try {
//     // Récupérer l'ID envoyé (soit employeId soit id)
//     const employeId = req.body.employeId || req.body.id;
//     const { date } = req.body;

//     if (!employeId || !mongoose.Types.ObjectId.isValid(employeId)) {
//       return res.status(400).json({ message: "ID employé invalide" });
//     }

//     // Vérifier si l'employé existe
//     const employe = await User.findById(employeId);
//     if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

//     // Vérifier les permissions
//     if (req.user.role === "RH") {
//       // Vérifier si ce RH a créé cet employé
//       if (!employe.employer?.createdByrh.equals(req.user._id)) {
//         return res.status(403).json({ message: "Vous ne pouvez pas modifier cet employé" });
//       }
//     } else if (!req.user._id.equals(employeId)) {
//       return res.status(403).json({ message: "Non autorisé" });
//     }

//     // Trouver ou créer l'enregistrement de présence
//     let record = await Attendance.findOne({ employe: employeId, date });
//     if (!record) {
//       record = new Attendance({ employe: employeId, date });
//     }

//     const now = new Date();
//     record.heureDepart = now.toTimeString().slice(0, 8);

//     // Calculer les heures travaillées si l'heure d'arrivée existe
//     if (record.heureArrivee && record.heureArrivee !== "-") {
//       const arrivee = new Date(`${date}T${record.heureArrivee}`);
//       const diffMs = now - arrivee;
//       const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//       const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
//       record.heuresTravaillees = `${diffHours}h${diffMinutes}m`;
//     } else {
//       record.heuresTravaillees = "-";
//     }

//     await record.save();
//     res.json(record);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.setDeparture = async (req, res) => {
  try {
    const employeId = req.body.employeId || req.body.id;
    const { date } = req.body;

    if (!employeId || !mongoose.Types.ObjectId.isValid(employeId)) {
      return res.status(400).json({ message: "ID employé invalide" });
    }

    const employe = await User.findById(employeId);
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

    // Vérification permissions
    if (req.user.role === "RH") {
      if (!employe.employer?.createdByrh.equals(req.user._id)) {
        return res.status(403).json({ message: "Vous ne pouvez pas modifier cet employé" });
      }
    } else if (!req.user._id.equals(employeId)) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Trouver ou créer l'enregistrement de présence
    let record = await Attendance.findOne({ employe: employeId, date });
    if (!record) {
      record = new Attendance({ employe: employeId, date });
    }

    const now = new Date();
    record.heureDepart = now.toTimeString().slice(0, 8);

    // Calcul heures travaillées
    if (record.heureArrivee && record.heureArrivee !== "-") {
      const arrivee = new Date(`${date}T${record.heureArrivee}`);
      const diffMs = now - arrivee;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
      record.heuresTravaillees = `${diffHours}h${diffMinutes}m`;
    } else {
      record.heuresTravaillees = "-";
    }

    await record.save();

    // Peupler l'employé avant d'envoyer
    await record.populate("employe", "_id nom prenom matricule");
    res.json(record);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
