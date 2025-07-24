import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Home/HomePage.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function HomePage() {
    const navigate = useNavigate();
    const [activeSlide, setActiveSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const slides = [
        {
            id: 0,
            image: require('../../assets/images/home1.jpg'),
            title: '펫토리,',
            subtitle: '반려동물의 일상과 관리를 한 번에',
        },
        {
            id: 1,
            image: require('../../assets/images/home2.jpg'),
            title: '안전한 서비스,',
            subtitle: '반려동물 관리를 위한 최고의 선택',
        },
        {
            id: 2,
            image: require('../../assets/images/home3.jpg'),
            title: '쉽고 간편한 관리,',
            subtitle: '당신의 펫 라이프를 지원합니다',
        },
    ];

    useEffect(() => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 120,
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            handleSlideChange((activeSlide + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeSlide, slides.length]);

    const handleSlideChange = (index) => {
        setIsAnimating(true);
        setTimeout(() => {
            setActiveSlide(index);
            setIsAnimating(false);
        }, 800);
    };

    const handleLoginClick = () => navigate('/login');
    const handleSignUpClick = () => navigate('/signUp');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    } else {
                        entry.target.classList.remove('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.homepage-middle-card');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="homepage-container">
            <header className="homepage-header" data-aos="fade-down">
                <h1 className="homepage-logo">PETORY</h1>
                <div className="homepage-button-group">
                    <button className="homepage-button" onClick={handleLoginClick}>
                        로그인
                    </button>
                    <button className="homepage-button" onClick={handleSignUpClick}>
                        회원가입
                    </button>
                </div>
            </header>

            <div className="homepage-top" data-aos="fade-up">
                <div className="homepage-top-box">
                    <div className="homepage-content">
                        <div className="homepage-controls">
                            <div className="homepage-slides">
                                <div className="homepage-pagination">
                                    <span className="homepage-pagination-current">{activeSlide + 1}</span>
                                    <span className="homepage-pagination-total">{slides.length}</span>
                                </div>
                                <div className="homepage-progress">
                                    <span className="homepage-bar"></span>
                                </div>
                            </div>
                            <div className={`homepage-textarea fade ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                                <h1 className="homepage-textarea-title">{slides[activeSlide].title}</h1>
                                <h2 className="homepage-textarea-subtitle">{slides[activeSlide].subtitle}</h2>
                                <p className="homepage-textarea-description">
                                    반려동물을 위한, 반려동물의 삶을 더 쉽고
                                    <br />
                                    간단하게 관리해보세요
                                </p>
                            </div>
                        </div>
                        <div className={`homepage-slider fade ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                            <img
                                className="homepage-slider-image"
                                src={slides[activeSlide].image}
                                alt={`Slide ${activeSlide + 1}`}
                            />
                        </div>
                    </div>

                    <div className="homepage-bullets-wrap">
                        {slides.map((slide, index) => (
                            <span
                                key={slide.id}
                                className={`homepage-bullets ${
                                    activeSlide === index ? 'homepage-bullets-on' : ''
                                }`}
                                onClick={() => handleSlideChange(index)}
                            ></span>
                        ))}
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

                <ul className='homepage-middle-card-wrap'>
                    <li className="homepage-middle-card">
                            <img src={require('../../assets/images/calendar.png')} alt="캘린더 관리" />
                            <div className="homepage-middle-card-round"></div>
                            <div className="homepage-middle-card-text">
                                <div className="homepage-middle-card-title">캘린더 관리</div>
                                <p className="homepage-middle-card-content">
                                    일정을 등록하고<br />
                                    반려동물을 손쉽게 관리하세요
                                </p>
                            </div>
                    </li>
                    <li className="homepage-middle-card">
                            <img src={require('../../assets/images/care.jpg')} alt="돌보미 기능" />
                            <div className="homepage-middle-card-round"></div>
                            <div className="homepage-middle-card-text">
                                <div className="homepage-middle-card-title">돌보미 기능</div>
                                <p className="homepage-middle-card-content">
                                    믿을 수 있는 돌보미와 함께<br />
                                    반려동물을 안전하게 케어하세요
                                </p>
                            </div>
                    </li>
                    <li className="homepage-middle-card">
                            <img src={require('../../assets/images/sns.png')} alt="커뮤니티" />
                            <div className="homepage-middle-card-round"></div>
                            <div className="homepage-middle-card-text">
                                <div className="homepage-middle-card-title">커뮤니티</div>
                                <p className="homepage-middle-card-content">
                                    반려동물에 대한 정보를<br />
                                    공유하고 소통하며<br />
                                    새로운 인연을 만들어 보세요
                                </p>
                            </div>
                    </li>
                </ul>
            </div>

            <div className="homepage-bottom">
                <div >
                    <span>PETORY</span>
                    <h2>반려동물 라이프의 새로운 시작!</h2>
                    <p>지금 바로 가입하고 반려동물과의 특별한 시간을 만들어보세요.</p>
                    <button onClick={handleLoginClick} className="homepage-bottom-button">이용하기</button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
