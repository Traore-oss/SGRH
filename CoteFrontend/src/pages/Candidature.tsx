/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/recrutement";

interface Candidat {
  prenom: string;
  nom: string;
  email: string;
  cvUrl?: string;
  statutCandidature?: "En attente" | "Retenu" | "Rejeté";
}

interface Department {
  _id?: string;
  nom: string;
}

interface Offre {
  _id: string;
  poste: string;
  description: string;
  departement?: Department | string;
  statut: "Ouvert" | "En cours" | "Clôturé";
  candidats: Candidat[];
}

const Recrutement = () => {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [departementsList, setDepartementsList] = useState<Department[]>([]);
  const [newOffre, setNewOffre] = useState<Omit<Offre, "_id" | "candidats">>({
    poste: "",
    description: "",
    departement: "",
    statut: "Ouvert",
  });
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les offres
  const fetchOffres = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE, { withCredentials: true });
      setOffres(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors du chargement des offres");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger départements
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

  // Création / mise à jour offre
  const handleCreateOffre = async () => {
    try {
      if (!newOffre.departement) {
        setError("Veuillez sélectionner un département");
        return;
      }
      const payload = {
        ...newOffre,
        departement: typeof newOffre.departement === "object" ? newOffre.departement._id : newOffre.departement,
      };
      const res = await axios.post(API_BASE, payload, { withCredentials: true });
      setOffres([...offres, res.data.offre]);
      setNewOffre({ poste: "", description: "", departement: "", statut: "Ouvert" });
      setError("");
    } catch (err: any) {
      console.error(err);
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

  if (loading) return <p>Chargement des offres...</p>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Recrutements</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Formulaire création / édition */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">{editingOffre ? "Modifier Offre" : "Nouvelle Offre"}</h2>
        <input
          type="text"
          placeholder="Poste"
          className="w-full border p-2 rounded"
          value={editingOffre ? editingOffre.poste : newOffre.poste}
          onChange={e =>
            editingOffre ? setEditingOffre({ ...editingOffre, poste: e.target.value }) : setNewOffre({ ...newOffre, poste: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={editingOffre ? editingOffre.description : newOffre.description}
          onChange={e =>
            editingOffre
              ? setEditingOffre({ ...editingOffre, description: e.target.value })
              : setNewOffre({ ...newOffre, description: e.target.value })
          }
        />
        <select
          className="w-full border p-2 rounded"
          value={editingOffre ? (typeof editingOffre.departement === "string" ? editingOffre.departement : editingOffre.departement?._id || "") : newOffre.departement || ""}
          onChange={e => {
            const selected = departementsList.find(d => d._id === e.target.value);
            if (editingOffre && selected) setEditingOffre({ ...editingOffre, departement: selected });
            else if (selected) setNewOffre({ ...newOffre, departement: selected });
          }}
        >
          <option value="">-- Sélectionnez un département --</option>
          {departementsList.map(d => (
            <option key={d._id} value={d._id}>
              {d.nom}
            </option>
          ))}
        </select>
        <select
          className="w-full border p-2 rounded"
          value={editingOffre ? editingOffre.statut : newOffre.statut}
          onChange={e =>
            editingOffre
              ? setEditingOffre({ ...editingOffre, statut: e.target.value as any })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              : setNewOffre({ ...newOffre, statut: e.target.value as any })
          }
        >
          <option value="Ouvert">Ouvert</option>
          <option value="En cours">En cours</option>
          <option value="Clôturé">Clôturé</option>
        </select>
        <div className="flex gap-2">
          {editingOffre ? (
            <>
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleUpdateOffre}>
                Mettre à jour
              </button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={cancelEditing}>
                Annuler
              </button>
            </>
          ) : (
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCreateOffre}>
              Créer Offre
            </button>
          )}
        </div>
      </div>

      {/* Tableau des offres */}
      <table className="min-w-full border border-gray-300 bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">Poste</th>
            <th className="border px-4 py-2">Département</th>
            <th className="border px-4 py-2">Statut</th>
            <th className="border px-4 py-2">Lien Candidature</th>
            <th className="border px-4 py-2">Candidats</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offres.map(offre => (
            <tr key={offre._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{offre.poste}</td>
              <td className="border px-4 py-2">{typeof offre.departement === "string" ? offre.departement : offre.departement?.nom || "-"}</td>
              <td className="border px-4 py-2">{offre.statut}</td>
              <td className="border px-4 py-2">
                <a
                  href={`http://localhost:3000/candidature/${offre._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Candidature
                </a>
              </td>
              <td className="border px-4 py-2">
                {offre.candidats.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {offre.candidats.map((c, idx) => (
                      <li key={idx}>
                        {c.prenom} {c.nom} - {c.statutCandidature || "En attente"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Aucun candidat"
                )}
              </td>
              <td className="border px-4 py-2 space-x-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => startEditing(offre)}>
                  Modifier
                </button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDeleteOffre(offre._id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recrutement;
