import React, { useState, useEffect } from "react";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Pet/AssignCareGiver.css";
import { fetchAcceptedFriends } from "../../services/FriendService";
import {
  fetchCaregiversByPet,
  assignCaregiver,
} from "../../services/PetService";

const AssignCareGiver = ({ pet, onClose, onAssignCareGiver }) => {
  const [friends, setFriends] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);

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
        <h2 className="pet-assign-title">
          {pet.name}의 돌보미로 등록할 친구를 선택해주세요
        </h2>
        {loading ? (
          <p className="pet-assign-loading">로딩 중...</p>
        ) : error ? (
          <p className="pet-assign-error">{error}</p>
        ) : friends.length > 0 ? (
          <div className="pet-assign-friends-grid">
            {friends.map((friend) => {
              const alreadyAssigned = isAlreadyCaregiver(friend.name);
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
          <p className="pet-assign-no-friends">등록된 친구가 없습니다.</p>
        )}
        <div className="pet-assign-button-row">
          <button className="pet-assign-cancel" onClick={onClose}>
            취소
          </button>
          <button
            className="pet-assign-submit"
            onClick={handleAssign}
            disabled={!selectedFriend}
          >
            돌보미 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCareGiver;
