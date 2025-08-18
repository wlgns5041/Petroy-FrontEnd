import React, { useState } from "react";
import "../../styles/Main/CategoryDeleteModal.css";

const CategoryDeleteModal = ({
  categoryName = "",
  onClose,
  onConfirm,
  loading,
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const canDelete =
    input.trim().toLowerCase() === (categoryName || "").trim().toLowerCase();

  const handleConfirm = () => {
    if (!canDelete) {
      setError("카테고리 이름을 정확히 입력해주세요.");
      return;
    }
    onConfirm?.();
  };

  return (
    <div className="category-delete-overlay" role="dialog" aria-modal="true">
      <div className="category-delete-container">
        <h2 className="category-delete-title">정말로 삭제하시겠습니까?</h2>
        <p className="category-delete-description">
          <strong>카테고리 삭제</strong>를 원하시면{" "}
          <strong>카테고리의 이름</strong>을 입력해주세요
        </p>

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canDelete) handleConfirm();
          }}
          className="category-delete-input"
          placeholder={categoryName || "카테고리 이름"}
          aria-label="카테고리 이름 입력"
        />

        {error && <p className="category-delete-error">{error}</p>}

        <div className="category-delete-button-row">
          <button
            className="category-delete-cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="category-delete-confirm-button"
            onClick={handleConfirm}
            disabled={loading || !canDelete}
          >
            {loading ? "삭제 중..." : "삭제하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDeleteModal;