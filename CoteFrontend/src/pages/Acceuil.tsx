import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BarChart3, ChevronRight, Building2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Images pour la section SGRH (à remplacer par vos propres images)
  const sgrhImages = [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  ];

  // Animation des images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sgrhImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-indigo-600" />
          <span className="text-2xl font-bold text-indigo-800">SGRH</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Connexion
        </button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Système de Gestion des Ressources Humaines
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Optimisez la gestion de votre personnel, des congés et générez des rapports détaillés 
            avec notre plateforme tout-en-un.
          </p>
          <button
            onClick={() => setShowRoleSelection(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            Commencer maintenant <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
        
        {/* Image Slider */}
        <div className="md:w-1/2 relative">
          <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl">
            {sgrhImages.map((img, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImage ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={img} 
                  alt={`SGRH ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            ))}
          </div>
          
          {/* Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {sgrhImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImage ? 'bg-indigo-600 scale-125' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentImage(index)}
                aria-label={`Afficher l'image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Employee Access */}
      {showRoleSelection && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Information nécessaire avant la connexion
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Veuillez vous connecter avec les identifiants fournis par votre administrateur.
              Vous serez redirigé vers le tableau de bord de votre entreprise.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              Aller à la page de connexion <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Fonctionnalités principales</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow duration-300 animate-slide-up">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Gestion du Personnel</h3>
            <p className="text-sm text-gray-600">Gérez les informations des employés, les contrats et les départements.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Gestion des Congés</h3>
            <p className="text-sm text-gray-600">Suivez et approuvez les demandes de congés de manière simplifiée.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Reporting</h3>
            <p className="text-sm text-gray-600">Générez des rapports détaillés sur la gestion de vos ressources.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2025 SGRH. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Styles d'animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slideUp 0.5s ease-out forwards;
            opacity: 0;
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;