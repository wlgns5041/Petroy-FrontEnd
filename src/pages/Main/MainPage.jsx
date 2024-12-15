import React, { useState, useEffect } from 'react';
import CalendarComponent from '../../components/commons/CalendarComponent.jsx';
import NavBar from '../../components/commons/NavBar.jsx';
import CategoryModal from '../../components/Schedule/CategoryModal.jsx';
import ScheduleModal from '../../components/Schedule/ScheduleModal.jsx';
import ScheduleDetailModal from '../../components/Schedule/ScheduleDetailModal.jsx'; 
import { fetchMemberPets } from '../../services/TokenService.jsx';
import axios from 'axios';
import '../../styles/Main/MainPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

function MainPage() {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isScheduleDetailModalOpen, setIsScheduleDetailModalOpen] = useState(false); 
    const [pets, setPets] = useState([]);
    const [careGiverPets, setCareGiverPets] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPets, setSelectedPets] = useState(new Set());
    const [selectedSchedules, setSelectedSchedules] = useState({}); 
    const [selectedScheduleId, setSelectedScheduleId] = useState(null); 
    const [selectedCategories, setSelectedCategories] = useState(new Set()); 
    const [sortOrder, setSortOrder] = useState('recent');
    const [selectedDate, setSelectedDate] = useState(null);

        const loadPets = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await fetchMemberPets(token);
                    if (response && response.content) {
                        setPets(response.content);
                        console.log('내 반려동물 데이터:', response.content);
                    } else {
                        setPets([]); 
                    }
                } catch (error) {
                    console.error('반려동물 로딩 중 오류 발생:', error);
                    setPets([]); 
                    setError('반려동물 정보를 불러오는 중 오류 발생');
                }
            } else {
                setError('로그인이 필요합니다.');
                setPets([]); 
            }
            setLoading(false); 
        };

        const loadCareGiverPets = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/pets/caregiver`, {
                        headers: {
                            'Authorization': `${token}`,
                        },
                    });

                    if (response.status === 200) {
                        setCareGiverPets(response.data.content || []);
                        console.log('돌보미 반려동물 데이터:', response.data.content || []);
                    } else {
                        setCareGiverPets([]); 
                        setError(response.data.errorMessage || '돌보미 반려동물 목록을 불러오는 중 오류가 발생했습니다.');
                    }
                } catch (err) {
                    console.error('돌보미 반려동물 로딩 중 오류 발생:', err);
                    setCareGiverPets([]); 
                    setError('API 호출 중 오류가 발생했습니다.');
                }
            } else {
                setError('로그인이 필요합니다.');
                setCareGiverPets([]); 
            }
            setLoading(false); 
        };

        const loadCategories = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/schedules/category`, {
                        headers: {
                            'Authorization': `${token}` 
                        }
                    });
                    if (response.status === 200) {
                        setCategories(response.data.content || []);
                    } else {
                        setError(response.data.errorMessage || '카테고리를 불러오는 중 오류 발생');
                    }
                } catch (err) {
                    console.error('카테고리 로딩 중 오류 발생:', err);
                    setError('카테고리 정보를 불러오는 중 오류 발생');
                }
            } else {
                setError('로그인이 필요합니다.');
            }
        };

        const loadSchedules = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/schedules`, {
                        headers: {
                            'Authorization': `${token}`,
                        },
                    });

                    if (response.status === 200) {
                        const schedulesData = response.data.content || [];

                        const formattedSchedules = schedulesData.flatMap(schedule => 
                            schedule.dateInfo.map(dateInfo => ({
                                categoryId: schedule.categoryId,
                                scheduleId: schedule.scheduleId,
                                title: schedule.title,
                                priority: schedule.priority,
                                petName: schedule.petName,
                                date: new Date(dateInfo.date),
                                status: dateInfo.status,
                            }))
                        );

                        console.log('일정 목록 데이터:', formattedSchedules || []);

                        setSchedules(formattedSchedules);
                    } else {
                        setError(response.data.message || '일정을 불러오는 데 실패했습니다.');
                    }
                } catch (err) {
                    console.error('일정 로딩 중 오류 발생:', err.response ? err.response.data : err);
                    setError(err.response ? err.response.data.message : '네트워크 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('로그인이 필요합니다.');
                setLoading(false);
            }
        };      

    useEffect(() => {
        loadPets();
        loadCareGiverPets();
        loadCategories(); 
        loadSchedules();
    }, []);

    const handleCategoryCreated = () => {
        loadCategories(); // 카테고리가 생성된 후 카테고리 다시 로드
    };

    const handleScheduleCreated = () => {
        loadSchedules(); // 일정이 생성된 후 일정을 다시 로드
    };
    
    const handlePetCheckboxChange = (petName) => {
        const newSelectedPets = new Set(selectedPets);
        if (newSelectedPets.has(petName)) {
            newSelectedPets.delete(petName);
        } else {
            newSelectedPets.add(petName); 
        }
        setSelectedPets(newSelectedPets);
        
        const updatedSchedules = {};
        schedules.forEach(schedule => {
            const key = `${schedule.scheduleId}-${schedule.date}`;
            if (newSelectedPets.has(schedule.petName[0])) { 
                updatedSchedules[key] = true; 
            } else if (selectedSchedules[key] && schedule.petName[0] === petName) {
                updatedSchedules[key] = false; 
            } else {
                updatedSchedules[key] = selectedSchedules[key]; 
            }
        });
    
        setSelectedSchedules(prev => ({
            ...prev,
            ...updatedSchedules,
        }));
    };
    
    const handleCareGiverCheckboxChange = (petName) => {
        const newSelectedPets = new Set(selectedPets);
        if (newSelectedPets.has(petName)) {
            newSelectedPets.delete(petName); 
        } else {
            newSelectedPets.add(petName); 
        }
        setSelectedPets(newSelectedPets);
        
        const updatedSchedules = {};
        schedules.forEach(schedule => {
            const key = `${schedule.scheduleId}-${schedule.date}`;
            if (newSelectedPets.has(schedule.petName[0])) { 
                updatedSchedules[key] = true; 
            } else if (selectedSchedules[key] && schedule.petName[0] === petName) {
                updatedSchedules[key] = false; 
            } else {
                updatedSchedules[key] = selectedSchedules[key];
            }
        });
    
        setSelectedSchedules(prev => ({
            ...prev,
            ...updatedSchedules,
        }));
    };
    
    const handleCategoryCheckboxChange = (categoryId) => {
        const newSelectedCategories = new Set(selectedCategories);
        if (newSelectedCategories.has(categoryId)) {
            newSelectedCategories.delete(categoryId); 
        } else {
            newSelectedCategories.add(categoryId); 
        }
        setSelectedCategories(newSelectedCategories);
    
        const updatedSchedules = {};
        schedules.forEach(schedule => {
            const key = `${schedule.scheduleId}-${schedule.date}`;
            if (newSelectedCategories.has(schedule.categoryId)) {
                updatedSchedules[key] = true; 
            } else if (selectedSchedules[key] && schedule.categoryId === categoryId) {
                updatedSchedules[key] = false; 
            } else {
                updatedSchedules[key] = selectedSchedules[key]; 
            }
        });
    
        setSelectedSchedules(prev => ({
            ...prev,
            ...updatedSchedules,
        }));
    };
    

    const handleScheduleCheckboxChange = (scheduleId, date) => {
        const key = `${scheduleId}-${date}`;
        setSelectedSchedules(prevSelectedSchedules => ({
            ...prevSelectedSchedules,
            [key]: !prevSelectedSchedules[key], 
        }));
    };

    const getFilteredSchedules = () => {
        return schedules.filter(schedule => {
            const key = `${schedule.scheduleId}-${schedule.date}`;
            return selectedSchedules[key]; 
        });
    };

    const openCategoryModal = () => setIsCategoryModalOpen(true);
    const closeCategoryModal = () => setIsCategoryModalOpen(false);
    const openScheduleModal = () => setIsScheduleModalOpen(true);
    const closeScheduleModal = () => setIsScheduleModalOpen(false);
    
    const openScheduleDetailModal = (scheduleId, date) => {
        setSelectedScheduleId(scheduleId);
        setSelectedDate(date); 
        setIsScheduleDetailModalOpen(true); 
    };
    
    const closeScheduleDetailModal = () => {
        setIsScheduleDetailModalOpen(false); 
        setSelectedScheduleId(null); 
    };
    
    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'LOW':
                return '낮음';
            case 'MEDIUM':
                return '중간';
            case 'HIGH':
                return '높음';
            default:
                return '미지정';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ONGOING':
                return '진행중';
            case 'DONE':
                return '완료';
            case 'DELETED':
                return '삭제됨';
            default:
                return '미지정';
        }
    };
    
    return (
        <div className="main-page">
            <NavBar title="메인페이지" />

            <div className="left-section">
            <div className="button-container">
                    <button onClick={openCategoryModal} className="create-category-button">
                        일정 카테고리 생성
                    </button>
                    <button onClick={openScheduleModal} className="create-schedule-button">
                        일정 생성
                    </button>
                </div>

                <div className="category-section">
                    <h3>일정 카테고리</h3>
                    {categories.length > 0 ? (
                        <ul className="category-list">
                            {categories.map((category) => (
                                <li key={category.categoryId} className="category-item">
                                    <div className="category-info-content">
                                        <strong>{category.name}</strong>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.has(category.categoryId)}
                                        onChange={() => handleCategoryCheckboxChange(category.categoryId)}
                                        className="category-checkbox"
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>등록된 카테고리가 없습니다.</p>
                    )}
                </div>

                {loading && <p>로딩 중...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && (
                    <>
                        <div className="my-pets-section">
                            <h3>내 반려동물</h3>
                            {pets.length > 0 ? (
                                pets.map((pet) => (
                                    <div key={pet.petId} className="pet-info-item">
                                        <div className="pet-info-content">
                                            <strong>{pet.name}</strong> ({pet.breed})
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedPets.has(pet.name)}
                                            onChange={() => handlePetCheckboxChange(pet.name)}
                                            className="pet-checkbox"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="no-data-message">등록된 반려동물이 없습니다.</div> 
                            )}
                        </div>

                        <div className="care-giver-pets-section">
                            <h3>돌보미 반려동물</h3>
                            {careGiverPets.length > 0 ? (
                                careGiverPets.map((pet) => (
                                    <div key={pet.petId} className="care-giver-pet-item">
                                        <div className="pet-info-content">
                                            <strong>{pet.name}</strong> ({pet.breed})
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedPets.has(pet.name)}
                                            onChange={() => handleCareGiverCheckboxChange(pet.name)}
                                            className="pet-checkbox"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="no-data-message">등록된 돌보미 반려동물이 없습니다.</div> 
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="schedule-list">
                <h3>일정 목록</h3>
                <div className="sort-select">
                    <label htmlFor="sortOrder">정렬 기준 : </label>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="recent">최근 생성순</option>
                        <option value="date">날짜순</option>
                    </select>
                </div>
                {loading ? (
                    <p>로딩 중...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : schedules.length > 0 ? (
                    <div className="schedule-list-content">
                        {schedules.map((schedule) => (
                            <div key={`${schedule.scheduleId}-${schedule.date}`} className="schedule-item" onClick={() => openScheduleDetailModal(schedule.scheduleId, schedule.date)}>
                                <div className="schedule-title">
                                    <input
                                        type="checkbox"
                                        checked={selectedSchedules[`${schedule.scheduleId}-${schedule.date}`] || false} 
                                        onClick={(e) => e.stopPropagation()} 
                                        onChange={() => handleScheduleCheckboxChange(schedule.scheduleId, schedule.date)}
                                        className="schedule-checkbox"
                                    />
                                    <h4>{schedule.title}</h4>
                                </div>
                                <p>날짜: {schedule.date.toLocaleString()}</p>
                                <p>반려동물: {schedule.petName}</p>
                                <p>우선순위: {getPriorityLabel(schedule.priority)}</p>
                                <p>상태: {getStatusLabel(schedule.status)}</p> 
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>등록된 일정이 없습니다.</p>
                )}
            </div>

            <div className="right-section">
                <CalendarComponent 
                    schedules={getFilteredSchedules()} 
                    selectedDates={Object.keys(selectedSchedules).filter(key => selectedSchedules[key])} 
                />
            </div>

            <CategoryModal 
                isOpen={isCategoryModalOpen} 
                onRequestClose={closeCategoryModal} 
                onCategoryCreated={handleCategoryCreated} 
            />

            {isScheduleModalOpen && (
                <ScheduleModal 
                    onClose={closeScheduleModal} 
                    pets={[...pets, ...careGiverPets]} 
                    onScheduleCreated={handleScheduleCreated}
                />
            )}

            <ScheduleDetailModal 
                isOpen={isScheduleDetailModalOpen} 
                onRequestClose={closeScheduleDetailModal} 
                scheduleId={selectedScheduleId} 
                selectedDate={selectedDate}
            />
        </div>
    );
}    

export default MainPage;

