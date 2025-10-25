import React from "react";
import "../../styles/AlertModal.css";

const AlertModal = ({ message, onConfirm }) => {
  return (
    <div className="alertmodal-overlay">
      <div className="alertmodal-container">
        <p className="alertmodal-message">{message}</p>
        <button className="alertmodal-button" onClick={onConfirm}>
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;