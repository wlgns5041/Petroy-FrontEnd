import React, { useState } from "react";
import "../../styles/Main/ScheduleDeleteModal.css";

const ScheduleDeleteModal = ({
  title = "",
  dateText = "",
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [input, setInput] = useState("");

  const canDelete =
    input.trim().toLowerCase() === (title || "").trim().toLowerCase();

  const handleConfirm = () => {
    if (canDelete) onConfirm?.();
  };

  return (
    <div className="schedule-delete-overlay" role="dialog" aria-modal="true">
      <div
        className="schedule-delete-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="schedule-delete-title">정말로 삭제하시겠습니까?</h2>
        <p className="schedule-delete-description">
          <strong>일정 삭제</strong>를 원하시면 <strong>일정 제목</strong>을
          정확히 입력해주세요.
        </p>

        <div className="schedule-delete-meta">
          <div className="row">
            <span className="label">제목</span>
            <span className="value">{title || "-"}</span>
          </div>
          <div className="row">
            <span className="label">날짜 및 시간</span>
            <span className="value">{dateText || "-"}</span>
          </div>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canDelete) handleConfirm();
          }}
          className="schedule-delete-input"
          placeholder={title || "일정 제목"}
          aria-label="일정 제목 입력"
        />

        <div className="schedule-delete-button-row">
          <button
            className="schedule-delete-cancel-button"
            onClick={onClose}
            disabled={loading}
            aria-label="삭제 취소"
          >
            취소
          </button>
          <button
            className="schedule-delete-confirm-button"
            onClick={handleConfirm}
            disabled={loading || !canDelete}
            aria-label="일정 삭제 확인"
          >
            {loading ? "삭제 중..." : "삭제하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDeleteModal;