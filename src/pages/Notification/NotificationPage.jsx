import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/commons/NavBar.jsx";
import "../../styles/Notification/NotificationPage.css";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  subscribeNotification,
  updateGlobalUnreadCount,
  fetchNotifications,
  markNotificationAsRead,
} from "../../services/NotificationService.jsx";
import {
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa";

const categories = ["전체", "친구", "일정", "커뮤니티"];

const typeMap = {
  FRIEND_REQUEST: "친구 요청",
  FRIEND_ACCEPTED: "친구 수락",
  FRIEND_REJECTED: "친구 거절",
  SCHEDULE: "일정 알림",
  POST: "커뮤니티 알림",
};

const iconMap = {
  FRIEND_REQUEST: <FaUserPlus size={24} color="#1e293b" />,
  FRIEND_ACCEPTED: <FaCheckCircle size={24} color="#10b981" />,
  FRIEND_REJECTED: <FaTimesCircle size={24} color="#ef4444" />,
  SCHEDULE: <FaCalendarAlt size={24} color="#1e293b" />,
  POST: <FaComments size={24} color="#1e293b" />,
};

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("전체");
  const tabRefs = useRef([]); 
  const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });


  useEffect(() => {
    const activeIndex = categories.indexOf(activeCategory);
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab;
      setBgStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeCategory]);


  const reload = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("❌ 알림 로딩 실패:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const eventSource = subscribeNotification((count) => {
      const next =
        typeof count === "number"
          ? count
          : count && typeof count === "object" && "unReadCount" in count
          ? count.unReadCount
          : 0;
      setUnreadCount(Number(next) || 0);
      reload();
    });

    eventSource.addEventListener("unReadCount", (event) => {
      const unreadCount = parseInt(event.data, 10);
      setUnreadCount(isNaN(unreadCount) ? 0 : unreadCount);
      reload();
    });

    return () => {
      eventSource.close();
      window.__eventSourceInstance = null;
    };
  }, []);

  useEffect(() => {
    const unread = (notifications || []).filter((n) => !n.read).length;
    setUnreadCount(unread);
    localStorage.setItem("unreadCount", unread);
  }, [notifications]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("❌ 알림 로딩 실패:", err);
        setError(err.message);
      }
    };
    loadNotifications();
  }, []);

  const markAsRead = async (noticeId) => {
    try {
      await markNotificationAsRead(noticeId);
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.noticeId === noticeId ? { ...n, read: true } : n
        );
        const newUnread = updated.filter((n) => !n.read).length;
        setUnreadCount(newUnread);
        updateGlobalUnreadCount(newUnread);
        return updated;
      });
    } catch (err) {
      console.error("❌ 읽음 처리 중 오류 발생:", err);
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const filteredNotifications =
    activeCategory === "전체"
      ? sortedNotifications
      : sortedNotifications.filter((n) => {
          if (activeCategory === "친구") {
            return [
              "FRIEND_REQUEST",
              "FRIEND_ACCEPTED",
              "FRIEND_REJECTED",
            ].includes(n.noticeType);
          }
          if (activeCategory === "일정") return n.noticeType === "SCHEDULE";
          if (activeCategory === "커뮤니티") return n.noticeType === "POST";
          return false;
        });

  const categoryCounts = {
    전체: notifications.filter((n) => !n.read).length,
    친구: notifications.filter(
      (n) =>
        ["FRIEND_REQUEST", "FRIEND_ACCEPTED", "FRIEND_REJECTED"].includes(
          n.noticeType
        ) && !n.read
    ).length,
    일정: notifications.filter((n) => n.noticeType === "SCHEDULE" && !n.read)
      .length,
    커뮤니티: notifications.filter((n) => n.noticeType === "POST" && !n.read)
      .length,
  };

  const handleNotificationClick = (notice) => {
    if (notice.noticeType === "SCHEDULE") {
      navigate("/mainPage");
    } else if (
      ["FRIEND_REQUEST", "FRIEND_ACCEPTED", "FRIEND_REJECTED"].includes(
        notice.noticeType
      )
    ) {
      navigate("/friendPage");
    }
  };


  return (
    <div className="notification-viewport">
      <div className="notification-container">
        <NavBar title="알림" unreadCount={unreadCount} />
        <div className="notification-tab-bar">
<div
            className="notification-tab-background"
            style={{
              left: `${bgStyle.left}px`,
              width: `${bgStyle.width}px`,
              transition: "left 0.3s ease, width 0.3s ease",
            }}
          />

          {categories.map((cat, index) => (
            <button
              key={cat}
              ref={(el) => (tabRefs.current[index] = el)}
              className={`notification-tab ${
                activeCategory === cat ? "active" : ""
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="notification-tab-label">
                <span className="notification-tab-text">{cat}</span>
                <span className="notification-count">{categoryCounts[cat]}</span>
              </span>
            </button>
          ))}
        </div>

        {error && <div className="notification-error-message">❌ {error}</div>}

        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="notification-empty-state">
              <p className="notification-empty-icon">📭</p>
              <p className="notification-empty-title">알림 목록이 없습니다</p>
              <p className="notification-empty-subtitle">
                새로운 소식이 도착하면 알려드릴게요!
              </p>
            </div>
          ) : (
            filteredNotifications.map((notice) => (
              <div
                key={notice.noticeId}
                className={`notification-item ${
                  notice.read ? "read" : "unread"
                }`}
                onClick={() => handleNotificationClick(notice)}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    {iconMap[notice.noticeType] || "🔔"}
                  </div>

                  <div className="notification-text-area">
                    <div className="notification-message">
                      {typeMap[notice.noticeType]} 알림이 도착했습니다
                    </div>
                    <div className="notification-time">
                      {formatDistanceToNow(new Date(notice.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </div>
                  </div>

                  {!notice.read && (
                    <div className="notification-right">
                      <button
                        className="notification-mark-read-button"
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
    </div>
  );
}

export default NotificationPage;