import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Pet/PetEdit.css'; 

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetEdit = ({ pet, onClose, onUpdate }) => {
    const [petInfo, setPetInfo] = useState({  // 반려동물의 정보
        speciesId: pet.speciesId || '',
        breedId: pet.breedId || '',
        name: pet.name || '',
        age: pet.age || '',
        gender: pet.gender || '',
        image: pet.image || '',
        memo: pet.memo || '',
    });
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 오류 메시지 상태

    const [speciesOptions, setSpeciesOptions] = useState([]);
    const [breedOptions, setBreedOptions] = useState([]);

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(`${API_BASE_URL}/pets/species`, {
                    headers: {
                        Authorization: `${token}`,
                      }
                });
                
                const speciesList = response.data.content || [];
                const formattedSpecies = speciesList.map((s) => ({
                    value: s.speciesId,
                    label: s.speciesName,
                }));
                setSpeciesOptions(formattedSpecies);
            } catch (err) {
                setError('종 정보를 불러오지 못했습니다.');
            }
        };

        fetchSpecies();
    }, []);

    useEffect(() => {
        const fetchBreeds = async () => {
            if (!petInfo.speciesId) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/pets/breed/${petInfo.speciesId}`);
                const breedList = response.data.content || [];
                const formattedBreeds = breedList.map((b) => ({
                    value: b.breedId,
                    label: b.breedName,
                }));
                setBreedOptions(formattedBreeds);
            } catch (err) {
                setError('품종 정보를 불러오지 못했습니다.');
            }
        };

        fetchBreeds();
    }, [petInfo.speciesId]);

    // 입력 필드의 값이 변경될 때 호출되는 함수
    const handleChange = (e) => { // e는 이벤트 객체
        const { name, value } = e.target; // 구조 분해 할당으로 이벤트 타겟의 name과 value 속성 추출
        setPetInfo((prev) => ({ // 현재 상태(prev = petInfo 객체)를 기반으로 새로운 상태를 설정
            ...prev, // 전개 연산자로 현재 상태의 모든 키-값 쌍을 복사
             [name]: name === 'age' ? value : name === 'speciesId' || name === 'breedId' ? Number(value) : value,
        }));
    };

    // 폼 제출 시 호출되는 함수
    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼의 기본 동작(페이지 새로 고침) 방지
        setLoading(true); // 로딩 시작
        setError(null); // 오류 초기화

        const formattedPetInfo = {
            speciesId: Number(petInfo.speciesId),
            breedId: Number(petInfo.breedId),
            name: petInfo.name,
            age: Number(petInfo.age),
            gender: petInfo.gender,
            image: petInfo.image,
            memo: petInfo.memo,
        };

        try {
            const token = localStorage.getItem('accessToken');

            if (token) {
                const response = await axios.patch(`${API_BASE_URL}/pets/${pet.petId}`, formattedPetInfo, {
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    onUpdate(formattedPetInfo);
                    onClose();
                } else {
                    setError('펫 정보 수정에 실패했습니다.');
                }
            } else {
                setError('토큰이 존재하지 않습니다.');
            }
        } catch (err) {
            setError('서버와의 통신에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="petEdit-modal-overlay"> 
            <div className="petEdit-modal-content"> 
                <h2>펫 정보 수정</h2> 
                <form onSubmit={handleSubmit}> 
                    <div className="petEdit-form-group">
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
                    <div className="petEdit-form-group">
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
                    <div className="petEdit-form-group">
                        <label>이름:</label>
                        <input
                            type="text"
                            name="name"
                            value={petInfo.name}
                            onChange={handleChange} // 입력값 변경 시 handleChange 호출
                            required
                        />
                    </div>
                    <div className="petEdit-form-group">
                        <label>나이:</label>
                        <input
                            type="number"
                            name="age"
                            value={petInfo.age}
                            onChange={handleChange} // 입력값 변경 시 handleChange 호출
                            required
                        />
                    </div>
                    <div className="petEdit-form-group">
                        <label>성별:</label>
                        <select
                            name="gender"
                            value={petInfo.gender}
                            onChange={handleChange} // 입력값 변경 시 handleChange 호출
                            required
                        >
                            <option value="male">남자</option>
                            <option value="female">여자</option>
                        </select>
                    </div>
                    <div className="petEdit-form-group">
                        <label>이미지 URL:</label>
                        <input
                            type="text"
                            name="image"
                            value={petInfo.image}
                            onChange={handleChange} // 입력값 변경 시 handleChange 호출
                        />
                    </div>
                    <div className="petEdit-form-group">
                        <label>메모:</label>
                        <textarea
                            name="memo"
                            value={petInfo.memo}
                            onChange={handleChange} // 입력값 변경 시 handleChange 호출
                        />
                    </div>
                    <button type="submit" className="petEdit-submit-button" disabled={loading}>
                        {loading ? '수정 중...' : '수정하기'} {/* 로딩 상태에 따른 버튼 텍스트 */}
                    </button>
                    {error && <p className="petEdit-error">{error}</p>}
                </form>
                <button onClick={onClose} className="petEdit-close-button">닫기</button>
            </div>
        </div>
    );
};

export default PetEdit; 
