// export default Recrutement;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/recrutement";

// === Types ===
interface Candidat {
  prenom: string;
  nom: string;
  email: string;
  cvUrl?: string;
  statutCandidature?: "En attente" | "Retenu" | "Rejeté";
}

interface Offre {
  _id: string;
  poste: string;
  description: string;
  departement?: string | { _id?: string; nom: string; code_departement: string };
  statut: "Ouvert" | "En cours" | "Clôturé";
  datePublication: string;
  candidats: Candidat[];
}

interface Department {
  _id?: string;
  nom: string;
  code_departement: string;
}

const Recrutement = () => {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [departementsList, setDepartementsList] = useState<Department[]>([]);
  const [newOffre, setNewOffre] = useState<Omit<Offre, "_id" | "datePublication" | "candidats">>({
    poste: "",
    description: "",
    departement: "",
    statut: "Ouvert",
  });
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCandidatsModal, setShowCandidatsModal] = useState<Offre | null>(null);

  // === Charger les offres ===
  const fetchOffres = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE, { withCredentials: true });
      setOffres(res.data);
      setError("");
    } catch (err: any) {
      console.error("AxiosError:", err);
      setError(
        err.response?.status === 401
          ? "Vous n'êtes pas autorisé à voir ces offres. Veuillez vous connecter."
          : "Erreur lors du chargement des offres"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // === Charger la liste des départements ===
  const fetchDepartements = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/departements/getAllDepartements", {
        credentials: "include",
      });
      const data = await res.json();
      setDepartementsList(data.departements || []);
    } catch (err) {
      console.error("Erreur récupération départements:", err);
    }
  };

  useEffect(() => {
    fetchOffres();
    fetchDepartements();
  }, [fetchOffres]);

  // === CRUD Offres ===
  const handleCreateOffre = async () => {
    try {
      if (!newOffre.departement) {
        setError("Veuillez sélectionner un département");
        return;
      }
      const payload = {
        ...newOffre,
        departement: typeof newOffre.departement === "object" ? newOffre.departement._id : newOffre.departement
      };
      const res = await axios.post(API_BASE, payload, { withCredentials: true });
      setOffres([...offres, res.data.offre]);
      setNewOffre({ poste: "", description: "", departement: "", statut: "Ouvert" });
      setError("");
      setShowModal(false);
    } catch (err: any) {
      console.error("AxiosError:", err);
      setError(err.response?.data?.message || "Erreur lors de la création de l'offre");
    }
  };

  const handleUpdateOffre = async () => {
    if (!editingOffre) return;
    try {
      const res = await axios.put(`${API_BASE}/${editingOffre._id}`, editingOffre, { withCredentials: true });
      setOffres(offres.map(o => (o._id === editingOffre._id ? res.data.updated : o)));
      setEditingOffre(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'offre");
    }
  };

  const handleDeleteOffre = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/${id}`, { withCredentials: true });
      setOffres(offres.filter(o => o._id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la suppression de l'offre");
    }
  };

  const startEditing = (offre: Offre) => setEditingOffre({ ...offre });
  const cancelEditing = () => setEditingOffre(null);

  const openCandidatsModal = async (offre: Offre) => {
    try {
      const res = await axios.get(`${API_BASE}/${offre._id}/candidats`, { withCredentials: true });
      setShowCandidatsModal({ ...offre, candidats: res.data.candidats });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la récupération des candidats");
    }
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
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Gestion des Recrutements</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Bouton pour ouvrir la modale */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm md:text-base"
          onClick={() => setShowModal(true)}
        >
          Créer une nouvelle offre
        </button>
      </div>

      {/* === Modal de création === */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 md:p-6 rounded shadow-md w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Nouvelle Offre</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Poste"
                className="w-full border p-2 rounded"
                value={newOffre.poste}
                onChange={e => setNewOffre({ ...newOffre, poste: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full border p-2 rounded"
                value={newOffre.description}
                onChange={e => setNewOffre({ ...newOffre, description: e.target.value })}
              />
              <select
                name="departement"
                className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent ${
                  newOffre.departement === "" ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
                value={newOffre.departement}
                onChange={e => setNewOffre({ ...newOffre, departement: e.target.value })}
              >
                <option value="">Sélectionner un département</option>
                {departementsList.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.nom} ({d.code_departement})
                  </option>
                ))}
              </select>
              <select
                className="w-full border p-2 rounded"
                value={newOffre.statut}
                onChange={e => setNewOffre({ ...newOffre, statut: e.target.value as any })}
              >
                <option value="Ouvert">Ouvert</option>
                <option value="En cours">En cours</option>
                <option value="Clôturé">Clôturé</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-blue-600 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-blue-700 text-sm md:text-base"
                  onClick={handleCreateOffre}
                >
                  Créer
                </button>
                <button
                  className="bg-gray-400 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-gray-500 text-sm md:text-base"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Modal d'édition === */}
      {editingOffre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 md:p-6 rounded shadow-md w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Modifier Offre</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Poste"
                className="w-full border p-2 rounded"
                value={editingOffre.poste}
                onChange={e => setEditingOffre({ ...editingOffre, poste: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full border p-2 rounded"
                value={editingOffre.description}
                onChange={e => setEditingOffre({ ...editingOffre, description: e.target.value })}
              />
              <select
                name="departement"
                className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent ${
                  editingOffre.departement === "" ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
                value={typeof editingOffre.departement === "object" ? editingOffre.departement._id : editingOffre.departement}
                onChange={e => setEditingOffre({ ...editingOffre, departement: e.target.value })}
              >
                <option value="">Sélectionner un département</option>
                {departementsList.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.nom} ({d.code_departement})
                  </option>
                ))}
              </select>
              <select
                className="w-full border p-2 rounded"
                value={editingOffre.statut}
                onChange={e => setEditingOffre({ ...editingOffre, statut: e.target.value as any })}
              >
                <option value="Ouvert">Ouvert</option>
                <option value="En cours">En cours</option>
                <option value="Clôturé">Clôturé</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-green-600 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-green-700 text-sm md:text-base"
                  onClick={handleUpdateOffre}
                >
                  Mettre à jour
                </button>
                <button
                  className="bg-gray-400 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-gray-500 text-sm md:text-base"
                  onClick={cancelEditing}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Tableau des Offres === */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Département</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Candidats</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offres.map(offre => (
              <tr key={offre._id}>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{offre.poste}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{offre.description}</div>
                  <div className="text-sm text-gray-500 sm:hidden mt-1">
                    Dépt: {typeof offre.departement === "string" ? offre.departement : offre.departement?.nom || "-"}
                  </div>
                  <div className="text-sm text-gray-500 md:hidden mt-1">
                    Candidats: {offre.candidats.length}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                  {typeof offre.departement === "string" ? offre.departement : offre.departement?.nom || "-"}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${offre.statut === "Ouvert" ? "bg-green-100 text-green-800" : 
                     offre.statut === "En cours" ? "bg-yellow-100 text-yellow-800" : 
                     "bg-red-100 text-red-800"}`}>
                    {offre.statut}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">{offre.candidats.length} candidat(s)</td>
                <td className="px-4 py-4 text-sm font-medium">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 px-2 py-1 bg-indigo-50 rounded text-xs sm:text-sm"
                      onClick={() => startEditing(offre)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 px-2 py-1 bg-red-50 rounded text-xs sm:text-sm"
                      onClick={() => handleDeleteOffre(offre._id)}
                    >
                      Supprimer
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 px-2 py-1 bg-green-50 rounded text-xs sm:text-sm"
                      onClick={() => openCandidatsModal(offre)}
                    >
                      Voir candidats ({offre.candidats.length})
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Message si aucune offre */}
      {offres.length === 0 && !loading && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">Aucune offre de recrutement pour le moment.</p>
        </div>
      )}

      {/* === Modal des Candidats === */}
      {showCandidatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 md:p-6 rounded shadow-md w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Candidats pour : {showCandidatsModal.poste}
            </h2>
            {showCandidatsModal.candidats.length === 0 ? (
              <p>Aucun candidat pour cette offre.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CV</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {showCandidatsModal.candidats.map((c, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{c.prenom}</td>
                      <td className="px-4 py-2">{c.nom}</td>
                      <td className="px-4 py-2">{c.email}</td>
                      <td className="px-4 py-2">
                        {c.cvUrl ? (
                          <a href={c.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Voir CV
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2">{c.statutCandidature || "En attente"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-400 text-white px-3 py-1 md:px-4 md:py-2 rounded hover:bg-gray-500 text-sm md:text-base"
                onClick={() => setShowCandidatsModal(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recrutement;
