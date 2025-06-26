import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Pet/CareGiverList.css";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import noCaregiverImg from "../../assets/images/dogpaw.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const CareGiverList = ({ pet, onClose }) => {
  const [caregiversList, setCaregiversList] = useState([]);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${API_BASE_URL}/friends`, {
          headers: { Authorization: `${token}` },
          params: { status: "ACCEPTED" },
        });
        setFriends(response.data.content || []);
      } catch (err) {
        console.error("친구 목록을 불러오지 못했습니다:", err);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchCaregivers = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(`${API_BASE_URL}/caregivers`, {
          headers: { Authorization: `${token}` },
          params: { petId: pet.petId },
        });

        setCaregiversList(response.data.content || []);
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
    const token = localStorage.getItem("accessToken");

    const realFriend = friends.find((f) => f.name === memberName);
    if (!realFriend) {
      alert("해당 친구의 ID를 찾을 수 없습니다.");
      return;
    }

    const realMemberId = realFriend.id;

    if (!window.confirm("해당 돌보미를 삭제하시겠습니까?")) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/caregivers`, {
        headers: { Authorization: `${token}` },
        params: {
          petId: pet.petId,
          memberId: realMemberId,
        },
      });

      if (response.data === true) {
        alert("돌보미가 삭제되었습니다.");
        setCaregiversList((prev) =>
          prev.filter((cg) => cg.memberName !== memberName)
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.errorMessage || "삭제 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <div className="CareGiverList-overlay">
      <div className="CareGiverList-modal">
        <button className="CareGiverList-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="CareGiverList-title">
          <strong>{pet.name}</strong>의 돌보미 친구목록
        </h2>
        {error ? (
          <p className="CareGiverList-error">{error}</p>
        ) : caregiversList.length > 0 ? (
          <ul className="CareGiverList-list">
            {caregiversList.map((cg) => (
              <li key={cg.memberId} className="CareGiverList-card">
                <div className="CareGiverList-left">
                  <img
                    src={cg.image || defaultProfilePic}
                    alt={cg.name}
                    className="CareGiverList-friend-image"
                  />
                  <span className="CareGiverList-name">{cg.memberName}</span>
                </div>
                <button
                  className="CareGiverList-button"
                  onClick={() =>
                    handleDeleteCareGiver(cg.memberId, cg.memberName)
                  }
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="CareGiverList-empty">
            <img
               src={noCaregiverImg}
              alt="no caregiver"
              className="CareGiverList-empty-img"
            />
            <p className="CareGiverList-empty-text">
              아직 등록된 돌보미가 없어요.
              <br />
              친구를 돌보미로 등록해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareGiverList;
