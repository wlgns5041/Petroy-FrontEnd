import React, { useEffect, useState } from 'react';
import '../../styles/Main/ScheduleDetailModal.css';
import { fetchScheduleDetail, deleteSchedule } from '../../services/ScheduleService';
import ScheduleDeleteModal from '../../components/Main/ScheduleDeleteModal.jsx';

function ScheduleDetailModal({ isOpen, onRequestClose, scheduleId, selectedDate, onScheduleDeleted }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleDetail, setScheduleDetail] = useState({
    title: '로딩 중...',
    content: '',
    priority: '미지정',
    petName: [],
    categoryName: '정보 없음',
    status: '미지정',
    noticeYn: false,
    allDay: false,
    repeatYn: false,
    scheduleAt: new Date().toISOString(),
  });

  // ▼ 추가: 삭제 모달 상태
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'LOW': return '낮음';
      case 'MEDIUM': return '중간';
      case 'HIGH': return '높음';
      default: return '미지정';
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onRequestClose();
  };

  // ▼ 변경: 확인창 대신 모달 오픈
  const openDeleteModal = () => {
    if (!scheduleId || !selectedDate) {
      setError('삭제할 일정이 선택되지 않았습니다.');
      return;
    }
    setDeleteError("");
    setDeleteOpen(true);
  };

  // ▼ 추가: 실제 삭제 수행
  const confirmDelete = async () => {
    if (!scheduleId || !selectedDate) {
      setDeleteError('삭제할 일정이 선택되지 않았습니다.');
      return;
    }
    setDeleting(true);
    try {
      const dateParam = selectedDate.toLocaleString('sv-SE');
      const response = await deleteSchedule(scheduleId, dateParam);

      if (response.status === 200 && response.data === true) {
        alert('일정이 삭제되었습니다.');
        onScheduleDeleted?.(scheduleId, selectedDate);
        setDeleteOpen(false);
        onRequestClose();
      } else {
        const msg = response?.data?.message || '일정 삭제에 실패했습니다.';
        setDeleteError(msg);
      }
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ??
        '네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchScheduleDetail(
          scheduleId,
          selectedDate ? selectedDate.toLocaleString('sv-SE') : null
        );
        setScheduleDetail(data);
      } catch (err) {
        setError('일정 상세 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && scheduleId && selectedDate) {
      loadDetail();
    } else if (!isOpen) {
      setLoading(true);
      setError(null);
      setScheduleDetail({
        title: '로딩 중...',
        content: '',
        priority: '미지정',
        petName: [],
        categoryName: '정보 없음',
        status: '미지정',
        noticeYn: false,
        allDay: false,
        repeatYn: false,
        scheduleAt: new Date().toISOString(),
      });
      setDeleteOpen(false);
      setDeleteError("");
      setDeleting(false);
    }
  }, [isOpen, scheduleId, selectedDate]);

  if (!isOpen) return null;

  const dateText = new Date(scheduleDetail.scheduleAt).toLocaleString();

  return (
    <div className="schedule-detail-modal-overlay">
      <div className="schedule-detail-modal-wrapper">
        <h2 className="schedule-detail-title">일정 상세 정보</h2>

        {loading && <p className="schedule-detail-loading-text">로딩 중...</p>}
        {error && <p className="schedule-detail-error-text">{error}</p>}

        {!loading && !error && (
          <div className="schedule-detail-section">
            <div className="schedule-detail-label">카테고리</div>
            <div className="schedule-detail-value">{scheduleDetail.categoryName}</div>

            <div className="schedule-detail-label">제목</div>
            <div className="schedule-detail-value">{scheduleDetail.title}</div>

            <div className="schedule-detail-label">내용</div>
            <div className="schedule-detail-value">{scheduleDetail.content}</div>

            <div className="schedule-detail-label">우선순위</div>
            <div className="schedule-detail-value">
              {getPriorityLabel(scheduleDetail.priority)}
            </div>

            <div className="schedule-detail-label">반려동물</div>
            <div className="schedule-detail-value">
              {scheduleDetail.petName.join(', ')}
            </div>

            <div className="schedule-detail-label">알림 여부</div>
            <div className="schedule-detail-value">
              {scheduleDetail.noticeYn ? '예' : '아니오'}
            </div>

            <div className="schedule-detail-label">하루종일</div>
            <div className="schedule-detail-value">
              {scheduleDetail.allDay ? '예' : '아니오'}
            </div>

            <div className="schedule-detail-label">일정 시간</div>
            <div className="schedule-detail-value">{dateText}</div>
          </div>
        )}

        <div className="schedule-detail-button-container">
          <button onClick={openDeleteModal} className="schedule-detail-delete-button">
            일정 삭제
          </button>
          <button onClick={handleClose} className="schedule-detail-cancel-button">
            닫기
          </button>
        </div>
      </div>

      {/* ▼ 삭제 확인 모달 */}
      {deleteOpen && (
        <ScheduleDeleteModal
          title={scheduleDetail?.title ?? ""}
          dateText={dateText}
          onClose={() => { setDeleteOpen(false); setDeleteError(""); }}
          onConfirm={confirmDelete}
          loading={deleting}
          serverError={deleteError}
        />
      )}
    </div>
  );
}

export default ScheduleDetailModal;