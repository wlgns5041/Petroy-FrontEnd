import React, { useState, useRef, useEffect } from "react";
import "../../styles/Main/CategoryDeleteModal.css";

const CategoryDeleteModal = ({
  categoryName = "",
  onClose,
  onConfirm,
  loading,
}) => {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const canDelete =
    input.trim().toLowerCase() === (categoryName || "").trim().toLowerCase();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <div className="category-delete-overlay" role="dialog" aria-modal="true">
      <div
        className="category-delete-container"
        onClick={(e) => e.stopPropagation()} // 바깥 클릭 방지
      >
        <h2 className="category-delete-title">카테고리 삭제</h2>
        <p className="category-delete-subtitle">
          카테고리 삭제를 원하시면 <strong>카테고리의 이름</strong>을 입력해주세요
          <br />
          해당 카테고리의 일정이 존재하면 삭제되지 않습니다
        </p>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canDelete && !loading) handleConfirm();
          }}
          className="category-delete-input"
          placeholder={categoryName || "카테고리 이름"}
          aria-label="카테고리 이름 입력"
        />

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