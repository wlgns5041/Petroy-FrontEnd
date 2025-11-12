// 로그인 상태를 확인하고, 인증이 필요한 페이지를 보호하는 HOC

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AlertModal from "../components/commons/AlertModal";

// 고차 컴포넌트 (HOC): 인증이 필요한 컴포넌트를 감싸서 보호
const withAuth = (WrappedComponent) => {
  const ProtectedComponent = (props) => {
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [onConfirmAction, setOnConfirmAction] = useState(null);

    // 초기 로딩 시 로그인 상태 확인
    useEffect(() => {
      const token = localStorage.getItem("accessToken");

      // 토큰이 없으면 로그인 페이지로 이동
      if (!token) {
        setAlertMessage("로그인 후 이용가능한 페이지입니다");
        setShowAlert(true);
        setOnConfirmAction(() => () => navigate("/login", { replace: true }));
        return;
      }

      // Axios 응답 인터셉터 등록 (401 감지 시 자동 로그아웃)
      const interceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            // 만료된 세션 정리
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            // SSE 연결 종료
            if (window.__eventSourceInstance) {
              window.__eventSourceInstance.close();
              window.__eventSourceInstance = null;
            }

            // 로그인 만료 알림 후 이동
            setAlertMessage("로그인 세션이 만료되었습니다.\n다시 로그인해주세요");
            setShowAlert(true);
            setOnConfirmAction(() => () => navigate("/login", { replace: true }));
          }
          return Promise.reject(error);
        }
      );

      // 언마운트 시 인터셉터 제거
      return () => axios.interceptors.response.eject(interceptor);
    }, [navigate]);

    // 알림 모달 표시
    if (showAlert) {
      return (
        <AlertModal
          message={alertMessage}
          onConfirm={() => {
            setShowAlert(false);
            if (onConfirmAction) onConfirmAction();
          }}
        />
      );
    }

    // 인증 통과 시 원본 컴포넌트 렌더링
    return <WrappedComponent {...props} />;
  };

  return ProtectedComponent;
};

export default withAuth;