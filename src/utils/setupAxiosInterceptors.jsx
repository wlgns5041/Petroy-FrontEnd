// Axios 전역 응답 인터셉터 설정 파일
// 네트워크 또는 서버 오류 발생 시 전역 AlertModal을 띄워 사용자에게 알림

import axios from "axios";
import AlertModal from "../components/commons/AlertModal.jsx";
import React from "react";
import ReactDOM from "react-dom";

// 현재 Alert가 표시 중인지 여부 (중복 표시 방지용)
let alertVisible = false;

/**
 * 전역 AlertModal을 화면에 표시하는 함수
 * @param {string} message - 사용자에게 보여줄 에러 메시지
 */
const showGlobalAlert = (message) => {
  // 이미 Alert가 떠 있으면 다시 띄우지 않음
  if (alertVisible) return;
  alertVisible = true;

  // AlertModal을 렌더링할 임시 컨테이너 생성
  const container = document.createElement("div");
  document.body.appendChild(container);

  // 모달 닫을 때 cleanup 처리
  const handleClose = () => {
    alertVisible = false;
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  };

  // AlertModal을 전역으로 동적 렌더링
  ReactDOM.render(<AlertModal message={message} onConfirm={handleClose} />, container);
};

/**
 * Axios 전역 응답 인터셉터 설정
 * - 모든 API 요청의 응답을 공통 처리
 * - 네트워크 오류 및 500번대 서버 오류를 전역 Alert로 표시
 */
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    // 정상 응답은 그대로 반환
    (response) => response,

    // 에러 응답 처리
    (error) => {
      // 네트워크 오류 (서버 다운, CORS, 연결 실패 등)
      if (!error.response) {
        error._handledGlobally = true; // 중복 처리 방지 플래그
        showGlobalAlert("서버와의 연결에 실패했습니다.");
        return Promise.reject(error);
      }

      // 서버 내부 오류 (HTTP 5xx)
      if (error.response.status >= 500) {
        error._handledGlobally = true;
        showGlobalAlert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        return Promise.reject(error);
      }

      // 그 외 상태코드(401, 403, 404 등)는 개별 컴포넌트에서 처리
      return Promise.reject(error);
    }
  );
};