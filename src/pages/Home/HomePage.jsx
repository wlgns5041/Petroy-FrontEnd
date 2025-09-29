import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../../styles/Home/HomePage.css";
import { RiKakaoTalkFill } from "react-icons/ri";
import lottie1 from "../../assets/images/lottie1.json";
import lottie2 from "../../assets/images/lottie2.json";
import lottie3 from "../../assets/images/lottie3.json";

function HomePage() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);

  const slides = [
    {
      id: 0,
      lottie: lottie2,
      title: "펫토리,",
      subtitle: "반려동물의 일상과 관리를 한 번에",
    },
    {
      id: 1,
      lottie: lottie3,
      title: "쉽고 간편한 관리,",
      subtitle: "반려동물 관리를 위한 최고의 선택",
    },
    {
      id: 2,
      lottie: lottie1,
      title: "함께하는 커뮤니티,",
      subtitle: "반려동물과 사람을 이어주는 특별한 인연",
    },
  ];

  const loginWithKakao = () => {
    if (window.Kakao) {
      window.Kakao.Auth.authorize({
        redirectUri: `${process.env.REACT_APP_API_URL}/oauth/kakao/callback`,
      });
    } else {
      console.error("Kakao SDK를 로드하지 못했습니다.");
    }
  };

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearTimeout(timerRef.current);
  }, [activeSlide, slides.length]);

  const handleBulletClick = (index) => {
    setActiveSlide(index);
  };

  const handleLoginClick = () => navigate("/login");
  const handleSignUpClick = () => navigate("/signUp");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".homepage-middle-card");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage-container">
      <div className="homepage-top" data-aos="fade-up">
        <div className="homepage-top-box">
          <div className="homepage-content">
            <div className="homepage-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="homepage-textarea"
                >
                  <h1 className="homepage-textarea-title">
                    {slides[activeSlide].title}
                  </h1>
                  <h2 className="homepage-textarea-subtitle">
                    {slides[activeSlide].subtitle}
                  </h2>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="homepage-slider"
                >
                  <Lottie
                    animationData={slides[activeSlide].lottie}
                    loop
                    style={{ width: 400, height: 400 }}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="homepage-bullets-wrap">
                {slides.map((slide, index) => (
                  <span
                    key={slide.id}
                    className={`homepage-bullets ${
                      activeSlide === index ? "homepage-bullets-on" : ""
                    }`}
                    onClick={() => handleBulletClick(index)}
                  ></span>
                ))}
              </div>
            </div>

            <div className="homepage-right">
              <div className="homepage-logo-box">
                <div className="homepage-logo-wrapper">
                  <img
                    src={require("../../assets/icons/icon.png")}
                    alt="Petory Logo"
                    className="homepage-logo-icon"
                  />
                </div>
                <h1 className="homepage-logo-text">PETORY</h1>
              </div>

              <div className="homepage-right-buttons">
                <div className="homepage-row">
                  <button className="btn-login" onClick={handleLoginClick}>
                    로그인
                  </button>
                  <button className="btn-signup" onClick={handleSignUpClick}>
                    회원가입
                  </button>
                </div>

                <div className="homepage-sns">
                  <div className="homepage-sns-title">
                    <hr />
                    <span>SNS 로그인</span>
                    <hr />
                  </div>

                  <div className="homepage-sns-buttons">
                    <button
                      type="button"
                      onClick={loginWithKakao}
                      className="homepage-kakao-button"
                    >
                      <RiKakaoTalkFill size={18} color="#191919" />
                      <span>카카오 로그인</span>
                    </button>
                    <button type="button" className="homepage-guest-button">
                      <img
                        src={require("../../assets/icons/my-icon.png")}
                        alt="게스트 아이콘"
                        className="homepage-guest-icon"
                      />
                      <span>게스트 로그인</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="homepage-middle">
        <div className="homepage-middle-header">
          <h3>펫토리 주요 기능</h3>
          <p className="homepage-middle-text">
            반려동물의 삶을 보다 체계적이고 편리하게 관리할 수 있는 <br />
            다양한 기능을 제공합니다
          </p>
        </div>

        <ul className="homepage-middle-card-wrap">
          <li className="homepage-middle-card">
            <img
              src={require("../../assets/images/calendar.png")}
              alt="캘린더 관리"
            />
            <div className="homepage-middle-card-round"></div>
            <div className="homepage-middle-card-text">
              <div className="homepage-middle-card-title">캘린더 관리</div>
              <p className="homepage-middle-card-content">
                일정을 등록하고
                <br />
                반려동물을 손쉽게 관리하세요
              </p>
            </div>
          </li>
          <li className="homepage-middle-card">
            <img
              src={require("../../assets/images/care.jpg")}
              alt="돌보미 기능"
            />
            <div className="homepage-middle-card-round"></div>
            <div className="homepage-middle-card-text">
              <div className="homepage-middle-card-title">돌보미 기능</div>
              <p className="homepage-middle-card-content">
                믿을 수 있는 돌보미와 함께
                <br />
                반려동물을 안전하게 케어하세요
              </p>
            </div>
          </li>
          <li className="homepage-middle-card">
            <img src={require("../../assets/images/sns.png")} alt="커뮤니티" />
            <div className="homepage-middle-card-round"></div>
            <div className="homepage-middle-card-text">
              <div className="homepage-middle-card-title">커뮤니티</div>
              <p className="homepage-middle-card-content">
                반려동물에 대한 정보를
                <br />
                공유하고 소통하며
                <br />
                새로운 인연을 만들어 보세요
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="homepage-bottom">
        <div>
          <span>PETORY</span>
          <h2>반려동물 라이프의 새로운 시작!</h2>
          <p>지금 바로 가입하고 반려동물과의 특별한 시간을 만들어보세요.</p>
          <button onClick={handleLoginClick} className="homepage-bottom-button">
            이용하기
          </button>
        </div>
      </div>

      <div className="onboarding">
        <div className="onboarding-logo-box">
          <div className="onboarding-logo-wrapper">
            <img
              src={require("../../assets/icons/icon.png")}
              alt="Petory Logo"
              className="onboarding-logo-icon"
            />
          </div>
          <h1 className="onboarding-logo-text">PETORY</h1>
        </div>

        <div className="onboarding-buttons">
          <div className="onboarding-row">
            <button className="btn-login" onClick={handleLoginClick}>
              로그인
            </button>
            <button className="btn-signup" onClick={handleSignUpClick}>
              회원가입
            </button>
          </div>
        </div>

        <div className="onboarding-sns">
          <div className="onboarding-sns-title">
            <hr />
            <span>SNS 로그인</span>
            <hr />
          </div>

          <div className="onboarding-buttons">
            <button
              type="button"
              className="homepage-kakao-button"
              onClick={loginWithKakao}
            >
              <RiKakaoTalkFill size={18} color="#191919" />
              <span>카카오 로그인</span>
            </button>

            <button type="button" className="homepage-guest-button">
              <img
                src={require("../../assets/icons/my-icon.png")}
                alt="게스트 아이콘"
                className="homepage-guest-icon"
              />
              <span>게스트 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
