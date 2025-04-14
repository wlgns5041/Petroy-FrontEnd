import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/Main/CategoryModal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const CategoryModal = ({ isOpen, onRequestClose, onCategoryCreated }) => {
  const [categoryName, setCategoryName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/schedules/category`,
        { name: categoryName },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert('일정 카테고리가 생성되었습니다.');
        onCategoryCreated();
        onRequestClose();
      } else {
        alert(`카테고리 생성에 실패했습니다: ${response.data.message}`);
      }
    } catch (error) {
      console.error('카테고리 생성 오류:', error);
      alert('카테고리 생성에 실패했습니다.');
    }
  };

  return (
    <div className="category-modal-overlay">
      <div className="category-modal-wrapper">
        <h2 className="category-modal-title">카테고리 추가</h2>
        <div className="category-modal-form-section">
          <input
            type="text"
            className="category-modal-form-input"
            placeholder="카테고리의 이름을 작성해주세요"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <div className="category-modal-button-group">
          <button className="category-modal-btn category-modal-cancel" onClick={onRequestClose}>
            취소
          </button>
          <button className="category-modal-btn category-modal-submit" onClick={handleSubmit}>
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;