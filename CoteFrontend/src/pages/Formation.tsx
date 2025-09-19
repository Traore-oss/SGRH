/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaChartBar, FaSync } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SuiviFormations() {
  const [formations, setFormations] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    titre: "",
    formateur: "",
    debut: "",
    fin: "",
  });

  // API base URL
  const API_BASE_URL = "http://localhost:8000/api/formation";

  // Charger les formations depuis l'API au démarrage
  useEffect(() => {
    chargerFormations();
  }, []);

// Fonction pour charger les formations
const chargerFormations = async () => {
  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/getAllFormations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // envoie le cookie JWT automatiquement
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        toast.error(errorData.message || "Non autorisé. Veuillez vous reconnecter.");
        return;
      } else if (response.status === 403) {
        toast.error(errorData.message || "Accès refusé pour ce rôle.");
        return;
      }

      throw new Error(errorData.message || "Erreur lors du chargement des formations");
    }

    const data = await response.json();
    setFormations(data.formations || []);
  } catch (error: any) {
    console.error("Erreur:", error);
    toast.error(error.message || "Impossible de charger les formations");
  } finally {
    setLoading(false);
  }
};



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const ouvrirModal = (id: string | null = null) => {
    if (id) {
      const f = formations.find(f => f._id === id);
      if (f) {
        setForm({
          titre: f.titre,
          formateur: f.formateur,
          debut: f.debut.split('T')[0],
          fin: f.fin.split('T')[0],
        });
        setEditId(id);
      }
    } else {
      setForm({ titre: "", formateur: "", debut: "", fin: "" });
      setEditId(null);
    }
    setModalOpen(true);
  };

  const fermerModal = () => {
    setModalOpen(false);
    setForm({ titre: "", formateur: "", debut: "", fin: "" });
    setEditId(null);
  };

const ajouterOuModifierFormation = async () => {
  if (!form.titre || !form.formateur || !form.debut || !form.fin) {
    toast.error("Veuillez remplir tous les champs");
    return;
  }
  if (new Date(form.debut) > new Date(form.fin)) {
    toast.error("La date de fin doit être après la date de début");
    return;
  }

  try {
    const url = editId ? `${API_BASE_URL}/updateFormation/${editId}` : `${API_BASE_URL}/createFormation`;
    const method = editId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include", // envoie le cookie JWT automatiquement
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de l'opération");
    }

    await chargerFormations();
    toast.success(editId ? "Formation modifiée avec succès" : "Formation ajoutée avec succès");
    fermerModal();
  } catch (error: any) {
    console.error("Erreur:", error);
    toast.error(error.message || "Une erreur est survenue");
  }
};

const supprimerFormation = async (id: string) => {
  // Afficher une confirmation élégante
  const confirmer = await new Promise<boolean>((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-2">
          <span>Voulez-vous vraiment supprimer cette formation ?</span>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              Supprimer
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  });

  if (!confirmer) return;

  try {
    const response = await fetch(`${API_BASE_URL}/deleteFormation/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la suppression");
    }

    await chargerFormations();
    toast.success("Formation supprimée");
  } catch (error: any) {
    console.error("Erreur:", error);
    toast.error(error.message || "Impossible de supprimer la formation");
  }
};


  // Statistiques
  const stats = formations.reduce(
    (acc, f) => {
      if (f.statut === "Prévue") acc.prevues++;
      else if (f.statut === "Terminée") acc.terminees++;
      else acc.encours++;
      return acc;
    },
    { prevues: 0, terminees: 0, encours: 0 }
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Prévue": return "bg-blue-100 text-blue-800";
      case "En cours": return "bg-yellow-100 text-yellow-800";
      case "Terminée": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Formations</h1>
            <p className="text-gray-600 mt-2">Suivez et organisez toutes vos formations</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md" onClick={chargerFormations} title="Actualiser">
              <FaSync className="text-sm" />
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md" onClick={() => ouvrirModal()}>
              <FaPlus className="text-sm" /> Ajouter une formation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">📅</div>
              <div><h3 className="text-2xl font-bold text-gray-800">{stats.prevues}</h3><p className="text-gray-600">Formations prévues</p></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">🕓</div>
              <div><h3 className="text-2xl font-bold text-gray-800">{stats.encours}</h3><p className="text-gray-600">Formations en cours</p></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">✅</div>
              <div><h3 className="text-2xl font-bold text-gray-800">{stats.terminees}</h3><p className="text-gray-600">Formations terminées</p></div>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><FaChartBar className="text-blue-600" /> Liste des formations</h3>
            <div className="flex items-center gap-3">
              {loading && <div className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div><span className="ml-2 text-gray-600 text-sm">Chargement...</span></div>}
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">{formations.length} formation(s)</span>
            </div>
          </div>
          {loading ? <div className="p-12 text-center">Chargement...</div> :
            formations.length === 0 ? <div className="p-12 text-center">Aucune formation</div> :
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formateur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formations.map(f => (
                      <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">{f.titre}</td>
                        <td className="px-6 py-4">{f.formateur}</td>
                        <td className="px-6 py-4">{new Date(f.debut).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4">{new Date(f.fin).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(f.statut)}`}>{f.statut}</span></td>
                        <td className="px-6 py-4 text-sm font-medium flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" onClick={() => ouvrirModal(f._id)} title="Modifier"><FaEdit /></button>
                          <button className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors" onClick={() => supprimerFormation(f._id)} title="Supprimer"><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </section>

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h5 className="text-xl font-bold mb-4 text-gray-800">{editId ? "Modifier la formation" : "Planifier une formation"}</h5>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la formation</label>
                  <input type="text" name="titre" value={form.titre} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du formateur</label>
                  <input type="text" name="formateur" value={form.formateur} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                    <input type="date" name="debut" value={form.debut} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                    <input type="date" name="fin" value={form.fin} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors" onClick={fermerModal}>Annuler</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors" onClick={ajouterOuModifierFormation}>{editId ? "Enregistrer" : "Ajouter"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
