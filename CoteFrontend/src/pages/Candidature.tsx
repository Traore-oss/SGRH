import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/recrutement";

const CandidatureForm = () => {
  const { offreId } = useParams<{ offreId: string }>();
  const [formData, setFormData] = useState({ 
    prenom: "", 
    nom: "", 
    email: "",
    telephone: "",
    motivation: ""
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    if (!ext || !allowed.includes(`.${ext}`)) {
      setError("Seuls les fichiers PDF, DOC et DOCX sont autorisés");
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 5 Mo");
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    setError("");
    setCvFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!offreId) {
      setError("Offre introuvable.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("prenom", formData.prenom);
      data.append("nom", formData.nom);
      data.append("email", formData.email);
      data.append("telephone", formData.telephone);
      data.append("motivation", formData.motivation);
      if (cvFile) data.append("cv", cvFile);

      await axios.post(`${API_BASE}/${offreId}/candidats`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Votre candidature a été envoyée avec succès !");
      setError("");
      setFormData({ prenom: "", nom: "", email: "", telephone: "", motivation: "" });
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'envoi de la candidature.");
      setSuccess("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 md:p-10 w-full max-w-2xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Postuler à l'offre</h1>
          <p className="text-gray-600">Remplissez le formulaire ci-dessous pour soumettre votre candidature</p>
        </div>
        
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-6 flex items-start">
            <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 flex items-start">
            <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                placeholder="Votre prénom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              placeholder="Votre numéro de téléphone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">Lettre de motivation</label>
            <textarea
              id="motivation"
              name="motivation"
              placeholder="Pourquoi souhaitez-vous postuler à cette offre ?"
              value={formData.motivation}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="cv" className="block text-sm font-medium text-gray-700">
              CV (PDF, DOC, DOCX) - Max 5 Mo *
            </label>
            
            {!cvFile ? (
              <div 
                className={`flex items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label htmlFor="cv" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-gray-600"><span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5 Mo)</p>
                  </div>
                  <input 
                    id="cv" 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    ref={fileInputRef}
                    required
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <span className="block text-sm font-medium text-gray-800 truncate max-w-xs">{cvFile.name}</span>
                    <span className="block text-xs text-gray-600">{(cvFile.size / 1024 / 1024).toFixed(2)} Mo</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="text-rose-500 hover:text-rose-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Envoyer ma candidature
              </span>
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-8">
          En soumettant ce formulaire, vous acceptez que vos données personnelles soient traitées conformément à notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
};

export default CandidatureForm;