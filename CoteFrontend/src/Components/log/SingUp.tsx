// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

const SignUpAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    genre: 'Homme',
    password: '',
    confirmPassword: '',
    nomEntreprise: '',
    ville: '',
    codePostal: '',
    secteur: '',
    siteWeb: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

  const validatePhone = (phone: string) =>
    /^[0-9]{8,15}$/.test(phone.replace(/\D/g, ''));

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      genre: 'Homme',
      password: '',
      confirmPassword: '',
      nomEntreprise: '',
      ville: '',
      codePostal: '',
      secteur: '',
      siteWeb: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation mots de passe
    if (formData.password !== formData.confirmPassword) return setError('Les mots de passe ne correspondent pas');
    if (formData.password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères');

    // Validation email / téléphone
    if (!validateEmail(formData.email)) return setError('Email invalide');
    if (!validatePhone(formData.telephone)) return setError('Téléphone invalide');

    // Champs obligatoires
    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'genre', 'password', 'nomEntreprise'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) return setError(`Champs obligatoires manquants: ${missingFields.join(', ')}`);

    setLoading(true);
    try {
      const response = await api.post('/users/signUp', formData);

      if (response.status === 201) {
        // Sauvegarder token et user dans localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast.success('Compte administrateur créé avec succès !', { position: 'top-center' });

        resetForm();

        // Redirection après 1.5s pour laisser le toast s'afficher
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        setError(response.data.error || 'Une erreur est survenue');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <ToastContainer />
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Créer un compte administrateur</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} className="border p-2 rounded" required />
          <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} className="border p-2 rounded" required />
        </div>

        <select name="genre" value={formData.genre} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
          <option value="Autre">Autre</option>
        </select>

        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border p-2 rounded w-full" required />
        <input type="tel" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} className="border p-2 rounded w-full" required />
        <input type="text" name="adresse" placeholder="Adresse" value={formData.adresse} onChange={handleChange} className="border p-2 rounded w-full" required />

        <input type="text" name="nomEntreprise" placeholder="Nom de l'entreprise" value={formData.nomEntreprise} onChange={handleChange} className="border p-2 rounded w-full" required />
        <input type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className="border p-2 rounded w-full" />
        <input type="text" name="codePostal" placeholder="Code Postal" value={formData.codePostal} onChange={handleChange} className="border p-2 rounded w-full" />
        <input type="text" name="secteur" placeholder="Secteur" value={formData.secteur} onChange={handleChange} className="border p-2 rounded w-full" />
        <input type="text" name="siteWeb" placeholder="Site Web" value={formData.siteWeb} onChange={handleChange} className="border p-2 rounded w-full" />

        <input type="password" name="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} className="border p-2 rounded w-full" required />
        <input type="password" name="confirmPassword" placeholder="Confirmer mot de passe" value={formData.confirmPassword} onChange={handleChange} className="border p-2 rounded w-full" required />

        <div className="flex justify-between pt-4">
          <button type="button" onClick={() => { resetForm(); navigate('/'); }} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Annuler</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {loading ? 'Création...' : 'S’inscrire'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpAdmin;
