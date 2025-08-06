import React, { useState, useEffect } from "react";
import "../../styles/Pet/PetRegister.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
  fetchSpeciesList,
  fetchBreedList,
  registerPet,
} from "../../services/PetService";

const PetRegister = ({ onClose, onRegisterSuccess }) => {
  const [step, setStep] = useState(1);
  const [petInfo, setPetInfo] = useState({
    speciesId: "",
    breedId: "",
    name: "",
    age: "",
    gender: "",
    image: "",
    memo: "",
  });

  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [breedOptions, setBreedOptions] = useState([]);
  const [error, setError] = useState(null);

  const breedImageMap = {
    1: require("../../assets/icons/dog-chihuahua.png"),
    2: require("../../assets/icons/dog-jindo.png"),
    3: require("../../assets/icons/dog-pomeranian.png"),
    4: require("../../assets/icons/cat-russianblue.png"),
    5: require("../../assets/icons/cat-munchkin.png"),
    6: require("../../assets/icons/cat-cheese.png"),
  };

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const speciesList = await fetchSpeciesList();
        const formatted = speciesList.map((s) => ({
          value: s.speciesId,
          label: s.speciesName,
        }));
        setSpeciesOptions(formatted);
      } catch {
        setError("종 정보를 불러오지 못했습니다.");
      }
    };
    fetchSpecies();
  }, []);

  useEffect(() => {
    const fetchBreeds = async () => {
      if (!petInfo.speciesId) return;
      try {
        const breedList = await fetchBreedList(petInfo.speciesId);
        const formatted = breedList.map((b) => ({
          value: b.breedId,
          label: b.breedName,
        }));
        setBreedOptions(formatted);
      } catch {
        setError("품종 정보를 불러오지 못했습니다.");
      }
    };
    fetchBreeds();
  }, [petInfo.speciesId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!petInfo.speciesId || !petInfo.breedId)) {
      alert("종과 품종을 모두 선택해주세요.");
      return;
    }
    if (step === 2 && (!petInfo.name || !petInfo.age || !petInfo.gender)) {
      alert("이름, 나이, 성별을 모두 입력해주세요.");
      return;
    }
    setStep(step + 1);
  };

  const handleRegister = async () => {
    try {
      const formData = new FormData();
      formData.append("speciesId", petInfo.speciesId);
      formData.append("breedId", petInfo.breedId);
      formData.append("name", petInfo.name);
      formData.append("age", petInfo.age);
      formData.append("gender", petInfo.gender);
      formData.append("memo", petInfo.memo || "");

      if (petInfo.image && petInfo.image instanceof File) {
        formData.append("image", petInfo.image);
      } else {
        const fallbackImageUrl = breedImageMap[petInfo.breedId];
        const response = await fetch(fallbackImageUrl);
        const blob = await response.blob();
        const file = new File([blob], "default.png", { type: blob.type });
        formData.append("image", file);
      }

      const result = await registerPet(formData);

      alert("반려동물이 성공적으로 등록되었습니다.");
      if (onRegisterSuccess && result) {
        onRegisterSuccess(result);
      }
      onClose();
    } catch (err) {
      alert("등록 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="pet-register-modal-overlay">
      <div className="pet-register-modal-content">
        <button className="pet-register-close" onClick={onClose}>
          &times;
        </button>
        {step !== 1 && (
          <button
            className="pet-register-back-button"
            onClick={() => setStep(step - 1)}
          >
            &#x2039;
          </button>
        )}
        <SwitchTransition>
          <CSSTransition key={step} timeout={300} classNames="fade">
            <div className="pet-register-step-wrapper">
              {step === 1 && (
                <>
                  <p className="pet-register-step-indicator">1 / 4</p>
                  <h2 className="pet-register-title">
                    반려동물의 종을 선택해주세요
                  </h2>

                  <div className="pet-register-step-center">
                    {/* 종 선택 */}
                    <div className="pet-register-form-inline">
                      <label className="pet-register-inline-label">종</label>
                      <select
                        name="speciesId"
                        value={petInfo.speciesId}
                        onChange={handleChange}
                        className="pet-register-inline-select"
                      >
                        <option value="">선택</option>
                        {speciesOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 품종 선택 */}
                    <div className="pet-register-form-inline">
                      <label className="pet-register-inline-label">품종</label>
                      <select
                        name="breedId"
                        value={petInfo.breedId}
                        onChange={handleChange}
                        className="pet-register-inline-select"
                        disabled={!petInfo.speciesId}
                      >
                        <option value="">선택</option>
                        {breedOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pet-register-button-fixed">
                    <button
                      className="pet-register-step-button"
                      onClick={handleNext}
                      disabled={!petInfo.speciesId || !petInfo.breedId}
                    >
                      다음으로
                    </button>
                    {error && <p className="pet-register-error">{error}</p>}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="pet-register-step-content">
                    <p className="pet-register-step-indicator">2 / 4</p>
                    <h2 className="pet-register-title">
                      이름, 나이, 성별을 입력해주세요
                    </h2>
                    <div className="pet-register-form-inline">
                      <input
                        type="text"
                        name="name"
                        value={petInfo.name}
                        onChange={handleChange}
                        className="pet-register-input"
                        placeholder="반려동물 이름"
                      />
                    </div>
                    <div className="pet-register-form-inline">
                      <label className="pet-register-inline-label">나이</label>
                      <select
                        name="age"
                        value={petInfo.age}
                        onChange={handleChange}
                        className="pet-register-inline-select"
                      >
                        <option value="">선택</option>
                        {Array.from({ length: 20 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} 살
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pet-register-form-inline">
                      <label className="pet-register-inline-label">성별</label>
                      <select
                        name="gender"
                        value={petInfo.gender}
                        onChange={handleChange}
                        className="pet-register-inline-select"
                      >
                        <option value="">선택</option>
                        <option value="MALE">남자</option>
                        <option value="FEMALE">여자</option>
                      </select>
                    </div>
                  </div>
                  <div className="pet-register-button-fixed">
                    <button
                      className="pet-register-step-button"
                      onClick={handleNext}
                      disabled={
                        !petInfo.name || !petInfo.age || !petInfo.gender
                      }
                    >
                      다음으로
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="pet-register-step-content">
                    <p className="pet-register-step-indicator">3 / 4</p>
                    <h2 className="pet-register-title">
                      반려동물의 이미지를 등록해주세요
                    </h2>
                    <div className="pet-register-image-box">
                      {!petInfo.image ? (
                        <div className="pet-register-image-placeholder">
                          <label className="pet-register-file-button">
                            이미지 선택
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setPetInfo((prev) => ({
                                  ...prev,
                                  image: e.target.files[0],
                                }))
                              }
                            />
                          </label>
                        </div>
                      ) : (
                        <>
                          <div className="pet-register-image-preview">
                            <img
                              src={URL.createObjectURL(petInfo.image)}
                              alt="미리보기"
                            />
                          </div>
                          <button
                            type="button"
                            className="pet-register-file-clear"
                            onClick={() =>
                              setPetInfo((prev) => ({ ...prev, image: null }))
                            }
                          >
                            선택 해제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="pet-register-button-row">
                    <button
                      type="button"
                      className="pet-register-skip-button"
                      onClick={() => {
                        setPetInfo((prev) => ({ ...prev, image: "" }));
                        setStep(step + 1);
                      }}
                      disabled={!!petInfo.image}
                    >
                      건너뛰기
                    </button>
                    <button
                      className="pet-register-next-button"
                      onClick={() => setStep(step + 1)}
                      disabled={!petInfo.image}
                    >
                      다음으로
                    </button>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="pet-register-step-content">
                    <p className="pet-register-step-indicator">4 / 4</p>
                    <h2 className="pet-register-title">
                      마지막이예요! <br /> 반려동물에 대한 특징을 남겨주세요
                    </h2>
                    <div className="pet-register-content-textarea">
                      <textarea
                        name="memo"
                        value={petInfo.memo}
                        onChange={handleChange}
                        className="pet-register-textarea"
                        placeholder="메모를 입력해주세요"
                        rows={5}
                      />
                    </div>
                  </div>
                  <div className="pet-register-button-row">
                    <button
                      type="button"
                      className="pet-register-skip-button"
                      onClick={handleRegister}
                      disabled={!!petInfo.memo}
                    >
                      건너뛰고 등록하기
                    </button>
                    <button
                      className="pet-register-next-button"
                      onClick={handleRegister}
                      disabled={!petInfo.memo}
                    >
                      등록하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
};

export default PetRegister;
