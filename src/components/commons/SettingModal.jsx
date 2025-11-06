import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "../../styles/SettingModal.css";
import { useTheme } from "../../utils/ThemeContext";
import GuideModal from "../../components/commons/GuideModal.jsx";

export default function SettingModal({ open, onClose }) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [notification, setNotification] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const handleOpenGuide = () => {
    onClose();
    setTimeout(() => setShowGuide(true), 100); 
  };

  return (
    <>
      {open && (
        <div className="setting-modal-overlay" onClick={onClose}>
          <div
            className="setting-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="setting-modal-header">
              <div className="setting-modal-title">설정</div>
              <button onClick={onClose} className="setting-modal-close">
                <CloseIcon style={{ fontSize: "18px" }} />
              </button>
            </div>

            <div className="setting-modal-body">
              <div className="setting-modal-row">
                <span>다크모드</span>
                <label className="setting-switch">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={() => setIsDarkMode(!isDarkMode)}
                  />
                  <span className="setting-slider round"></span>
                </label>
              </div>

              <div className="setting-modal-row">
                <span>알림 설정</span>
                <label className="setting-switch">
                  <input
                    type="checkbox"
                    checked={notification}
                    onChange={() => setNotification(!notification)}
                  />
                  <span className="setting-slider round"></span>
                </label>
              </div>

              <div className="setting-modal-row">
                <span>가이드 보기</span>
                <button
                  className="setting-guide-button"
                  onClick={handleOpenGuide}
                >
                  열기
                </button>
              </div>

              <div className="setting-modal-row info">
                <span>버전 정보</span>
                <span className="setting-version">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </>
  );
}