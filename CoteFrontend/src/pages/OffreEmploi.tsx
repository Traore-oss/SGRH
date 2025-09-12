import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const Recrutement = () => {
  const [offres, setOffres] = useState([]);
  const [newOffre, setNewOffre] = useState({ 
    poste: "", 
    description: "", 
    departement: "",
    statut: "ouverte"
  });
  const [showCandidatureForm, setShowCandidatureForm] = useState(null);
  const [newCandidat, setNewCandidat] = useState({ 
    nom: "", 
    prenom: "", 
    email: "", 
    cvUrl: "" 
  });
  const [editingOffre, setEditingOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOffres();
  }, []);
interface Candidat {
  prenom: string;
  nom: string;
  email: string;
  cvUrl?: string;
  statutCandidature?: "en attente" | "accepté" | "refusé";
}

interface Offre {
  _id: string;
  poste: string;
  description: string;
  departement?: string;
  statut: "ouverte" | "fermée";
  datePublication: string;
  candidats: Candidat[];
}
const [offres, setOffres] = useState<Offre[]>([]);
const [newOffre, setNewOffre] = useState<Omit<Offre, "_id" | "datePublication" | "candidats">>({
  poste: "",
  description: "",
  departement: "",
  statut: "ouverte"
});
const [newCandidat, setNewCandidat] = useState<Candidat>({
  nom: "",
  prenom: "",
  email: "",
  cvUrl: ""
});
const [editingOffre, setEditingOffre] = useState<Offre | null>(null);

  const fetchOffres = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/recrutements`);
      setOffres(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des offres");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffre = async () => {
    try {
      const res = await axios.post(`${API_BASE}/recrutements`, newOffre);
      setOffres([...offres, res.data.offre]);
      setNewOffre({ poste: "", description: "", departement: "", statut: "ouverte" });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création de l'offre");
    }
  };

  const handleUpdateOffre = async () => {
    try {
      const res = await axios.put(`${API_BASE}/recrutements/${editingOffre._id}`, editingOffre);
      setOffres(offres.map(offre => 
        offre._id === editingOffre._id ? res.data.updated : offre
      ));
      setEditingOffre(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour de l'offre");
    }
  };

  const handleDeleteOffre = async (id) => {
    try {
      await axios.delete(`${API_BASE}/recrutements/${id}`);
      setOffres(offres.filter(offre => offre._id !== id));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression de l'offre");
    }
  };

  const handleAddCandidat = async (offreId) => {
    try {
      const res = await axios.post(`${API_BASE}/recrutements/${offreId}/candidats`, newCandidat);
      
      const updatedOffres = offres.map(offre => {
        if (offre._id === offreId) {
          return res.data.offre;
        }
        return offre;
      });
      
      setOffres(updatedOffres);
      setNewCandidat({ nom: "", prenom: "", email: "", cvUrl: "" });
      setShowCandidatureForm(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi de la candidature");
    }
  };

  const toggleCandidatureForm = (offreId) => {
    setShowCandidatureForm(showCandidatureForm === offreId ? null : offreId);
  };

  const startEditing = (offre) => {
    setEditingOffre({...offre});
  };

  const cancelEditing = () => {
    setEditingOffre(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Recrutements</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Formulaire création d'offre */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Nouvelle offre d'emploi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Poste"
            value={newOffre.poste}
            onChange={(e) => setNewOffre({ ...newOffre, poste: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Département (optionnel)"
            value={newOffre.departement}
            onChange={(e) => setNewOffre({ ...newOffre, departement: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <textarea
          placeholder="Description du poste"
          value={newOffre.description}
          onChange={(e) => setNewOffre({ ...newOffre, description: e.target.value })}
          className="border border-gray-300 p-3 rounded w-full h-32 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-4">
          <button
            onClick={handleCreateOffre}
            className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Publier l'offre
          </button>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Offres publiées</h2>
        
        {offres.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
            Aucune offre de recrutement pour le moment
          </div>
        ) : (
          offres.map((offre) => (
            <div key={offre._id} className="bg-white shadow-md rounded-lg p-6">
              {editingOffre && editingOffre._id === offre._id ? (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Modifier l'offre</h3>
                  <input
                    type="text"
                    value={editingOffre.poste}
                    onChange={(e) => setEditingOffre({ ...editingOffre, poste: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full mb-2"
                  />
                  <input
                    type="text"
                    value={editingOffre.departement}
                    onChange={(e) => setEditingOffre({ ...editingOffre, departement: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full mb-2"
                  />
                  <textarea
                    value={editingOffre.description}
                    onChange={(e) => setEditingOffre({ ...editingOffre, description: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full h-32 mb-2"
                  />
                  <select
                    value={editingOffre.statut}
                    onChange={(e) => setEditingOffre({ ...editingOffre, statut: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full mb-2"
                  >
                    <option value="ouverte">Ouverte</option>
                    <option value="fermée">Fermée</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateOffre}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-600 text-white px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{offre.poste}</h3>
                      {offre.departement && (
                        <p className="text-gray-600">Département: {offre.departement}</p>
                      )}
                      <p className="text-gray-700 mt-2">{offre.description}</p>
                      <div className="flex items-center mt-3 space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          offre.statut === 'ouverte' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {offre.statut}
                        </span>
                        <span className="text-sm text-gray-500">
                          Publiée le {new Date(offre.datePublication).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(offre)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteOffre(offre._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => toggleCandidatureForm(offre._id)}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                      >
                        Postuler
                      </button>
                    </div>
                  </div>

                  {/* Formulaire de candidature */}
                  {showCandidatureForm === offre._id && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">Postuler à cette offre</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Prénom"
                          value={newCandidat.prenom}
                          onChange={(e) => setNewCandidat({ ...newCandidat, prenom: e.target.value })}
                          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Nom"
                          value={newCandidat.nom}
                          onChange={(e) => setNewCandidat({ ...newCandidat, nom: e.target.value })}
                          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newCandidat.email}
                          onChange={(e) => setNewCandidat({ ...newCandidat, email: e.target.value })}
                          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="URL du CV (optionnel)"
                          value={newCandidat.cvUrl}
                          onChange={(e) => setNewCandidat({ ...newCandidat, cvUrl: e.target.value })}
                          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => setShowCandidatureForm(null)}
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleAddCandidat(offre._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
                        >
                          Envoyer la candidature
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Liste des candidats */}
                  {offre.candidats && offre.candidats.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Candidats ({offre.candidats.length})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                              <th className="py-3 px-6 text-left">Nom</th>
                              <th className="py-3 px-6 text-left">Email</th>
                              <th className="py-3 px-6 text-left">CV</th>
                              <th className="py-3 px-6 text-left">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-600 text-sm">
                            {offre.candidats.map((candidat, i) => (
                              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6">{candidat.prenom} {candidat.nom}</td>
                                <td className="py-3 px-6">{candidat.email}</td>
                                <td className="py-3 px-6">
                                  {candidat.cvUrl ? (
                                    <a 
                                      href={candidat.cvUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      Voir le CV
                                    </a>
                                  ) : (
                                    <span className="text-gray-400">Non fourni</span>
                                  )}
                                </td>
                                <td className="py-3 px-6">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    candidat.statutCandidature === 'en attente' 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : candidat.statutCandidature === 'accepté'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {candidat.statutCandidature || 'en attente'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recrutement;