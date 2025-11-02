import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMemberPosts } from "../../services/CommunityService.jsx";
import "../../styles/MyPage/MyPage.css";
import NameEditModal from "../../components/MyPage/NameEditModal.jsx";
import ImageEditModal from "../../components/MyPage/ImageEditModal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw } from "@fortawesome/free-solid-svg-icons";
import MyPageConfirmModal from "../../components/MyPage/MyPageConfirmModal.jsx";
import defaultPetPic from "../../assets/images/DefaultImage.png";
import { fetchFriendCount } from "../../services/FriendService";
import {
  fetchCurrentMember,
  uploadMemberImage,
  deleteMember,
} from "../../services/MemberService";
import {
  fetchScheduleCategories,
  fetchAllSchedules,
} from "../../services/ScheduleService";
import { fetchMemberPets } from "../../services/PetService.jsx";
import ArrowCircleRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import withAuth from "../../utils/withAuth";
import AlertModal from "../../components/commons/AlertModal.jsx";
import { useTheme } from "../../utils/ThemeContext.jsx";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const MyPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [pets, setPets] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [confirmAction, setConfirmAction] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertNextAction, setAlertNextAction] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAlertMessage("로그인이 필요합니다.");
      setShowAlert(true);
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [
          userResponse,
          petsResponse,
          postsResponse,
          categoriesResponse,
          schedulesResponse,
        ] = await Promise.all([
          fetchCurrentMember(token),
          fetchMemberPets(),
          fetchMemberPosts(token),
          fetchScheduleCategories(),
          fetchAllSchedules(),
        ]);

        const postCount =
          postsResponse?.content?.length || postsResponse?.length || 0;

        const categoryCount = Array.isArray(categoriesResponse)
          ? categoriesResponse.length
          : categoriesResponse?.content?.length || 0;

        const scheduleCount = Array.isArray(schedulesResponse)
          ? schedulesResponse.reduce(
              (acc, schedule) =>
                acc +
                (Array.isArray(schedule.dateInfo)
                  ? schedule.dateInfo.length
                  : 0),
              0
            )
          : 0;

        setUserInfo(userResponse);
        setPets(petsResponse);
        setPostCount(postCount);
        setCategoryCount(categoryCount);
        setScheduleCount(scheduleCount);

        const count = await fetchFriendCount(token);
        setFriendsCount(count);
      } catch (error) {
        if (error._handledGlobally || error?.response?._handledGlobally) return;

        const message =
          error.response?.data?.message ||
          "데이터를 불러오는 중 오류가 발생했습니다.";
        setAlertMessage(message);
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const normalizeUrl = (u) => {
    if (!u) return "";
    if (u.startsWith("http") || u.startsWith("data:")) return u;
    return `${API_BASE_URL}${u}`;
  };

  const banners = [
    {
      title: "내 작성 글",
      sub: "반려동물에 대한 정보를 공유하고 소통하며<br />새로운 인연을 만들어보세요",
      image: require("../../assets/icons/post logo.png"),
      count: postCount,
      link: "/communityPage",
    },
    {
      title: "내 카테고리",
      sub: "카테고리를 추가해서 일정을 분류해보세요",
      image: require("../../assets/icons/category logo.png"),
      count: categoryCount,
      link: "/mainPage",
    },
    {
      title: "내 일정",
      sub: "일정을 통해 반려동물을 손쉽게 관리해보세요",
      image: require("../../assets/icons/schedule logo.png"),
      count: scheduleCount,
      link: "/mainPage",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) return;

      const banners = Array.from(scrollEl.children);
      if (banners.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = banners.indexOf(entry.target);
              if (index !== -1) setActiveIndex(index);
            }
          });
        },
        {
          root: scrollEl,
          threshold: 0.3,
        }
      );

      banners.forEach((banner) => observer.observe(banner));

      return () => {
        banners.forEach((banner) => observer.unobserve(banner));
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [banners.length]);

  // 이미지 변경 함수
  const handleImageUpload = async (file, preview) => {
    const token = localStorage.getItem("accessToken");
    if (preview) setDisplayImage(preview);

    try {
      const savedPath = await uploadMemberImage(token, file);
      const finalUrlBase = normalizeUrl(savedPath);
      const stamp = Date.now();
      const finalUrl = finalUrlBase.includes("?")
        ? `${finalUrlBase}&v=${stamp}`
        : `${finalUrlBase}?v=${stamp}`;

      setAlertMessage("이미지를 변경했습니다.");
      setShowAlert(true);

      const swapWhenReady = (tries = 6, delay = 250) => {
        const probe = new Image();
        probe.onload = () => {
          setUserInfo((prev) => ({ ...prev, image: finalUrl }));
          setDisplayImage(finalUrl);
        };
        probe.onerror = () => {
          if (tries > 1) {
            setTimeout(() => swapWhenReady(tries - 1, delay * 1.5), delay);
          }
        };
        const r = Math.random().toString(36).slice(2);
        probe.src = `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}r=${r}`;
      };
      swapWhenReady();
    } catch (e) {
      const message =
        e.response?.data?.message || "이미지 업로드 중 오류가 발생했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (alertNextAction) {
      alertNextAction();
      setAlertNextAction(null);
    }
  };

  // 계정 삭제 처리 함수
  const handleAccountDelete = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await deleteMember(token);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setAlertMessage("회원 탈퇴에 성공했습니다.");
      setAlertNextAction(() => () => (window.location.href = "/"));
      setShowAlert(true);
    } catch (error) {
      const message =
        error.response?.data?.message || "회원 탈퇴 중 오류가 발생했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    if (window.__eventSourceInstance) {
      window.__eventSourceInstance.close();
      window.__eventSourceInstance = null;
    }

    setAlertMessage("로그아웃되었습니다.");
    setAlertNextAction(() => () => (window.location.href = "/login"));
    setShowAlert(true);
  };

  const handleConfirm = async () => {
    if (confirmAction?.type === "logout") {
      handleLogout();
    } else if (confirmAction?.type === "delete") {
      await handleAccountDelete();
    }
    setConfirmAction(null);
  };

  if (loading) return <p>잠시만 기다려주세요...</p>;

  return (
    <main className="mypage-viewport">
      <div className="mypage">
        <div className="mypage-profile">
          <div className="mypage-profile-card">
            <img
              src={displayImage ?? normalizeUrl(userInfo.image)}
              alt="profile"
              className="mypage-profile-image"
            />

            <div className="mypage-profile-info">
              <div className="mypage-profile-name">{userInfo.name}</div>
              <div className="mypage-profile-phone">{userInfo.phone}</div>
              <div className="mypage-profile-friends">
                친구 <span>{friendsCount}</span>
              </div>
            </div>

            <div className="mypage-profile-menu" ref={dropdownRef}>
              <button
                className="mypage-profile-more"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                <MoreHorizRoundedIcon
                  sx={{
                    fontSize: 20,
                    color: dark ? "#fff" : "#000",
                  }}
                />
              </button>

              {showMenu && (
                <div className="mypage-dropdown">
                  <div onClick={() => setShowNameModal(true)}>이름 변경</div>
                  <div onClick={() => setShowImageModal(true)}>이미지 변경</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mypage-profile-buttons">
          <button
            className="mypage-button logout"
            onClick={() =>
              setConfirmAction({
                type: "logout",
                message: "정말 로그아웃 하시겠어요?",
              })
            }
          >
            로그아웃
          </button>
          <button
            className="mypage-button delete"
            onClick={() =>
              setConfirmAction({
                type: "delete",
                message: "정말 탈퇴하시겠어요? \n이 작업은 되돌릴 수 없습니다.",
              })
            }
          >
            회원 탈퇴
          </button>
        </div>

        <div className="mypage-banner-section">
          <div className="mypage-banner-scroll" ref={scrollRef}>
            {banners.map((banner, i) => (
              <div className="mypage-banner" key={i}>
                <img
                  src={banner.image}
                  alt="banner"
                  className="mypage-banner-image"
                />
                <div className="mypage-banner-content">
                  <div className="mypage-banner-title">
                    {banner.title}
                    <span className="mypage-banner-count">{banner.count}</span>
                  </div>
                  <p
                    className="mypage-banner-sub"
                    dangerouslySetInnerHTML={{ __html: banner.sub }}
                  ></p>
                </div>
                <button
                  className="mypage-banner-link"
                  onClick={() => navigate(banner.link)}
                >
                  <ArrowCircleRightRoundedIcon
                    sx={{
                      fontSize: 20,
                      color: dark ? "#fff" : "#000",
                      transition: "color 0.3s ease",
                      "&:hover": {
                        color: dark ? "#e0e0e0" : "#333",
                      },
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mypage-banner-dots">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`mypage-banner-dot ${
                i === activeIndex ? "active" : ""
              }`}
            ></span>
          ))}
        </div>

        <div className="mypage-pet-section">
          <h3 className="mypage-pet-section-title">
            <div className="mypage-icon-withtext">
              <FontAwesomeIcon icon={faPaw} />내 펫
              <span className="mypage-pet-count">{pets.length}</span>
            </div>
          </h3>
          {pets.length === 0 ? (
            <div className="mypage-empty-state">
              <p className="mypage-empty-text-main">
                등록된 펫이 없습니다.
                <span className="mypage-empty-text-sub">
                  펫을 등록하면 이곳에 표시됩니다!
                </span>
              </p>
            </div>
          ) : (
            <div className="mypage-pet-list">
              {pets.map((pet) => (
                <li key={pet.petId}>
                  <img
                    src={
                      pet.image
                        ? pet.image.startsWith("http") ||
                          pet.image.startsWith("data:")
                          ? pet.image
                          : `${API_BASE_URL}${pet.image}`
                        : defaultPetPic
                    }
                    alt={pet.name}
                    className="mypage-pet-image"
                  />
                  <div className="mypage-pet-info">
                    <div className="mypage-pet-name">{pet.name}</div>
                    <div className="mypage-pet-species">
                      {pet.breed || "종 미등록"}
                    </div>
                  </div>
                </li>
              ))}
            </div>
          )}
        </div>

        {showNameModal && (
          <NameEditModal
            currentName={userInfo.name}
            onSave={(newName) =>
              setUserInfo((prev) => ({ ...prev, name: newName }))
            }
            onClose={() => setShowNameModal(false)}
          />
        )}
        {showImageModal && (
          <ImageEditModal
            onSave={handleImageUpload}
            onClose={() => setShowImageModal(false)}
          />
        )}

        {confirmAction && (
          <MyPageConfirmModal
            message={confirmAction.message}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
          />
        )}

        {showAlert && (
          <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
        )}
      </div>
    </main>
  );
};

export default withAuth(MyPage);
