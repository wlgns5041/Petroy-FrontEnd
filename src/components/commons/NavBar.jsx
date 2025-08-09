import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCurrentMember } from "../../services/MemberService.jsx";
import { subscribeNotification } from "../../services/NotificationService.jsx";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import calendarIcon from "../../assets/icons/calendar-icon.png";
import communityIcon from "../../assets/icons/community-icon.png";
import friendIcon from "../../assets/icons/friend-icon.png";
import myIcon from "../../assets/icons/my-icon.png";
import petIcon from "../../assets/icons/pet-icon.png";
import notificationIcon from "../../assets/icons/notification-icon.png";
import settingsIcon from "../../assets/icons/setting-icon.png";

export default function NavBar() {
  const [memberName, setMemberName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 시계
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
      const weekday = weekNames[now.getDay()];
      setCurrentDate(`${year}.${month}.${day} ${weekday}`);

      const hour = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const sec = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hour}:${min}:${sec}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // 사용자, 알림
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetchCurrentMember(token).then((memberData) => {
      if (memberData?.name) setMemberName(memberData.name);
    });

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/notification`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        const data = await response.json();
        const unread = (data.content || []).filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("🔔 알림 수 불러오기 실패:", err);
      }
    };
    fetchUnreadCount();

    const sse = subscribeNotification((count) => setUnreadCount(count));
    return () => {
      sse.close();
      window.__eventSourceInstance = null;
    };
  }, []);

  const navIcons = [
    { label: "홈", icon: calendarIcon, path: "/mainPage" },
    { label: "마이페이지", icon: myIcon, path: "/myPage" },
    { label: "펫", icon: petIcon, path: "/petPage" },
    { label: "친구", icon: friendIcon, path: "/friendPage" },
    { label: "펫스타그램", icon: communityIcon, path: "/communityPage" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: 50,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1300,
        background: "#484848",
        boxShadow: "0 2px 6px 0 rgba(0,0,0,0.04)",
        px: { xs: 1, md: 4 },
        overflow: "hidden",
        py: 1.5,
      }}
    >
      {/* 좌측 로고 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 20,
            fontFamily: "Pretendard",
            whiteSpace: "nowrap",
            letterSpacing: "1px",
          }}
        >
          PETORY
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: 44,
          px: 1, 
          py: 1, 
          borderRadius: 2,
          backgroundColor: "#3a3a3a", 
          marginBottom:0.3
        }}
      >
        {/* 네비 아이콘: 이미지로 표시 */}
        {navIcons.map(({ label, icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 52,
                height: 46,
                marginTop: 6,
                marginBottom: 6,
                marginRight: 2,
                marginLeft: 1,
                background: isActive ? "#fff" : "transparent",
                border: "none",
                borderRadius: 6,
                color: isActive ? "#222" : "#fff",
                fontWeight: isActive ? 700 : 600,
                fontSize: 11,
                cursor: "pointer",
                padding: "0 16px",
                transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
                boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                e.currentTarget.querySelector(".tab-icon img").style.filter =
                  "invert(0)";
                e.currentTarget.style.background = isActive
                  ? "#fff"
                  : "#F0F2F5";
                e.currentTarget.querySelector(".tab-label").style.color =
                  "#222";
              }}
              onMouseOut={(e) => {
                e.currentTarget.querySelector(".tab-icon img").style.filter =
                  isActive ? "invert(0)" : "invert(1) brightness(2)";
                e.currentTarget.style.background = isActive
                  ? "#fff"
                  : "transparent";
                e.currentTarget.querySelector(".tab-label").style.color =
                  isActive ? "#222" : "#fff";
              }}
            >
              <span
                className="tab-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 28,
                  marginBottom: 0,
                  transition: "filter 0.3s",
                }}
              >
                <img
                  src={icon}
                  alt={label}
                  style={{
                    width: 26,
                    height: 26,
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                    verticalAlign: "middle",
                    transition: "filter 0.3s",
                    filter: isActive ? "invert(0)" : "invert(1) brightness(2)",
                  }}
                />
              </span>
              <span
                className="tab-label"
                style={{
                  fontFamily: "Pretendard",
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? "#222" : "#fff",
                  transition:
                    "opacity 0.3s, max-height 0.3s, color 0.3s, font-weight 0.3s",
                  opacity: isActive ? 1 : 0,
                  maxHeight: isActive ? 30 : 0,
                  pointerEvents: "none",
                }}
              >
                {label}
              </span>
              <style>
                {`
                button:hover .tab-label {
                  opacity: 1 !important;
                  max-height: 30px !important;
                }
              `}
              </style>
            </button>
          );
        })}
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* 우측 영역 : 사용자 이름, 시계, 설정, 알림 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
          flexShrink: 0,
          pr: { xs: "20px", md: "50px" },
        }}
      >
        {/* 사용자 이름 */}
        <Typography
          variant="subtitle1"
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontFamily: "Pretendard",
            textAlign: "center",
            whiteSpace: "nowrap",
            fontSize: 16,
            mr: 1,
          }}
          noWrap
        >
          {memberName ? `${memberName} 님` : ""}
        </Typography>

        <Box
          sx={{
            width: "3px",
            height: 36,
            bgcolor: "#5d5d5dff",
            mx: 0.2,
            borderRadius: 999,
          }}
        />

        {/* 날짜 및 시간 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 100,
            userSelect: "none",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#fff",
              fontFamily: "Pretendard",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: 0.5,
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            {currentDate}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              color: "#fff",
              fontFamily: "Pretendard",
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              fontSize: 15,
              letterSpacing: 2,
              textAlign: "center",
              lineHeight: 1.2,
              mt: "2px",
            }}
          >
            {currentTime}
          </Typography>
        </Box>

        <Box
          sx={{
            width: "3px",
            height: 36,
            bgcolor: "#5d5d5dff",
            mx: 0.2,
            borderRadius: 999,
          }}
        />

        <IconButton
          onClick={() => navigate("/settingsPage")}
          sx={{ color: "#fff", p: 1.1 }}
        >
          <img
            src={settingsIcon}
            alt="설정"
            style={{
              width: 24,
              height: 24,
              display: "block",
              objectFit: "contain",
              filter: "invert(1) brightness(2)",
            }}
          />
        </IconButton>

        <IconButton
          onClick={() => navigate("/notificationPage")}
          sx={{ color: "#fff", p: 1.1 }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99} showZero>
            <img
              src={notificationIcon}
              alt="알림"
              style={{
                width: 24,
                height: 24,
                display: "block",
                objectFit: "contain",
                filter: "invert(1) brightness(2)",
              }}
            />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
}
