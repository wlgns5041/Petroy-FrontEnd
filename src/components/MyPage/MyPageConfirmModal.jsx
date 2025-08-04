import React from "react";
import "../../styles/MyPage/MyPageConfirmModal.css";

const MyPageConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="my-page-confirm-modal-overlay">
      <div className="my-page-confirm-modal">
        <div className="my-page-confirm-message">
          {message.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        <div className="my-page-confirm-buttons">
          <button className="my-page-cancel-button" onClick={onCancel}>
            취소
          </button>
          <button className="my-page-confirm-button" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPageConfirmModal;