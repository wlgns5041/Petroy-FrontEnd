import React, { useState } from "react";
import axios from "axios";
import "../../styles/Pet/DeletePet.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const DeletePet = ({ pet, onClose, onDeleteSuccess }) => {
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setNameInput(e.target.value);
  };

  const handleDelete = async () => {
    if (nameInput !== pet.name) {
      setError("반려동물의 이름을 정확히 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("액세스 토큰이 존재하지 않습니다.");
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/pets/${pet.petId}`, {
        headers: { Authorization: `${token}` },
      });

      if (response.status === 200) {
        alert("펫 삭제 성공");
        onDeleteSuccess();
        onClose();
      } else {
        setError("펫 삭제에 실패했습니다.");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError("자신의 반려동물만 삭제할 수 있습니다.");
      } else {
        setError("서버와의 통신에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="petDelete-overlay">
      <div className="petDelete-container">
        <h2 className="petDelete-title">정말로 삭제하시겠습니까?</h2>
        <p className="petDelete-description">
          <strong>반려동물 삭제</strong>를 원하시면{" "}
          <strong>반려동물의 이름</strong>을 입력해주세요
        </p>

        <input
          type="text"
          value={nameInput}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && nameInput === pet.name) {
              handleDelete();
            }
          }}
          className="petDelete-input"
          placeholder={pet.name}
        />

        {error && <p className="petDelete-error">{error}</p>}

        <div className="petDelete-button-row">
          <button
            className="petDelete-cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="petDelete-confirm-button"
            onClick={handleDelete}
            disabled={loading || nameInput !== pet.name}
          >
            {loading ? "삭제 중..." : "삭제하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePet;
