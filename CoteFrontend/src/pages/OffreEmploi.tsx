/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Edit, Trash2, Eye, X, Download, Check, XCircle, Building, Users, Calendar, Clock, User, Mail, Phone, Briefcase } from "lucide-react";

const API_BASE = "http://localhost:8000/api/recrutement";

// === Types ===
interface Candidat {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  experience?: string;
  cvUrl?: string;
  statutCandidature?: "En attente" | "Accepté" | "Refusé";
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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidat | null>(null);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

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
      toast.success("Offre créée ✅");
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
      toast.success("Offre mise à jour ✅");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'offre");
    }
  };

  const handleDeleteOffre = async (id: string) => {
    try {
      setLoadingActions(prev => ({ ...prev, [id]: true }));
      await axios.delete(`${API_BASE}/${id}`, { withCredentials: true });
      setOffres(offres.filter(o => o._id !== id));
      toast.success("Offre supprimée ✅");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la suppression de l'offre");
    } finally {
      setLoadingActions(prev => ({ ...prev, [id]: false }));
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

  const openCandidateDetails = (candidat: Candidat) => {
    setSelectedCandidate(candidat);
  };

  // === Mettre à jour le statut d'un candidat ===
  const updateCandidatStatus = async (candidatId: string, statut: "Accepté" | "Refusé" | "En attente") => {
    if (!showCandidatsModal) return;
    try {
      setLoadingActions(prev => ({ ...prev, [candidatId]: true }));
      
      await axios.patch(
        `${API_BASE}/${showCandidatsModal._id}/candidats/${candidatId}/status`,
        { statut },
        { withCredentials: true }
      );

      // Mise à jour locale
      const updatedCandidats = showCandidatsModal.candidats.map(c =>
        c._id === candidatId ? { ...c, statutCandidature: statut } : c
      );
      
      setShowCandidatsModal({
        ...showCandidatsModal,
        candidats: updatedCandidats,
      });

      // Mise à jour également dans la liste principale des offres
      setOffres(offres.map(offre => 
        offre._id === showCandidatsModal._id 
          ? { ...offre, candidats: updatedCandidats } 
          : offre
      ));

      toast.success(`Statut de candidature mis à jour ✅`);
    } catch (err: any) {
      console.error("Erreur updateCandidatStatus:", err);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoadingActions(prev => ({ ...prev, [candidatId]: false }));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Ouvert": return "bg-green-100 text-green-800 border-green-200";
      case "En cours": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Clôturé": return "bg-red-100 text-red-800 border-red-200";
      case "Accepté": return "bg-green-100 text-green-800 border-green-200";
      case "Refusé": return "bg-red-100 text-red-800 border-red-200";
      case "En attente": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Recrutements</h1>
          <p className="text-gray-600">Gérez vos offres d'emploi et candidatures</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{offres.length}</h3>
                <p className="text-gray-600">Offres actives</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {offres.reduce((total, offre) => total + offre.candidats.length, 0)}
                </h3>
                <p className="text-gray-600">Candidatures totales</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {offres.filter(o => o.statut === "Ouvert").length}
                </h3>
                <p className="text-gray-600">Offres ouvertes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900">Liste des offres</h2>
          </div>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-5 w-5" />
            Nouvelle offre
          </button>
        </div>

        {/* Offres Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poste
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Département
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Candidats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offres.map((offre) => (
                  <tr key={offre._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{offre.poste}</span>
                        <span className="text-sm text-gray-500 line-clamp-2">{offre.description}</span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 lg:hidden">
                          <Building className="h-3 w-3" />
                          {typeof offre.departement === "string" ? offre.departement : offre.departement?.nom || "-"}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 md:hidden">
                          <Users className="h-3 w-3" />
                          {offre.candidats.length} candidat(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                      {typeof offre.departement === "string" ? offre.departement : offre.departement?.nom || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(offre.statut)}`}>
                        {offre.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {offre.candidats.length}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCandidatsModal(offre)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Voir candidats"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => startEditing(offre)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffre(offre._id)}
                          disabled={loadingActions[offre._id]}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                          title="Supprimer"
                        >
                          {loadingActions[offre._id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {offres.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">Aucune offre de recrutement pour le moment.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Créer votre première offre
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        {(showModal || editingOffre) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingOffre ? "Modifier l'offre" : "Nouvelle offre"}
                </h2>
                <button
                  onClick={editingOffre ? cancelEditing : () => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poste *</label>
                  <input
                    type="text"
                    placeholder="Ex: Développeur Frontend"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={editingOffre?.poste || newOffre.poste}
                    onChange={e =>
                      editingOffre
                        ? setEditingOffre({ ...editingOffre, poste: e.target.value })
                        : setNewOffre({ ...newOffre, poste: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    placeholder="Description détaillée du poste..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={editingOffre?.description || newOffre.description}
                    onChange={e =>
                      editingOffre
                        ? setEditingOffre({ ...editingOffre, description: e.target.value })
                        : setNewOffre({ ...newOffre, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Département *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={
                      editingOffre
                        ? typeof editingOffre.departement === "object"
                          ? editingOffre.departement._id
                          : editingOffre.departement
                        : typeof newOffre.departement === "object"
                          ? newOffre.departement._id
                          : newOffre.departement
                    }
                    onChange={e =>
                      editingOffre
                        ? setEditingOffre({ ...editingOffre, departement: e.target.value })
                        : setNewOffre({ ...newOffre, departement: e.target.value })
                    }
                  >
                    <option value="">Sélectionner un département</option>
                    {departementsList.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.nom} ({d.code_departement})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={editingOffre?.statut || newOffre.statut}
                    onChange={e =>
                      editingOffre
                        ? setEditingOffre({ ...editingOffre, statut: e.target.value as any })
                        : setNewOffre({ ...newOffre, statut: e.target.value as any })
                    }
                  >
                    <option value="Ouvert">Ouvert</option>
                    <option value="En cours">En cours</option>
                    <option value="Clôturé">Clôturé</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={editingOffre ? cancelEditing : () => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={editingOffre ? handleUpdateOffre : handleCreateOffre}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 transform hover:-translate-y-1"
                >
                  {editingOffre ? "Mettre à jour" : "Créer l'offre"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Candidats */}
        {showCandidatsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Candidatures - {showCandidatsModal.poste}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {showCandidatsModal.candidats.length} candidat(s)
                  </p>
                </div>
                <button
                  onClick={() => setShowCandidatsModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {showCandidatsModal.candidats.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun candidat pour cette offre.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {showCandidatsModal.candidats.map((candidat) => (
                      <div key={candidat._id} className="bg-gray-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {candidat.prenom} {candidat.nom}
                            </h3>
                            <p className="text-sm text-gray-600">{candidat.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(candidat.statutCandidature || "En attente")}`}>
                                {candidat.statutCandidature || "En attente"}
                              </span>
                              {candidat.cvUrl && (
                                <a
                                  href={candidat.cvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                >
                                  <Download className="h-3 w-3" />
                                  Voir CV
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openCandidateDetails(candidat)}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                              Détails
                            </button>
                            <button
                              onClick={() => updateCandidatStatus(candidat._id, "Accepté")}
                              disabled={candidat.statutCandidature === "Accepté" || loadingActions[candidat._id]}
                              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {loadingActions[candidat._id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              Accepter
                            </button>
                            <button
                              onClick={() => updateCandidatStatus(candidat._id, "Refusé")}
                              disabled={candidat.statutCandidature === "Refusé" || loadingActions[candidat._id]}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {loadingActions[candidat._id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Refuser
                            </button>
                            <button
                              onClick={() => updateCandidatStatus(candidat._id, "En attente")}
                              disabled={candidat.statutCandidature === "En attente" || loadingActions[candidat._id]}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {loadingActions[candidat._id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                              En attente
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCandidatsModal(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Détails Candidat */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Détails du candidat
                </h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium">{selectedCandidate.prenom} {selectedCandidate.nom}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedCandidate.email}</p>
                      </div>
                    </div>

                    {selectedCandidate.telephone && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Phone className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-medium">{selectedCandidate.telephone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedCandidate.experience && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-50 rounded-lg">
                          <Briefcase className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Expérience</p>
                          <p className="font-medium">{selectedCandidate.experience}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(selectedCandidate.statutCandidature || "En attente")}`}>
                          {selectedCandidate.statutCandidature || "En attente"}
                        </span>
                      </div>
                    </div>

                    {selectedCandidate.cvUrl && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <Download className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">CV</p>
                          <a
                            href={selectedCandidate.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                          >
                            Télécharger le CV
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Recrutement;