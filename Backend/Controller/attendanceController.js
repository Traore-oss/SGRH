const Attendance = require('../Models/pointageModel');
const User = require('../Models/usersModel');
const mongoose = require("mongoose");

// GET attendances
exports.getAttendances = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Utilisateur non authentifié" });

    let employeIds = [];
    if (req.user.role === "Admin") {
      const allUsers = await User.find().select("_id");
      employeIds = allUsers.map(u => u._id);
    } else if (req.user.role === "RH") {
      const employes = await User.find({ "employer.createdByrh": req.user._id }).select("_id");
      employeIds = employes.map(e => e._id);
    } else {
      employeIds = [req.user._id];
    }

    const filter = { employe: { $in: employeIds } };
    if (req.query.date) filter.date = req.query.date;

    const attendances = await Attendance.find(filter).populate("employe", "nom prenom");
    res.json(attendances);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Mettre à jour la présence de plusieurs employés
exports.updatePresence = async (req, res) => {
  try {
    let records = req.body.attendances || req.body;
    if (!Array.isArray(records)) records = [records];

    if (!records.length) {
      return res.status(400).json({ message: "Aucun pointage fourni" });
    }

    const bulkOps = [];

    for (let r of records) {
      const { employeId, date, checked } = r;

      if (!employeId || !mongoose.Types.ObjectId.isValid(employeId)) {
        console.log("🚨 employeId invalide ou manquant:", r);
        continue;
      }

      const employe = await User.findById(employeId);
      if (!employe) continue;

      // Vérifier permissions
      if (req.user.role !== "Admin") {
        if (req.user.role === "RH" && !employe.employer?.createdByrh.equals(req.user._id)) continue;
        if (req.user.role === "Employe" && !req.user._id.equals(employeId)) continue;
      }

      // Calcul de l'état de présence
      const now = new Date();
      let statut = "Absent";
      let heureArrivee = "-";
      let retard = "-";

      if (checked) {
        heureArrivee = now.toTimeString().slice(0, 8);
        const limite = new Date(`${date}T08:00:00`);
        const diffSec = Math.floor((now - limite) / 1000);
        if (diffSec > 0) {
          statut = "Retard";
          const totalMinutes = Math.floor(diffSec / 60);
          retard = `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`;
        } else {
          statut = "Présent";
        }
      }

      // 🔹 Ajouter à bulkOps avec upsert pour éviter les doublons
      bulkOps.push({
        updateOne: {
          filter: { employe: employeId, date },
          update: { statut, heureArrivee, retard },
          upsert: true,
        },
      });
    }

    if (!bulkOps.length) {
      return res.status(400).json({ message: "Aucun pointage valide à enregistrer" });
    }

    // 🔹 Exécuter le bulkWrite pour tous les employés
    await Attendance.bulkWrite(bulkOps);

    // 🔹 Récupérer toutes les présences mises à jour
    const updatedRecords = await Attendance.find({
      employe: { $in: records.map(r => r.employeId) },
      date: records[0].date,
    }).populate("employe", "_id nom prenom");

    res.json(updatedRecords);

  } catch (err) {
    console.error("🚨 updatePresence error:", err);

    // Si erreur de doublon (E11000)
    if (err.code === 11000) {
      return res.status(409).json({ message: "Doublon détecté pour un employé sur cette date" });
    }

    res.status(500).json({ message: err.message });
  }
};



// SET departure (départ d’un employé)
exports.setDeparture = async (req, res) => {
  try {
    const { employeId, date } = req.body;

    if (!employeId || !mongoose.Types.ObjectId.isValid(employeId)) {
      return res.status(400).json({ message: "ID employé invalide" });
    }

    const employe = await User.findById(employeId);
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

    // Permissions
    if (req.user.role !== "Admin") {
      if (req.user.role === "RH" && !employe.employer?.createdByrh.equals(req.user._id)) {
        return res.status(403).json({ message: "Vous ne pouvez pas modifier cet employé" });
      }
      if (req.user.role === "Employe" && !req.user._id.equals(employeId)) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    }

    let record = await Attendance.findOne({ employe: employeId, date });
    if (!record) record = new Attendance({ employe: employeId, date });

    const now = new Date();
    record.heureDepart = now.toTimeString().slice(0, 8);

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
    await record.populate("employe", "_id nom prenom");

    res.json(record);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
