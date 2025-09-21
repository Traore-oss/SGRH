import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Building, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

const CreateRHForm = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    genre: "",
    password: "",
    nomEntreprise: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    nom: false,
    prenom: false,
    email: false,
    password: false,
    nomEntreprise: false
  });
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/Auth/signup",
        formData,
        { withCredentials: true }
      );

      setMessage(`RH créé avec succès ! Nom de l'entreprise : ${response.data.rhInfo.nomEntreprise}`);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        genre: "",
        password: "",
        nomEntreprise: "",
      });
      
      // Redirection après succès
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte RH");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-6 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <img 
                  src="../../../src/public/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" 
                  alt="Logo SGRH" 
                  className="h-20 w-auto mx-auto"
                />
              </div>
            </div>
            <h2 className="text-lg font-bold text-white mt-2">Création de compte RH</h2>
            <p className="text-blue-100 text-xs mt-1">Système de Gestion des Ressources Humaines</p>
          </div>

          <form className="px-6 py-4 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="animate-fadeIn bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg flex items-center text-xs">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="animate-fadeIn bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg flex items-center text-xs">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="prenom" className={`absolute left-3 transition-all duration-200 ${isFocused.prenom || formData.prenom ? 'top-0.5 text-xs text-blue-600 bg-white px-1' : 'top-2.5 text-xs text-gray-500'}`}>
                  Prénom
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-4 w-4 ${isFocused.prenom ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                  </div>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.prenom}
                    onChange={handleChange}
                    onFocus={() => handleFocus("prenom")}
                    onBlur={() => handleBlur("prenom")}
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="nom" className={`absolute left-3 transition-all duration-200 ${isFocused.nom || formData.nom ? 'top-0.5 text-xs text-blue-600 bg-white px-1' : 'top-2.5 text-xs text-gray-500'}`}>
                  Nom
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-4 w-4 ${isFocused.nom ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                  </div>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.nom}
                    onChange={handleChange}
                    onFocus={() => handleFocus("nom")}
                    onBlur={() => handleBlur("nom")}
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="email" className={`absolute left-3 transition-all duration-200 ${isFocused.email || formData.email ? 'top-0.5 text-xs text-blue-600 bg-white px-1' : 'top-2.5 text-xs text-gray-500'}`}>
                Adresse email
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-4 w-4 ${isFocused.email ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="genre" className="block text-xs font-medium text-gray-700 mb-1">
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                required
                className="block w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.genre}
                onChange={handleChange}
              >
                <option value="">Sélectionner le genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="relative">
              <label htmlFor="password" className={`absolute left-3 transition-all duration-200 ${isFocused.password || formData.password ? 'top-0.5 text-xs text-blue-600 bg-white px-1' : 'top-2.5 text-xs text-gray-500'}`}>
                Mot de passe
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 ${isFocused.password ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="nomEntreprise" className={`absolute left-3 transition-all duration-200 ${isFocused.nomEntreprise || formData.nomEntreprise ? 'top-0.5 text-xs text-blue-600 bg-white px-1' : 'top-2.5 text-xs text-gray-500'}`}>
                Nom de l'entreprise
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className={`h-4 w-4 ${isFocused.nomEntreprise ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                </div>
                <input
                  id="nomEntreprise"
                  name="nomEntreprise"
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.nomEntreprise}
                  onChange={handleChange}
                  onFocus={() => handleFocus("nomEntreprise")}
                  onBlur={() => handleBlur("nomEntreprise")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : 'Créer le compte RH'}
            </button>

            <div className="text-center mt-3">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </form>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2025 SGRH</span>
              <div className="flex space-x-3">
                <a href="#" className="hover:text-blue-600 transition-colors">Confidentialité</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Conditions</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Optimisé pour tous les appareils • v2.1.0
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default CreateRHForm;