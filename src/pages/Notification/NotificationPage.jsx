import React, { useState } from 'react';
import NavBar from '../../components/commons/NavBar.jsx';
import '../../styles/Notification/NotificationPage.css'

const categories = ['전체', '친구', '일정', '커뮤니티'];

const mockData = {
  친구: [
    { id: 1, type: '친구 요청', message: '연경수님이 친구 요청을 보냈습니다.', time: '2시간 전' },
    { id: 3, type: '친구 확인', message: '신석호님이 친구 요청을 수락했습니다.', time: '2일 전' },
  ],
  일정: [
    { id: 2, type: '일정 알림', message: '산책 일정이 곧 시작돼요!', time: '3시간 전' },
  ],
  커뮤니티: [],
};

function NotificationPage() {
    const [activeCategory, setActiveCategory] = useState('전체');
  
    const notifications =
  activeCategory === '전체'
    ? [...mockData.친구, ...mockData.일정, ...mockData.커뮤니티]
    : mockData[activeCategory];
  
    return (
      <div className="notification-page">
        <NavBar className="notification-page-Navbar" title="알림" />
        <h2 className="title">알림</h2>
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
  
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <p className="icon">📭</p>
              <p className="empty-title">알림 목록이 없습니다</p>
              <p className="empty-subtitle">새로운 소식이 도착하면 알려드릴게요!</p>
            </div>
          ) : (
            notifications.map((notice) => (
              <div key={notice.id} className="notification-item">
                <div className="notice-type">{notice.type}</div>
                <div className="notice-message">{notice.message}</div>
                <div className="notice-time">{notice.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

export default NotificationPage;