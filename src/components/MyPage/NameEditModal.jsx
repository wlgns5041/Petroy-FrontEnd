import React, { useState } from 'react';
import '../../styles/MyPage/NameEditModal.css'

const NameEditModal = ({ onClose, onSave }) => {
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    onSave(newName); 
    onClose(); 
  };

  return (
    <div className="nameEdit-modal show">
      <div className="nameEdit-modal-content">
        <div className="nameEdit-modal-header">이름 수정</div>
        <div className="nameEdit-modal-body">
          <input
            type="text"
            placeholder="새로운 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="nameEdit-myPage-input"
          />
        </div>
        <div className="nameEdit-modal-footer">
          <button onClick={onClose}>닫기</button>
          <button onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default NameEditModal;