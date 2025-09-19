const Conge = require("../Models/CongesModel");
const Attendance = require("../Models/pointageModel");
const Performance = require("../Models/evaluationModel");

exports.getEmployeeStats = async (req, res) => {
  try {
    const employeId = req.params.id;

    // Statistiques congés
    const conges = await Conge.find({ employe: employeId });
    const leaveStats = {
      approved: conges.filter(c => c.etat === "approuvé").length,
      rejected: conges.filter(c => c.etat === "refusé").length,
      pending: conges.filter(c => c.etat === "en attente").length,
      total: conges.length
    };

    // Statistiques présence
    const attendances = await Attendance.find({ employe: employeId });
    const presence = attendances.filter(a => a.statut === "Présent").length;
    const absence = attendances.filter(a => a.statut === "Absent").length;
    const retard = attendances.filter(a => a.statut === "Retard").length;

    const attendanceStats = {
      presence: ((presence / attendances.length) * 100) || 0,
      absence: ((absence / attendances.length) * 100) || 0,
      delay: ((retard / attendances.length) * 100) || 0
    };

    // Statistiques performance
    const performances = await Performance.find({ employe: employeId });
    let perfScore = 0;
    if (performances.length > 0) {
      performances.forEach(p => {
        if (p.evaluation === "Excellent") perfScore += 100;
        if (p.evaluation === "Bon") perfScore += 80;
        if (p.evaluation === "Moyen") perfScore += 60;
        if (p.evaluation === "Insuffisant") perfScore += 40;
      });
      perfScore = Math.round(perfScore / performances.length);
    }

    const performanceStats = {
      ponctuality: 90, // Tu peux affiner avec données de pointage
      efficiency: 85,
      productivity: 95,
      engagement: 80,
      global: perfScore
    };

    res.json({
      leaves: leaveStats,
      attendance: attendanceStats,
      performance: performanceStats
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
