import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Pet/PetEdit.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetEdit = ({ pet, onClose, onUpdate }) => {
  const [step, setStep] = useState(1);
  const [petInfo, setPetInfo] = useState({
    speciesId: "",
    breedId: "",
    name: pet.name || "",
    age: pet.age || "",
    gender: pet.gender || "",
    image: "",
    memo: pet.memo || "",
  });
  const [previewUrl, setPreviewUrl] = useState(pet.image || "");
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [breedOptions, setBreedOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setPetInfo((prev) => ({ ...prev, speciesId: pet.speciesId }));
      } catch {
        setError("종 정보를 불러오지 못했습니다.");
      }
    };
    fetchSpecies();
  }, [pet.speciesId]);

  useEffect(() => {
    const fetchBreeds = async () => {
      if (!pet.speciesId && !petInfo.speciesId) return;
      try {
        const speciesId = petInfo.speciesId || pet.speciesId;
        const response = await axios.get(
          `${API_BASE_URL}/pets/breed/${speciesId}`
        );
        const list = response.data.content || [];
        const formatted = list.map((b) => ({
          value: b.breedId,
          label: b.breedName,
        }));
        setBreedOptions(formatted);
        setPetInfo((prev) => ({ ...prev, breedId: pet.breedId }));
      } catch {
        setError("품종 정보를 불러오지 못했습니다.");
      }
    };
    fetchBreeds();
  }, [pet.speciesId, petInfo.speciesId, pet.breedId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetInfo((prev) => ({
      ...prev,
      [name]:
        name === "age" || name === "speciesId" || name === "breedId"
          ? Number(value)
          : value,
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
    
        const requestBody = {
          name: petInfo.name,
          age: Number(petInfo.age),
          image: typeof petInfo.image === "string" ? petInfo.image : "", 
          memo: petInfo.memo || "",
        };
    
        const response = await axios.patch(
          `${API_BASE_URL}/pets/${pet.petId}`,
          requestBody,
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
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

  const isStep1Valid = petInfo.speciesId && petInfo.breedId;
  const isStep2Valid = petInfo.name && petInfo.age && petInfo.gender;

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
        <p className="petEdit-step-indicator">{step} / 4</p>

        <div className="petEdit-step-wrapper">
          <SwitchTransition>
            <CSSTransition key={step} timeout={300} classNames="fade">
              <div className="petEdit-step-content">
                {step === 1 && (
                  <>
                    <h2 className="petEdit-title">
                      반려동물의 종을 수정해주세요
                    </h2>
                    <div className="petEdit-step1-group">
                      <div className="petEdit-form-inline">
                        <label className="petEdit-inline-label">종</label>
                        <select
                          name="speciesId"
                          value={petInfo.speciesId}
                          onChange={handleChange}
                          className="petEdit-inline-select"
                          
                        >
                          <option value="">선택</option>
                          {speciesOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="petEdit-form-inline">
                        <label className="petEdit-inline-label">품종</label>
                        <select
                          name="breedId"
                          value={petInfo.breedId}
                          onChange={handleChange}
                          className="petEdit-inline-select"
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
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="petEdit-title">
                      반려동물의 기본 정보를 수정해주세요
                    </h2>
                    <div className="petEdit-step2-group">
                      <div className="petEdit-form-inline">
                        <input
                          type="text"
                          name="name"
                          value={petInfo.name}
                          onChange={handleChange}
                          className="petEdit-input"
                          placeholder="이름"
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
                      <div className="petEdit-form-inline">
                        <label className="petEdit-inline-label">성별</label>
                        <select
                          name="gender"
                          value={petInfo.gender}
                          onChange={handleChange}
                          className="petEdit-inline-select"
                        >
                          <option value="">선택</option>
                          <option value="MALE">남자</option>
                          <option value="FEMALE">여자</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
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

                {step === 4 && (
                  <>
                    <h2 className="petEdit-title">
                      마지막으로 반려동물의 특징을 적어주세요
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
              if (step < 4) setStep(step + 1);
              else handleSubmit();
            }}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 4 && loading)
            }
          >
            {step < 4 ? "다음" : loading ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetEdit;
