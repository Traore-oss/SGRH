const Attendance = require('../Models/pointageModel');
const User = require('../Models/usersModel');

// Ajouter une présence
exports.addAttendance = async (req, res) => {
  try {
    const { matricule, date } = req.body;
    if (!matricule || !date) return res.status(400).json({ message: "Matricule et date obligatoires" });

    const employe = await User.findOne({ matricule });
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });

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
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour l'arrivée
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
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Marquer le départ
exports.setDeparture = async (req, res) => {
  try {
    const { matricule, date } = req.body;
    const record = await Attendance.findOne({ matricule, date });
    if (!record) return res.status(404).json({ message: "Enregistrement non trouvé" });
    if (record.statut === "Absent") return res.status(400).json({ message: "Veuillez marquer l'arrivée avant le départ" });

    const now = new Date();
    record.heureDepart = now.toTimeString().slice(0, 8);

    const [hours, minutes] = record.heureArrivee.split(':').map(Number);
    const start = new Date(record.date);
    start.setHours(hours, minutes, 0, 0);
    let diffMs = now - start;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    record.heuresTravaillees = `${diffHours}h${diffMinutes.toString().padStart(2,'0')}m`;

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les présences
exports.getAttendances = async (req, res) => {
  try {
    const { date } = req.params;
    let query = {};
    if (date) query.date = date;

    const records = await Attendance.find(query).sort({ date: -1 });
    const result = await Promise.all(records.map(async rec => {
      const employe = await User.findOne({ matricule: rec.matricule }, 'nom prenom matricule statut isActive');
      return { ...rec.toObject(), ...employe.toObject() };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une présence
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "Présence supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
