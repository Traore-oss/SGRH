import React, { useState } from "react";
import axios from "axios";

const AddAdminForm = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    genre: "Homme",
    date_naissance: "",
    telephone: "",
    adresse: "",
    roleType: "Admin"
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/employees/creerEmployer", formData, {
        withCredentials: true
      });
      setMessage("Admin créé et email envoyé avec succès !");
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        genre: "Homme",
        date_naissance: "",
        telephone: "",
        adresse: "",
        roleType: "Admin"
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Erreur serveur");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Créer un Admin</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required className="w-full p-2 border rounded"/>
        <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required className="w-full p-2 border rounded"/>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded"/>
        <select name="genre" value={formData.genre} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
        <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required className="w-full p-2 border rounded"/>
        <input type="text" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} required className="w-full p-2 border rounded"/>
        <input type="text" name="adresse" placeholder="Adresse" value={formData.adresse} onChange={handleChange} required className="w-full p-2 border rounded"/>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Créer Admin</button>
      </form>
    </div>
  );
};

export default AddAdminForm;
