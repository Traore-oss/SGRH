/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Eye, EyeOff, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Effet pour nettoyer les messages après un délai
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      setLoading(false);
      return;
    }

    try {
      const userData = await login(email, password);
      if (!userData) throw new Error('Utilisateur introuvable');

      setSuccess('Connexion réussie!');
      
      // Petite pause pour montrer le message de succès
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirection selon rôle
      const role = userData.role;
      switch (role) {
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        case 'RH':
          navigate('/hr-dashboard');
          break;
        case 'Employe':
          navigate('/employee-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Carte principale - réduite en hauteur */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* En-tête avec logo agrandi */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-6 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <img 
                  src="../../../src/public/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" 
                  alt="Logo SGRH" 
                  className="h-20 w-auto mx-auto" // Logo agrandi
                />
              </div>
            </div>
            <h2 className="text-lg font-bold text-white mt-2">Connexion SGRH</h2>
            <p className="text-blue-100 text-xs mt-1">Système de Gestion des Ressources Humaines</p>
          </div>

          {/* Formulaire avec espacement réduit */}
          <form className="px-6 py-4 space-y-4" onSubmit={handleSubmit}>
            {/* Messages d'alerte */}
            {error && (
              <div className="animate-fadeIn bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg flex items-center text-xs">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="animate-fadeIn bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg flex items-center text-xs">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Champ Email */}
              <div className="relative">
                <label 
                  htmlFor="email" 
                  className={`absolute left-3 transition-all duration-200 ${
                    isFocused.email || email 
                      ? 'top-0.5 text-xs text-blue-600 bg-white px-1' 
                      : 'top-2.5 text-xs text-gray-500'
                  }`}
                >
                  Adresse email
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-4 w-4 ${isFocused.email ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="relative">
                <label 
                  htmlFor="password" 
                  className={`absolute left-3 transition-all duration-200 ${
                    isFocused.password || password 
                      ? 'top-0.5 text-xs text-blue-600 bg-white px-1' 
                      : 'top-2.5 text-xs text-gray-500'
                  }`}
                >
                  Mot de passe
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-4 w-4 ${isFocused.password ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Lien mot de passe oublié */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
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
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Première connexion ?</span>
              </div>
            </div>

            {/* Lien vers contact admin */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Contactez votre <span className="text-blue-600 font-medium">administrateur</span> pour obtenir vos identifiants
              </p>
            </div>
          </form>

          {/* Pied de page */}
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

        {/* Version responsive */}
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SignIn;