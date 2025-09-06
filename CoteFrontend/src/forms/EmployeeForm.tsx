// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios.config';

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

type RoleType = 'Employer' | 'Manager' | 'rh';
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
  roleType: RoleType;
  photoFile?: File;
}

// Liste des codes pays avec indicatifs
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
  const [photoPreview, setPhotoPreview] = useState<string>(user?.photo || '');
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormDataType>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    genre: user?.genre || 'Homme',
    date_naissance: user?.date_naissance ? new Date(user.date_naissance).toISOString().slice(0, 10) : '',
    telephone: user?.telephone || '',
    codePays: 'GN', // Par défaut Guinée
    adresse: user?.adresse || '',
    poste: user?.poste || '',
    departement: user?.departement?._id || user?.departement || '',
    salaire: user?.salaire ?? '',
    typeContrat: (user?.typeContrat as ContratType) || 'CDI',
    statut: (user?.statut as StatutType) || 'Actif',
    roleType: (user?.role as RoleType) || 'Employer',
    photoFile: undefined
  });

  // 🔹 Récupération des départements
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

  // 🔹 Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // 🔹 Validation immédiate de l'âge si c'est le champ date de naissance
    if (name === 'date_naissance' && value) {
      const age = calculateAge(value);
      if (age < 18) {
        setErrors(prev => ({
          ...prev,
          date_naissance: "L'âge doit être d'au moins 18 ans"
        }));
      } else if (errors.date_naissance) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.date_naissance;
          return newErrors;
        });
      }
    }

    // 🔹 Réinitialiser le département si le rôle est rh
    if (name === 'roleType' && value === 'rh') {
      setFormData(prev => ({ ...prev, departement: '' }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.departement;
        return newErrors;
      });
    }
  };

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }
    setFormData(prev => ({ ...prev, photoFile: file }));
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFile(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMediaStream(stream);
      setShowVideo(true);
    } catch (err) {
      console.error("Impossible d'accéder à la caméra", err);
      toast.error("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (blob) handlePhotoFile(new File([blob], 'photo.png', { type: 'image/png' }));
    });
    stopCamera();
  };

  const stopCamera = () => {
    mediaStream?.getTracks().forEach(track => track.stop());
    setShowVideo(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof FormDataType)[] = [
      'nom', 'prenom', 'email', 'genre', 'date_naissance', 
      'telephone', 'adresse', 'poste', 'roleType'
    ];
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = 'Ce champ est obligatoire';
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Validation du téléphone avec code pays
    const selectedCountry = countryCodes.find(c => c.code === formData.codePays);
    const fullPhoneNumber = selectedCountry ? selectedCountry.prefix + formData.telephone : formData.telephone;
    
    if (formData.telephone && !/^\+?[0-9\s\-\(\)]{8,}$/.test(fullPhoneNumber)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (formData.roleType !== 'rh' && !formData.departement) {
      newErrors.departement = 'Veuillez sélectionner un département';
    }

    // 🔹 Validation de l'âge (18 ans minimum)
    if (formData.date_naissance) {
      const age = calculateAge(formData.date_naissance);
      if (age < 18) {
        newErrors.date_naissance = "L'âge doit être d'au moins 18 ans";
      }
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
    const data = new FormData();

    // 🔹 Préparer le numéro de téléphone avec le code pays
    const selectedCountry = countryCodes.find(c => c.code === formData.codePays);
    const telephoneComplet = selectedCountry ? selectedCountry.prefix + formData.telephone : formData.telephone;

    // 🔹 Ajouter tous les champs au FormData
    data.append('nom', formData.nom);
    data.append('prenom', formData.prenom);
    data.append('email', formData.email);
    data.append('genre', formData.genre);
    data.append('date_naissance', formData.date_naissance);
    data.append('telephone', telephoneComplet);
    data.append('adresse', formData.adresse);
    data.append('poste', formData.poste);
    data.append('salaire', formData.salaire.toString());
    data.append('typeContrat', formData.typeContrat);
    data.append('statut', formData.statut);
    data.append('roleType', formData.roleType);

    // 🔹 Ajouter le département seulement si sélectionné et si ce n'est pas un rh
    if (formData.departement && formData.roleType !== 'rh') {
      data.append('departement', formData.departement);
    }

    if (formData.photoFile) {
      data.append('photo', formData.photoFile);
    }

    try {
      if (user?._id) {
        await api.put(`http://localhost:8000/api/Users/updateEmployee/${user._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Utilisateur modifié avec succès');
      } else {
        await api.post('http://localhost:8000/api/Users/creerEmployer', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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
        <div>
          <input 
            name="nom" 
            value={formData.nom} 
            onChange={handleChange} 
            placeholder="Nom" 
            className={`w-full border rounded-lg p-3 ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
        </div>
        <div>
          <input 
            name="prenom" 
            value={formData.prenom} 
            onChange={handleChange} 
            placeholder="Prénom" 
            className={`w-full border rounded-lg p-3 ${errors.prenom ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <input 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="Email" 
          className={`w-full border rounded-lg p-3 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Genre / Date naissance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <select 
            name="genre" 
            value={formData.genre} 
            onChange={handleChange} 
            className={`w-full border rounded-lg p-3 ${errors.genre ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>
          {errors.genre && <p className="text-red-500 text-sm mt-1">{errors.genre}</p>}
        </div>
        <div>
          <input 
            name="date_naissance" 
            type="date" 
            value={formData.date_naissance} 
            onChange={handleChange} 
            className={`w-full border rounded-lg p-3 ${errors.date_naissance ? 'border-red-500' : 'border-gray-300'}`}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.date_naissance && <p className="text-red-500 text-sm mt-1">{errors.date_naissance}</p>}
        </div>
      </div>

      {/* Téléphone avec code pays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <select 
            name="codePays" 
            value={formData.codePays} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg p-3"
          >
            {countryCodes.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <input 
            name="telephone" 
            value={formData.telephone} 
            onChange={handleChange} 
            placeholder="Numéro de téléphone" 
            className={`w-full border rounded-lg p-3 ${errors.telephone ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
        </div>
      </div>

      {/* Adresse */}
      <div>
        <input 
          name="adresse" 
          value={formData.adresse} 
          onChange={handleChange} 
          placeholder="Adresse" 
          className={`w-full border rounded-lg p-3 ${errors.adresse ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>}
      </div>

      {/* Poste / Département */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input 
            name="poste" 
            value={formData.poste} 
            onChange={handleChange} 
            placeholder="Poste" 
            className={`w-full border rounded-lg p-3 ${errors.poste ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.poste && <p className="text-red-500 text-sm mt-1">{errors.poste}</p>}
        </div>
        <div>
          <select
            name="departement"
            value={formData.departement}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${errors.departement ? 'border-red-500' : 'border-gray-300'}`}
            disabled={formData.roleType === 'rh'}
          >
            <option value="">Sélectionner un département</option>
            {departements.map(d => (
              <option key={d._id} value={d._id}>{d.nom} ({d.code_departement})</option>
            ))}
          </select>
          {errors.departement && <p className="text-red-500 text-sm mt-1">{errors.departement}</p>}
        </div>
      </div>

      {/* Salaire / Contrat / Statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input 
            name="salaire" 
            type="number" 
            value={formData.salaire as any} 
            onChange={handleChange} 
            placeholder="Salaire (GNF)" 
            className={`w-full border rounded-lg p-3 ${errors.salaire ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.salaire && <p className="text-red-500 text-sm mt-1">{errors.salaire}</p>}
        </div>
        <div>
          <select 
            name="typeContrat" 
            value={formData.typeContrat} 
            onChange={handleChange} 
            className="w-full border rounded-lg p-3"
          >
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>
        <div>
          <select 
            name="statut" 
            value={formData.statut} 
            onChange={handleChange} 
            className="w-full border rounded-lg p-3"
          >
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="Suspendu">Suspendu</option>
          </select>
        </div>
      </div>

      {/* Rôle */}
      <div>
        <select 
          name="roleType" 
          value={formData.roleType} 
          onChange={handleChange} 
          className={`w-full border rounded-lg p-3 ${errors.roleType ? 'border-red-400' : 'border-gray-300'}`}
        >
          <option value="Employer">Employé</option>
          <option value="Manager">Manager</option>
          <option value="rh">RH</option>
        </select>
        {errors.roleType && <p className="text-red-500 text-sm mt-1">{errors.roleType}</p>}
      </div>

      {/* Photo */}
      <div className="flex flex-col items-center gap-4">
        {photoPreview && (
          <div className="relative">
            <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
            <button 
              type="button" 
              onClick={() => { setPhotoPreview(''); setFormData(prev => ({ ...prev, photoFile: undefined })); }} 
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {!photoPreview && !showVideo && (
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={startCamera} 
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              <Camera size={20} /> Prendre une photo
            </button>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              <Upload size={20} /> Importer une photo
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect} 
              className="hidden" 
            />
          </div>
        )}

        {showVideo && (
          <div className="flex flex-col items-center gap-2">
            <video ref={videoRef} autoPlay className="w-64 h-64 rounded-lg border" />
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={capturePhoto} 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Capturer
              </button>
              <button 
                type="button" 
                onClick={stopCamera} 
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-4 pt-4">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-4 py-2 rounded-lg border border-gray-300"
        >
          Annuler
        </button>
        <button 
          type="button" 
          onClick={submitForm} 
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : (user?._id ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </div>
  );
};
