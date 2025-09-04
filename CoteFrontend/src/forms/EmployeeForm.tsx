/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios.config';

interface Departement {
  _id: string;
  nom: string;
  departement: string;
}

interface EmployeeFormProps {
  user?: any;
  onSubmit: () => void;
  onClose: () => void;
}

type RoleType = 'Employer' | 'Manager' | 'Admin' | 'rh';
type StatutType = 'Actif' | 'Inactif' | 'Suspendu';
type ContratType = 'CDI' | 'CDD' | 'Stage' | 'Freelance';

interface FormDataType {
  nom: string;
  prenom: string;
  email: string;
  genre: string;
  date_naissance: string;
  telephone: string;
  adresse: string;
  poste: string;
  departement?: string;
  salaire: string | number;
  typeContrat: ContratType;
  statut: StatutType;
  roleType: RoleType;
  photoFile?: File;
}

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
    adresse: user?.adresse || '',
    poste: user?.poste || '',
    departement: user?.departement?._id || undefined,
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
        const res = await api.get('http://localhost:5000/api/departements/getAllDepartements');
        setDepartements(res.data.departements || []);
      } catch (err) {
        console.error('Erreur récupération départements:', err);
        toast.error('Erreur lors du chargement des départements');
      }
    };
    fetchDepartements();
  }, []);

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

    if (formData.telephone && !/^\+?[0-9\s\-\(\)]{10,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (formData.roleType !== 'Admin' && !formData.departement) {
      newErrors.departement = 'Veuillez sélectionner un département';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async () => {
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    console.log(formData);
    setLoading(true);
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'photoFile') data.append(key, value as any);
    });

    if (formData.photoFile) data.append('photo', formData.photoFile);

    try {
      if (user?._id) {
        await api.put(`http://localhost:5000/api/Users/updateEmployee/${user._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Utilisateur modifié avec succès');
      } else {
        await api.post('http://localhost:5000/api/Users/creerEmployer', data, {
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
          />
          {errors.date_naissance && <p className="text-red-500 text-sm mt-1">{errors.date_naissance}</p>}
        </div>
      </div>

      {/* Téléphone / Adresse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input 
            name="telephone" 
            value={formData.telephone} 
            onChange={handleChange} 
            placeholder="Téléphone" 
            className={`w-full border rounded-lg p-3 ${errors.telephone ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
        </div>
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
            disabled={formData.roleType === 'Admin'}
          >
            <option value="">Sélectionner un département</option>
            {departements.map(d => (
              <option key={d._id} value={d._id}>{d.nom} ({d.departement})</option>
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
            className={`w-full border rounded-lg p-3 ${errors.typeContrat ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
          </select>
          {errors.typeContrat && <p className="text-red-500 text-sm mt-1">{errors.typeContrat}</p>}
        </div>
        <div>
          <select 
            name="statut" 
            value={formData.statut} 
            onChange={handleChange} 
            className={`w-full border rounded-lg p-3 ${errors.statut ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="Suspendu">Suspendu</option>
          </select>
          {errors.statut && <p className="text-red-500 text-sm mt-1">{errors.statut}</p>}
        </div>
      </div>

      {/* Rôle / Photo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <select 
            name="roleType" 
            value={formData.roleType} 
            onChange={handleChange} 
            className={`w-full border rounded-lg p-3 ${errors.roleType ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="Employer">Employé</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.roleType && <p className="text-red-500 text-sm mt-1">{errors.roleType}</p>}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col items-center space-y-2">
            {photoPreview ? (
              <img src={photoPreview} alt="Aperçu" className="w-28 h-28 object-cover rounded-lg border" />
            ) : (
              <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex space-x-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Upload className="h-4 w-4 mr-1" />
                Importer
              </button>
              
              <button 
                type="button"
                onClick={startCamera}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
              >
                <Camera className="h-4 w-4 mr-1" />
                Caméra
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {showVideo && (
            <div className="relative mt-2">
              <video ref={videoRef} autoPlay className="w-full rounded-lg border" />
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button 
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  onClick={stopCamera}
                >
                  <X className="h-4 w-4" />
                </button>
                <button 
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                  onClick={capturePhoto}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button 
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          onClick={onClose}
        >
          Annuler
        </button>
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={submitForm}
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};
