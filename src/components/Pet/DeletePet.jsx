import React, { useState } from "react";
import "../../styles/Pet/DeletePet.css";
import { deletePet } from "../../services/PetService";
import AlertModal from "../../components/commons/AlertModal.jsx";

const DeletePet = ({ pet, onClose, onDeleteSuccess }) => {
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
      const success = await deletePet(pet.petId);
      if (success) {
        setAlertMessage("펫을 삭제했습니다");
        setShowAlert(true);
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
    <div className="pet-delete-overlay">
      <div className="pet-delete-container">
        <h2 className="pet-delete-title">정말로 삭제하시겠습니까?</h2>
        <p className="pet-delete-description">
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
          className="pet-delete-input"
          placeholder={pet.name}
        />

        {error && <p className="pet-delete-error">{error}</p>}

        <div className="pet-delete-button-row">
          <button
            className="pet-delete-cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            className="pet-delete-confirm-button"
            onClick={handleDelete}
            disabled={loading || nameInput !== pet.name}
          >
            {loading ? "삭제 중..." : "삭제하기"}
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

export default DeletePet;
