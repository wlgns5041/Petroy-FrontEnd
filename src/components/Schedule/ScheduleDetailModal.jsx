import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Main/ScheduleDetailModal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

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
            case 'LOW': return '낮음';
            case 'MEDIUM': return '중간';
            case 'HIGH': return '높음';
            default: return '미지정';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ONGOING': return '진행중';
            case 'DONE': return '완료';
            case 'DELETED': return '삭제됨';
            default: return '미지정';
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

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`, {
                headers: { Authorization: `${token}` },
                params: { scheduleAt: selectedDate.toLocaleString('sv-SE') },
            });

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
        const fetchScheduleDetail = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/schedules/${scheduleId}`, {
                        headers: { Authorization: `${token}` },
                        params: { scheduleAt: selectedDate ? selectedDate.toLocaleString('sv-SE') : null },
                    });

                    if (response.status === 200) {
                        setScheduleDetail(response.data);
                    } else {
                        setError(response.data.message || '일정 상세 정보를 불러오는 데 실패했습니다.');
                    }
                } catch (err) {
                    setError('네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('로그인이 필요합니다.');
                setLoading(false);
            }
        };

        if (isOpen && scheduleId && selectedDate) {
            fetchScheduleDetail();
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
        <div className="schedule-detail-modal">
            <div className="schedule-detail-modal-header">
                <h2>일정 상세 정보</h2>
            </div>
            <div className="schedule-detail-modal-body">
                {loading && <p>로딩 중...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && !scheduleDetail.title && <p>일정 정보가 없습니다.</p>}
                {!loading && !error && (
                    <>
                        <h3>{scheduleDetail.title}</h3>
                        <p>내용 : {scheduleDetail.content}</p>
                        <p>우선순위 : {getPriorityLabel(scheduleDetail.priority)}</p>
                        <p>반려동물 : {scheduleDetail.petName.join(', ')}</p>
                        <p>카테고리 : {scheduleDetail.categoryName || '정보 없음'}</p>
                        <p>상태 : {getStatusLabel(scheduleDetail.status)}</p>
                        <p>알림 여부 : {scheduleDetail.noticeYn ? '예' : '아니오'}</p>
                        <p>하루종일 : {scheduleDetail.allDay ? '예' : '아니오'}</p>
                        <p>반복 여부 : {scheduleDetail.repeatYn ? '예' : '아니오'}</p>
                        <p>일정 시간 : {new Date(scheduleDetail.scheduleAt).toLocaleString()}</p>
                    </>
                )}
            </div>
            <div className="schedule-detail-modal-footer">
                <button onClick={handleDelete} className="schedule-delete-button">일정 삭제</button>
                <button onClick={handleClose} className="schedule-detail-modal-close-button">닫기</button>
            </div>
        </div>
    );
}

export default ScheduleDetailModal;