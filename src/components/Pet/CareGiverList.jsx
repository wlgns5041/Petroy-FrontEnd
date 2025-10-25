import React, { useEffect, useState } from "react";
import "../../styles/Pet/CareGiverList.css";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import noCaregiverImg from "../../assets/images/dogpaw.png";
import { fetchAcceptedFriends } from "../../services/FriendService";
import {
  fetchCaregiversByPet,
  deleteCaregiver,
} from "../../services/PetService";
import AlertModal from "../../components/commons/AlertModal.jsx";

const CareGiverList = ({ pet, onClose }) => {
  const [caregiversList, setCaregiversList] = useState([]);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await fetchAcceptedFriends();
        setFriends(data);
      } catch (err) {
        console.error("친구 목록을 불러오지 못했습니다:", err);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const data = await fetchCaregiversByPet(pet.petId);
        setCaregiversList(data);
      } catch (err) {
        const msg =
          err.response?.data?.errorMessage ||
          "돌보미 정보를 불러오지 못했습니다.";
        setError(msg);
      }
    };

    fetchCaregivers();
  }, [pet.petId]);

  const handleDeleteCareGiver = async (cgId, memberName) => {
    const realFriend = friends.find((f) => f.name === memberName);
    if (!realFriend) {
      setAlertMessage("해당 친구의 ID를 찾을 수 없습니다.");
      setShowAlert(true);
      return;
    }

    const realMemberId = realFriend.id;

    if (!window.confirm("해당 돌보미를 삭제하시겠습니까?")) return;

    try {
      const success = await deleteCaregiver(pet.petId, realMemberId);
      if (success) {
        setAlertMessage("돌보미가 삭제되었습니다.");
        setShowAlert(true);
        setCaregiversList((prev) =>
          prev.filter((cg) => cg.memberName !== memberName)
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.errorMessage || "삭제 중 오류가 발생했습니다.";
      setAlertMessage(msg);
      setShowAlert(true);
    }
  };

  return (
    <div className="care-giver-list-overlay">
      <div className="care-giver-list-modal">
        <button className="care-giver-list-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="care-giver-list-title">{pet.name}의 돌보미 친구목록</h2>
        {error ? (
          <p className="care-giver-list-error">{error}</p>
        ) : caregiversList.length > 0 ? (
          <ul className="care-giver-list-list">
            {caregiversList.map((cg) => (
              <li key={cg.memberId} className="care-giver-list-card">
                <div className="care-giver-list-left">
                  <img
                    src={cg.image || defaultProfilePic}
                    alt={cg.name}
                    className="care-giver-list-friend-image"
                  />
                  <span className="care-giver-list-name">{cg.memberName}</span>
                </div>
                <button
                  className="care-giver-list-button"
                  onClick={() =>
                    handleDeleteCareGiver(cg.memberId, cg.memberName)
                  }
                >
                  목록에서 제거
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="care-giver-list-empty">
            <img
              src={noCaregiverImg}
              alt="no caregiver"
              className="care-giver-list-empty-img"
            />
            <p className="care-giver-list-empty-text">
              아직 등록된 돌보미가 없어요.
              <br />
              친구를 돌보미로 등록해보세요!
            </p>
          </div>
        )}
      </div>
      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default CareGiverList;
