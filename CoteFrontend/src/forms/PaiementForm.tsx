/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { createPaiement } from "../Components/paiementService";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const API_EMPLOYE =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/users";

const PaiementForm: React.FC<Props> = ({ onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    matricule: "",
    mois: new Date().toISOString().slice(0, 7), // AAAA-MM
    primes: 0,
    retenues: 0,
    modePaiement: "Virement",
  });
  const [employeeInfo, setEmployeeInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔹 Recherche employé via matricule
  const searchEmployee = async () => {
    const matriculeTrim = formData.matricule.trim();
    if (!matriculeTrim) return toast.error("Veuillez entrer un matricule");

    setLoading(true);
    try {
      const res = await axios.get(`${API_EMPLOYE}?matricule=${matriculeTrim}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (!res.data || res.data.length === 0) {
        setEmployeeInfo(null);
        return toast.error("Employé introuvable !");
      }

      const employe = res.data[0];
      // Compatibilité avec structure employe / employer
      const nom = employe.nom || employe.employer?.nom || "";
      const prenom = employe.prenom || employe.employer?.prenom || "";

      if (!nom && !prenom) {
        setEmployeeInfo(null);
        return toast.error("Impossible de récupérer le nom de l'employé");
      }

      setEmployeeInfo(employe);
      toast.success(`Employé trouvé : ${prenom} ${nom}`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la récupération de l'employé");
      setEmployeeInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeInfo) return toast.error("Veuillez rechercher un employé");

    const matriculeToSend = employeeInfo.employer?.matricule || employeeInfo.matricule;
    if (!matriculeToSend) return toast.error("Matricule introuvable");

    try {
      await createPaiement({ matricule: matriculeToSend, ...formData });
      toast.success("Paiement créé avec succès");
      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
      <ToastContainer position="top-right" />
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nouveau Paiement</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matricule de l'employé
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Saisir le matricule"
              value={formData.matricule}
              onChange={e => setFormData({ ...formData, matricule: e.target.value })}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <button
              onClick={searchEmployee}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              )}
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>
        </div>

        {employeeInfo && (
          <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="font-medium text-blue-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Employé trouvé : {employeeInfo.prenom || employeeInfo.employer?.prenom}{" "}
              {employeeInfo.nom || employeeInfo.employer?.nom}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <input
              type="month"
              value={formData.mois}
              onChange={e => setFormData({ ...formData, mois: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primes</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.primes}
                  onChange={e => setFormData({ ...formData, primes: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retenues</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.retenues}
                  onChange={e => setFormData({ ...formData, retenues: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
            <select
              value={formData.modePaiement}
              onChange={e => setFormData({ ...formData, modePaiement: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Virement">Virement</option>
              <option value="Espèces">Espèces</option>
              <option value="Chèque">Chèque</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!employeeInfo}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaiementForm;