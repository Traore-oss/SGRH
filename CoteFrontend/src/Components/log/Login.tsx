  /* eslint-disable @typescript-eslint/no-unused-expressions */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';
  import { useAuth } from '../../context/AuthContext';
  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';

  export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        // Récupérer les données de l'utilisateur connecté
        const userData = await login(email, password);

      userData?.role === 'Admin' ? navigate('/admin') :
      userData?.role === 'RH' ? navigate('/rh-dashboard') :
      userData?.role === 'Manager' ? navigate('/manager-dashboard') :
      userData?.role === 'Employer' ? navigate('/employee') : // Notez l'accent
      navigate('/dashboard');

      } catch (err: any) {
        setError(err.message || 'Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <img 
                    src="../../src/public/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" 
                    alt="Logo SGRH" 
                    className="w-28 mx-auto"
                  />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">Connexion SGRH</h2>
              <p className="mt-1 text-blue-100 text-xs">
                Système de Gestion des Ressources Humaines
              </p>
            </div>

            <form className="px-6 py-4 space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg flex items-center text-xs">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Adresse email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      className="block w-full pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="block w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-3 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-3 w-3 mr-1" /> Se connecter
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">© 2025 SGRH. Tous droits réservés.</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              Bienvenue sur votre portail RH. Accédez à tous les outils de gestion des ressources humaines.
            </p>
          </div>
        </div>
      </div>
    );
  };
