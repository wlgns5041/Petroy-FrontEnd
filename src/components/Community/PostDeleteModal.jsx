import React, { useState } from "react";
import "../../styles/Community/PostDeleteModal.css";

const PostDeleteModal = ({ postTitle = "", onClose, onConfirm, loading }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const canDelete = input.trim() === postTitle.trim();

  const handleConfirm = () => {
    if (!canDelete) {
      setError("게시글 제목을 정확히 입력해 주세요.");
      return;
    }
    onConfirm?.(); // 실제 삭제 로직은 부모에서
  };

  return (
    <div className="post-delete-overlay" role="dialog" aria-modal="true">
      <div className="post-delete-container">
        <h2 className="post-delete-title">정말로 삭제하시겠습니까?</h2>
        <p className="post-delete-description">
          <strong>게시글 삭제</strong>를 원하시면{" "}
          <strong>게시글 제목</strong>을 입력해주세요
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
          className="post-delete-input"
          placeholder={postTitle || "게시글 제목"}
          aria-label="게시글 제목 입력"
        />

        {error && <p className="post-delete-error">{error}</p>}

        <div className="post-delete-button-row">
          <button
            className="post-delete-cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="post-delete-confirm-button"
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

export default PostDeleteModal;