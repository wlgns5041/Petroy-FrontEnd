import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Friend/FriendDetail.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const FriendDetail = ({ memberId, onClose }) => {
  const [friendDetail, setFriendDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getFriendDetail = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(
          `${API_BASE_URL}/friends/${memberId}`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        console.log("친구 상세 정보 응답:", response.data); // 👈 추가
        setFriendDetail(response.data);
      } catch (error) {
        setError(
          error.response?.data?.errorMessage ||
            "친구 상세 정보를 불러오는 중 오류가 발생했습니다."
        );
      }
    };
    getFriendDetail();
  }, [memberId]);

  if (!friendDetail && !error) return <div className="modal">로딩 중...</div>;

  return (
    <div className="friend-detail-modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {!error ? (
          <>
            <div className="profile-section">
              <img
                src={friendDetail.image || defaultProfilePic}
                alt={friendDetail.name}
                className="profile-image"
              />
              <h2 className="friend-name">{friendDetail.name}</h2>
            </div>

            <div className="pet-section">
              <h3 className="section-title">
                <strong>{friendDetail.name}</strong>님에게 돌보미로 등록한 펫
              </h3>
              <ul className="pet-list">
                {friendDetail.myPets?.length > 0 ? (
                  friendDetail.myPets.map((pet) => (
                    <li key={pet.id} className="pet-item">
                      <img
                        src={pet.petImage}
                        alt={pet.name}
                        className="pet-image"
                      />
                      <span className="pet-name">{pet.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="empty-text">돌보미로 등록한 펫이 없습니다</li>
                )}
              </ul>
            </div>

            <div className="pet-section">
              <h3 className="section-title">
                <strong>{friendDetail.name}</strong>님이 나를 돌보미로 등록한 펫
              </h3>
              {friendDetail.careGiversPets?.length > 0 ? ( 
                <ul className="pet-list">
                  {friendDetail.careGiversPets.map(
                    (
                      pet 
                    ) => (
                      <li key={pet.id} className="pet-item">
                        <img
                          src={pet.petImage}
                          alt={pet.name}
                          className="pet-image"
                        />
                        <span className="pet-name">{pet.name}</span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="empty-text">돌보미로 등록된 펫이 없습니다.</p>
              )}
            </div>
          </>
        ) : (
          <ul className="pet-list">
            <li className="pet-error-message">{error}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

FriendDetail.propTypes = {
  memberId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FriendDetail;
