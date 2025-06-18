import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Pet/PetRegister.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import dogChihuahua from "../../assets/icons/dog-chihuahua.png";
import dogJindo from "../../assets/icons/dog-jindo.png";
import dogPomeranian from "../../assets/icons/dog-pomeranian.png";
import catCheese from "../../assets/icons/cat-cheese.png";
import catMunchkin from "../../assets/icons/cat-munchkin.png";
import catRussianBlue from "../../assets/icons/cat-russianblue.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetRegister = ({ onClose, onRegisterSuccess }) => {
  const [step, setStep] = useState(1);
  const [petInfo, setPetInfo] = useState({
    speciesId: "",
    breedId: "",
    name: "",
    age: "",
    gender: "",
    image: null,
    memo: "",
  });

  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [breedOptions, setBreedOptions] = useState([]);
  const [error, setError] = useState(null);

  const defaultImageMap = {
    "강아지-포메라니안": dogPomeranian,
    "강아지-치와와": dogChihuahua,
    "강아지-진돗개": dogJindo,
    "고양이-치즈": catCheese,
    "고양이-먼치킨": catMunchkin,
    "고양이-러시안블루": catRussianBlue,
  };

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_BASE_URL}/pets/species`, {
          headers: { Authorization: `${token}` },
        });
        const list = response.data.content || [];
        const formatted = list.map((s) => ({
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
        const response = await axios.get(
          `${API_BASE_URL}/pets/breed/${petInfo.speciesId}`
        );
        const list = response.data.content || [];
        const formatted = list.map((b) => ({
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
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("speciesId", petInfo.speciesId);
      formData.append("breedId", petInfo.breedId);
      formData.append("name", petInfo.name);
      formData.append("age", petInfo.age);
      formData.append("gender", petInfo.gender);
      formData.append("memo", petInfo.memo || "");
      if (petInfo.image) {
        formData.append("image", petInfo.image);
      } else {
        const speciesLabel = speciesOptions.find(s => s.value === petInfo.speciesId)?.label;
        const breedLabel = breedOptions.find(b => b.value === petInfo.breedId)?.label;
        const key = `${speciesLabel}-${breedLabel}`;
        const fallbackImage = defaultImageMap[key];
      
        if (fallbackImage) {
          const response = await fetch(fallbackImage);
          const blob = await response.blob();
          const defaultFile = new File([blob], "default.png", { type: blob.type });
          formData.append("image", defaultFile);
        } else {
          const dummyFile = new File(["placeholder"], "placeholder.png", {
            type: "image/png",
          });
          formData.append("image", dummyFile);
        }
      }

      await axios.post(`${API_BASE_URL}/pets`, formData, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("반려동물이 성공적으로 등록되었습니다.");
      if (onRegisterSuccess) onRegisterSuccess();
      onClose();
    } catch (err) {
      alert("등록 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="petRegister-modal-overlay">
      <div className="petRegister-modal-content">
        <button className="petRegister-close" onClick={onClose}>
          &times;
        </button>
        {step !== 1 && (
          <button
            className="petRegister-back-button"
            onClick={() => setStep(step - 1)}
          >
            &#x2039;
          </button>
        )}
        <SwitchTransition>
          <CSSTransition key={step} timeout={300} classNames="fade">
            <div className="petRegister-step-wrapper">
              {/* 1단계 */}
              {step === 1 && (
                <>
                  <p className="petRegister-step-indicator">1 / 4</p>
                  <h2 className="petRegister-title">
                    반려동물의 종을 선택해주세요
                  </h2>

                  {/* 종 선택 */}
                  <div className="petRegister-form-inline">
                    <label className="petRegister-inline-label">종</label>
                    <select
                      name="speciesId"
                      value={petInfo.speciesId}
                      onChange={handleChange}
                      className="petRegister-inline-select"
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
                  <div className="petRegister-form-inline">
                    <label className="petRegister-inline-label">품종</label>
                    <select
                      name="breedId"
                      value={petInfo.breedId}
                      onChange={handleChange}
                      className="petRegister-inline-select"
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

                  <button
                    className="petRegister-step-button"
                    onClick={handleNext}
                  >
                    다음으로
                  </button>
                  {error && <p className="petRegister-error">{error}</p>}
                </>
              )}

              {/* 2단계 */}
              {step === 2 && (
                <>
                  <p className="petRegister-step-indicator">2 / 4</p>
                  <h2 className="petRegister-title">
                    이름, 나이, 성별을 입력해주세요
                  </h2>

                  {/* 이름 */}
                  <div className="petRegister-form-inline">
                    <input
                      type="text"
                      name="name"
                      value={petInfo.name}
                      onChange={handleChange}
                      className="petRegister-input"
                      placeholder="반려동물 이름"
                    />
                  </div>

                  {/* 나이 */}
                  <div className="petRegister-form-inline">
                    <label className="petRegister-inline-label">나이</label>
                    <select
                      name="age"
                      value={petInfo.age}
                      onChange={handleChange}
                      className="petRegister-inline-select"
                    >
                      <option value="">선택</option>
                      {Array.from({ length: 20 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} 살
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 성별 */}
                  <div className="petRegister-form-inline">
                    <label className="petRegister-inline-label">성별</label>
                    <select
                      name="gender"
                      value={petInfo.gender}
                      onChange={handleChange}
                      className="petRegister-inline-select"
                    >
                      <option value="">선택</option>
                      <option value="MALE">남자</option>
                      <option value="FEMALE">여자</option>
                    </select>
                  </div>

                  <button
                    className="petRegister-step-button"
                    onClick={handleNext}
                  >
                    다음으로
                  </button>
                </>
              )}

              {/* 3단계 */}
              {step === 3 && (
                <>
                  <p className="petRegister-step-indicator">3 / 4</p>
                  <h2 className="petRegister-title">
                    반려동물의 이미지를 등록해주세요
                  </h2>

                  <div className="petRegister-image-box">
                    {!petInfo.image ? (
                      <div className="petRegister-image-placeholder">
                        <label className="petRegister-file-button">
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
                        <div className="petRegister-image-preview">
                          <img
                            src={URL.createObjectURL(petInfo.image)}
                            alt="미리보기"
                          />
                        </div>
                        <button
                          type="button"
                          className="petRegister-file-clear"
                          onClick={() =>
                            setPetInfo((prev) => ({
                              ...prev,
                              image: null,
                            }))
                          }
                        >
                          선택 해제
                        </button>
                      </>
                    )}
                  </div>

                  <div className="petRegister-button-row">
                    <button
                      type="button"
                      className="petRegister-skip-button"
                      onClick={() => setStep(step + 1)}
                      disabled={!!petInfo.image}
                    >
                      건너뛰기
                    </button>
                    <button
                      className="petRegister-next-button"
                      onClick={() => setStep(step + 1)}
                      disabled={!petInfo.image}
                    >
                      다음으로
                    </button>
                  </div>
                </>
              )}

              {/* 4단계 */}
              {step === 4 && (
                <>
                  <p className="petRegister-step-indicator">4 / 4</p>
                  <h2 className="petRegister-title">
                    반려동물에 대한 메모를 남겨주세요
                  </h2>

                  <div className="petRegister-form-inline">
                    <textarea
                      name="memo"
                      value={petInfo.memo}
                      onChange={handleChange}
                      className="petRegister-textarea"
                      placeholder="메모를 입력해주세요 (선택사항)"
                      rows={5}
                    />
                  </div>

                  <div className="petRegister-button-row">
                    <button
                      type="button"
                      className="petRegister-skip-button"
                      onClick={handleRegister}
                      disabled={!!petInfo.memo}
                    >
                      건너뛰고 등록하기
                    </button>
                    <button
                      className="petRegister-next-button"
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
        </SwitchTransition>{" "}
      </div>
    </div>
  );
};

export default PetRegister;
