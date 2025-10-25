import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AlertModal from "../components/commons/AlertModal";

const withAuth = (WrappedComponent) => {
  const ProtectedComponent = (props) => {
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [onConfirmAction, setOnConfirmAction] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setAlertMessage("로그인 후 이용가능한 페이지입니다");
        setShowAlert(true);
        setOnConfirmAction(() => () => navigate("/login", { replace: true }));
        return;
      }

      const interceptor = axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            if (window.__eventSourceInstance) {
              window.__eventSourceInstance.close();
              window.__eventSourceInstance = null;
            }

            setAlertMessage("로그인 세션이 만료되었습니다.\n다시 로그인해주세요");
            setShowAlert(true);
            setOnConfirmAction(() => () => navigate("/login", { replace: true }));
          }
          return Promise.reject(error);
        }
      );

      return () => axios.interceptors.response.eject(interceptor);
    }, [navigate]);

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

    return <WrappedComponent {...props} />;
  };

  return ProtectedComponent;
};

export default withAuth;