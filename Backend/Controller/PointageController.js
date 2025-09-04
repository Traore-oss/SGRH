
const Attendance = require('../Models/pointageModel');
const User = require('../Models/usersModel');

// 🔹 Ajouter une présence
exports.addAttendance = async (req, res) => {
  try {
    const { matricule, date } = req.body;
    if (!matricule || !date)
      return res.status(400).json({ message: "Matricule et date obligatoires" });

    // Vérifier si l'employé existe
    const employe = await User.findOne({ matricule });
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

    // Vérifier si la présence existe déjà
    const existing = await Attendance.findOne({ matricule, date });
    if (existing) return res.status(400).json({ message: "Présence déjà enregistrée" });

    const attendance = new Attendance({
      matricule,
      date,
      statut: 'Absent',
      heureArrivee: '-',
      heureDepart: '-',
      heuresTravaillees: '-',
      retard: '-'
    });

    await attendance.save();
    res.status(201).json({ message: "Présence ajoutée", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Mettre à jour l'arrivée
exports.updatePresence = async (req, res) => {
  try {
    const { matricule, date, checked } = req.body;

    const record = await Attendance.findOne({ matricule, date });
    if (!record) return res.status(404).json({ message: "Enregistrement non trouvé" });

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
    res.json({ message: "Présence mise à jour", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Marquer départ
exports.setDeparture = async (req, res) => {
  try {
    const { matricule, date } = req.body;

    const record = await Attendance.findOne({ matricule, date });
    if (!record) return res.status(404).json({ message: "Enregistrement non trouvé" });
    if (record.statut === "Absent") return res.status(400).json({ message: "Veuillez marquer l'arrivée avant le départ" });

    const now = new Date();
    record.heureDepart = now.toTimeString().slice(0, 8);

    const start = new Date(`${date}T${record.heureArrivee}`);
    const end = new Date(`${date}T${record.heureDepart}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
    const diffMinutes = Math.floor((diffMs / 1000 / 60) % 60);

    record.heuresTravaillees = `${diffHours}h${diffMinutes}m`;

    await record.save();
    res.json({ message: "Départ enregistré", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Récupérer toutes les présences avec infos employé
exports.getAttendances = async (req, res) => {
  try {
    const { status, date, period } = req.query;
    let query = {};

    if (status && status !== "Tous") query.statut = status;
    if (date) {
      const selectedDate = new Date(date);
      if (period === "jour") query.date = selectedDate.toISOString().split("T")[0];
      else if (period === "mois" || period === "semaine") {
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();
        query.date = { $regex: `^${year}-${String(month + 1).padStart(2, '0')}` };
      }
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    // Ajouter les infos de l'employé
    const result = await Promise.all(records.map(async rec => {
      const employe = await User.findOne({ matricule: rec.matricule }, 'nom prenom poste matricule');
      return { ...rec.toObject(), employe };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
