import React, { useState, useEffect, useCallback } from "react";
import CalendarComponent from "../../components/Main/CalendarComponent.jsx";
import CategoryModal from "../../components/Main/CategoryModal.jsx";
import ScheduleModal from "../../components/Main/ScheduleModal.jsx";
import ScheduleDetailModal from "../../components/Main/ScheduleDetailModal.jsx";
import { fetchMemberPets, fetchCaregiverPets } from "../../services/PetService.jsx";
import { fetchScheduleCategories, fetchAllSchedules, deleteScheduleCategory } from "../../services/ScheduleService.jsx";
import "../../styles/Main/MainPage.css";
import InfoIcon from "@mui/icons-material/Info";
import ClearIcon from "@mui/icons-material/Clear";

function MainPage() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleDetailModalOpen, setIsScheduleDetailModalOpen] =
    useState(false);
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
  const [sortMode, setSortMode] = useState("timeAsc");
  const [searchQuery, setSearchQuery] = useState("");

  const loadPets = async () => {
    try {
      const data = await fetchMemberPets();
      setPets(data || []);
    } catch (err) {
      console.error("내 반려동물 오류", err);
    }
  };

const loadCareGiverPets = async () => {
  try {
    const data = await fetchCaregiverPets();
    setCareGiverPets(data || []);
  } catch (err) {
    console.error("돌보미 반려동물 오류", err);
  }
};

const loadCategories = async () => {
  try {
    const data = await fetchScheduleCategories();
    setCategories(data || []);
  } catch (err) {
    console.error("카테고리 오류", err);
  }
};

  const loadSchedules = useCallback(async () => {
  try {
    const data = await fetchAllSchedules();

    const getCategoryNameById = (id) => {
      const match = categories.find((c) => c.categoryId === id);
      return match ? match.name : "카테고리 없음";
    };

    const flatSchedules = data.flatMap((schedule) =>
      schedule.dateInfo.map((info) => {
        const petInfo = (schedule.petId || [])
          .map((id) =>
            [...pets, ...careGiverPets].find((p) => p.petId === id)
          )
          .filter(Boolean);

        return {
          ...schedule,
          date: new Date(info.date),
          status: info.status,
          categoryName: getCategoryNameById(schedule.categoryId),
          pets: schedule.petName || [],
          petInfo,
        };
      })
    );

    setSchedules(flatSchedules);
  } catch (err) {
    console.error("일정 불러오기 오류", err);
  }
}, [categories, pets, careGiverPets]);

