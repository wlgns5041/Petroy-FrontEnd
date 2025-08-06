import React, { useState, useEffect } from "react";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Pet/AssignCareGiver.css";
import { fetchAcceptedFriends } from "../../services/FriendService";
import {fetchCaregiversByPet, assignCaregiver} from "../../services/PetService";


const AssignCareGiver = ({ pet, onClose, onAssignCareGiver }) => {
  const [friends, setFriends] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pet.petId]);

  const handleAssign = async (careGiverId) => {
    try {
      const success = await assignCaregiver(pet.petId, careGiverId);
      if (success) {
        onAssignCareGiver(careGiverId);
        onClose();
      }
    } catch (err) {
      const message =
        err.response?.data?.errorMessage || "오류가 발생했습니다.";
      alert(message);
      console.error(err);
    }
  };

  const isAlreadyCaregiver = (friendName) =>
    caregivers.some((c) => c.memberName === friendName);

  return (
  <div className="pet-assign-overlay">
    <div className="pet-assign-container">
      <button className="pet-assign-close" onClick={onClose}>
        &times;
      </button>
      <h2 className="pet-assign-title">
        <strong>{pet.name}</strong>의 돌보미로 등록할 친구를 선택해주세요
      </h2>
      {loading ? (
        <p className="pet-assign-loading">로딩 중...</p>
      ) : error ? (
        <p className="pet-assign-error">{error}</p>
      ) : friends.length > 0 ? (
        <div className="pet-assign-friends-grid">
          {friends.map((friend) => {
            const alreadyAssigned = isAlreadyCaregiver(friend.name);

            return (
              <div key={friend.id} className="pet-assign-friend-card">
                <div className="pet-assign-left">
                  <img
                    src={friend.image || defaultProfilePic}
                    alt={friend.name}
                    className="pet-assign-friend-image"
                  />
                  <span className="pet-assign-friend-name">{friend.name}</span>
                </div>
                <button
                  disabled={alreadyAssigned}
                  onClick={() => handleAssign(friend.id)}
                  className={`pet-assign-button ${
                    alreadyAssigned ? "pet-assign-disabled" : ""
                  }`}
                >
                  {alreadyAssigned ? "이미 등록된 돌보미" : "돌보미 등록"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="pet-assign-no-friends">등록된 친구가 없습니다.</p>
      )}
    </div>
  </div>
);
};

export default AssignCareGiver;
