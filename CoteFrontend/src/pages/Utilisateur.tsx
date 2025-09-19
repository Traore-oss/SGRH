/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Plus, Edit } from "lucide-react";
import axios from "axios";

// 🔹 Modal
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <button className="absolute top-3 right-4 text-xl font-bold" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

// 🔹 Badge statut
const Badge: React.FC<{ statut: string }> = ({ statut }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statut==='Actif'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>
    {statut}
  </span>
);

// 🔹 Formulaire employé
const EmployeeForm: React.FC<{ onSubmit: () => void; employee?: any; onClose: () => void }> = ({ onSubmit, employee, onClose }) => {
  const [form, setForm] = useState({
    id: employee?._id || "",
    nom: employee?.nom || "",
    prenom: employee?.prenom || "",
    email: employee?.email || "",
    telephone: employee?.telephone || "",
    poste: employee?.poste || "",
    code_departement: employee?.departement?.code_departement || "",
    salaire: employee?.salaire || "",
    typeContrat: employee?.typeContrat || "CDI",
    roleType: employee?.role || "Employer",
    statut: employee?.statut || "Actif",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(form.id) {
        await axios.put(`http://localhost:8000/api/Users/updateEmployee/${form.id}`, form);
      } else {
        await axios.post("http://localhost:8000/api/Users/creerEmployer", form);
      }
      onSubmit();
      onClose();
    } catch(err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Erreur serveur");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="id" value={form.id} />
      {/* Champs du formulaire */}
      <div>
        <label className="block mb-1 font-semibold">Nom</label>
        <input className="w-full border rounded px-2 py-1" name="nom" value={form.nom} onChange={handleChange} required />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Prénom</label>
        <input className="w-full border rounded px-2 py-1" name="prenom" value={form.prenom} onChange={handleChange} required />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Email</label>
        <input className="w-full border rounded px-2 py-1" type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Téléphone</label>
        <input className="w-full border rounded px-2 py-1" type="tel" name="telephone" value={form.telephone} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Poste</label>
        <input className="w-full border rounded px-2 py-1" name="poste" value={form.poste} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Département (code)</label>
        <input className="w-full border rounded px-2 py-1" name="code_departement" value={form.code_departement} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Salaire</label>
        <input className="w-full border rounded px-2 py-1" type="number" name="salaire" value={form.salaire} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Type de contrat</label>
        <select className="w-full border rounded px-2 py-1" name="typeContrat" value={form.typeContrat} onChange={handleChange}>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
          <option value="Freelance">Freelance</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Rôle</label>
        <select className="w-full border rounded px-2 py-1" name="roleType" value={form.roleType} onChange={handleChange}>
          <option value="Employer">Employer</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Statut</label>
        <select className="w-full border rounded px-2 py-1" name="statut" value={form.statut} onChange={handleChange}>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
        </select>
      </div>
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">Enregistrer</button>
    </form>
  );
};

// 🔹 Liste complète des employés
export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/Users/");
      setEmployees(res.data.employees || []);
    } catch(err) { console.error(err); }
  };

  // const toggleStatus = async (emp: any) => {
  //   try {
  //     if(emp.statut==="Actif") {
  //       await axios.patch(`http://localhost:8000/api/Users/deactivateEmployee/${emp._id}`);
  //     } else {
  //       await axios.patch(`http://localhost:8000/api/Users/activateEmployee/${emp._id}`);
  //     }
  //     fetchEmployees();
  //   } catch(err) { console.error(err); }
  // };

  useEffect(() => { fetchEmployees(); }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Liste des Employés</h3>
          <button onClick={() => { setEditingEmployee(null); setShowModal(true); }}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" /><span>Nouvel Employé</span>
          </button>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Matricule</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Poste</th>
                <th className="px-4 py-2">Département</th>
                <th className="px-4 py-2">Salaire</th>
                <th className="px-4 py-2">Type Contrat</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-4">Aucun employé trouvé</td></tr>
              ) : employees.map(emp => (
                <tr key={emp._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{emp.matricule}</td>
                  <td className="px-4 py-2">{emp.nom}</td>
                  <td className="px-4 py-2">{emp.prenom}</td>
                  <td className="px-4 py-2">{emp.email}</td>
                  <td className="px-4 py-2">{emp.poste || "-"}</td>
                  <td className="px-4 py-2">{emp.departement?.nom || "-"}</td>
                  <td className="px-4 py-2">{emp.salaire ? `${emp.salaire.toLocaleString()} GNF` : "-"}</td>
                  <td className="px-4 py-2">{emp.typeContrat || "-"}</td>
                  <td className="px-4 py-2"><Badge statut={emp.statut} /></td>
                  <td className="px-4 py-2">{emp.role}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => { setEditingEmployee(emp); setShowModal(true); }} className="text-green-600"><Edit /></button>
                    <button onClick={() => toggleStatus(emp)}
                      className={`px-2 py-1 rounded-md text-white ${emp.statut==="Actif" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}>
                      {emp.statut==="Actif" ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEmployee ? "Modifier Employé" : "Nouvel Employé"}>
        <EmployeeForm employee={editingEmployee} onSubmit={fetchEmployees} onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};
