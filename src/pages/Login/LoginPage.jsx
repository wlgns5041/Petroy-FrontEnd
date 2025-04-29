import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Login/LoginPage.css";
import careImage from "../../assets/images/dogpaw.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { RiKakaoTalkFill } from "react-icons/ri";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const KAKAO_KEY = process.env.REACT_APP_KAKAO_KEY;

function LoginPage() {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  const [email, setEmail] = useState(""); // 이메일 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const [error, setError] = useState(null); // 에러 메시지 상태
  const [showPassword, setShowPassword] = useState(false);

  // 로그인 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작을 막음

    try {
      // 로그인 요청을 보내기
      const response = await fetch(`${API_BASE_URL}/members/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // 요청 본문이 JSON임을 명시
        },
        body: JSON.stringify({
          email: email, // 이메일 필드
          password: password, // 비밀번호 필드
        }),
      });

      // 응답이 성공적이지 않을 경우 에러 처리
      if (!response.ok) {
        let errorMessage = "로그인 실패"; // 기본 에러 메시지
        try {
          const errorData = await response.json(); // 서버에서 반환된 JSON 데이터 파싱
          errorMessage = errorData.errorMessage || "로그인 실패"; // 서버에서 반환된 에러 메시지 사용
        } catch (e) {
          errorMessage = "서버 응답을 처리할 수 없습니다."; // JSON 파싱 오류 시 에러 메시지
        }
        throw new Error(errorMessage); // 에러 발생
      }

      // 로그인 성공 시, 응답 데이터 처리
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken); // accessToken을 로컬 저장소에 저장
      localStorage.setItem("refreshToken", data.refreshToken); // refreshToken을 로컬 저장소에 저장

      navigate("/mainPage"); // 메인 페이지로 이동
    } catch (error) {
      // 에러 처리
      setError(error.message || "로그인에 실패했습니다. 다시 시도해 주세요."); // 에러 메시지 상태 업데이트
    }
  };

  useEffect(() => {
    if (!KAKAO_KEY) {
      console.error("KAKAO_KEY가 존재하지 않습니다.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.integrity =
      "sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_KEY);
        console.log("✅ Kakao SDK 초기화 완료");
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loginWithKakao = () => {
    if (window.Kakao) {
      window.Kakao.Auth.authorize({
        redirectUri: `${process.env.REACT_APP_API_URL}/oauth/kakao/callback`,
      });
    } else {
      console.error("Kakao SDK를 로드하지 못했습니다.");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginPageContainer">
        <div className="loginLeftSection">
          <img
            src={careImage}
            alt="Login Illustration"
            className="loginImage"
          />
        </div>
        <div className="loginRightSection">
          <div className="loginHeader">
            <h2>
              로그인을 통해
              <br />
              반려동물 일정을 함께 관리해보세요
            </h2>
            <p>친구와 일정을 공유하며 반려동물을 더 편하게 돌볼 수 있어요</p>
          </div>

          <form className="fullGroup" onSubmit={handleSubmit}>
            <div className="loginFormGroup">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="loginFormGroup">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>
            {error && <p className="loginError">{error}</p>}
            <div className="loginButtonGroup">
              <button
                type="submit"
                className="loginConfirmButton"
                disabled={!email || !password}
              >
                로그인
              </button>
              <button
                type="button"
                className="homeRedirectButton"
                onClick={() => navigate("/")}
              >
                홈으로
              </button>
            </div>

            <div className="signUpText" onClick={() => navigate("/signUp")}>
              <div className="signUpWrapper">
                <span className="signUpPrompt">아이디가 아직 없다면?</span>
                <span
                  className="signUpLink"
                  onClick={() => navigate("/signUp")}
                >
                  회원가입하러가기
                </span>
              </div>
            </div>
          </form>

          <div className="loginDivider">
            <hr />
            <span>SNS 로그인</span>
            <hr />
          </div>

          <div className="snsLoginButtons">
            <button
              type="button"
              className="customKakaoButton"
              onClick={loginWithKakao}
            >
              <RiKakaoTalkFill size={18} color="#191919" />
              <span className="kakaoText">카카오 로그인</span>
            </button>
            <button type="button" className="guestLoginButton">
              게스트 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
