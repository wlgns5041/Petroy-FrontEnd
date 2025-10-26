import React, { useEffect, useState } from "react";
import "../../styles/Main/ScheduleDetailModal.css";
import {
  fetchScheduleDetail,
  deleteSchedule,
} from "../../services/ScheduleService";
import ScheduleDeleteModal from "../../components/Main/ScheduleDeleteModal.jsx";
import AlertModal from "../../components/commons/AlertModal.jsx";

function ScheduleDetailModal({
  isOpen,
  onRequestClose,
  scheduleId,
  selectedDate,
  onScheduleDeleted,
}) {
  const [loading, setLoading] = useState(true);
  const [scheduleDetail, setScheduleDetail] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "LOW":
        return "낮음";
      case "MEDIUM":
        return "중간";
      case "HIGH":
        return "높음";
      default:
        return "미지정";
    }
  };

  const handleClose = () => onRequestClose();

  const openDeleteModal = () => {
    if (!scheduleId || !selectedDate) {
      setAlertMessage("삭제할 일정이 선택되지 않았습니다.");
      setShowAlert(true);
      return;
    }
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!scheduleId || !selectedDate) {
      setAlertMessage("삭제할 일정이 선택되지 않았습니다.");
      setShowAlert(true);
      return;
    }

    setDeleting(true);
    try {
      const localDate = selectedDate
        .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" })
        .replace(" ", "T");

      const response = await deleteSchedule(scheduleId, localDate);

      if (
        response.status === 200 &&
        (response.data === true || response.data?.success)
      ) {
        setAlertMessage("일정이 삭제되었습니다.");
      } else {
        setAlertMessage(response?.data?.message || "일정 삭제에 실패했습니다.");
      }
    } catch (err) {
      setAlertMessage(
        err?.response?.data?.message ??
          "서버 오류(500)가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setShowAlert(true);
      setDeleting(false);
    }
  };

  const handleAlertConfirm = async () => {
    setShowAlert(false);

    if (alertMessage.includes("삭제되었습니다")) {
      await Promise.resolve(onScheduleDeleted?.(scheduleId, selectedDate));
      setDeleteOpen(false);
      onRequestClose();
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchScheduleDetail(
          scheduleId,
          selectedDate
            ? selectedDate
                .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" })
                .replace(" ", "T")
            : null
        );
        setScheduleDetail(data);
      } catch (err) {
        setAlertMessage("일정 상세 정보를 불러오는 데 실패했습니다.");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && scheduleId && selectedDate) {
      loadDetail();
    }
  }, [isOpen, scheduleId, selectedDate]);

  if (!isOpen) return null;

  const dateText = scheduleDetail
    ? new Date(scheduleDetail.scheduleAt).toLocaleString()
    : "";

  return (
    <div className="schedule-detail-modal-overlay">
      <div className="schedule-detail-modal-wrapper">
        <h2 className="schedule-detail-title">일정 상세 정보</h2>

        {loading && <p className="schedule-detail-loading-text">로딩 중...</p>}

        {!loading && scheduleDetail && (
          <div className="schedule-detail-section">
            <div className="schedule-detail-label">카테고리</div>
            <div className="schedule-detail-value">
              {scheduleDetail.categoryName}
            </div>

            <div className="schedule-detail-label">제목</div>
            <div className="schedule-detail-value">{scheduleDetail.title}</div>

            <div className="schedule-detail-label">내용</div>
            <div className="schedule-detail-value">
              {scheduleDetail.content}
            </div>

            <div className="schedule-detail-label">우선순위</div>
            <div className="schedule-detail-value">
              {getPriorityLabel(scheduleDetail.priority)}
            </div>

            <div className="schedule-detail-label">반려동물</div>
            <div className="schedule-detail-value">
              {scheduleDetail.petName.join(", ")}
            </div>

            <div className="schedule-detail-label">알림 여부</div>
            <div className="schedule-detail-value">
              {scheduleDetail.noticeYn ? "예" : "아니오"}
            </div>

            <div className="schedule-detail-label">하루종일</div>
            <div className="schedule-detail-value">
              {scheduleDetail.allDay ? "예" : "아니오"}
            </div>

            <div className="schedule-detail-label">일정 시간</div>
            <div className="schedule-detail-value">{dateText}</div>
          </div>
        )}

        <div className="schedule-detail-button-container">
          <button
            onClick={handleClose}
            className="schedule-detail-cancel-button"
          >
            닫기
          </button>
          <button
            onClick={openDeleteModal}
            className="schedule-detail-delete-button"
          >
            일정 삭제
          </button>
        </div>
      </div>

      {deleteOpen && (
        <ScheduleDeleteModal
          title={scheduleDetail?.title ?? ""}
          dateText={dateText}
          onClose={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}

      {showAlert && (
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
}

export default ScheduleDetailModal;
