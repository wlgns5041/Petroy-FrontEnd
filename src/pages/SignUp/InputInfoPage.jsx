import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SignUp/InputInfoPage.css";
import { submitKakaoExtraInfo } from "../../services/MemberService.jsx";

function InputInfo() {
  const [userData, setUserData] = useState({ email: "", phone: "" });
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
    } else {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) setAccessToken(storedToken);
      else console.error("로컬 스토리지에서 액세스 토큰을 찾을 수 없습니다.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        <h1 className="inputinfopage-title">
          카카오 로그인을 위한 추가 정보를 입력해주세요
        </h1>
        <p className="inputinfopage-subtext">기존의 이메일 아이디와 연동됩니다</p>

        <form onSubmit={handleSubmit} className="inputinfopage-form">
          <div className="inputinfopage-group">
            {/* 화면에는 숨기고 접근성만 유지 */}
            <label className="inputinfopage-label" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              className="inputinfopage-input"
              placeholder="이메일"
              value={userData.email}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, email: e.target.value }))
              }
              autoComplete="email"
              required
            />
          </div>

          <div className="inputinfopage-group">
            <label className="inputinfopage-label" htmlFor="phone">
              휴대폰 번호
            </label>
            <input
              id="phone"
              type="tel"
              className="inputinfopage-input"
              placeholder="휴대폰 번호"
              value={userData.phone}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </div>

          <div className="inputinfopage-buttongroup">
            <button
              type="button"
              className="inputinfopage-cancelbutton"
              onClick={() => navigate("/")}
            >
              홈으로
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