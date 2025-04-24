import React, { useState } from 'react';
import '../../styles/MyPage/NameEditModal.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const NameEditModal = ({ onClose, onSave }) => {
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameChecked, setNameChecked] = useState(false);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNewName(value);
    setNameChecked(false);
    setNameError('이름 중복 확인을 해주세요.');
  };

  const checkNameDuplicate = async () => {
    if (newName.trim() === '') {
      setNameError('이름을 입력해 주세요.');
      setNameChecked(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/members/check-name`, {
        params: { name: newName }
      });

      if (response.status === 200) {
        setNameError('사용 가능한 이름입니다.');
        setNameChecked(true);
      }
    } catch (error) {
      if (error.response) {
        setNameError('중복된 이름입니다.');
      } else if (error.request) {
        setNameError('서버에 연결할 수 없습니다.');
      } else {
        setNameError('알 수 없는 오류가 발생했습니다.');
      }
      setNameChecked(false);
    }
  };

  const handleSave = () => {
    if (!nameChecked) {
      alert('이름 중복 확인을 완료해주세요.');
      return;
    }
    onSave(newName);
    onClose();
  };

  return (
    <div className="nameEdit-modal show">
      <div className="nameEdit-modal-content">
        <div className="nameEdit-modal-header">이름 변경</div>
        <div className="nameEdit-modal-body">
          <div className="input-with-button">
            <input
              type="text"
              placeholder="새로운 이름"
              value={newName}
              onChange={handleNameChange}
              className="nameEdit-myPage-input"
              maxLength="10"
            />
            <button className="check-button" onClick={checkNameDuplicate}>중복 확인</button>
          </div>
          <p className={`name-error ${nameError ? 'visible' : ''}`}>{nameError}</p>
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