import React, { useEffect, useState } from 'react';
import '../../styles/Main/ScheduleDetailModal.css';
import {fetchScheduleDetail, deleteSchedule} from '../../services/ScheduleService';

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

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'LOW':
        return '낮음';
      case 'MEDIUM':
        return '중간';
      case 'HIGH':
        return '높음';
      default:
        return '미지정';
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onRequestClose();
  };

  const handleDelete = async () => {
    if (!scheduleId || !selectedDate) {
      setError('삭제할 일정이 선택되지 않았습니다.');
      return;
    }

    if (!window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteSchedule(
        scheduleId,
        selectedDate.toLocaleString('sv-SE')
      );

      if (response.status === 200 && response.data === true) {
        alert('일정이 삭제되었습니다.');
        onScheduleDeleted(scheduleId, selectedDate);
        onRequestClose();
      } else {
        setError(response.data.message || '일정 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
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
    }
  }, [isOpen, scheduleId, selectedDate]);

  if (!isOpen) return null;

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
          <div className="schedule-detail-value">
            {new Date(scheduleDetail.scheduleAt).toLocaleString()}
          </div>
        </div>
      )}

      <div className="schedule-detail-button-container">
        <button onClick={handleDelete} className="schedule-detail-delete-button">
          일정 삭제
        </button>
        <button onClick={handleClose} className="schedule-detail-cancel-button">
          닫기
        </button>
      </div>
    </div>
  </div>
);
}

export default ScheduleDetailModal;