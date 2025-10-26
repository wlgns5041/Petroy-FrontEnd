import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Friend/FriendDetail.css";
import { fetchFriendDetail } from "../../services/FriendService.jsx";
import AlertModal from "../../components/commons/AlertModal.jsx";

const FriendDetail = ({ memberId, onClose }) => {
  const [friendDetail, setFriendDetail] = useState(null);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    let isMounted = true; // 언마운트 안전 처리

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
              <img
                src={friendDetail.image || defaultProfilePic}
                onError={(e) => (e.target.src = defaultProfilePic)}
                alt={friendDetail.name}
                className="frienddetail-profile-image"
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
                    <li key={pet.petId || pet.id} className="frienddetail-pet-item">
                      <img
                        src={pet.petImage || defaultProfilePic}
                        onError={(e) => (e.target.src = defaultProfilePic)}
                        alt={pet.name}
                        className="frienddetail-pet-image"
                      />
                      <span className="frienddetail-pet-name">{pet.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="frienddetail-empty-text">
                    돌보미로 등록한 펫이 없습니다
                  </li>
                )}
              </ul>
            </div>

            {/* 친구가 나를 돌보미로 등록한 펫 */}
            <div className="frienddetail-pet-section">
              <h3 className="frienddetail-section-title">
                <strong>{friendDetail.name}</strong>님이 나를 돌보미로 등록한 펫
              </h3>
              {friendDetail.careGiversPets?.length > 0 ? (
                <ul className="frienddetail-pet-list">
                  {friendDetail.careGiversPets.map((pet) => (
                    <li key={pet.petId || pet.id} className="frienddetail-pet-item">
                      <img
                        src={pet.petImage || defaultProfilePic}
                        onError={(e) => (e.target.src = defaultProfilePic)}
                        alt={pet.name}
                        className="frienddetail-pet-image"
                      />
                      <span className="frienddetail-pet-name">{pet.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="frienddetail-empty-text">
                  돌보미로 등록된 펫이 없습니다.
                </p>
              )}
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