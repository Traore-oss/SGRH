import React from 'react';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6 relative">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-800" onClick={onClose}>✕</button>
        <div>{children}</div>
      </div>
    </div>
  );
};
