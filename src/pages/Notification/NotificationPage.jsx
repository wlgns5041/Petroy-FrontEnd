import React, { useEffect, useState } from 'react';
import NavBar from '../../components/commons/NavBar.jsx';
import '../../styles/Notification/NotificationPage.css';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const categories = ['전체', '친구', '일정', '커뮤니티'];
const API_BASE_URL = process.env.REACT_APP_API_URL;

// 알림 타입 텍스트 매핑
const typeMap = {
  FRIEND_REQUEST: '친구 요청',
  FRIEND_ACCEPTED: '친구 수락',
  FRIEND_REJECTED: '친구 거절',
  SCHEDULE: '일정 알림',
  POST: '커뮤니티 알림',
};

function NotificationPage() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // 기존 알림 목록 불러오기
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/notification`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`알림 요청 실패 (status: ${response.status})`);
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonErr) {
          console.warn('⚠️ 응답 본문이 비어있거나 JSON 아님');
          data = { content: [] };
        }

        console.log('✅ 알림 수신:', data.content);
        setNotifications(data.content || []);
      } catch (err) {
        console.error('❌ 알림 로딩 실패:', err);
        setError(err.message);
      }
    };

    fetchNotifications();
  }, []);


  // 카테고리 필터링
  const filteredNotifications =
    activeCategory === '전체'
      ? notifications
      : notifications.filter((n) => {
          if (activeCategory === '친구') {
            return ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_REJECTED'].includes(n.noticeType);
          }
          if (activeCategory === '일정') return n.noticeType === 'SCHEDULE';
          if (activeCategory === '커뮤니티') return n.noticeType === 'POST';
          return false;
        });

  return (
    <div className="notification-page">
      <NavBar className="notification-page-Navbar" title="알림" />
      <h2 className="notification-title">알림</h2>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab-button ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      <div className="notification-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p className="icon">📭</p>
            <p className="empty-title">알림 목록이 없습니다</p>
            <p className="empty-subtitle">새로운 소식이 도착하면 알려드릴게요!</p>
          </div>
        ) : (
          filteredNotifications.map((notice) => (
            <div key={notice.noticeId} className="notification-item">
              <div className="notice-type">{typeMap[notice.noticeType]}</div>
              <div className="notice-message">
                {typeMap[notice.noticeType]} 알림이 도착했습니다.
              </div>
              <div className="notice-time">
                {formatDistanceToNow(new Date(notice.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPage;