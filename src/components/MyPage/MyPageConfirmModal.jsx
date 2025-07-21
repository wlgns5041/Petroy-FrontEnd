import React from "react";
import "../../styles/MyPage/MyPageConfirmModal.css";

const MyPageConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
      <div className="confirm-message">
  {message.split('\n').map((line, idx) => (
    <p key={idx}>{line}</p>
  ))}
</div>
        <div className="confirm-buttons">
          <button className="cancel-button" onClick={onCancel}>
            취소
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPageConfirmModal;
