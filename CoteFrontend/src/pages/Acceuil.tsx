import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, BarChart3, ChevronRight, Building2, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 5 images pour la section SGRH avec des thèmes RH
  const sgrhImages = [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ];

  // Animation des images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sgrhImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation au défilement
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['Inter']">
      {/* Google Fonts import - Inter */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { 
              opacity: 0;
              transform: scale(0.9);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
          .animate-scale-in {
            animation: scaleIn 0.3s ease-out;
          }
        `}
      </style>

      {/* Header amélioré */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="../../../src/public/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" 
              alt="Logo SGRH" 
              className="h-10 object-contain" 
            />
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Connexion
            </button>
            <button
              onClick={() => setShowRoleSelection(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-md hover:shadow-lg"
            >
              Essai gratuit <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section améliorée */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0 md:pr-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Simplifiez la gestion de vos <span className="text-indigo-600">ressources humaines</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Une plateforme tout-en-un pour optimiser la gestion de votre personnel, 
            des congés et générer des rapports détaillés. Gagnez du temps et améliorez 
            votre productivité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowRoleSelection(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Commencer gratuitement <ChevronRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center"
            >
              Voir les fonctionnalités
            </button>
          </div>
          
          {/* Badges de confiance */}
          <div className="mt-10 flex flex-wrap gap-6 items-center">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Sécurisé et fiable</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">500+ entreprises</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="text-sm text-gray-600">Support 24/7</span>
            </div>
          </div>
        </div>
        
        {/* Image Slider amélioré avec 5 images */}
        <div className="md:w-1/2 relative">
          <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
            {sgrhImages.map((img, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImage ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={img} 
                  alt={`SGRH ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            ))}
          </div>
          
          {/* Indicators améliorés */}
          <div className="flex justify-center mt-6 space-x-3">
            {sgrhImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImage ? 'bg-indigo-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
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
        <section className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 animate-scale-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Accédez à votre espace
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Veuillez vous connecter avec les identifiants fournis par votre administrateur.
              Vous serez redirigé vers le tableau de bord de votre entreprise.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-md"
            >
              Aller à la page de connexion <ChevronRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => setShowRoleSelection(false)}
              className="w-full mt-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Retour
            </button>
          </div>
        </section>
      )}

      {/* Features Grid amélioré */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Fonctionnalités principales</h2>
          <p className="text-lg text-gray-600">
            Découvrez comment notre plateforme peut transformer la gestion de vos ressources humaines
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-blue-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
              <Users className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-xl text-gray-800 mb-4 text-center">Gestion du Personnel</h3>
            <p className="text-gray-600 text-center mb-4">Centralisez toutes les informations de vos employés en un seul endroit.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Fiches employés complètes
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Gestion des contrats
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Organisation par départements
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-green-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-xl text-gray-800 mb-4 text-center">Gestion des Congés</h3>
            <p className="text-gray-600 text-center mb-4">Simplifiez la gestion et l'approbation des demandes de congés.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Demandes en ligne
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Approbations simplifiées
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Calendrier visuel
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-purple-100 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-xl text-gray-800 mb-4 text-center">Reporting Avancé</h3>
            <p className="text-gray-600 text-center mb-4">Générez des rapports détaillés pour une meilleure prise de décision.</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Tableaux de bord personnalisables
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Export de données
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Analyses en temps réel
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à transformer votre gestion RH ?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez les centaines d'entreprises qui nous font confiance pour simplifier leur gestion des ressources humaines.
          </p>
          <button
            onClick={() => setShowRoleSelection(true)}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Démarrer maintenant
          </button>
        </div>
      </section>

      {/* Footer amélioré */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="../../../src/public/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" 
                alt="Logo SGRH" 
                className="h-10 object-contain mb-4" 
              />
              <p className="text-gray-400 text-sm">
                La solution tout-en-un pour une gestion RH moderne et efficace.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cas clients</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 SGRH. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Bouton de retour en haut */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40"
          aria-label="Retour en haut"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HomePage;