// /* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'react-toastify';
import api from '../api/axios.config';
import { useEffect, useState } from 'react';

interface Departement {
  _id: string;
  nom: string;
  code_departement: string;
}

interface EmployeeFormProps {
  user?: any;
  onSubmit: () => void;
  onClose: () => void;
}

type StatutType = 'Actif' | 'Inactif' | 'Suspendu';
type ContratType = 'CDI' | 'CDD' | 'Stage' | 'Freelance';

interface FormDataType {
  nom: string;
  prenom: string;
  email: string;
  genre: string;
  date_naissance: string;
  telephone: string;
  codePays: string;
  adresse: string;
  poste: string;
  departement?: string;
  salaire: string | number;
  typeContrat: ContratType;
  statut: StatutType;
  role: 'Employe';
}

const countryCodes = [
  { code: 'FR', name: 'France (+33)', prefix: '+33' },
  { code: 'GN', name: 'Guinée (+224)', prefix: '+224' },
  { code: 'US', name: 'USA (+1)', prefix: '+1' },
  { code: 'GB', name: 'UK (+44)', prefix: '+44' },
  { code: 'DE', name: 'Allemagne (+49)', prefix: '+49' },
  { code: 'SN', name: 'Sénégal (+221)', prefix: '+221' },
  { code: 'ML', name: 'Mali (+223)', prefix: '+223' },
  { code: 'CI', name: "Côte d'Ivoire (+225)", prefix: '+225' },
];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ user, onSubmit, onClose }) => {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormDataType>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    genre: user?.genre || 'Homme',
    date_naissance: user?.date_naissance ? new Date(user.date_naissance).toISOString().slice(0, 10) : '',
    telephone: user?.telephone || '',
    codePays: 'GN',
    adresse: user?.adresse || '',
    poste: user?.employer?.poste || '',
    departement: user?.employer?.departement?._id || user?.employer?.departement || '',
    salaire: user?.employer?.salaire ?? '',
    typeContrat: user?.employer?.typeContrat || 'CDI',
    statut: user?.employer?.statut || 'Actif',
    role: 'Employe',
  });

  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const res = await api.get('http://localhost:8000/api/departements/getAllDepartements');
        setDepartements(res.data.departements || []);
      } catch (err) {
        console.error('Erreur récupération départements:', err);
        toast.error('Erreur lors du chargement des départements');
      }
    };
    fetchDepartements();
  }, []);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'date_naissance' && value) {
      const age = calculateAge(value);
      if (age < 18) setErrors(prev => ({ ...prev, date_naissance: "L'âge doit être d'au moins 18 ans" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof FormDataType)[] = [
      'nom', 'prenom', 'email', 'genre', 'date_naissance',
      'telephone', 'adresse', 'poste', 'departement'
    ];
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = 'Ce champ est obligatoire';
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    const selectedCountry = countryCodes.find(c => c.code === formData.codePays);
    const fullPhoneNumber = selectedCountry ? selectedCountry.prefix + formData.telephone : formData.telephone;
    if (formData.telephone && !/^\+?[0-9\s\-\(\)]{8,}$/.test(fullPhoneNumber)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (formData.date_naissance) {
      const age = calculateAge(formData.date_naissance);
      if (age < 18) newErrors.date_naissance = "L'âge doit être d'au moins 18 ans";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async () => {
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);

    const selectedCountry = countryCodes.find(c => c.code === formData.codePays);
    const fullPhoneNumber = selectedCountry ? selectedCountry.prefix + formData.telephone : formData.telephone;

    const payload = {
       ...user, // garde tout ce qui existe
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      genre: formData.genre,
      date_naissance: formData.date_naissance,
      telephone: fullPhoneNumber,
      adresse: formData.adresse,
      role: 'Employe',
      employer: {
        ...user.employer,
        poste: formData.poste,
        salaire: Number(formData.salaire),
        typeContrat: formData.typeContrat,
        statut: formData.statut,
        departement: formData.departement
      }
    };

    try {
      if (user?._id) {
        await api.put(`http://localhost:8000/api/Users/${user._id}`, payload);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await api.post('http://localhost:8000/api/Users/', payload);
        toast.success('Utilisateur créé avec succès');
      }
      onSubmit();
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement", err);
      const errorMessage = err.response?.data?.error || "Échec de l'enregistrement";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Nom / Prénom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" className={`w-full border rounded-lg p-3 ${errors.nom ? 'border-red-500' : 'border-gray-300'}`} />
        <input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" className={`w-full border rounded-lg p-3 ${errors.prenom ? 'border-red-500' : 'border-gray-300'}`} />
      </div>

      {/* Email */}
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className={`w-full border rounded-lg p-3 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />

      {/* Genre / Date naissance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select name="genre" value={formData.genre} onChange={handleChange} className="w-full border rounded-lg p-3">
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
          <option value="Autre">Autre</option>
        </select>
        <input name="date_naissance" type="date" value={formData.date_naissance} onChange={handleChange} className={`w-full border rounded-lg p-3 ${errors.date_naissance ? 'border-red-500' : 'border-gray-300'}`} max={new Date().toISOString().split('T')[0]} />
      </div>

      {/* Téléphone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select name="codePays" value={formData.codePays} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3">
          {countryCodes.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <input name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Numéro de téléphone" className={`w-full border rounded-lg p-3 ${errors.telephone ? 'border-red-500' : 'border-gray-300'}`} />
      </div>

      {/* Adresse */}
      <input name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Adresse" className={`w-full border rounded-lg p-3 ${errors.adresse ? 'border-red-500' : 'border-gray-300'}`} />

      {/* Poste / Département */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="poste" value={formData.poste} onChange={handleChange} placeholder="Poste" className={`w-full border rounded-lg p-3 ${errors.poste ? 'border-red-500' : 'border-gray-300'}`} />
        <select name="departement" value={formData.departement} onChange={handleChange} className={`w-full border rounded-lg p-3 ${errors.departement ? 'border-red-500' : 'border-gray-300'}`}>
          <option value="">Sélectionner un département</option>
          {departements.map(d => <option key={d._id} value={d._id}>{d.nom} ({d.code_departement})</option>)}
        </select>
      </div>

      {/* Salaire / Contrat / Statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="salaire" type="number" value={formData.salaire as any} onChange={handleChange} placeholder="Salaire (GNF)" className={`w-full border rounded-lg p-3 ${errors.salaire ? 'border-red-500' : 'border-gray-300'}`} />
        <select name="typeContrat" value={formData.typeContrat} onChange={handleChange} className="w-full border rounded-lg p-3">
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
          <option value="Freelance">Freelance</option>
        </select>
        <select name="statut" value={formData.statut} onChange={handleChange} className="w-full border rounded-lg p-3">
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="Suspendu">Suspendu</option>
        </select>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300">Annuler</button>
        <button type="button" onClick={submitForm} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50">
          {loading ? 'Enregistrement...' : (user?._id ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </div>
  );
};
