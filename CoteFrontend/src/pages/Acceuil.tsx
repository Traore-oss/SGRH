import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, BarChart3, ChevronRight, Building2, Shield, 
  ArrowRight, CheckCircle, Play, Star, Award, Rocket, Zap,
  Target, Globe, Lock, Heart, Sparkles, ArrowUp
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Images pour la section SGRH avec des thèmes RH
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

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Statistiques animées
  const stats = [
    { value: '500+', label: 'Entreprises' },
    { value: '50k+', label: 'Utilisateurs' },
    { value: '99.9%', label: 'Disponibilité' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-['Inter'] overflow-hidden">
      {/* Google Fonts import - Inter */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
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
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          .animate-scale-in {
            animation: scaleIn 0.4s ease-out;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse 2s ease-in-out infinite;
          }
        `}
      </style>

      {/* Header amélioré avec glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <img 
                src="../../../src/public/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" 
                alt="Logo SGRH" 
                className="h-8 object-contain" 
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SGRH
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              Fonctionnalités
            </button>
            <button onClick={() => scrollToSection('stats')} className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              Statistiques
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              Témoignages
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors hidden md:block"
            >
              Connexion
            </button>
            <button
              onClick={() => setShowRoleSelection(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Essai gratuit
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section améliorée avec particules animées */}
      <section className="relative container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        {/* Effet de particules animées */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-indigo-200/30 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 20 + 10}px`,
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>

        <div className="md:w-1/2 mb-12 md:mb-0 md:pr-10 relative z-10">
          <div className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse-slow">
            <Sparkles className="h-4 w-4 mr-2" />
            Plateforme RH révolutionnaire
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Transformez votre <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">gestion RH</span> 
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Une solution complète pour optimiser la gestion de votre personnel, 
            automatiser les processus RH et prendre des décisions éclairées grâce 
            à des analyses en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => setShowRoleSelection(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Zap className="mr-2 h-5 w-5" />
              Démarrer gratuitement
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="bg-white text-indigo-600 border-2 border-indigo-200 px-8 py-4 rounded-lg hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center group"
            >
              <Play className="mr-2 h-5 w-5 group-hover:text-indigo-700" />
              Voir la démo
            </button>
          </div>
          
          {/* Badges de confiance améliorés */}
          <div className="flex flex-wrap gap-6 items-center">
            {[
              { icon: Shield, text: 'Certifié ISO 27001', color: 'text-green-500' },
              { icon: Users, text: '500+ entreprises', color: 'text-blue-500' },
              { icon: Award, text: 'Prix innovation 2024', color: 'text-yellow-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                <item.icon className={`h-5 w-5 mr-2 ${item.color}`} />
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Image Slider amélioré avec effet 3D */}
        <div className="md:w-1/2 relative z-10">
          <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl transform perspective-1000 rotate-y-6">
            {sgrhImages.map((img, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentImage 
                    ? 'opacity-100 z-10 scale-100' 
                    : 'opacity-0 z-0 scale-105'
                }`}
              >
                <img 
                  src={img} 
                  alt={`SGRH ${index + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            ))}
            
            {/* Overlay avec texte */}
            <div className="absolute bottom-6 left-6 right-6 text-white z-20">
              <h3 className="text-xl font-semibold mb-2">Gestion RH Moderne</h3>
              <p className="text-sm opacity-90">Solution tout-en-un pour les professionnels RH</p>
            </div>
          </div>
          
          {/* Indicators améliorés */}
          <div className="flex justify-center mt-6 space-x-3">
            {sgrhImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImage 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setCurrentImage(index)}
                aria-label={`Afficher l'image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section Statistiques animées */}
      <section id="stats" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2 animate-count">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Access Modal amélioré */}
      {showRoleSelection && (
        <section className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 animate-scale-in border border-gray-100">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Accès Sécurisé</h3>
              <p className="text-gray-600">
                Connectez-vous à votre espace professionnel
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg mb-4 group"
            >
              <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              Se connecter
            </button>
            
            <div className="text-center">
              <button
                onClick={() => setShowRoleSelection(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Retour à l'accueil
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                🔒 Données cryptées et conformes RGPD
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid amélioré avec animations au survol */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Target className="h-4 w-4 mr-2" />
            FONCTIONNALITÉS PRINCIPALES
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-lg text-gray-600">
            Une plateforme complète pour révolutionner votre gestion des ressources humaines
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Gestion du Personnel",
              description: "Centralisez toutes les informations de vos employés en un seul endroit sécurisé.",
              features: ["Fiches employés complètes", "Gestion des contrats", "Organisation par départements"],
              color: "blue"
            },
            {
              icon: Calendar,
              title: "Gestion des Congés",
              description: "Automatisez la gestion et l'approbation des demandes de congés en temps réel.",
              features: ["Demandes en ligne", "Approbations simplifiées", "Calendrier visuel"],
              color: "green"
            },
            {
              icon: BarChart3,
              title: "Reporting Avancé",
              description: "Générez des rapports détaillés et des analyses prédictives pour mieux décider.",
              features: ["Tableaux de bord personnalisables", "Export de données", "Analyses en temps réel"],
              color: "purple"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group cursor-pointer ${
                hoveredFeature === index ? 'ring-2 ring-indigo-500' : ''
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`bg-${feature.color}-100 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-4 text-center group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-3">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="text-center mt-6">
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  En savoir plus
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Témoignages */}
      <section id="testimonials" className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center bg-white text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-sm">
              <Heart className="h-4 w-4 mr-2" />
              CE QUE NOS CLIENTS DISENT
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Ils nous font confiance</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "SGRH a transformé notre gestion RH. Gain de temps considérable et équipe plus productive !",
                author: "Traore Ibrahima sory",
                role: "DRH - TechCorp",
                rating: 5
              },
              {
                text: "Interface intuitive et fonctionnalités complètes. Exactement ce qu'il nous fallait pour évoluer.",
                author: "Karifa Camara",
                role: "CEO - StartupFast",
                rating: 5
              },
              {
                text: "Le support client est exceptionnel. Des solutions rapides et efficaces à chaque problème.",
                author: "Fode Cisse",
                role: "Responsable RH - GroupMega",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-indigo-400 to-purple-400 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section améliorée */}
      <section className="relative py-24 bg-gradient-to-r from-indigo-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à révolutionner votre gestion RH ?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez les entreprises innovantes qui digitalisent leur gestion des ressources humaines avec SGRH.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRoleSelection(true)}
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Démarrer maintenant
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all duration-300 font-semibold"
            >
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* Footer amélioré */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <img 
                    src="../../../src/public/SGRH_Logo_-_Wordmark_Style-removebg-preview.png" 
                    alt="Logo SGRH" 
                    className="h-8 object-contain" 
                  />
                </div>
                <span className="text-xl font-bold text-white">SGRH</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                La solution tout-en-un pour une gestion RH moderne, efficace et sécurisée.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            
            {[
              {
                title: "Produit",
                links: ["Fonctionnalités", "Tarifs", "Cas clients", "Intégrations"]
              },
              {
                title: "Support",
                links: ["Centre d'aide", "Contact", "FAQ", "Documentation"]
              },
              {
                title: "Entreprise",
                links: ["À propos", "Blog", "Carrières", "Presse"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-4 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 SGRH. Tous droits réservés. | 
              <a href="#" className="text-gray-400 hover:text-white transition-colors ml-2">Mentions légales</a> | 
              <a href="#" className="text-gray-400 hover:text-white transition-colors ml-2">Politique de confidentialité</a>
            </p>
          </div>
        </div>
      </footer>

      {/* Bouton de retour en haut amélioré */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-40 group"
          aria-label="Retour en haut"
        >
          <ArrowUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default HomePage;