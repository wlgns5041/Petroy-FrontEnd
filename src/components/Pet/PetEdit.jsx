import React, { useState } from "react";
import axios from "axios";
import "../../styles/Pet/PetEdit.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const API_BASE_URL = process.env.REACT_APP_API_URL;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ ${name} 값 변경됨:`, value);

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
      const token = localStorage.getItem("accessToken");
  
      const formData = new FormData();
      formData.append("name", petInfo.name);
      formData.append("age", petInfo.age);
      formData.append("memo", petInfo.memo || "");
  
      if (petInfo.image && petInfo.image instanceof File) {
        formData.append("image", petInfo.image); 
      }
  
      const response = await axios.patch(
        `${API_BASE_URL}/pets/${pet.petId}`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        alert("반려동물이 성공적으로 등록되었습니다.");
        onUpdate(response.data);
        onClose();
      } else {
        setError("펫 정보 수정에 실패했습니다.");
      }
    } catch (err) {
      setError("서버와의 통신에 실패했습니다.");
      console.error(err);
    }
  };

  const isStep1Valid = petInfo.name && petInfo.age;

  return (
    <div className="petEdit-modal-overlay">
      <div className="petEdit-modal-content">
        {step > 1 && (
          <button
            className="petEdit-back-button"
            onClick={() => setStep(step - 1)}
          >
            &#x2039;
          </button>
        )}
        <button className="petEdit-close" onClick={onClose}>
          &times;
        </button>
        <p className="petEdit-step-indicator">{step} / 3</p>

        <div className="petEdit-step-wrapper">
          <SwitchTransition>
            <CSSTransition key={step} timeout={300} classNames="fade">
              <div className="petEdit-step-content">
                {step === 1 && (
                  <>
                    <h2 className="petEdit-title">
                      반려동물의 기본 정보를 수정해주세요
                    </h2>
                    <div className="petEdit-step2-group">
                      <div className="petEdit-form-inline">
                        <label className="petEdit-inline-label">이름</label>
                        <input
                          type="text"
                          name="name"
                          value={petInfo.name}
                          onChange={handleChange}
                          className="petEdit-input"
                        />
                      </div>
                      <div className="petEdit-form-inline">
                        <label className="petEdit-inline-label">나이</label>
                        <input
                          type="number"
                          name="age"
                          value={petInfo.age}
                          onChange={handleChange}
                          className="petEdit-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="petEdit-title">
                      반려동물의 이미지를 수정해주세요
                    </h2>
                    <div className="petEdit-image-box">
                      {!previewUrl ? (
                        <div className="petEdit-image-placeholder">
                          <label className="petEdit-file-button">
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
                          <div className="petEdit-image-preview">
                            <img src={previewUrl} alt="미리보기" />
                          </div>
                          <button
                            type="button"
                            className="petEdit-file-clear"
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
                    <h2 className="petEdit-title">
                      마지막으로 특이사항을 수정해주세요
                    </h2>
                    <div className="petEdit-content-textarea">
                      <textarea
                        name="memo"
                        value={petInfo.memo}
                        onChange={handleChange}
                        className="petEdit-textarea"
                        placeholder="메모"
                        rows={4}
                      />
                    </div>
                    {error && <p className="petEdit-error">{error}</p>}
                  </>
                )}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
        <div className="petEdit-button-row">
          <button
            className="petEdit-next-button"
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
    </div>
  );
};

export default PetEdit;
