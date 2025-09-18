const Attendance = require('../Models/pointageModel');
const User = require('../Models/usersModel');
const mongoose = require("mongoose");

// Helper pour récupérer le bon matricule
const getMatricule = (user) => user?.matricule || user?.employer?.matricule || "-";

// 📌 Récupérer les présences
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

        return {
          ...att.toObject(),
          matricule: getMatricule(att.employe)
        };
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
    const { employeId, id, date, checked } = req.body;
    const targetId = employeId || id;

    if (!targetId || !date) return res.status(400).json({ message: "Données manquantes" });
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: "ID employé invalide" });

    // ✅ Charger avec createdByrh
    const employe = await User.findById(targetId).select("nom prenom matricule employer.createdByrh employer.matricule");
    if (!employe) return res.status(404).json({ message: "Employé introuvable" });

    // 🔒 Vérification stricte des droits
    if (req.user.role !== "Admin") {
      if (req.user.role === "RH") {
        if (!employe.employer?.createdByrh || employe.employer.createdByrh.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "Vous n’êtes pas autorisé à pointer cet employé." });
        }
      }
      if (req.user.role === "Employe" && req.user._id.toString() !== targetId.toString()) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    }

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

    const filter = { employe: employe._id, date };
    const update = { statut, heureArrivee, retard };

    const record = await Attendance.findOneAndUpdate(
      filter,
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("employe", "nom prenom matricule employer");

    const matricule = getMatricule(employe);
    res.json({ ...record.toObject(), matricule });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Pointage déjà enregistré pour cet employé à cette date." });
    }
    res.status(500).json({ message: err.message });
  }
};

// 📌 Pointer départ
exports.setDeparture = async (req, res) => {
  try {
    const { employeId, id, date } = req.body;
    const targetId = employeId || id;

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "ID employé invalide" });
    }

    // ✅ Charger avec createdByrh
    const employe = await User.findById(targetId).select("nom prenom matricule employer.createdByrh employer.matricule");
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

    // 🔒 Vérification stricte des droits
    if (req.user.role !== "Admin") {
      if (req.user.role === "RH") {
        if (!employe.employer?.createdByrh || employe.employer.createdByrh.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "Vous n’êtes pas autorisé à pointer cet employé." });
        }
      }
      if (req.user.role === "Employe" && req.user._id.toString() !== targetId.toString()) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    }

    let record = await Attendance.findOne({ employe: targetId, date });
    if (!record) record = new Attendance({ employe: targetId, date });

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

// 📌 Pointer plusieurs présences (bulk)
exports.updatePresenceBulk = async (req, res) => {
  try {
    const { attendances } = req.body; // [{ employeId, date, checked }]
    if (!attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ message: "Aucune donnée reçue" });
    }

    const results = [];

    for (const item of attendances) {
      const { employeId, date, checked } = item;
      if (!employeId || !date) continue;

      // ✅ Charger avec createdByrh
      const employe = await User.findById(employeId).select("nom prenom matricule employer.createdByrh employer.matricule");
      if (!employe) continue;

      // 🔒 Vérification stricte des droits
      if (req.user.role !== "Admin") {
        if (req.user.role === "RH") {
          if (!employe.employer?.createdByrh || employe.employer.createdByrh.toString() !== req.user._id.toString()) continue;
        }
        if (req.user.role === "Employe" && req.user._id.toString() !== employeId.toString()) continue;
      }

      let statut = "Absent";
      let heureArrivee = "-";
      let retard = "-";

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

      const filter = { employe: employe._id, date };
      const update = { statut, heureArrivee, retard };

      const record = await Attendance.findOneAndUpdate(
        filter,
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate("employe", "nom prenom matricule employer");

      results.push({ ...record.toObject(), matricule: getMatricule(employe) });
    }

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
