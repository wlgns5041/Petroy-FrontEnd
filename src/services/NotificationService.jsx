import React from "react";
import { toast } from "react-toastify";
import axios from "axios";

// MUI 아이콘
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const isMobile = window.innerWidth <= 768;

/* =========================================================
   📡 전역 콜백 관리 (알림 카운트 동기화)
========================================================= */

// 알림 수 변경을 구독 중인 모든 콜백을 저장
let globalUnreadCallbacks = new Set();

// 등록된 모든 콜백에 새 알림 수 전달 (브로드캐스트)
const broadcastUnread = (value) => {
  globalUnreadCallbacks.forEach((cb) => {
    try {
      cb?.(value);
    } catch (e) {
      console.error("unread 콜백 에러", e);
    }
  });
};

// 개별 콜백 구독 해제 (연결은 유지)
export const unsubscribeNotification = (cb) => {
  if (cb) globalUnreadCallbacks.delete(cb);
};

// 완전 종료 (로그아웃 시 사용)
export const closeNotificationStream = () => {
  if (window.__eventSourceInstance) {
    try {
      window.__eventSourceInstance.close();
    } catch {}
  }
  window.__eventSourceInstance = null;
  window.__eventSourceHandlersReady = false;
};

/* =========================================================
   🧩 Toast 알림 카드 컴포넌트
========================================================= */

const DURATION_MS = 20 * 60 * 1000; // 20분 유지

// 알림 타입별 시각적 정보
const TYPE_META = {
  FRIEND_REQUEST: {
    color: "#2563eb",
    title: "친구 요청",
    iconBg: "#F9F9F9",
    IconEl: <PersonAddAlt1RoundedIcon fontSize="small" />,
  },
  FRIEND_REJECTED: {
    color: "#ef4444",
    title: "친구 거절",
    iconBg: "#F9F9F9",
    IconEl: <CancelRoundedIcon fontSize="small" />,
  },
  FRIEND_ACCEPTED: {
    color: "#00CBA8",
    title: "친구 수락",
    iconBg: "#F9F9F9",
    IconEl: <CheckCircleRoundedIcon fontSize="small" />,
  },
  SCHEDULE: {
    color: "#00CBA8",
    title: "일정 알림",
    iconBg: "#F9F9F9",
    IconEl: <EventAvailableRoundedIcon fontSize="small" />,
  },
};

