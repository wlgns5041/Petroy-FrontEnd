import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SignUp/InputInfoPage.css";
import { submitKakaoExtraInfo } from "../../services/MemberService.jsx";

function InputInfo() {
  const [userData, setUserData] = useState({ email: "", phone: "" }); // 사용자 데이터 관리
  const [accessToken, setAccessToken] = useState(null); // 액세스 토큰 관리
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  useEffect(() => {
    // URL 쿼리 파라미터에서 토큰을 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // 토큰을 로컬 스토리지에 저장하고 상태 업데이트
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
    } else {
      // 로컬 스토리지에서 액세스 토큰을 가져오기
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        setAccessToken(storedToken);
      } else {
        console.error("로컬 스토리지에서 액세스 토큰을 찾을 수 없습니다.");
      }
    }
  }, []); // 컴포넌트가 처음 렌더링될 때만 실행

  // 폼 제출 처리 함수
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!accessToken) {
      console.error("액세스 토큰이 없습니다.");
      return;
    }

    try {
      const data = await submitKakaoExtraInfo(
        accessToken,
        userData.email,
        userData.phone
      );

      alert("카카오 회원가입 성공");
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/mainPage");
    } catch (error) {
      console.error("서버 전송 실패:", error);
    }
  };

  return (
    <div className="inputinfopage">
      <div className="inputinfopage-container">
        <h2 className="inputinfopage-title">
          카카오 로그인을 위해 추가 정보를 입력해주세요
        </h2>
        <form onSubmit={handleSubmit} className="inputinfopage-form">
          <div className="inputinfopage-group">
            <label className="inputinfopage-label">이메일 :</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
              required
              className="inputinfopage-input"
            />
          </div>

          <div className="inputinfopage-group">
            <label className="inputinfopage-label">전화번호 :</label>
            <input
              type="tel"
              value={userData.phone}
              onChange={(e) =>
                setUserData({ ...userData, phone: e.target.value })
              }
              required
              className="inputinfopage-input"
            />
          </div>

          <div className="inputinfopage-buttongroup">
            <button
              type="button"
              className="inputinfopage-cancelbutton"
              onClick={() => navigate("/")}
            >
              홈으로 이동
            </button>
            <button type="submit" className="inputinfopage-submitbutton">
              완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputInfo;
