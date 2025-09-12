import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn: React.FC = () => {
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
      const userData = await login(email, password);

      if (!userData) throw new Error('Utilisateur introuvable');

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
            <img src="/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" alt="Logo" className="w-28 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">Connexion SGRH</h2>
            <p className="mt-1 text-blue-100 text-xs">Système de Gestion des Ressources Humaines</p>
          </div>

          <form className="px-6 py-4 space-y-4" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">{error}</div>}

            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Adresse email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-2 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" /> : <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 px-3 text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-center text-gray-500">
            © 2025 SGRH. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
