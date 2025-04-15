import React, { useState, useEffect } from 'react';
import CalendarComponent from '../../components/commons/CalendarComponent.jsx';
import NavBar from '../../components/commons/NavBar.jsx';
import CategoryModal from '../../components/Schedule/CategoryModal.jsx';
import ScheduleModal from '../../components/Schedule/ScheduleModal.jsx';
import ScheduleDetailModal from '../../components/Schedule/ScheduleDetailModal.jsx'; 
import { fetchMemberPets } from '../../services/TokenService.jsx';
import axios from 'axios';
import '../../styles/Main/MainPage.css';
import InfoIcon from '@mui/icons-material/Info';
import ClearIcon from '@mui/icons-material/Clear';

const API_BASE_URL = process.env.REACT_APP_API_URL;

function MainPage() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleDetailModalOpen, setIsScheduleDetailModalOpen] = useState(false);
  const [pets, setPets] = useState([]);
  const [careGiverPets, setCareGiverPets] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); 
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedMyPets, setSelectedMyPets] = useState(new Set());
  const [selectedCareGiverPets, setSelectedCareGiverPets] = useState(new Set());
  const [selectedSchedules, setSelectedSchedules] = useState(new Set());

  const loadPets = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await fetchMemberPets(token);
        if (response && response.content) {
          setPets(response.content);
        }
      } catch (err) {
        console.error('내 반려동물 오류', err);
      }
    }
  };

  const loadCareGiverPets = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/pets/caregiver`, {
          headers: { Authorization: `${token}` },
        });
        setCareGiverPets(response.data.content || []);
      } catch (err) {
        console.error('돌보미 반려동물 오류', err);
      }
    }
  };

  const loadCategories = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/schedules/category`, {
          headers: { Authorization: `${token}` },
        });
        setCategories(response.data.content || []);
      } catch (err) {
        console.error('카테고리 오류', err);
      }
    }
  };

  const loadSchedules = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/schedules`, {
          headers: { Authorization: `${token}` },
        });
        const schedulesData = response.data.content || [];
        const flatSchedules = schedulesData.flatMap(schedule =>
          schedule.dateInfo.map(info => ({
            ...schedule,
            date: new Date(info.date),
            status: info.status,
            petId: schedule.petId,
          }))
        );
        setSchedules(flatSchedules);
      } catch (err) {
        console.error('일정 불러오기 오류', err);
      }
    }
  };

  const deleteCategory = async (categoryId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
  
    const confirmDelete = window.confirm('카테고리를 삭제하시겠습니까?');
    if (!confirmDelete) return;
  
    try {
      const response = await axios.delete(`${API_BASE_URL}/schedules/category/${categoryId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
  
      if (response.data === true) {
        alert('카테고리가 삭제되었습니다.');
        loadCategories();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('카테고리 삭제 오류:', err);
      alert('해당 카테고리에 대한 일정이 존재하여 삭제에 실패하였습니다.');
    }
  };

  useEffect(() => {
    loadPets();
    loadCareGiverPets();
    loadCategories();
    loadSchedules();
  }, []);

  const openCategoryModal = () => setIsCategoryModalOpen(true);
  const closeCategoryModal = () => setIsCategoryModalOpen(false);
  const openScheduleModal = () => setIsScheduleModalOpen(true);
  const closeScheduleModal = () => setIsScheduleModalOpen(false);
  const openScheduleDetailModal = (id, date) => {
    setSelectedScheduleId(id);
    setSelectedDate(date);
    setIsScheduleDetailModalOpen(true);
  };
  const closeScheduleDetailModal = () => setIsScheduleDetailModalOpen(false);

/* --------------------------------------- 카테고리 선택 로직 --------------------------------------- */
  const isCategorySelected = (id) => selectedCategories.has(id);

  const toggleCategory = (id) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCategories(newSet);
  };

  const selectAllCategories = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set()); 
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.categoryId))); 
    }
  };

/* --------------------------------------- 펫(돌보미포함) 선택 로직 --------------------------------------- */
  
const isMyPetSelected = (id) => selectedMyPets.has(id);
const isCareGiverPetSelected = (id) => selectedCareGiverPets.has(id);

const toggleMyPet = (id) => {
    const newSet = new Set(selectedMyPets);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedMyPets(newSet);
  };

const toggleCareGiverPet = (id) => {
  const newSet = new Set(selectedCareGiverPets);
  newSet.has(id) ? newSet.delete(id) : newSet.add(id);
  setSelectedCareGiverPets(newSet);
};

const selectAllMyPets = () => {
    if (selectedMyPets.size === pets.length) {
      setSelectedMyPets(new Set());
    } else {
      setSelectedMyPets(new Set(pets.map(p => p.petId)));
    }
  };

  const selectAllCareGiverPets = () => {
    if (selectedCareGiverPets.size === careGiverPets.length) {
      setSelectedCareGiverPets(new Set());
    } else {
      setSelectedCareGiverPets(new Set(careGiverPets.map(p => p.petId)));
    }
  };

  /* --------------------------------------- 일정 선택 로직 --------------------------------------- */

  const getScheduleKey = (s) => `${s.scheduleId}-${s.date}`;
  const isScheduleSelected = (key) => selectedSchedules.has(key);

  const toggleSchedule = (key) => {
    const newSet = new Set(selectedSchedules);
    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
    setSelectedSchedules(newSet);
  };  

  const selectAllSchedules = () => {
    const allKeys = schedules.map(getScheduleKey);
    const allSelected = allKeys.every((key) => selectedSchedules.has(key));
    setSelectedSchedules(allSelected ? new Set() : new Set(allKeys));
  };

  /* --------------------------------------- 캘린더로 넘기기 --------------------------------------- */