// 커스텀 프로그레스바 애니메이션 등록 (1회만)
const injectKeyframesOnce = () => {
  if (window.__toastProgressKFInjected) return;
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes toastShrink {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }
  `;
  document.head.appendChild(style);
  window.__toastProgressKFInjected = true;
};

// 토스트 카드 UI
const ToastCard = ({ kind, title, sub, durationMs = DURATION_MS }) => {
  injectKeyframesOnce();
  const meta = TYPE_META[kind] || TYPE_META.SCHEDULE;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 10px 30px rgba(0,0,0,.12)",
        padding: "14px 44px 22px 14px",
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      {/* 좌측 강조 컬러 라인 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          borderTopLeftRadius: 2,
          borderBottomLeftRadius: 2,
          background: meta.color,
        }}
      />

      {/* 라운드 아이콘 */}
      <div
        style={{
          flex: "0 0 auto",
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: meta.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: meta.color,
          marginLeft: 10,
        }}
      >
        {meta.IconEl}
      </div>

      {/* 텍스트 영역 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: "#000000",
            fontSize: isMobile ? 14 : 16,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: isMobile ? 12 : 14,
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {sub}
        </div>
      </div>

      {/* 하단 진행바 */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          height: 4,
          background: "#e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: meta.color,
            transformOrigin: "left",
            animation: `toastShrink ${durationMs}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

// Toast 기본 옵션
const toastOpts = (id) => ({
  containerId: "global-toasts",
  icon: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: true,
  autoClose: DURATION_MS,
  closeButton: false,
  style: {
    backgroundColor: "transparent",
    boxShadow: "none",
    padding: 0,
    marginRight: 8,
  },
  toastId: id,
});

/* =========================================================
   🔄 SSE 구독 (단일 인스턴스 유지)
========================================================= */

// 백오프 설정 (자동 재연결 지연시간)
const backoff = {
  delay: 1000,
  max: 30000,
  next() {
    this.delay = Math.min(this.delay * 2, this.max);
    return this.delay;
  },
  reset() {
    this.delay = 1000;
  },
};

// 알림 SSE 구독 시작
export const subscribeNotification = (onUnReadCount) => {
  const raw = localStorage.getItem("accessToken");
  const token = raw?.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  if (onUnReadCount) globalUnreadCallbacks.add(onUnReadCount);

  // 이미 연결 중이면 재사용
  if (
    window.__eventSourceInstance &&
    window.__eventSourceInstance.readyState !== 2
  ) {
    return window.__eventSourceInstance;
  }

  // 새로운 SSE 연결
  const es = new EventSource(
    `${API_BASE_URL}/notification/subscribe?token=${encodeURIComponent(token)}`
  );
  window.__eventSourceInstance = es;

  // 이벤트 핸들러 1회만 등록
  const bindHandlersOnce = (src) => {
    if (src.__bound) return;
    src.__bound = true;

    const broadcastCount = (n) => {
      if (!Number.isNaN(n)) broadcastUnread(n);
    };

    // 실시간 읽지않은 알림 수
    src.addEventListener("unReadCount", (e) => {
      const n = parseInt(e.data, 10);
      broadcastCount(n);
    });

    // 공통 카운트 업데이트 함수
    const handleUnreadCount = (data) => {
      if (data?.unReadCount !== undefined) broadcastUnread(data.unReadCount);
    };

    /* ---------- 개별 이벤트 핸들러 ---------- */

    src.addEventListener("FRIEND_REQUEST", (e) => {
      const d = JSON.parse(e.data);
      toast(
        <ToastCard
          kind="FRIEND_REQUEST"
          title="친구요청"
          sub={`${d.sendMemberName}님이 친구요청을 했습니다`}
        />,
        toastOpts(`friend-req-${d.sendMemberId || Date.now()}`)
      );
      handleUnreadCount(d);
    });

    src.addEventListener("FRIEND_ACCEPTED", (e) => {
      const d = JSON.parse(e.data);
      toast(
        <ToastCard
          kind="FRIEND_ACCEPTED"
          title="친구수락"
          sub={`${d.sendMemberName}님이 친구 요청을 수락했습니다`}
        />,
        toastOpts(`friend-acc-${d.sendMemberId || Date.now()}`)
      );
      handleUnreadCount(d);
    });

    src.addEventListener("FRIEND_REJECTED", (e) => {
      const d = JSON.parse(e.data);
      toast(
        <ToastCard
          kind="FRIEND_REJECTED"
          title="친구거절"
          sub={`${d.sendMemberName}님이 친구 요청을 거절했습니다`}
        />,
        toastOpts(`friend-rej-${d.sendMemberId || Date.now()}`)
      );
      handleUnreadCount(d);
    });

    src.addEventListener("SCHEDULE", (e) => {
      const d = JSON.parse(e.data);
      toast(
        <ToastCard
          kind="SCHEDULE"
          title="일정알림"
          sub={`${d.title || "일정"}에 대한 알림이 도착했습니다`}
        />,
        toastOpts(`schedule-${d.entityId || Date.now()}`)
      );
      handleUnreadCount(d);
    });
  };

  // 연결 성공 시 백오프 초기화
  es.onopen = () => {
    backoff.reset();
    bindHandlersOnce(es);
  };

  // 연결 오류 시 재시도 (지수 백오프)
  es.onerror = () => {
    if (es.readyState === 2) {
      const delay = backoff.next();
      setTimeout(() => {
        window.__eventSourceInstance = null;
        subscribeNotification(); // 콜백 유지
      }, delay);
    }
  };

  // 연결 초기화 전에 미리 핸들러 바인딩
  bindHandlersOnce(es);

  return es;
};

/* =========================================================
   🧭 전역 수동 업데이트 (읽지 않은 수)
========================================================= */
export const updateGlobalUnreadCount = (count) => {
  if (typeof count === "number") {
    globalUnreadCallbacks.forEach((cb) => {
      if (typeof cb === "function") cb(count);
    });
  }
};

/* =========================================================
   🌐 REST API
========================================================= */

// 알림 목록 조회
export const fetchNotifications = async () => {
  const raw = localStorage.getItem("accessToken");
  const token = raw?.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

  const response = await axios.get(`${API_BASE_URL}/notification`, {
    headers: { Authorization: token },
    params: { sort: "createdAt,desc", size: 50, page: 0 },
  });

  return response.data.content || [];
};

// 알림 읽음 처리
export const markNotificationAsRead = async (noticeId) => {
  const raw = localStorage.getItem("accessToken");
  const token = raw?.startsWith("Bearer ") ? raw : `Bearer ${raw}`;

  await axios.patch(`${API_BASE_URL}/notification/${noticeId}`, null, {
    headers: { Authorization: token },
  });
};