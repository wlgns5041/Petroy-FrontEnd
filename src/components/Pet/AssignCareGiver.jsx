import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultProfilePic from '../../assets/images/DefaultImage.png';
import '../../styles/Pet/AssignCareGiver.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AssignCareGiver = ({ pet, onClose, onAssignCareGiver }) => {
    const [friends, setFriends] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            const token = localStorage.getItem('accessToken');

            try {
                const response = await axios.get(`${API_BASE_URL}/friends`, {
                    params: { status: 'ACCEPTED' },
                    headers: {
                        'Authorization': `${token}`,
                    },
                });

                setFriends(response.data.content || []);
            } catch (err) {
                setError('친구 목록을 불러오는 중 오류가 발생했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    const handleAssign = async (careGiverId) => {
        const token = localStorage.getItem('accessToken');
    
        try {
            const response = await axios.post(
                `${API_BASE_URL}/caregivers/${pet.petId}`, 
                {}, 
                {
                    headers: {
                        'Authorization': `${token}`,
                    },
                    params: { memberId: careGiverId }, 
                }
            );
    
            if (response.status === 200) {
                onAssignCareGiver(careGiverId); 
                onClose(); 
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.errorMessage || '오류가 발생했습니다.');
            } else {
                setError('오류가 발생했습니다.');
            }
            console.error(err);
        }
    };


    return (
        <div className="assignCareGiverModal">
            <div className="assignCareGiverModalContent">
                <h2>{pet.name}에 돌보미 등록하기</h2>
                {loading ? (
                    <p>로딩 중...</p>
                ) : error ? (
                    <p className="assignCareGiverError">{error}</p>
                ) : friends.length > 0 ? (
                    <div className="assignCareGiverFriendsList">
                        {friends.map((friend) => (
                            <div key={friend.id} className="assignCareGiverFriendCard">
                                <img
                                    src={friend.image || defaultProfilePic}
                                    alt={friend.name}
                                    className="assignCareGiverFriendImage"
                                />
                                <h2>{friend.name}</h2>
                                <button
                                    onClick={() => handleAssign(friend.id)}
                                    className="assignCareGiverButton"
                                >
                                    돌보미 등록
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>등록된 친구가 없습니다.</p>
                )}
                <button onClick={onClose} className="assignCareGiverCloseButton">닫기</button>
            </div>
        </div>
    );
};

export default AssignCareGiver;
