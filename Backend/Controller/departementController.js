const Departement = require('../Models/departementModel');

// Créer un département
exports.createDepartement = async (req, res) => {
  try {
    const { code_departement, nom, chef, effectif, budget, description } = req.body;

    if (!code_departement || !nom) {
      return res.status(400).json({ message: "Nom et code sont obligatoires." });
    }

    const exist = await Departement.findOne({ code_departement });
    if (exist) {
      return res.status(409).json({ message: "Le code du département existe déjà." });
    }

    const departement = new Departement({
      code_departement,
      nom,
      chef: chef || '',
      effectif: effectif || 0,
      budget: budget ? Number(budget) : 0,
      description: description || ''
    });

    await departement.save();
    res.status(201).json({ message: "Département créé avec succès.", departement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Récupérer tous les départements
exports.getAllDepartements = async (req, res) => {
  try {
    const departements = await Departement.find().sort({ createdAt: -1 });
    res.status(200).json({ departements });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Mettre à jour un département
exports.updateDepartement = async (req, res) => {
  try {
    const { code_departement } = req.params;
    const { nom, chef, effectif, budget, description } = req.body;

    const departement = await Departement.findOneAndUpdate(
      { code_departement },
      { nom, chef, effectif, budget, description },
      { new: true }
    );

    if (!departement) return res.status(404).json({ message: "Département non trouvé." });

    res.status(200).json({ message: "Département mis à jour.", departement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Supprimer un département
exports.deleteDepartement = async (req, res) => {
  try {
    const { code_departement } = req.params;

    const departement = await Departement.findOneAndDelete({ code_departement });
    if (!departement) return res.status(404).json({ message: "Département non trouvé." });

    res.status(200).json({ message: "Département supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
