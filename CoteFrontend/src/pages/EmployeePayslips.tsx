/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { getPaiements } from "../Components/paiementService";
import jsPDF from "jspdf";
import "react-toastify/dist/ReactToastify.css";
import autoTable from 'jspdf-autotable';

interface Employe {
  _id: string;
  nom: string;
  prenom: string;
  employer: { matricule: string };
}

interface Paiement {
  _id: string;
  employe: Employe;
  mois: string;
  salaireNet: number;
  primes?: number;
  heuresSupplementaires?: number;
  retenues?: number;
  absences?: number;
  modePaiement: string;
}

const EmployeePayslips: React.FC = () => {
  const [payslips, setPayslips] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Paiement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const data: Paiement[] = await getPaiements();
      setPayslips(data.filter((p) => p.employe._id === user._id));
    } catch (err: any) {
      console.error(err);
      toast.error("Impossible de récupérer vos paiements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const generatePDF = (p: Paiement) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 220, 30, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("BULLETIN DE PAIE", 105, 15, { align: "center" });
    
    // Informations de l'entreprise
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Entreprise XYZ", 105, 40, { align: "center" });
    doc.text("123 Avenue des Entreprises, Conakry", 105, 45, { align: "center" });
    doc.text("Tél: +224 123 456 789", 105, 50, { align: "center" });
    
    // Ligne séparatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 55, 190, 55);
    
    // Informations employé
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("INFORMATIONS EMPLOYÉ", 20, 65);
    
    doc.setFontSize(10);
    doc.text(`Nom: ${p.employe.nom} ${p.employe.prenom}`, 20, 75);
    doc.text(`Matricule: ${p.employe.employer.matricule}`, 20, 80);
    doc.text(
      `Période: ${new Date(p.mois).toLocaleString("fr-FR", {
        month: "long",
        year: "numeric",
      })}`,
      20,
      85
    );
    doc.text(`Mode de paiement: ${p.modePaiement}`, 20, 90);
    
    // Détails de paie
    doc.setFontSize(12);
    doc.text("DÉTAILS DE LA PAIE", 20, 105);
    
    // Tableau des gains et retenues
    const tableColumn = ["Description", "Montant (GNF)"];
    const tableRows = [];
    
    tableRows.push(["Salaire de base", (p.salaireNet - (p.primes || 0) + (p.retenues || 0)).toLocaleString('fr-FR')]);
    if (p.primes) tableRows.push(["Primes", p.primes.toLocaleString('fr-FR')]);
    if (p.heuresSupplementaires) tableRows.push(["Heures supplémentaires", p.heuresSupplementaires.toLocaleString('fr-FR')]);
    if (p.retenues) tableRows.push(["Retenues", `-${p.retenues.toLocaleString('fr-FR')}`]);
    if (p.absences) tableRows.push(["Absences (jours)", p.absences.toString()]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 20 }
    });
    
    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`SALAIRE NET: ${p.salaireNet.toLocaleString('fr-FR')} GNF`, 20, finalY);
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Document généré électroniquement - Valable sans signature", 105, 280, { align: "center" });
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 285, { align: "center" });
    
    doc.save(`bulletin_paie_${p.employe.nom}_${p.mois}.pdf`);
  };

  const PayslipDetailsModal = () => {
    if (!selectedPayslip) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="border-b border-gray-200 px-6 py-4 rounded-t-xl flex justify-between items-center bg-white">
            <h3 className="text-lg font-semibold text-gray-800">Détails du bulletin</h3>
            <button 
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6 text-center">
              <h4 className="text-xl font-bold text-gray-800">
                {new Date(selectedPayslip.mois).toLocaleString("fr-FR", { 
                  month: "long", 
                  year: "numeric" 
                })}
              </h4>
              <p className="text-gray-600">{selectedPayslip.employe.nom} {selectedPayslip.employe.prenom}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Salaire de base:</span>
                <span className="font-medium">{(selectedPayslip.salaireNet - (selectedPayslip.primes || 0) + (selectedPayslip.retenues || 0)).toLocaleString('fr-FR')} GNF</span>
              </div>
              
              {selectedPayslip.primes && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Primes:</span>
                  <span className="text-green-600 font-medium">+{selectedPayslip.primes.toLocaleString('fr-FR')} GNF</span>
                </div>
              )}
              
              {selectedPayslip.heuresSupplementaires && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Heures supplémentaires:</span>
                  <span className="text-green-600 font-medium">+{selectedPayslip.heuresSupplementaires.toLocaleString('fr-FR')} GNF</span>
                </div>
              )}
              
              {selectedPayslip.retenues && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Retenues:</span>
                  <span className="text-red-600 font-medium">-{selectedPayslip.retenues.toLocaleString('fr-FR')} GNF</span>
                </div>
              )}
              
              {selectedPayslip.absences && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Jours d'absence:</span>
                  <span className="text-red-600 font-medium">{selectedPayslip.absences}</span>
                </div>
              )}
              
              <div className="flex justify-between pt-4 border-t-2 border-gray-200 font-bold text-lg">
                <span className="text-gray-800">Salaire net:</span>
                <span className="text-blue-600">{selectedPayslip.salaireNet.toLocaleString('fr-FR')} GNF</span>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>Mode de paiement: <span className="font-medium">{selectedPayslip.modePaiement}</span></p>
                <p>Matricule: <span className="font-medium">{selectedPayslip.employe.employer.matricule}</span></p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => generatePDF(selectedPayslip)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Chargement de vos bulletins de paie...</p>
      </div>
    </div>
  );

  if (!payslips.length) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center animate-fade-in">
        <div className="mb-6">
          <svg className="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">Aucun bulletin de paie disponible</h3>
        <p className="text-gray-600 mb-6">Vos bulletins de paie apparaîtront ici une fois traités.</p>
        <button 
          onClick={() => fetchPayslips()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          Actualiser
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <ToastContainer position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mes Bulletins de Paie</h1>
          <p className="text-xl text-gray-600">Consultez et téléchargez vos bulletins de salaire</p>
        </div>
        
        {/* Statistiques résumé */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Résumé</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{payslips.length}</div>
              <div className="text-sm text-gray-600">Total bulletins</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {payslips.filter(p => p.salaireNet > 0).length}
              </div>
              <div className="text-sm text-gray-600">Bulletins payés</div>
            </div>
          </div>
        </div>

        {/* Historique des paiements */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
          <div className="border-b border-gray-200 px-6 py-5 bg-white">
            <h2 className="text-xl font-semibold text-gray-800">Historique des paiements</h2>
            <p className="text-gray-600 mt-1">{payslips.length} bulletin(s) disponible(s)</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {payslips.map((p, index) => (
              <div 
                key={p._id} 
                className="p-6 hover:bg-gray-50 transition-all duration-300 hover-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {new Date(p.mois).toLocaleString("fr-FR", { 
                        month: "long", 
                        year: "numeric" 
                      })}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {p.employe.nom} {p.employe.prenom} • {p.employe.employer.matricule}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.salaireNet > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {p.salaireNet > 0 ? "✅ Payé" : "⏳ En attente"}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        Mode: {p.modePaiement}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setSelectedPayslip(p);
                        setShowDetails(true);
                      }}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 15.5v-11a2 2 0 012-2h16a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2z"></path>
                      </svg>
                      Détails
                    </button>
                    
                    <button
                      onClick={() => generatePDF(p)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-600">Salaire net perçu:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {p.salaireNet.toLocaleString("fr-FR")} GNF
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {showDetails && <PayslipDetailsModal />}
    </div>
  );
};

export default EmployeePayslips;