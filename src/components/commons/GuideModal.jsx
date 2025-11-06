import React, { useState, useEffect, useRef } from "react";
import "../../styles/GuideModal.css";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import guideCategory from "../../assets/images/guide_category.mov";
import guideSchedule from "../../assets/images/guide_schedule.mov";
import guidePet from "../../assets/images/guide_pet.mov";
import guideFriend from "../../assets/images/guide_friend.mov";
import guideCaregiver from "../../assets/images/guide_care.mov";
import guideCommunity from "../../assets/images/guide_community.mov";

function GuideModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("next");
  const [selectedVideo, setSelectedVideo] = useState(guideCategory);
  const [progress, setProgress] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = [useRef(null), useRef(null)];

  const guides = [
    {
      title: "일정 관리",
      subtext: `<strong>카테고리, 일정</strong>을 <strong>생성</strong>해서 반려동물을 손쉽게 관리해보세요.<br/>
        카테고리, 일정, 펫을 선택하여 <strong>필터링</strong>을 통해  <strong>캘린더</strong>를 확인할 수 있어요`,
      buttons: [
        { label: "카테고리 생성", video: guideCategory },
        { label: "일정 생성", video: guideSchedule },
      ],
    },
    {
      title: "펫 / 친구 / 돌보미",
      subtext: `펫과 친구를 <strong>등록</strong>하고 친구들과 <strong>돌보미 기능</strong>을 통해<br/>
        펫을 공유하여 일정을 관리할 수 있어요`,
      buttons: [
        { label: "펫 등록", video: guidePet },
        { label: "친구 등록", video: guideFriend },
        { label: "돌보미 등록", video: guideCaregiver },
      ],
    },
    {
      title: "펫스타그램",
      subtext: `펫스타그램을 통해 글과 댓글을 작성하며 <br/>펫토리 사용자들과 <strong>일상을 공유</strong>할 수 있어요`,
      buttons: [{ video: guideCommunity }],
    },
  ];

  const handleNext = () => {
    if (step < 3) {
      setDirection("next");
      const nextStep = step + 1;
      setStep(nextStep);

      const nextGuide = guides[nextStep - 1];
      const newVideo = nextGuide.buttons[0]?.video || nextGuide.video;
      handleVideoChange(newVideo);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setDirection("prev");
      const prevStep = step - 1;
      setStep(prevStep);

      const prevGuide = guides[prevStep - 1];
      const newVideo = prevGuide.buttons[0]?.video || prevGuide.video;
      handleVideoChange(newVideo);
    }
  };

  const handleNeverShow = () => {
    localStorage.setItem("hideGuide", "true");
    onClose();
  };

  const currentGuide = guides[step - 1];

  const handleVideoChange = (newVideo) => {
    setSelectedVideo(newVideo);

    const nextIndex = (activeVideoIndex + 1) % 2;
    const nextVideoEl = videoRefs[nextIndex].current;
    const currentVideoEl = videoRefs[activeVideoIndex].current;

    nextVideoEl.src = newVideo;
    nextVideoEl.load();
    nextVideoEl.onloadeddata = () => {
      nextVideoEl.play().catch(() => {});
      nextVideoEl.style.opacity = "1";
      currentVideoEl.style.opacity = "0";
      setActiveVideoIndex(nextIndex);
    };
  };

  useEffect(() => {
    const firstVideo = videoRefs[activeVideoIndex].current;
    if (firstVideo && selectedVideo) {
      firstVideo.src = selectedVideo;
      firstVideo.load();
      firstVideo.onloadeddata = () => {
        firstVideo.play().catch(() => {});
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const video = videoRefs[activeVideoIndex].current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const duration = video.duration || 1;
      setProgress((current / duration) * 100);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    setProgress(0);
    video.currentTime = 0;

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideoIndex]);

  return (
    <div className="guide-overlay">
      <div className="guide-container">
        <div className="guide-header">
          {step > 1 && (
            <ArrowBackIosNewIcon
              className="guide-back"
              onClick={handlePrev}
              style={{ fontSize: "14px" }}
            />
          )}
          <CloseIcon
            className="guide-close"
            onClick={onClose}
            style={{ fontSize: "16px" }}
          />
        </div>

        <div className="guide-indicator">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`guide-dot ${step === i ? "active" : ""}`}
            ></span>
          ))}
        </div>

        <div className={`guide-content slide-${direction}`}>
          <div className="guide-title">{currentGuide.title}</div>
          <div
            className="guide-subtext"
            dangerouslySetInnerHTML={{ __html: currentGuide.subtext }}
          ></div>

          <div className="guide-section">
            {step !== 3 && currentGuide.buttons.length > 0 && (
              <div className="guide-video-tab-bar">
                <div
                  className="guide-video-tab-background"
                  style={{
                    width: `calc((100% - 8px) / ${currentGuide.buttons.length})`,
                    transform: `translateX(${
                      currentGuide.buttons.findIndex(
                        (b) => b.video === selectedVideo
                      ) * 100
                    }%)`,
                  }}
                />
                {currentGuide.buttons.map((btn) => (
                  <button
                    key={btn.label}
                    className={`guide-video-tab-button ${
                      selectedVideo === btn.video ? "active" : ""
                    }`}
                    onClick={() => handleVideoChange(btn.video)}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            <div className={`guide-video-wrapper ${step === 3 ? "large" : ""}`}>
              {[0, 1].map((i) => (
                <video
                  key={i}
                  ref={videoRefs[i]}
                  className={`guide-video ${step === 3 ? "large" : ""}`}
                  style={{ opacity: i === activeVideoIndex ? 1 : 0 }}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ))}
            </div>

            <div className="guide-video-progress">
              <div
                className="guide-video-progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="guide-buttons">
          <button className="guide-button guide-skip" onClick={handleNeverShow}>
            다시 보지 않기
          </button>
          <button className="guide-button guide-next" onClick={handleNext}>
            {step < 3 ? "다음으로" : "시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideModal;
