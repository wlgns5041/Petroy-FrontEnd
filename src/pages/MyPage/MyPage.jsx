import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {fetchMemberPosts} from "../../services/CommunityService.jsx";
import "../../styles/MyPage/MyPage.css";
import NavBar from "../../components/commons/NavBar.jsx";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import NameEditModal from "../../components/MyPage/NameEditModal.jsx";
import ImageEditModal from "../../components/MyPage/ImageEditModal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw, faPen } from "@fortawesome/free-solid-svg-icons";
import MyPageConfirmModal from "../../components/MyPage/MyPageConfirmModal.jsx";
import defaultPetPic from "../../assets/images/DefaultImage.png";
import { fetchFriendCount } from "../../services/FriendService";
import { fetchCurrentMember, uploadMemberImage, deleteMember } from "../../services/MemberService";
import { fetchMemberPets } from "../../services/PetService.jsx"
const API_BASE_URL = process.env.REACT_APP_API_URL;

const MyPage = () => {
  const navigate = useNavigate(); // 리다이렉트 핸들러 함수
  const [userInfo, setUserInfo] = useState({}); // 사용자 정보
  const [pets, setPets] = useState([]); // 펫 목록
  const [posts, setPosts] = useState([]); // 작성 글 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [showNameModal, setShowNameModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [confirmAction, setConfirmAction] = useState(null);

  // 컴포넌트가 마운트될 때 실행
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // 로컬 저장소에서 토큰 가져오기

    if (token) {
      // 비동기 함수로 데이터를 가져오는 작업
      const fetchData = async () => {
        try {
          // 사용자 정보, 펫 목록, 포스트 목록을 동시에 가져오기 (토큰 서비스에 있음)
          const [userResponse, petsResponse, postsResponse] = await Promise.all(
            [
              fetchCurrentMember(token),
              fetchMemberPets(),
              fetchMemberPosts(token),
            ]
          );

          // 가져온 데이터를 상태에 저장
          setUserInfo(userResponse);
          setPets(petsResponse);
          setPosts(postsResponse?.content || []); // 포스트 목록이 없을 경우 빈 배열로 초기화\

          const count = await fetchFriendCount(token); // 🔥 이렇게 수정
          setFriendsCount(count);
        } catch (error) {
          console.error("데이터를 불러오는데 실패했습니다:", error); // 에러 처리
        } finally {
          setLoading(false); // 데이터 로딩이 끝나면 로딩 상태 종료
        }
      };

      fetchData(); // 데이터 가져오기 호출
    } else {
      console.error("토큰이 없습니다"); // 토큰이 없는 경우 에러 처리
    }
  }, []); // 빈 배열을 의존성으로 설정하여 컴포넌트 마운트 시 처음에 한 번만 실행

  // 이미지 변경 함수
  const handleImageUpload = async (newImage) => {
    const token = localStorage.getItem("accessToken");
    try {
      const imageUrl = await uploadMemberImage(token, newImage);
      setUserInfo((prev) => ({ ...prev, image: imageUrl }));
      alert("이미지를 변경했습니다.");
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
    }
  };

  if (loading) return <p>잠시만 기다려주세요...</p>;

  // 계정 삭제 처리 함수
  const handleAccountDelete = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await deleteMember(token);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      alert("회원 탈퇴에 성공했습니다.");
      window.location.href = "/";
    } catch (error) {
      console.error("회원 탈퇴 중 오류 발생:", error);
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 토큰 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // SSE 연결 해제
    if (window.__eventSourceInstance) {
      window.__eventSourceInstance.close();
      window.__eventSourceInstance = null;
      console.log("👋 SSE 연결 종료됨");
    }

    alert("로그아웃되었습니다.");

    // 로그인 페이지로 리디렉션
    window.location.href = "/login";
  };

  // 로딩 중일 때 메시지 표시
  if (loading) return <p>잠시만 기다려주세요...</p>;

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleConfirm = async () => {
    if (confirmAction?.type === "logout") {
      handleLogout();
    } else if (confirmAction?.type === "delete") {
      await handleAccountDelete();
    }
    setConfirmAction(null); // 모달 닫기
  };

  return (
    <div className="myPage">
      <NavBar title="마이페이지" />

      <div className="profile-card">
        <div className="profile-card-content">
          <img
            src={userInfo.image || defaultProfilePic}
            alt="profile"
            className="myPage-profile-image"
          />
          <div className="profile-info">
            <div className="name">{userInfo.name}</div>
            <div className="phone">{userInfo.phone}</div>
            <div className="counts">
              <div>
                <span
                  className="text"
                  onClick={() => handleNavigation("/friendPage")}
                >
                  친구
                </span>
                <span>{friendsCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="myPage-button-group">
          <button
            className="myPage-button"
            onClick={() => setShowNameModal(true)}
          >
            이름 변경
          </button>
          <button
            className="myPage-button"
            onClick={() => setShowImageModal(true)}
          >
            이미지 변경
          </button>
          <button
            className="myPage-button gray"
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
            className="myPage-button gray"
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
      </div>

      <div className="section-card-pets">
        <h3 className="pet-section-title">
          <div className="left-group">
            <FontAwesomeIcon icon={faPaw} />내 펫
          </div>
          <span className="link" onClick={() => handleNavigation("/petPage")}>
            펫 바로가기
          </span>
        </h3>
        {pets.length === 0 ? (
          <div className="myPage-empty-state">
            <p className="myPage-empty-text-main">
              등록된 펫이 없습니다.
              <span className="myPage-empty-text-sub">
                펫을 등록하면 이곳에 표시됩니다!
              </span>
            </p>
          </div>
        ) : (
          <div className="myPage-pet-list">
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
                  className="pet-image"
                />
                <div className="info">
                  <div className="name">{pet.name}</div>
                  <div className="species">{pet.breed || "종 미등록"}</div>
                </div>
              </li>
            ))}
          </div>
        )}
      </div>
      <div className="section-card-posts">
        <h3 className="pet-section-title">
          <div className="left-group">
            <FontAwesomeIcon icon={faPen} />내 글
          </div>
          <span
            className="link"
            onClick={() => handleNavigation("/communityPage")}
          >
            커뮤니티 바로가기
          </span>
        </h3>
        <ul>
          {posts.length === 0 ? (
            <div className="myPage-empty-state">
              <p className="myPage-empty-text-main">
                작성한 글이 없습니다.
                <span className="myPage-empty-text-sub">
                  게시글을 작성하면 이곳에 표시됩니다!
                </span>
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <li key={post.postId}>
                <strong>{post.title}</strong>
                <br />
                {post.content}
              </li>
            ))
          )}
        </ul>
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
    </div>
  );
};

export default MyPage;
