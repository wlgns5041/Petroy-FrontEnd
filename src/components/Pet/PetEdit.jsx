import React, { useState } from "react";
import "../../styles/Pet/PetEdit.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { updatePet } from "../../services/PetService";
import AlertModal from "../../components/commons/AlertModal.jsx";

const PetEdit = ({ pet, onClose, onUpdate }) => {
  const [step, setStep] = useState(1);
  const [petInfo, setPetInfo] = useState({
    name: pet.name || "",
    age: pet.age?.toString() || "",
    image: "",
    memo: pet.memo || "",
  });
  const [previewUrl, setPreviewUrl] = useState(pet.image || "");
  const [loading, setLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [pendingUpdate, setPendingUpdate] = useState(null);

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (pendingUpdate) {
      pendingUpdate();
      setPendingUpdate(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPetInfo((prev) => ({ ...prev, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", petInfo.name);
      formData.append("age", petInfo.age);
      formData.append("memo", petInfo.memo || "");

      if (petInfo.image && petInfo.image instanceof File) {
        formData.append("image", petInfo.image);
      } else if (petInfo.image === null) {
        formData.append("image", new Blob([]), "null");
      }

      const data = await updatePet(pet.petId, formData);
      setAlertMessage("반려동물이 성공적으로 수정되었습니다.");
      setShowAlert(true);

      setPendingUpdate(() => () => {
        onUpdate?.(data);
        onClose?.();
      });
    } catch (err) {
      console.error("펫 수정 실패:", err);
      setAlertMessage(
        "서버와의 통신에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = petInfo.name.trim() && petInfo.age.trim();

  return (
    <div className="pet-edit-modal-overlay">
      <div className="pet-edit-modal-content">
        {step > 1 && (
          <button
            className="pet-edit-back-button"
            onClick={() => setStep(step - 1)}
            disabled={loading}
          >
            &#x2039;
          </button>
        )}
        <button className="pet-edit-close" onClick={onClose} disabled={loading}>
          &times;
        </button>
        <p className="pet-edit-step-indicator">{step} / 3</p>

        <div className="pet-edit-step-wrapper">
          <SwitchTransition>
            <CSSTransition key={step} timeout={300} classNames="fade">
              <div className="pet-edit-step-content">
                {step === 1 && (
                  <>
                    <h2 className="pet-edit-title">
                      반려동물의 기본 정보를 수정해주세요
                    </h2>
                    <div className="pet-edit-step2-group">
                      <div className="pet-edit-form-inline">
                        <label className="pet-edit-inline-label">이름</label>
                        <input
                          type="text"
                          name="name"
                          value={petInfo.name}
                          onChange={handleChange}
                          className="pet-edit-input"
                        />
                      </div>
                      <div className="pet-edit-form-inline">
                        <label className="pet-edit-inline-label">나이</label>
                        <input
                          type="text"
                          name="age"
                          value={petInfo.age}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            setPetInfo((prev) => ({ ...prev, age: value }));
                          }}
                          inputMode="numeric"
                          className="pet-edit-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="pet-edit-title">
                      반려동물의 이미지를 수정해주세요
                    </h2>
                    <div className="pet-edit-image-box">
                      {!previewUrl ? (
                        <div className="pet-edit-image-placeholder">
                          <label className="pet-edit-file-button">
                            이미지 선택
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={loading}
                            />
                          </label>
                        </div>
                      ) : (
                        <>
                          <div className="pet-edit-image-preview">
                            <img src={previewUrl} alt="미리보기" />
                          </div>
                          <button
                            type="button"
                            className="pet-edit-file-clear"
                            onClick={() => {
                              setPetInfo((prev) => ({ ...prev, image: null }));
                              setPreviewUrl("");
                            }}
                            disabled={loading}
                          >
                            선택 해제
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="pet-edit-title">특이사항을 수정해주세요</h2>
                    <div className="pet-edit-content-textarea">
                      <textarea
                        name="memo"
                        value={petInfo.memo}
                        onChange={handleChange}
                        className="pet-edit-textarea"
                        placeholder="메모를 입력하세요"
                        rows={4}
                        disabled={loading}
                      />
                    </div>
                  </>
                )}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>

        <div className="pet-edit-button-row">
          <button
            className="pet-edit-next-button"
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSubmit();
            }}
            disabled={(step === 1 && !isStep1Valid) || loading}
          >
            {step < 3 ? "다음" : loading ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </div>

      {showAlert && (
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
};

export default PetEdit;
