import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/commons/NavBar.jsx";
import "../../styles/Notification/NotificationPage.css";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  subscribeNotification,
  fetchNotifications,
  markNotificationAsRead,
} from "../../services/NotificationService.jsx";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa";
import withAuth from "../../utils/withAuth";
import AlertModal from "../../components/commons/AlertModal.jsx";
import { useTheme } from "../../utils/ThemeContext.jsx";

const categories = ["전체", "친구", "일정", "커뮤니티"];

const typeMap = {
  FRIEND_REQUEST: "친구 요청",
  FRIEND_ACCEPTED: "친구 수락",
  FRIEND_REJECTED: "친구 거절",
  SCHEDULE: "일정 알림",
  POST: "커뮤니티 알림",
};

function NotificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();

  const iconColor = isDarkMode ? "#ffffff" : "#1e293b";

  const iconMap = {
    FRIEND_REQUEST: <FaUserPlus size={24} color={iconColor} />,
    FRIEND_ACCEPTED: <FaCheckCircle size={24} color={iconColor} />,
    FRIEND_REJECTED: <FaTimesCircle size={24} color={iconColor} />,
    SCHEDULE: <FaCalendarAlt size={24} color={iconColor} />,
    POST: <FaComments size={24} color={iconColor} />,
  };

  const [activeCategory, setActiveCategory] = useState("전체");
  const tabRefs = useRef([]);
  const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  /* -------------------- React Query: 알림 불러오기 -------------------- */
  const { data: notifications = [], isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  /* -------------------- React Query: SSE 구독 -------------------- */
  useEffect(() => {
    subscribeNotification(queryClient);
  }, [queryClient]);

  /* -------------------- 읽음 처리 -------------------- */
  const readMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (err) => {
      setAlertMessage(
        err?.response?.data?.message || "읽음 처리 중 오류가 발생했습니다."
      );
      setShowAlert(true);
    },
  });

  /* -------------------- 읽지 않은 알림 수 -------------------- */
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  /* -------------------- 탭 애니메이션 -------------------- */
  useEffect(() => {
    const activeIndex = categories.indexOf(activeCategory);
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab;
      setBgStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeCategory]);

  /* -------------------- 필터 -------------------- */
  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "전체") return sortedNotifications;

    if (activeCategory === "친구") {
      return sortedNotifications.filter((n) =>
        ["FRIEND_REQUEST", "FRIEND_ACCEPTED", "FRIEND_REJECTED"].includes(
          n.noticeType
        )
      );
    }

    if (activeCategory === "일정") {
      return sortedNotifications.filter((n) => n.noticeType === "SCHEDULE");
    }

    if (activeCategory === "커뮤니티") {
      return sortedNotifications.filter((n) => n.noticeType === "POST");
    }

    return sortedNotifications;
  }, [sortedNotifications, activeCategory]);

  /* -------------------- 카테고리별 개수 -------------------- */
  const categoryCounts = useMemo(
    () => ({
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
    }),
    [notifications]
  );

  /* -------------------- 클릭 이동 -------------------- */
  const handleNotificationClick = (notice) => {
    if (notice.noticeType === "SCHEDULE") navigate("/mainPage");
    else if (
      ["FRIEND_REQUEST", "FRIEND_ACCEPTED", "FRIEND_REJECTED"].includes(
        notice.noticeType
      )
    )
      navigate("/friendPage");
  };

  /* -------------------- UI -------------------- */
  if (isError) {
    return (
      <AlertModal
        message="알림을 불러오는 중 오류가 발생했습니다."
        onConfirm={() => setShowAlert(false)}
      />
    );
  }

  return (
    <div className="notification-viewport">
      <div className="notification-container">
        <NavBar title="알림" unreadCount={unreadCount} />

        {/* 탭바 */}
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
                <span className="notification-count">
                  {categoryCounts[cat]}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* 알림 목록 */}
        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="notification-empty-state">
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
                          readMutation.mutate(notice.noticeId);
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

      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}

export default withAuth(NotificationPage);