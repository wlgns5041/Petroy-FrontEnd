import React, { useState, useEffect } from "react";
import axios from "axios";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Pet/AssignCareGiver.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AssignCareGiver = ({ pet, onClose, onAssignCareGiver }) => {
  const [friends, setFriends] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const [friendsRes, caregiversRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/friends`, {
            params: { status: "ACCEPTED" },
            headers: { Authorization: `${token}` },
          }),
          axios.get(`${API_BASE_URL}/caregivers`, {
            params: { petId: pet.petId },
            headers: { Authorization: `${token}` },
          }),
        ]);

        setFriends(friendsRes.data.content || []);
        setCaregivers(caregiversRes.data.content || []);
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
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(`${API_BASE_URL}/caregivers`, null, {
        headers: {
          Authorization: `${token}`,
        },
        params: {
          petId: pet.petId,
          memberId: careGiverId,
        },
      });

      if (response.data === true) {
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
    <div className="petAssign-overlay">
      <div className="petAssign-container">
        <button className="petAssign-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="petAssign-title">
          <strong>{pet.name}</strong>의 돌보미로 등록할 친구를 선택해주세요
        </h2>
        {loading ? (
          <p className="petAssign-loading">로딩 중...</p>
        ) : error ? (
          <p className="petAssign-error">{error}</p>
        ) : friends.length > 0 ? (
          <div className="petAssign-friends-grid">
            {friends.map((friend) => {
              const alreadyAssigned = isAlreadyCaregiver(friend.name);

              return (
                <div key={friend.id} className="petAssign-friend-card">
                  <div className="petAssign-left">
                    <img
                      src={friend.image || defaultProfilePic}
                      alt={friend.name}
                      className="petAssign-friend-image"
                    />
                    <span className="petAssign-friend-name">{friend.name}</span>
                  </div>
                  <button
                    disabled={alreadyAssigned}
                    onClick={() => handleAssign(friend.id)}
                    className={`petAssign-button ${
                      alreadyAssigned ? "petAssign-disabled" : ""
                    }`}
                  >
                    {alreadyAssigned ? "이미 등록된 돌보미" : "돌보미 등록"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="petAssign-no-friends">등록된 친구가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default AssignCareGiver;
