import React, { useState } from "react";
import "../../styles/Pet/DeletePet.css";
import { deletePet } from "../../services/PetService";
import AlertModal from "../../components/commons/AlertModal.jsx";

const DeletePet = ({ pet, onClose, onDeleteSuccess }) => {
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleDelete = async () => {
    if (nameInput.trim() !== pet.name.trim()) {
      setAlertMessage("반려동물의 이름을 정확히 입력해주세요.");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    try {
      const success = await deletePet(pet.petId);
      if (success) {
        setAlertMessage("반려동물이 삭제되었습니다.");
        setShowAlert(true);
      } else {
        setAlertMessage("펫 삭제에 실패했습니다. 다시 시도해주세요.");
        setShowAlert(true);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setAlertMessage("자신의 반려동물만 삭제할 수 있습니다.");
      } else {
        setAlertMessage("서버 통신 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (alertMessage.includes("삭제되었습니다")) {
      onDeleteSuccess?.();
      onClose?.();
    }
  };

  return (
    <div className="pet-delete-overlay">
      <div className="pet-delete-container">
        <h2 className="pet-delete-title">정말로 삭제하시겠습니까?</h2>
        <p className="pet-delete-description">
          <strong>반려동물 삭제</strong>를 원하시면{" "}
          <strong>반려동물의 이름</strong>을 입력해주세요.
        </p>

        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && nameInput === pet.name) handleDelete();
          }}
          className="pet-delete-input"
          placeholder={pet.name}
          disabled={loading}
        />

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
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
};

export default DeletePet;