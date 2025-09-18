import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/recrutement";

const CandidatureForm = () => {
  const { offreId } = useParams<{ offreId: string }>();
  const [formData, setFormData] = useState({ prenom: "", nom: "", email: "" });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowed = [".pdf", ".doc", ".docx"];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !allowed.includes(`.${ext}`)) {
        setError("Seuls les fichiers PDF, DOC et DOCX sont autorisés");
        setCvFile(null);
        return;
      }
      setError("");
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offreId) return setError("Offre introuvable.");

    try {
      const data = new FormData();
      data.append("prenom", formData.prenom);
      data.append("nom", formData.nom);
      data.append("email", formData.email);
      if (cvFile) data.append("cv", cvFile);

      await axios.post(`${API_BASE}/${offreId}/candidats`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Votre candidature a été envoyée avec succès !");
      setError("");
      setFormData({ prenom: "", nom: "", email: "" });
      setCvFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'envoi de la candidature.");
      setSuccess("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Postuler à l’offre</h1>
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" required />

          <label className="block">
            <span className="text-gray-700">CV (PDF, DOC, DOCX)</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="w-full border p-2 rounded mt-1" />
            {cvFile && <span className="text-sm text-gray-600 mt-1 block">Fichier sélectionné: {cvFile.name}</span>}
          </label>

          <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
            Envoyer ma candidature
          </button>
        </form>
      </div>
    </div>
  );
};

export default CandidatureForm;
