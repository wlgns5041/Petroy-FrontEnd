import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCurrentMember } from "../../services/MemberService.jsx";
import { subscribeNotification } from "../../services/NotificationService.jsx";
import { fetchNotifications } from "../../services/NotificationService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import icon from "../../assets/icons/icon.png";
import SettingModal from "./SettingModal.jsx";
import { useTheme } from "../../utils/ThemeContext";

export default function NavBar() {
  const [memberName, setMemberName] = useState("");
  const [openSetting, setOpenSetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetchCurrentMember(token).then((memberData) => {
      if (memberData?.name) setMemberName(memberData.name);
    });

    subscribeNotification(queryClient);
  }, [queryClient]);

  const navIcons = [
    { label: "마이페이지", icon: myIcon, path: "/myPage" },
    { label: "펫", icon: petIcon, path: "/petPage" },
    { label: "홈", icon: calendarIcon, path: "/mainPage" },
    { label: "친구", icon: friendIcon, path: "/friendPage" },
    { label: "펫스타그램", icon: communityIcon, path: "/communityPage" },
  ];

  const bgColor = dark ? "#1e1e1e" : "#f9f9f9";
  const iconFilter = dark ? "invert(1) brightness(1.8)" : "invert(0)";
  const textColor = dark ? "#f9f9f9" : "#111827";

  if (isMobile) {
    return (
      <>
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
            bgcolor: bgColor,
            zIndex: 1200,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src={icon}
              alt="logo"
              style={{ width: 20, height: 16, filter: iconFilter }}
            />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 14,
                color: textColor,
                fontFamily: "'Baloo 2', sans-serif",
              }}
            >
              PETORY
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => setOpenSetting(true)}>
              <img
                src={settingsIcon}
                alt="설정"
                style={{ width: 22, filter: iconFilter }}
              />
            </IconButton>
            <IconButton onClick={() => navigate("/notificationPage")}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <img
                  src={notificationIcon}
                  alt="알림"
                  style={{ width: 22, filter: iconFilter }}
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
            bgcolor: dark ? "#2a2a2a" : "#fff",
            borderTop: `0.5px solid ${dark ? "#444" : "#e5e7eb"}`,
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
                    width: 68,
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
                      filter: dark
                        ? isActive
                          ? "invert(1) brightness(1.8) contrast(1.2)"
                          : "invert(0.85) brightness(0.9)"
                        : isActive
                        ? "none"
                        : "brightness(0.6)",

                      background: isActive
                        ? dark
                          ? "rgba(255, 255, 255, 0.15)"
                          : "#E8E9EC"
                        : "transparent",
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
                        color: dark ? "#aaa" : "#9CA3AF",
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

        <SettingModal
          open={openSetting}
          onClose={() => setOpenSetting(false)}
        />
      </>
    );
  }

  // PC 모드
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
      <Typography
        variant="h6"
        sx={{
          color: "#fff",
          fontWeight: 800,
          fontSize: 22,
          fontFamily: "'Baloo 2', sans-serif",
          letterSpacing: "1px",
          mr: 3,
        }}
      >
        PETORY
      </Typography>

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
          mb: 0.3,
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
                    marginTop: 2,
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 6 }}>
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontFamily: "Pretendard",
            fontSize: 17,
            p: 1,
          }}
        >
          {memberName}
        </Typography>

        <IconButton onClick={() => setOpenSetting(true)}>
          <img
            src={settingsIcon}
            alt="설정"
            style={{ width: 24, filter: "invert(1) brightness(2)" }}
          />
        </IconButton>

        <IconButton onClick={() => navigate("/notificationPage")}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <img
              src={notificationIcon}
              alt="알림"
              style={{ width: 24, filter: "invert(1) brightness(2)" }}
            />
          </Badge>
        </IconButton>
      </Box>

      <SettingModal open={openSetting} onClose={() => setOpenSetting(false)} />
    </Box>
  );
}
