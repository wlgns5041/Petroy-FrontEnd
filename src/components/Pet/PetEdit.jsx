import React, { useState } from "react";
import "../../styles/Pet/PetEdit.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { updatePet, fetchMemberPets } from "../../services/PetService";
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
  const [error, setError] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setPetInfo((prev) => ({ ...prev, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", petInfo.name);
      formData.append("age", petInfo.age);
      formData.append("memo", petInfo.memo || "");

      if (petInfo.image && petInfo.image instanceof File) {
        formData.append("image", petInfo.image);
      } else {
        const allPets = await fetchMemberPets();
        const currentPet = allPets.find((p) => p.petId === pet.petId);

        if (!currentPet) {
          console.warn("⚠ 현재 펫 정보를 찾을 수 없습니다.");
        } else {
          const { species, breed } = currentPet;
          console.log("✔ species:", species, "✔ breed:", breed);

          const fallbackImageMap = {
            "강아지-치와와": "dog-chihuahua.png",
            "강아지-진돗개": "dog-jindo.png",
            "강아지-포메라니안": "dog-pomeranian.png",
            "고양이-러시안블루": "cat-russianblue.png",
            "고양이-먼치킨": "cat-munchkin.png",
            "고양이-치즈": "cat-cheese.png",
          };

          const fallbackKey = `${species}-${breed}`;
          const fallbackFileName = fallbackImageMap[fallbackKey];

          if (fallbackFileName) {
            const fallbackImageUrl = `${process.env.PUBLIC_URL}/assets/icons/${fallbackFileName}`;
            const response = await fetch(fallbackImageUrl);
            const blob = await response.blob();
            const file = new File([blob], fallbackFileName, {
              type: blob.type,
            });
            formData.append("image", file);
            console.log("✔ fallback 이미지 적용:", fallbackFileName);
          } else {
            console.warn("⚠ 매핑된 fallback 이미지가 없습니다.");
          }
        }
      }

      const data = await updatePet(pet.petId, formData);
      setAlertMessage("반려동물이 성공적으로 수정되었습니다.");
      setShowAlert(true);
      onUpdate(data);
      onClose();
    } catch (err) {
      setError("서버와의 통신에 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = petInfo.name && petInfo.age;

  return (
    <div className="pet-edit-modal-overlay">
      <div className="pet-edit-modal-content">
        {step > 1 && (
          <button
            className="pet-edit-back-button"
            onClick={() => setStep(step - 1)}
          >
            &#x2039;
          </button>
        )}
        <button className="pet-edit-close" onClick={onClose}>
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
                          onKeyDown={(e) => {
                            if (
                              [
                                "Backspace",
                                "Delete",
                                "Tab",
                                "ArrowLeft",
                                "ArrowRight",
                              ].includes(e.key)
                            )
                              return;

                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onCompositionStart={(e) => {
                            e.preventDefault();
                          }}
                          className="pet-edit-input"
                          inputMode="numeric"
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
                              setPetInfo((prev) => ({ ...prev, image: "" }));
                              setPreviewUrl("");
                            }}
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
                    <h2 className="pet-edit-title">
                      마지막으로 특이사항을 수정해주세요
                    </h2>
                    <div className="pet-edit-content-textarea">
                      <textarea
                        name="memo"
                        value={petInfo.memo}
                        onChange={handleChange}
                        className="pet-edit-textarea"
                        placeholder="메모"
                        rows={4}
                      />
                    </div>
                    {error && <p className="pet-edit-error">{error}</p>}
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
            disabled={(step === 1 && !isStep1Valid) || (step === 3 && loading)}
          >
            {step < 3 ? "다음" : loading ? "수정 중..." : "수정 완료"}
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

export default PetEdit;
