import React from "react";

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="bg-white rounded-2xl shadow-2xl p-6 relative min-w-[300px] max-w-[90vw]">
      <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
      {children}
    </div>
  </div>
);

export default Modal;
