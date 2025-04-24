import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Pet/PetRegister.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetRegister = ({ onClose, onRegisterSuccess }) => {
  const [petInfo, setPetInfo] = useState({
    speciesId: "",
    breedId: "",
    name: "",
    age: "",
    gender: "",
    image: "",
    memo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [breedOptions, setBreedOptions] = useState([]);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_BASE_URL}/pets/species`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        const speciesList = response.data.content || [];
        const formattedSpecies = speciesList.map((s) => ({
          value: s.speciesId,
          label: s.speciesName,
        }));
        setSpeciesOptions(formattedSpecies);
      } catch (err) {
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
        const breedList = response.data.content || [];
        const formattedBreeds = breedList.map((b) => ({
          value: b.breedId,
          label: b.breedName,
        }));
        setBreedOptions(formattedBreeds);
      } catch (err) {
        setError("품종 정보를 불러오지 못했습니다.");
      }
    };

    fetchBreeds();
  }, [petInfo.speciesId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('speciesId', petInfo.speciesId);
    formData.append('breedId', petInfo.breedId);
    formData.append('name', petInfo.name);
    formData.append('age', petInfo.age);
    formData.append('gender', petInfo.gender);
    formData.append('image', petInfo.image); 
    formData.append('memo', petInfo.memo);
  
    try {
      const token = localStorage.getItem('accessToken');
  
      const response = await axios.post(`${API_BASE_URL}/pets`, formData, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        alert('펫 등록 성공');
        onRegisterSuccess(response.data);
        onClose();
      } else {
        setError('펫 등록에 실패했습니다.');
      }
    } catch (err) {
      if (err.response?.data?.errorMessage) {
        setError(err.response.data.errorMessage);
      } else {
        setError('서버 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="petRegister-modal-overlay">
      <div className="petRegister-modal-content">
        <span className="petRegister-close" onClick={onClose}>
          &times;
        </span>
        <h1>펫 등록</h1>
        <form onSubmit={handleSubmit}>
          <div className="petRegister-form-group">
            <label>종:</label>
            <select
              name="speciesId"
              value={petInfo.speciesId}
              onChange={handleChange}
              required
            >
              <option value="">선택</option>
              {speciesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="petRegister-form-group">
            <label>품종:</label>
            <select
              name="breedId"
              value={petInfo.breedId}
              onChange={handleChange}
              required
            >
              <option value="">선택</option>
              {breedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="petRegister-form-group">
            <label>이름:</label>
            <input
              type="text"
              name="name"
              value={petInfo.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="petRegister-form-group">
            <label>나이:</label>
            <input
              type="number"
              name="age"
              value={petInfo.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className="petRegister-form-group">
            <label>성별:</label>
            <select
              name="gender"
              value={petInfo.gender}
              onChange={handleChange}
              required
            >
              <option value="">선택</option>
              <option value="MALE">남자</option>
              <option value="FEMALE">여자</option>
            </select>
          </div>
          <div className="petRegister-form-group">
            <label>이미지 URL:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) =>
                setPetInfo((prev) => ({ ...prev, image: e.target.files[0] }))
              }
            />
          </div>
          <div className="petRegister-form-group">
            <label>메모:</label>
            <textarea
              name="memo"
              value={petInfo.memo}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="petRegister-submit-button"
            disabled={loading}
          >
            {loading ? "등록 중..." : "등록"}
          </button>
          {error && <p className="petRegister-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default PetRegister;
