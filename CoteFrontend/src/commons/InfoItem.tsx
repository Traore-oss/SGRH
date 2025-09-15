import React from "react";

interface InfoItemProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode; // optionnel si tu veux afficher une icône
}

// Définition correcte du composant
const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
  return (
    <div
      className="info-item"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        minWidth: "200px",
      }}
    >
      {icon && <span>{icon}</span>}
      <div>
        <div style={{ fontWeight: "bold" }}>{label}</div>
        <div>{value}</div>
      </div>
    </div>
  );
};

export default InfoItem;
