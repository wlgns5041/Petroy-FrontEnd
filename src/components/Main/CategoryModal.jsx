import React, { useState } from "react";
import "../../styles/Main/CategoryModal.css";
import { createScheduleCategory } from "../../services/ScheduleService";
import AlertModal from "../../components/commons/AlertModal.jsx";

const CategoryModal = ({ isOpen, onRequestClose, onCategoryCreated }) => {
  const [categoryName, setCategoryName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (loading) return;
    if (!categoryName.trim()) {
      setAlertMessage("카테고리 이름을 입력해주세요.");
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);
      const response = await createScheduleCategory(categoryName);
      if (response.status === 200) {
        setAlertMessage("일정 카테고리가 생성되었습니다.");
      } else {
        setAlertMessage(`카테고리 생성에 실패했습니다: ${response.data.message}`);
      }
    } catch (error) {
      console.error("카테고리 생성 오류:", error);
      setAlertMessage("카테고리 생성에 실패했습니다.");
    } finally {
      setShowAlert(true);
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (alertMessage.includes("생성되었습니다")) {
      onCategoryCreated();
      onRequestClose();
    }
  };

  return (
    <div className="category-modal-overlay">
      <div
        className="category-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="category-modal-title">카테고리 추가</h2>
        <div className="category-modal-subtitle">
          카테고리를 추가해서 일정을 분류해보세요
        </div>
        <div className="category-modal-form-section">
          <input
            type="text"
            className="category-modal-form-input"
            placeholder="카테고리의 이름을 작성해주세요"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>
        <div className="category-modal-button-group">
          <button
            className="category-modal-btn category-modal-cancel"
            onClick={onRequestClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="category-modal-btn category-modal-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "생성 중..." : "카테고리 생성"}
          </button>
        </div>
      </div>
      {showAlert && (
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
};

export default CategoryModal;