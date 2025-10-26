// axiosInterceptor.js
import axios from "axios";
import AlertModal from "../components/commons/AlertModal.jsx";
import React from "react";
import ReactDOM from "react-dom";

let alertVisible = false;

const showGlobalAlert = (message) => {
  if (alertVisible) return;
  alertVisible = true;

  const container = document.createElement("div");
  document.body.appendChild(container);

  const handleClose = () => {
    alertVisible = false;
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  };

  ReactDOM.render(<AlertModal message={message} onConfirm={handleClose} />, container);
};

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // 네트워크 오류 (서버 다운, CORS 등)
      if (!error.response) {
        error._handledGlobally = true;
        showGlobalAlert("서버와의 연결에 실패했습니다.");
        return Promise.reject(error);
      }

      // 서버 내부 오류 (5xx)
      if (error.response.status >= 500) {
        error._handledGlobally = true;
        showGlobalAlert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );
};