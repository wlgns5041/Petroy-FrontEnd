import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Login/LoginPage.css";
import logo from "../../assets/icons/logo-without-text.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { RiKakaoTalkFill } from "react-icons/ri";
import { loginUser } from "../../services/MemberService";

const KAKAO_KEY = process.env.REACT_APP_KAKAO_KEY;

function LoginPage() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState(null); 
  const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = await loginUser(email, password);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    navigate("/mainPage");
  } catch (error) {
    let message = "로그인 실패";
    if (error.response?.data?.errorMessage) {
      message = error.response.data.errorMessage;
    }
    setError(message);
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
    <div className="loginpage">
      <div className="loginpage-container">
        <div className="loginpage-leftsection">
          <img
            src={logo}
            alt="Login Illustration"
            className="loginpage-leftsection-image"
          />
        </div>
        <div className="loginpage-rightsection">
          <div className="loginpage-title">
            <h2>
              로그인을 통해
              <br />
              반려동물 일정을 관리해보세요
            </h2>
            <p>친구와 일정을 공유하며 반려동물을 더 편하게 돌볼 수 있어요</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="loginpage-form">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="loginpage-form">
              <div className="loginpage-password">
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
                  className="loginpage-password-icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>
            {error && <p className="loginpage-error">{error}</p>}
            <div className="loginpage-button">
              <button
                type="button"
                className="loginpage-homebutton"
                onClick={() => navigate("/")}
              >
                홈으로
              </button>
              <button
                type="submit"
                className="loginpage-loginbutton"
                disabled={!email || !password}
              >
                로그인
              </button>
            </div>

            <div>
              <div className="loginpage-signup-wrapper">
                <span className="loginpage-signup-title">아직 계정이 없으신가요?</span>
                <span
                  className="loginpage-signup-link"
                  onClick={() => navigate("/signUp")}
                >
                  회원가입하러가기
                </span>
              </div>
            </div>
          </form>

          <div className="loginpage-sns-title">
            <hr />
            <span>SNS 로그인</span>
            <hr />
          </div>

          <div className="loginpage-sns-buttons">
            <button
              type="button"
              className="loginpage-kakao-button"
              onClick={loginWithKakao}
            >
              <RiKakaoTalkFill size={18} color="#191919" />
              <span> 카카오 로그인</span>
            </button>
            <button type="button" className="loginpage-guest-button">
              게스트 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
