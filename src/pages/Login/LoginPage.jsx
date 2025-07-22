import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Login/LoginPage.css";
import careImage from "../../assets/images/dogpaw.png";
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
              반려동물 일정을 관리해보세요
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
                type="button"
                className="homeRedirectButton"
                onClick={() => navigate("/")}
              >
                홈으로
              </button>
              <button
                type="submit"
                className="loginConfirmButton"
                disabled={!email || !password}
              >
                로그인
              </button>
            </div>

            <div className="signUpText">
              <div className="signUpWrapper">
                <span className="signUpPrompt">아직 계정이 없으신가요?</span>
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
