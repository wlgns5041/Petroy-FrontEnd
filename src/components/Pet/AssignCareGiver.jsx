import React, { useState, useEffect } from "react";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Pet/AssignCareGiver.css";
import { fetchAcceptedFriends } from "../../services/FriendService";
import { fetchCaregiversByPet, assignCaregiver } from "../../services/PetService";
import AlertModal from "../../components/commons/AlertModal.jsx";

const AssignCareGiver = ({ pet, onClose, onAssignCareGiver }) => {
  const [friends, setFriends] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsList, caregiverList] = await Promise.all([
          fetchAcceptedFriends(),
          fetchCaregiversByPet(pet.petId),
        ]);
        setFriends(friendsList);
        setCaregivers(caregiverList);
      } catch (err) {
        console.error("데이터 불러오기 오류:", err);
        setAlertMessage("데이터를 불러오는 중 오류가 발생했습니다.");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pet.petId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isAlreadyCaregiver = (friendId) =>
    caregivers.some((c) => c.memberId === friendId);

  const handleAssign = async () => {
    if (!selectedFriend) return;
    try {
      const success = await assignCaregiver(pet.petId, selectedFriend.id);
      if (success) {
        onAssignCareGiver(selectedFriend.id);
        onClose();
      }
    } catch (err) {
      const message =
        err.response?.data?.errorMessage || "돌보미 등록 중 오류가 발생했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
      console.error(err);
    }
  };

  return (
    <div className="pet-assign-overlay">
      <div className="pet-assign-container">
        <h2 className="pet-assign-title">
          {pet.name}의 돌보미로 등록할 친구를 선택해주세요
        </h2>

        {loading ? (
          <p className="pet-assign-loading">로딩 중...</p>
        ) : friends.length > 0 ? (
          <div className="pet-assign-friends-grid">
            {friends.map((friend) => {
              const alreadyAssigned = isAlreadyCaregiver(friend.id);
              const isSelected = selectedFriend?.id === friend.id;

              return (
                <div
                  key={friend.id}
                  className={`pet-assign-friend-card ${
                    isSelected ? "pet-assign-selected" : ""
                  } ${alreadyAssigned ? "pet-assign-disabled-card" : ""}`}
                  onClick={() =>
                    !alreadyAssigned &&
                    setSelectedFriend((prev) =>
                      prev?.id === friend.id ? null : friend
                    )
                  }
                >
                  <img
                    src={friend.image || defaultProfilePic}
                    alt={friend.name}
                    className="pet-assign-friend-image"
                  />
                  <span className="pet-assign-friend-name">{friend.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pet-assign-no-friends">
          <div className="pet-assign-no-friends-title">등록된 친구가 없습니다.</div>
          <div className="pet-assign-no-friends-sub">친구를 추가해서 돌보미로 등록해보세요!</div>
          </div>
        )}

        <div className="pet-assign-button-row">
          <button
            className="pet-assign-cancel"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="pet-assign-submit"
            onClick={handleAssign}
            disabled={!selectedFriend || loading}
          >
            {loading ? "로딩 중..." : "돌보미 등록"}
          </button>
        </div>
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

export default AssignCareGiver;