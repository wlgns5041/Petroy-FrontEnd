import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../styles/Friend/FriendDetail.css";
import { fetchFriendDetail } from "../../services/FriendService.jsx";
import AlertModal from "../../components/commons/AlertModal.jsx";
import { useTheme } from "../../utils/ThemeContext.jsx";
import ProfileImage from "../../components/commons/ProfileImage.jsx";
import PetImage from "../../components/commons/PetImage.jsx";

const FriendDetail = ({ memberId, onClose }) => {
  const [friendDetail, setFriendDetail] = useState(null);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const getFriendDetail = async () => {
      try {
        const data = await fetchFriendDetail(memberId);
        if (isMounted) setFriendDetail(data);
      } catch (error) {
        if (isMounted) {
          const message =
            error.response?.data?.errorMessage ||
            "친구 상세 정보를 불러오는 중 오류가 발생했습니다.";
          setError(message);
          setShowAlert(true);
        }
      }
    };

    getFriendDetail();

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  if (!friendDetail && !error)
    return <div className="frienddetail-loading">로딩 중...</div>;

  return (
    <div className="frienddetail-modal">
      <div className="frienddetail-modal-content">
        <button className="frienddetail-close-button" onClick={onClose}>
          &times;
        </button>

        {!error ? (
          <>
            <div className="frienddetail-profile-section">
              <ProfileImage
                src={friendDetail.image}
                alt={friendDetail.name}
                title={friendDetail.name}
                className={`frienddetail-profile-image ${
                  isDarkMode ? "dark-mode" : ""
                }`}
              />
              <h2 className="frienddetail-friend-name">{friendDetail.name}</h2>
            </div>

            {/* 내가 친구에게 돌보미로 등록한 펫 */}
            <div className="frienddetail-pet-section">
              <h3 className="frienddetail-section-title">
                <strong>{friendDetail.name}</strong>님에게 돌보미로 등록한 펫
              </h3>
              <ul className="frienddetail-pet-list">
                {friendDetail.myPets?.length > 0 ? (
                  friendDetail.myPets.map((pet) => (
                    <li
                      key={pet.petId || pet.id}
                      className="frienddetail-pet-item"
                    >
                      <PetImage
                        src={pet.petImage}
                        alt={pet.name}
                        title={pet.name}
                        className="frienddetail-pet-image"
                      />
                      <span className="frienddetail-pet-name">{pet.name}</span>
                    </li>
                  ))
                ) : (
                  <div className="frienddetail-empty">
                    <div className="frienddetail-empty-title">
                      돌보미로 등록한 펫이 없습니다
                    </div>
                    <div className="frienddetail-empty-sub">
                      친구를 돌보미로 등록해보세요!
                    </div>
                  </div>
                )}
              </ul>
            </div>

            {/* 친구가 나를 돌보미로 등록한 펫 */}
            <div className="frienddetail-pet-section">
              <h3 className="frienddetail-section-title">
                <strong>{friendDetail.name}</strong>님이 나를 돌보미로 등록한 펫
              </h3>

              <ul className="frienddetail-pet-list">
                {friendDetail.careGiversPets?.length > 0 ? (
                  friendDetail.careGiversPets.map((pet) => (
                    <li
                      key={pet.petId || pet.id}
                      className="frienddetail-pet-item"
                    >
                      <PetImage
                        src={pet.petImage}
                        alt={pet.name}
                        title={pet.name}
                        className="frienddetail-pet-image"
                      />
                      <span className="frienddetail-pet-name">{pet.name}</span>
                    </li>
                  ))
                ) : (
                  <div className="frienddetail-empty">
                    <div className="frienddetail-empty-title">
                      돌보미로 등록된 펫이 없습니다
                    </div>
                    <div className="frienddetail-empty-sub">
                      친구에게 돌보미 등록을 요청해보세요!
                    </div>
                  </div>
                )}
              </ul>
            </div>
          </>
        ) : null}
      </div>

      {showAlert && (
        <AlertModal message={error} onConfirm={() => setShowAlert(false)} />
      )}
    </div>
  );
};

FriendDetail.propTypes = {
  memberId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FriendDetail;
