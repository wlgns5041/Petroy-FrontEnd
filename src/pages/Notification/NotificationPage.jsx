import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/commons/NavBar.jsx';
import '../../styles/Notification/NotificationPage.css';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { subscribeNotification, updateGlobalUnreadCount } from '../../services/SubscribeNotification.jsx';

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
  const [unreadCount, setUnreadCount] = useState(0); 
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = subscribeNotification();
  
    eventSource.addEventListener("unReadCount", (event) => {
      console.log("📩 수신한 unreadCount:", event.data);
      const unreadCount = parseInt(event.data, 10);
      setUnreadCount(unreadCount); 
    });
  
    return () => {
      eventSource.close();
      window.__eventSourceInstance = null;
    };
  }, []);

  useEffect(() => {
    const unread = (notifications || []).filter(n => !n.read).length;
    setUnreadCount(unread);
    localStorage.setItem('unreadCount', unread);
  }, [notifications]);

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

        setNotifications(data.content || []);
      } catch (err) {
        console.error('❌ 알림 로딩 실패:', err);
        setError(err.message);
      }
    };

    fetchNotifications();
  }, []);

  // 읽음 처리 함수
  const markAsRead = async (noticeId) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/notification/${noticeId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('읽음 처리 실패');
      }
  
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.noticeId === noticeId ? { ...n, read: true } : n
        );
  
        const newUnread = updated.filter(n => !n.read).length;
        setUnreadCount(newUnread); 

        updateGlobalUnreadCount(newUnread);

        return updated;
      });
    } catch (err) {
      console.error('❌ 읽음 처리 중 오류 발생:', err);
    }
  };

  // 목록 최신순 정렬
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // 카테고리 필터링
  const filteredNotifications =
    activeCategory === '전체'
      ? sortedNotifications
      : sortedNotifications.filter((n) => {
          if (activeCategory === '친구') {
            return ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_REJECTED'].includes(n.noticeType);
          }
          if (activeCategory === '일정') return n.noticeType === 'SCHEDULE';
          if (activeCategory === '커뮤니티') return n.noticeType === 'POST';
          return false;
        });

  const categoryCounts = {
    전체: notifications.filter(n => !n.read).length,
    친구: notifications.filter(n =>
      ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_REJECTED'].includes(n.noticeType) && !n.read
    ).length,
    일정: notifications.filter(n => n.noticeType === 'SCHEDULE' && !n.read).length,
    커뮤니티: notifications.filter(n => n.noticeType === 'POST' && !n.read).length,
  };

  const handleNotificationClick = (notice) => {
    if (notice.noticeType === 'SCHEDULE') {
      navigate('/mainPage');
    } else if (
      ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_REJECTED'].includes(notice.noticeType)
    ) {
      navigate('/friendPage');
    }
  };

  return (
    <div className="notification-page">
      <NavBar title="알림" unreadCount={unreadCount} />
      <h2 className="notification-title">알림</h2>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab-button ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            {categoryCounts[cat] > 0 && (
              <span style={{ color: '#ff4e50', marginLeft: '4px' }}>
                ({categoryCounts[cat]})
              </span>
            )}
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
            <div key={notice.noticeId} 
            className={`notification-item ${notice.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(notice)}
            >
            <div className="notification-content">
              <div className="notification-left">
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
              {!notice.read && (
                <div className="notification-right">
                  <button
                    className="mark-read-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notice.noticeId);
                    }}
                  >
                    읽음
                  </button>
                </div>
              )}
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPage;