import React, { useState, useEffect, useCallback } from "react";
import CalendarComponent from "../../components/Main/CalendarComponent.jsx";
import CategoryModal from "../../components/Main/CategoryModal.jsx";
import CategoryDeleteModal from "../../components/Main/CategoryDeleteModal.jsx";
import ScheduleModal from "../../components/Main/ScheduleModal.jsx";
import ScheduleDetailModal from "../../components/Main/ScheduleDetailModal.jsx";
import {
  fetchMemberPets,
  fetchCaregiverPets,
} from "../../services/PetService.jsx";
import {
  fetchScheduleCategories,
  fetchAllSchedules,
  deleteScheduleCategory,
} from "../../services/ScheduleService.jsx";
import "../../styles/Main/MainPage.css";
import InfoIcon from "@mui/icons-material/Info";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ExpandLessIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { motion } from "framer-motion";

function MainPage() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleDetailModalOpen, setIsScheduleDetailModalOpen] =
    useState(false);
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
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

  // 모바일용 섹션 토글 상태
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [openCategory, setOpenCategory] = useState(true);
  const [openSchedule, setOpenSchedule] = useState(true);
  const [openMyPets, setOpenMyPets] = useState(true);
  const [openCarePets, setOpenCarePets] = useState(true);

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // 오픈 함수
  const openCategoryDeleteModal = (category) => {
    setDeleteCategoryTarget(category);
    setDeleteCategoryOpen(true);
  };

  // 확인(실제 삭제) 함수
  const confirmDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setDeletingCategory(true);
    try {
      const ok = await deleteScheduleCategory(deleteCategoryTarget.categoryId);
      if (ok) {
        await loadCategories();
        alert("카테고리가 삭제되었습니다.");
        setDeleteCategoryOpen(false);
        setDeleteCategoryTarget(null);
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("카테고리 삭제 오류:", err);
      alert("해당 카테고리에 대한 일정이 존재하여 삭제에 실패하였습니다.");
    } finally {
      setDeletingCategory(false);
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
          <div className="mainpage-leftsection">
            {isMobile && (
              <div className="mainpage-calendar-mobile-wrapper">
                <CalendarComponent
                  filteredSchedules={filteredSchedules}
                  onOpenDetail={openScheduleDetailModal}
                />
              </div>
            )}

            {!isMobile && (
              <div className="mainpage-buttons">
                <button
                  className="mainpage-category-button"
                  onClick={openCategoryModal}
                >
                  카테고리 생성
                </button>
                <button
                  className="mainpage-calendar-button"
                  onClick={openScheduleModal}
                >
                  일정 생성
                </button>
              </div>
            )}

            {/* ✅ 일정 목록 섹션 (카테고리와 동일한 구조로 재작성) */}
            <div className="mainpage-filter-card mainpage-fixed-title">
              <div
                className="mainpage-filter-title-row mainpage-schedule-header-row"
                onClick={() => isMobile && setOpenSchedule(!openSchedule)}
                style={{ cursor: isMobile ? "pointer" : "default" }}
              >
                {/* ✅ 데스크탑용 레이아웃 */}
                {!isMobile ? (
                  <>
                    <div className="mainpage-schedule-controls">
                      <input
                        type="text"
                        placeholder="일정 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mainpage-schedule-search-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rotateSortMode();
                        }}
                        className="mainpage-schedule-sort-button"
                      >
                        {sortMode === "timeAsc" && "시간 ↑"}
                        {sortMode === "timeDesc" && "시간 ↓"}
                        {sortMode === "priorityHigh" && "중요도 ↑"}
                        {sortMode === "priorityLow" && "중요도 ↓"}
                      </button>
                    </div>

                    {/* ✅ 가운데 타이틀 */}
                    <div className="mainpage-schedule-title-center">
                      <h4 className="mainpage-filter-title">
                        일정 목록{" "}
                        <span className="mainpage-item-count">
                          {filteredAndSortedSchedules.length}
                        </span>
                      </h4>
                    </div>

                    {/* ✅ 오른쪽 전체선택 */}
                    <div className="mainpage-schedule-actions">
                      <button
                        className="mainpage-select-all-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllSchedules();
                        }}
                      >
                        전체선택
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ✅ 모바일 기존 형태 */}
                    <h4 className="mainpage-filter-title">
                      일정 목록{" "}
                      <span className="mainpage-item-count">
                        {filteredAndSortedSchedules.length}
                      </span>
                    </h4>
                    <div
                      className="mainpage-schedule-filter-bar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        placeholder="일정 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mainpage-schedule-search-input"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rotateSortMode();
                        }}
                        className="mainpage-schedule-sort-button"
                      >
                        {sortMode === "timeAsc" && "시간↑"}
                        {sortMode === "timeDesc" && "시간↓"}
                        {sortMode === "priorityHigh" && "중요도↑"}
                        {sortMode === "priorityLow" && "중요도↓"}
                      </button>
                    </div>

                    <span className="mainpage-toggle-icon">
                      <button
                        className="mainpage-select-all-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllSchedules();
                        }}
                      >
                        전체선택
                      </button>
                      {openSchedule ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </span>
                  </>
                )}
              </div>

              <motion.div
                className="mainpage-section-body"
                initial={false}
                animate={{
                  height: openSchedule ? "auto" : 0,
                  opacity: openSchedule ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                {/* ✅ 일정 목록 */}
                <div className="mainpage-filter-scroll-area">
                  {filteredAndSortedSchedules.length === 0 ? (
                    <div className="mainpage-empty-message">
                      생성된 일정이 없습니다
                    </div>
                  ) : (
                    <div className="mainpage-schedule-scroll-grid">
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
                            {/* ✅ 왼쪽 (일정 제목 + 날짜) */}
                            <div className="mainpage-schedule-list-item-left">
                              <p>{s.title}</p>
                              <small>
                                {new Date(s.date).toLocaleString("ko-KR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </small>
                            </div>

                            {/* ✅ 오른쪽 (중요도 점 + 상세보기 버튼) */}
                            <div className="mainpage-schedule-list-item-right">
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ✅ 하단 버튼 (모바일 전용) */}
                {isMobile && (
                  <div className="mainpage-create-button-wrapper">
                    <button
                      className="mainpage-create-button"
                      onClick={openScheduleModal}
                    >
                      일정 생성하기
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ✅ 카테고리 섹션 */}
            <div className="mainpage-filter-card mainpage-fixed-title">
              {/* 제목줄 */}
              <div
                className="mainpage-filter-title-row"
                onClick={() => isMobile && setOpenCategory(!openCategory)}
                style={{ cursor: isMobile ? "pointer" : "default" }}
              >
                <h4 className="mainpage-filter-title">
                  카테고리{" "}
                  <span className="mainpage-item-count">
                    {categories.length}
                  </span>
                </h4>

                {isMobile && (
                  <span className="mainpage-toggle-icon">
                    <button
                      className="mainpage-select-all-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllCategories();
                      }}
                    >
                      전체선택
                    </button>
                    {openCategory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </span>
                )}

                {!isMobile && (
                  <button
                    className="mainpage-select-all-button"
                    onClick={selectAllCategories}
                  >
                    전체선택
                  </button>
                )}
              </div>

              <motion.div
              className="mainpage-section-body"
                initial={false}
                animate={{
                  height: openCategory ? "auto" : 0,
                  opacity: openCategory ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
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
                          <span className="mainpage-category-name">
                            {c.name}
                          </span>
                          <ClearIcon
                            className="mainpage-delete-icon"
                            fontSize="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCategoryDeleteModal(c);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ✅ 버튼은 항상 아래 고정 */}
                {isMobile && (
                  <div className="mainpage-create-button-wrapper">
                    <button
                      className="mainpage-create-button"
                      onClick={openCategoryModal}
                    >
                      카테고리 생성하기
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ✅ 반려동물 섹션 */}
            <div className="mainpage-pets-grid">
              {/* ── 펫 ── */}
              <div className="mainpage-filter-card mainpage-fixed-title">
                <div
                  className="mainpage-filter-title-row"
                  onClick={() => isMobile && setOpenMyPets(!openMyPets)}
                  style={{ cursor: isMobile ? "pointer" : "default" }}
                >
                  <h4 className="mainpage-filter-title">
                    펫{" "}
                    <span className="mainpage-item-count">{pets.length}</span>
                  </h4>

                  {isMobile ? (
                    <span className="mainpage-toggle-icon">
                      <button
                        className="mainpage-select-all-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllMyPets();
                        }}
                      >
                        전체선택
                      </button>
                      {openMyPets ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </span>
                  ) : (
                    // ✅ PC일 때 전체선택 버튼 추가
                    <button
                      className="mainpage-select-all-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllMyPets();
                      }}
                    >
                      전체선택
                    </button>
                  )}
                </div>

                <motion.div
                className="mainpage-section-body"
                  initial={false}
                  animate={{
                    height: openMyPets ? "auto" : 0,
                    opacity: openMyPets ? 1 : 0,
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="mainpage-filter-scroll-area mainpage-pet-card">
                    {pets.length === 0 ? (
                      <div className="mainpage-empty-message">
                        등록된 펫이 없습니다
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
                          <img
                            src={p.image || "/images/default-pet.png"} // ✅ 실제 필드명 확인 필요
                            alt={p.name}
                            className="mainpage-pet-thumb"
                          />
                          <span>{p.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>

              {/* ── 돌보미 펫 ── */}
              <div className="mainpage-filter-card mainpage-fixed-title">
                <div
                  className="mainpage-filter-title-row"
                  onClick={() => isMobile && setOpenCarePets(!openCarePets)}
                  style={{ cursor: isMobile ? "pointer" : "default" }}
                >
                  <h4 className="mainpage-filter-title">
                    돌보미 펫{" "}
                    <span className="mainpage-item-count">
                      {careGiverPets.length}
                    </span>
                  </h4>

                  {isMobile ? (
                    <span className="mainpage-toggle-icon">
                      <button
                        className="mainpage-select-all-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllCareGiverPets();
                        }}
                      >
                        전체선택
                      </button>
                      {openCarePets ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </span>
                  ) : (
                    // ✅ PC일 때 전체선택 버튼 추가
                    <button
                      className="mainpage-select-all-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllCareGiverPets();
                      }}
                    >
                      전체선택
                    </button>
                  )}
                </div>

                <motion.div
                className="mainpage-section-body"
                  initial={false}
                  animate={{
                    height: openCarePets ? "auto" : 0,
                    opacity: openCarePets ? 1 : 0,
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="mainpage-filter-scroll-area mainpage-carepet-card">
                    {careGiverPets.length === 0 ? (
                      <div className="mainpage-empty-message">
                        등록된 돌보미 펫이 없습니다
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
                          <img
                            src={p.image || "/images/default-pet.png"}
                            alt={p.name}
                            className="mainpage-pet-thumb"
                          />
                          <span>{p.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          {/* 캘린더 본문 */}
          {!isMobile && (
            <div className="mainpage-calendar-main">
              <CalendarComponent
                filteredSchedules={filteredSchedules}
                onOpenDetail={openScheduleDetailModal}
              />
            </div>
          )}
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

      {deleteCategoryOpen && deleteCategoryTarget && (
        <CategoryDeleteModal
          categoryName={deleteCategoryTarget.name ?? ""}
          onClose={() => {
            setDeleteCategoryOpen(false);
            setDeleteCategoryTarget(null);
          }}
          onConfirm={confirmDeleteCategory}
          loading={deletingCategory}
        />
      )}
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
