import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCurrentMember } from "../../services/MemberService.jsx";
import { subscribeNotification } from "../../services/NotificationService.jsx";
import {
  useMediaQuery,
  Badge,
  IconButton,
  Typography,
  Box,
} from "@mui/material";

import calendarIcon from "../../assets/icons/calendar-icon.png";
import communityIcon from "../../assets/icons/community-icon.png";
import friendIcon from "../../assets/icons/friend-icon.png";
import myIcon from "../../assets/icons/my-icon.png";
import petIcon from "../../assets/icons/pet-icon.png";
import notificationIcon from "../../assets/icons/notification-icon.png";
import settingsIcon from "../../assets/icons/setting-icon.png";
import icon from "../../assets/icons/icon.png"

export default function NavBar() {
  const [memberName, setMemberName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    fetchCurrentMember(token).then((memberData) => {
      if (memberData?.name) setMemberName(memberData.name);
    });

    const fetchUnreadCount = async () => {
      try {
        const raw = localStorage.getItem("accessToken");
        const bearer = raw?.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
        let page = 0;
        const size = 50;
        let total = 0;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/notification?page=${page}&size=${size}&sort=createdAt,desc`,
            { headers: { Authorization: bearer } }
          );
          const data = await res.json();
          total += (data.content || []).filter((n) => !n.read).length;
          hasMore = data && data.last === false;
          page += 1;
        }
        setUnreadCount(total);
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
    { label: "마이페이지", icon: myIcon, path: "/myPage" },
    { label: "펫", icon: petIcon, path: "/petPage" },
    { label: "홈", icon: calendarIcon, path: "/mainPage" },
    { label: "친구", icon: friendIcon, path: "/friendPage" },
    { label: "펫스타그램", icon: communityIcon, path: "/communityPage" },
  ];

  // 📱 모바일 UI
  if (isMobile) {
    return (
      <>
        {/* 상단 헤더 */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            bgcolor: "#f9f9f9",
            zIndex: 1200,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={icon} alt="logo" style={{ width: 20, height: 16 }} />
            <Typography
              sx={{ fontWeight: 600, fontSize: 13, color: "#111827", fontFamily: "'Eommakkaturi', sans-serif"  }}
            >
              PETORY
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => navigate("/settingsPage")}>
              <img src={settingsIcon} alt="설정" style={{ width: 22 }} />
            </IconButton>
<IconButton onClick={() => navigate("/notificationPage")}>
<Badge
  badgeContent={unreadCount}
  color="error"
  max={99}
  showZero
  overlap="circular"
  anchorOrigin={{ vertical: "top", horizontal: "right" }}
  sx={{
    "& .MuiBadge-badge": {
      fontSize: "0.5rem",  
      fontWeight: 600, 
      minWidth: "14px",    
      height: "14px",       
      padding: "0 4px",     
    },
  }}
>
    <Box
      component="img"
      src={notificationIcon}
      alt="알림"
      sx={{ width: 22, height: 22, display: "block" }}
    />
  </Badge>
</IconButton>
          </Box>
        </Box>

        {/* 하단 탭바 */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            display: "flex",
            justifyContent: "center", 
            alignItems: "center",
            bgcolor: "#fff",
            borderTop: "0.5px solid #e5e7eb",
            zIndex: 1200,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
                    width: 64,
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    gap: 2,
                  }}
                >
                  <img
                    src={icon}
                    alt={label}
                    style={{
                      width: isActive ? 40 : 22,
                      height: isActive ? 40 : 22,
                      transition: "all 0.2s ease",

                      opacity: isActive ? 1 : 0.5,
                      background: isActive ? "#E8E9EC" : "transparent",
                      borderRadius: "30%",
                      padding: isActive ? 6 : 0,
                    }}
                  />
                  {!isActive && (
                    <span
                      style={{
                        fontSize: 8,
                        marginTop: 2,
                        fontWeight: 800,
                        color: "#9CA3AF",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </Box>
        </Box>
      </>
    );
  }

  // 💻 데스크탑 UI (그대로, 이름 + 흰색 아이콘 보장)
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

      {/* 중앙 메뉴 (기존 그대로) */}
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
          marginBottom: 0.3,
        }}
      >
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
                margin: "0 2px",
                background: isActive ? "#fff" : "transparent",
                border: "none",
                borderRadius: 6,
                color: isActive ? "#222" : "#fff",
                fontWeight: isActive ? 700 : 600,
                fontSize: 11,
                cursor: "pointer",
                padding: "0 16px",
                transition: "background 0.3s, color 0.3s",
              }}
            >
              <img
                src={icon}
                alt={label}
          style={{
            width: isActive ? 30 : 26,     
            height: isActive ? 34 : 26,
            transition: "all 0.2s ease",
            filter: isActive ? "invert(0)" : "invert(1) brightness(2)",
          }}
        />
        {!isActive && (               
          <span
            style={{
              fontFamily: "Pretendard",
              fontSize: 9,
              fontWeight: 600,
              color: "#fff",
              marginTop:2
            }}
          >
            {label}
          </span>
        )}
      </button>
          );
        })}
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* 우측 사용자 이름 + 설정 + 알림 */}
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
        {/* 사용자 이름 복구 */}
        <Typography
          variant="subtitle1"
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontFamily: "Pretendard",
            textAlign: "center",
            whiteSpace: "nowrap",
            fontSize: 17,
            p: 1,
          }}
          noWrap
        >
          {memberName ? `${memberName}` : ""}
        </Typography>

        <IconButton
          onClick={() => navigate("/settingsPage")}
          sx={{ color: "#fff", p: 1 }}
        >
          <img
            src={settingsIcon}
            alt="설정"
            style={{ width: 24, filter: "invert(1)" }}
          />
        </IconButton>

        <IconButton
          onClick={() => navigate("/notificationPage")}
          sx={{ color: "#fff", p: 1 }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99} showZero>
            <img
              src={notificationIcon}
              alt="알림"
              style={{ width: 24, filter: "invert(1)" }}
            />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
}