const deleteCategory = async (categoryId) => {
  const confirmDelete = window.confirm("카테고리를 삭제하시겠습니까?");
  if (!confirmDelete) return;

  try {
    const success = await deleteScheduleCategory(categoryId);
    if (success) {
      alert("카테고리가 삭제되었습니다.");
      loadCategories();
    } else {
      alert("삭제에 실패했습니다.");
    }
  } catch (err) {
    console.error("카테고리 삭제 오류:", err);
    alert("해당 카테고리에 대한 일정이 존재하여 삭제에 실패하였습니다.");
  }
};

  useEffect(() => {
    loadPets();
    loadCareGiverPets();
    loadCategories();
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

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

  /* --------------------------------------- 항목 선택 초기화 --------------------------------------- */

  const clearAllGroupsExcept = (groupName) => {
    if (groupName !== "category") {
      setSelectedCategories(new Set());
    }
    if (groupName !== "pet") {
      setSelectedMyPets(new Set());
      setSelectedCareGiverPets(new Set());
    }
    if (groupName !== "schedule") {
      setSelectedSchedules(new Set());
    }
  };

  /* --------------------------------------- 카테고리 선택 로직 --------------------------------------- */

  const isCategorySelected = (id) => selectedCategories.has(id);

  const toggleCategory = (id) => {
    clearAllGroupsExcept("category");
    const newSet = new Set(selectedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCategories(newSet);
  };

  const selectAllCategories = () => {
    clearAllGroupsExcept("category");
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
    clearAllGroupsExcept("pet");
    const newSet = new Set(selectedMyPets);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedMyPets(newSet);
  };

  const toggleCareGiverPet = (id) => {
    clearAllGroupsExcept("pet");
    const newSet = new Set(selectedCareGiverPets);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedCareGiverPets(newSet);
  };

  const selectAllMyPets = () => {
    clearAllGroupsExcept("pet");
    if (selectedMyPets.size === pets.length) {
      setSelectedMyPets(new Set());
    } else {
      setSelectedMyPets(new Set(pets.map((p) => p.petId)));
    }
  };

  const selectAllCareGiverPets = () => {
    clearAllGroupsExcept("pet");
    if (selectedCareGiverPets.size === careGiverPets.length) {
      setSelectedCareGiverPets(new Set());
    } else {
      setSelectedCareGiverPets(new Set(careGiverPets.map((p) => p.petId)));
    }
  };

  /* --------------------------------------- 일정 선택 로직 --------------------------------------- */

  const getScheduleKey = (s) => `${s.scheduleId}-${s.date}`;
  const isScheduleSelected = (key) => selectedSchedules.has(key);

  const toggleSchedule = (key) => {
    clearAllGroupsExcept("schedule");
    const newSet = new Set(selectedSchedules);
    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
    setSelectedSchedules(newSet);
  };

  const selectAllSchedules = () => {
    clearAllGroupsExcept("schedule");
    const allKeys = schedules.map(getScheduleKey);
    const allSelected = allKeys.every((key) => selectedSchedules.has(key));
    setSelectedSchedules(allSelected ? new Set() : new Set(allKeys));
  };

  /* --------------------------------------- 캘린더로 넘기기 --------------------------------------- */

  const filteredSchedules = schedules.filter((s) => {
    const key = `${s.scheduleId}-${s.date}`;
    const categoryMatch =
      selectedCategories.size === 0 || selectedCategories.has(s.categoryId);

    const schedulePetIds = Array.isArray(s.petId) ? s.petId : [s.petId];
    const petMatch =
      selectedMyPets.size === 0 && selectedCareGiverPets.size === 0
        ? true
        : schedulePetIds.some((pid) => selectedMyPets.has(pid)) ||
          schedulePetIds.some((pid) => selectedCareGiverPets.has(pid));

    const scheduleMatch =
      selectedSchedules.size === 0 || selectedSchedules.has(key);

    return categoryMatch && petMatch && scheduleMatch;
  });

  /* --------------------------------------- 일정목록 검색/필터 --------------------------------------- */

  const rotateSortMode = () => {
    setSortMode((prev) => {
      switch (prev) {
        case "timeAsc":
          return "timeDesc";
        case "timeDesc":
          return "priorityHigh";
        case "priorityHigh":
          return "priorityLow";
        default:
          return "timeAsc";
      }
    });
  };

  const filteredAndSortedSchedules = [...schedules]
    .filter((s) => s.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const priorityValue = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      switch (sortMode) {
        case "timeAsc":
          return dateA - dateB;
        case "timeDesc":
          return dateB - dateA;
        case "priorityHigh":
          return (
            (priorityValue[b.priority] || 0) - (priorityValue[a.priority] || 0)
          );
        case "priorityLow":
          return (
            (priorityValue[a.priority] || 0) - (priorityValue[b.priority] || 0)
          );
        default:
          return 0;
      }
    });

  return (
  <div className="mainpage">
    <div className="mainpage-container">
      <div className="mainpage-container-body">
        {/* 사이드바 */}
        <div className="mainpage-leftsection">
          <div className="mainpage-buttons">
            <button className="mainpage-category-button" onClick={openCategoryModal}>
              카테고리 생성
            </button>
            <button className="mainpage-calendar-button" onClick={openScheduleModal}>
              일정 생성
            </button>
          </div>

          {/* 카테고리 섹션 */}
          <div className="mainpage-filter-card mainpage-fixed-title">
            <div className="mainpage-filter-title-row">
              <h4 className="mainpage-filter-title">
                내 카테고리{" "}
                <span className="mainpage-item-count">{categories.length}</span>
              </h4>
              <button
                className="mainpage-select-all-button"
                onClick={selectAllCategories}
              >
                전체선택
              </button>
            </div>

            <div className="mainpage-filter-scroll-area">
              {categories.length === 0 ? (
                <div className="mainpage-empty-message">
                  등록된 카테고리가 없습니다
                </div>
              ) : (
                <div className="mainpage-category-grid">
                  {categories.map((c) => (
                    <div
                      key={c.categoryId}
                      className={`mainpage-filter-item ${
                        isCategorySelected(c.categoryId) ? "selected" : ""
                      }`}
                      onClick={() => toggleCategory(c.categoryId)}
                    >
                      <span className="mainpage-category-name">{c.name}</span>
                      <ClearIcon
                        className="mainpage-delete-icon"
                        fontSize="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(c.categoryId);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 반려동물 섹션 */}
          <div className="mainpage-pets-grid">
            <div className="mainpage-filter-card mainpage-fixed-title">
              <div className="mainpage-filter-title-row">
                <h4 className="mainpage-filter-title">
                  내 반려동물{" "}
                  <span className="mainpage-item-count">{pets.length}</span>
                </h4>
                <button
                  className="mainpage-select-all-button"
                  onClick={selectAllMyPets}
                >
                  전체선택
                </button>
              </div>

              <div className="mainpage-filter-scroll-area">
                {pets.length === 0 ? (
                  <div className="mainpage-empty-message">
                    등록된 반려동물이 없습니다
                  </div>
                ) : (
                  pets.map((p) => (
                    <div
                      key={p.petId}
                      className={`mainpage-filter-item ${
                        isMyPetSelected(p.petId) ? "selected" : ""
                      }`}
                      onClick={() => toggleMyPet(p.petId)}
                    >
                      {p.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mainpage-filter-card mainpage-fixed-title">
              <div className="mainpage-filter-title-row">
                <h4 className="mainpage-filter-title">
                  돌보미 반려동물{" "}
                  <span className="mainpage-item-count">{careGiverPets.length}</span>
                </h4>
                <button
                  className="mainpage-select-all-button"
                  onClick={selectAllCareGiverPets}
                >
                  전체선택
                </button>
              </div>

              <div className="mainpage-filter-scroll-area">
                {careGiverPets.length === 0 ? (
                  <div className="mainpage-empty-message">
                    등록된 돌보미 반려동물이 없습니다
                  </div>
                ) : (
                  careGiverPets.map((p) => (
                    <div
                      key={p.petId}
                      className={`mainpage-filter-item ${
                        isCareGiverPetSelected(p.petId) ? "selected" : ""
                      }`}
                      onClick={() => toggleCareGiverPet(p.petId)}
                    >
                      {p.name} ({p.breed})
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 일정 목록 섹션 */}
          <div className="mainpage-filter-card mainpage-fixed-title mainpage-schedule-list">
            <div className="mainpage-filter-title-row mainpage-schedule-header">
              <div className="mainpage-schedule-controls">
                <input
                  type="text"
                  placeholder="일정 이름 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mainpage-schedule-search-input"
                />
                <button
                  onClick={rotateSortMode}
                  className="mainpage-schedule-sort-button"
                >
                  {sortMode === "timeAsc" && "시간↑"}
                  {sortMode === "timeDesc" && "시간↓"}
                  {sortMode === "priorityHigh" && "중요도↑"}
                  {sortMode === "priorityLow" && "중요도↓"}
                </button>
              </div>

              <div className="mainpage-schedule-title-center">
                <h4 className="mainpage-filter-title">
                  일정 목록{" "}
                  <span className="mainpage-item-count">
                    {filteredAndSortedSchedules.length}
                  </span>
                </h4>
              </div>

              <div className="mainpage-schedule-actions">
                <button
                  className="mainpage-select-all-button"
                  onClick={selectAllSchedules}
                >
                  전체선택
                </button>
              </div>
            </div>

            {filteredAndSortedSchedules.length === 0 ? (
              <div className="mainpage-schedule-empty-message">
                생성된 일정이 없습니다
              </div>
            ) : (
              <div className="mainpage-filter-scroll-area mainpage-schedule-scroll-grid">
                {filteredAndSortedSchedules.map((s) => {
                  const key = `${s.scheduleId}-${s.date}`;
                  const isSelected = isScheduleSelected(key);
                  return (
                    <div
                      key={key}
                      className={`mainpage-schedule-list-item ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => toggleSchedule(key)}
                    >
                      <div
                        className={`mainpage-priority-indicator mainpage-priority-${s.priority.toLowerCase()}`}
                      />
                      <button
                        className="mainpage-detail-icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openScheduleDetailModal(s.scheduleId, s.date);
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </button>
                      <p>{s.title}</p>
                      <small>{new Date(s.date).toLocaleString()}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 캘린더 본문 */}
        <div className="mainpage-calendar-main">
          <CalendarComponent
            filteredSchedules={filteredSchedules}
            onOpenDetail={openScheduleDetailModal}
          />
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
