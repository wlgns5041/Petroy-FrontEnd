import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultPetPic from '../../assets/images/DefaultImage.png';
import '../../styles/Pet/CareGiverList.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const CareGiverList = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCareGiverList = async () => {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                setError('로그인이 필요합니다');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/pets/caregiver`, {
                    headers: {
                        'Authorization': `${token}`,
                    },
                });

                if (response.status === 200) {
                    setPets(response.data.content || []);
                } else {
                    setError(response.data.errorMessage || '반려동물 목록을 불러오는 중 오류가 발생했습니다.');
                }
            } catch (err) {
                const errorMessage = err.response?.data?.errorMessage || 'API 호출 중 오류가 발생했습니다.';
                setError(errorMessage);
                console.error('API 호출 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCareGiverList();
    }, []);

    return (
        <div className="careGiverPetsContainer">
            <h2 className="careGiverPetsHeader">돌보미로 등록된 반려동물 목록</h2>
            {loading ? (
                <p>로딩 중...</p>
            ) : error ? (
                <p className="careGiverPetsError">{error}</p>
            ) : pets.length > 0 ? (
                <div className="careGiverPetsList">
                    {pets.map((pet) => (
                        <div key={pet.petId} className="careGiverPetCard">
                            <img
                                src={pet.image || defaultPetPic}
                                alt={pet.name}
                                className="careGiverPetImage"
                            />
                            <h3>{pet.name}</h3>
                            <p>종: {pet.species}</p>
                            <p>품종: {pet.breed}</p>
                            <p>나이: {pet.age}세</p>
                            <p>성별: {pet.gender === 'MALE' ? '남자' : '여자'}</p>
                            <p>메모: {pet.memo}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>돌보미로 등록된 반려동물이 없습니다.</p>
            )}
        </div>
    );
};

export default CareGiverList;