const filteredSchedules = schedules.filter((s) => {
    const key = `${s.scheduleId}-${s.date}`;
    const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(s.categoryId);
  
    const schedulePetIds = Array.isArray(s.petId) ? s.petId : [s.petId];
    const petMatch =
      selectedMyPets.size === 0 && selectedCareGiverPets.size === 0
        ? true
        : schedulePetIds.some(pid => selectedMyPets.has(pid)) ||
          schedulePetIds.some(pid => selectedCareGiverPets.has(pid));
  
    const scheduleMatch = selectedSchedules.size === 0 || selectedSchedules.has(key);
  
    return categoryMatch && petMatch && scheduleMatch;
  });

  return (
    <div className="main-page">
      <NavBar title="메인페이지" />
  
      <div className="calendar-layout">
        <div className="calendar-body">
          <div className="calendar-sidebar">
            <div className="calendar-buttons-sidebar">
              <button className="calendar-add-btn" onClick={openCategoryModal}>카테고리 생성</button>
              <button className="calendar-add-btn" onClick={openScheduleModal}>일정 생성</button>
            </div>
  
            {/* 카테고리 섹션 */}
            <div className="filter-card fixed-title">
  <div className="filter-title-row">
    <h4 className="filter-title">내 카테고리 <span className="item-count">{categories.length}</span></h4>
    <button className="select-all-button" onClick={selectAllCategories}>전체선택</button>
  </div>

  <div className="filter-scroll-area">
    <div className="category-grid">
    {categories.map((c) => (
  <div
    key={c.categoryId}
    className={`filter-item ${isCategorySelected(c.categoryId) ? 'selected' : ''}`}
    onClick={() => toggleCategory(c.categoryId)}
  >
    <span className="category-name">{c.name}</span>
    <ClearIcon
      className="delete-icon"
      fontSize="small"
      onClick={(e) => {
        e.stopPropagation(); // X 클릭 시 선택 이벤트 방지
        deleteCategory(c.categoryId);
      }}
    />
  </div>
))}
    </div>
  </div>
</div>
            
            {/* 반려동물 섹션 */}
            <div className="pets-grid">
            <div className="filter-card fixed-title">
  <div className="filter-title-row">
    <h4 className="filter-title">내 반려동물 <span className="item-count">{pets.length}</span></h4>
    <button className="select-all-button" onClick={selectAllMyPets}>전체선택</button>
  </div>
  <div className="filter-scroll-area">
    {pets.map((p) => (
      <div
        key={p.petId}
        className={`filter-item ${isMyPetSelected(p.petId) ? 'selected' : ''}`}
        onClick={() => toggleMyPet(p.petId)}
      >
        {p.name} ({p.breed})
      </div>
    ))}
  </div>
</div>
  
<div className="filter-card fixed-title">
  <div className="filter-title-row">
    <h4 className="filter-title">돌보미 반려동물 <span className="item-count">{careGiverPets.length}</span></h4>
    <button className="select-all-button" onClick={selectAllCareGiverPets}>전체선택</button>
  </div>
  <div className="filter-scroll-area">
    {careGiverPets.map((p) => (
      <div
        key={p.petId}
        className={`filter-item ${isCareGiverPetSelected(p.petId) ? 'selected' : ''}`}
        onClick={() => toggleCareGiverPet(p.petId)}
      >
        {p.name} ({p.breed})
      </div>
    ))}
  </div>
</div>
            </div>
  
            {/* 일정 목록 */}
            <div className="filter-card fixed-title schedule-list">
  <div className="filter-title-row">
    <h4 className="filter-title">
      일정 목록 <span className="item-count">{schedules.length}</span>
    </h4>
    <button className="select-all-button" onClick={selectAllSchedules}>
      전체선택
    </button>
  </div>

  <div className="filter-scroll-area schedule-scroll-grid">
  {[...schedules]
  .sort((b, a) => new Date(a.date) - new Date(b.date))
  .map((s) => {
  const key = `${s.scheduleId}-${s.date}`;
  const isSelected = isScheduleSelected(key);

  return (
    <div
      key={key}
      className={`schedule-list-item ${isSelected ? 'selected' : ''}`}
      onClick={() => toggleSchedule(key)} 
    >
      <button
        className="detail-icon-button"
        onClick={(e) => {
          e.stopPropagation(); 
          openScheduleDetailModal(s.scheduleId, s.date);
        }}
      >
        <InfoIcon fontSize="small" />
      </button>

      <p>{s.title}</p>
      <small>{s.date.toLocaleString()}</small>
    </div>
  );
})}
  </div>
</div>
          </div>
  
          {/* 캘린더 본문 */}
          <div className="calendar-main">
          <CalendarComponent filteredSchedules={filteredSchedules} />
          </div>
        </div>
      </div>
  
      {/* 모달들 */}
      {isScheduleModalOpen && (
        <ScheduleModal
          onClose={closeScheduleModal}
          pets={[...pets, ...careGiverPets]}
          onScheduleCreated={loadSchedules}
        />
      )}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onRequestClose={closeCategoryModal}
        onCategoryCreated={loadCategories}
      />
      <ScheduleDetailModal
        isOpen={isScheduleDetailModalOpen}
        onRequestClose={closeScheduleDetailModal}
        scheduleId={selectedScheduleId}
        selectedDate={selectedDate}
        onScheduleDeleted={loadSchedules}
      />
    </div>
  );
}

export default MainPage;
