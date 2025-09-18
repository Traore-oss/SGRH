const Attendance = require('../Models/pointageModel');
const User = require('../Models/usersModel');
const mongoose = require("mongoose");

// Helper pour récupérer le matricule
const getMatricule = (user) => user?.matricule || user?.employer?.matricule || "-";

// 📌 Récupérer les présences selon le rôle
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

    let targetDate = null;
    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0,0,0,0);
      const end = new Date(req.query.date);
      end.setHours(23,59,59,999);
      targetDate = { $gte: start.toISOString(), $lte: end.toISOString() };
    }

    const allAttendances = await Promise.all(
      employeIds.map(async (id) => {
        const query = { employe: id };
        if (targetDate) query.date = targetDate;

        let att = await Attendance.findOne(query).populate("employe", "nom prenom matricule employer");
        const employeData = await User.findById(id).select("nom prenom matricule employer");

        if (!att) {
          return {
            employe: employeData,
            date: req.query.date || new Date().toISOString().slice(0,10),
            statut: "Absent",
            heureArrivee: "-",
            heureDepart: "-",
            heuresTravaillees: "-",
            retard: "-",
            matricule: getMatricule(employeData)
          };
        }

        return { ...att.toObject(), matricule: getMatricule(att.employe) };
      })
    );

    res.json(allAttendances);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// 📌 Pointer arrivée
exports.updatePresence = async (req, res) => {
  try {
    const { employeId, date, checked } = req.body;
    if (!employeId || !date) return res.status(400).json({ message: "Données manquantes" });
    if (!mongoose.Types.ObjectId.isValid(employeId)) return res.status(400).json({ message: "ID employé invalide" });

    const employe = await User.findById(employeId);
    if (!employe) return res.status(404).json({ message: "Employé introuvable" });

    // Vérification des droits
    if (req.user.role !== "Admin") {
      if (req.user.role === "RH" && !employe.employer?.createdByrh.equals(req.user._id))
        return res.status(403).json({ message: "Vous ne pouvez pas pointer cet employé" });
      if (req.user.role === "Employe" && !req.user._id.equals(employeId))
        return res.status(403).json({ message: "Non autorisé" });
    }

    const now = new Date();
    let statut = "Absent", heureArrivee = "-", retard = "-";

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

    const record = await Attendance.findOneAndUpdate(
      { employe: employe._id, date },
      { statut, heureArrivee, retard },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("employe", "nom prenom matricule employer");

    res.json({ ...record.toObject(), matricule: getMatricule(record.employe) });

  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Pointage déjà enregistré pour cet employé." });
    res.status(500).json({ message: err.message });
  }
};

// 📌 Pointer départ
exports.setDeparture = async (req, res) => {
  try {
    const { employeId, date } = req.body;
    if (!employeId || !mongoose.Types.ObjectId.isValid(employeId)) return res.status(400).json({ message: "ID employé invalide" });

    const employe = await User.findById(employeId);
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

    if (req.user.role !== "Admin") {
      if (req.user.role === "RH" && !employe.employer?.createdByrh.equals(req.user._id))
        return res.status(403).json({ message: "Vous ne pouvez pas pointer cet employé" });
      if (req.user.role === "Employe" && !req.user._id.equals(employeId))
        return res.status(403).json({ message: "Non autorisé" });
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
    await record.populate("employe", "nom prenom matricule employer");

    res.json({ ...record.toObject(), matricule: getMatricule(record.employe) });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Bulk update des présences
exports.updatePresenceBulk = async (req, res) => {
  try {
    const { attendances } = req.body; // [{ employeId, date, checked }]
    if (!attendances || !Array.isArray(attendances)) return res.status(400).json({ message: "Aucune donnée reçue" });

    const results = [];

    for (const item of attendances) {
      const { employeId, date, checked } = item;
      if (!employeId || !date) continue;

      const employe = await User.findById(employeId);
      if (!employe) continue;

      if (req.user.role !== "Admin") {
        if (req.user.role === "RH" && !employe.employer?.createdByrh.equals(req.user._id)) continue;
        if (req.user.role === "Employe" && !req.user._id.equals(employeId)) continue;
      }

      let statut = "Absent", heureArrivee = "-", retard = "-";
      if (checked) {
        const now = new Date();
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

      const record = await Attendance.findOneAndUpdate(
        { employe: employe._id, date },
        { statut, heureArrivee, retard },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate("employe", "nom prenom matricule employer");

      results.push({ ...record.toObject(), matricule: getMatricule(record.employe) });
    }

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
