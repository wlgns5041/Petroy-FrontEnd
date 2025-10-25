import React, { useState, useRef, useEffect } from "react";
import PetRegister from "../../components/Pet/PetRegister.jsx";
import PetEdit from "../../components/Pet/PetEdit.jsx";
import DeletePet from "../../components/Pet/DeletePet.jsx";
import AssignCareGiver from "../../components/Pet/AssignCareGiver.jsx";
import CareGiverList from "../../components/Pet/CareGiverList.jsx";
import {
  fetchMemberPets,
  fetchCaregiverPets,
} from "../../services/PetService.jsx";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import "../../styles/Pet/PetPage.css";
import withAuth from "../../utils/withAuth";
import AlertModal from "../../components/commons/AlertModal.jsx";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCareGiverList, setShowCareGiverList] = useState(false);

  const [pets, setPets] = useState([]);
  const [caregiverPets, setCaregiverPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPetId, setMenuPetId] = useState(null);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [caregiverLoading, setCaregiverLoading] = useState(false);

  const [error, setError] = useState(null);
  const [caregiverError, setCaregiverError] = useState(null);

  const [activeTab, setActiveTab] = useState("mine");
  const petTabIndex = activeTab === "mine" ? 0 : 1;

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const sortOptions = [
    { key: "name-asc", label: "이름순 ↓" },
    { key: "name-desc", label: "이름순 ↑" },
    { key: "date-asc", label: "등록순 ↓" },
    { key: "date-desc", label: "등록순 ↑" },
  ];
  const [petSortIndex, setPetSortIndex] = useState(0);
  const currentPetSort = sortOptions[petSortIndex];
  const rotatePetSort = () =>
    setPetSortIndex((v) => (v + 1) % sortOptions.length);
  const resetPetSort = () => setPetSortIndex(0);

  const sortPetList = (list) => {
    const sorted = [...list];
    switch (currentPetSort.key) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "date-asc":
        return sorted.sort(
          (a, b) =>
            (a.createdAt ? new Date(a.createdAt) : a.petId) -
            (b.createdAt ? new Date(b.createdAt) : b.petId)
        );
      case "date-desc":
        return sorted.sort(
          (a, b) =>
            (b.createdAt ? new Date(b.createdAt) : b.petId) -
            (a.createdAt ? new Date(a.createdAt) : a.petId)
        );
      default:
        return list;
    }
  };

  const itemsPerPage = 3;
  const caregiverItemsPerPage = 3;

  const [currentPage, setCurrentPage] = useState(1);
  const [caregiverCurrentPage, setCaregiverCurrentPage] = useState(1);

  const sortedPets = sortPetList(pets);
  const sortedCaregiverPets = sortPetList(caregiverPets);

  const paginatedPets = sortedPets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const caregiverPaginatedPets = sortedCaregiverPets.slice(
    (caregiverCurrentPage - 1) * caregiverItemsPerPage,
    caregiverCurrentPage * caregiverItemsPerPage
  );

  const totalPages = Math.ceil(sortedPets.length / itemsPerPage);
  const caregiverTotalPages = Math.ceil(
    sortedCaregiverPets.length / caregiverItemsPerPage
  );

  const loadPets = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    try {
      const petList = await fetchMemberPets();
      setPets(petList);
    } catch (e) {
      setError("반려동물 정보를 불러오는 중 오류 발생");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    const loadCaregiver = async () => {
      try {
        setCaregiverLoading(true);
        const list = await fetchCaregiverPets();
        setCaregiverPets(list);
      } catch (e) {
        setCaregiverError("돌보미 반려동물 정보를 불러오는 중 오류 발생");
        console.error(e);
      } finally {
        setCaregiverLoading(false);
      }
    };
    loadCaregiver();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        e.stopPropagation();
        setShowMenu(false);
        setMenuPetId(null);
      }
    };

    if (showMenu) {
      document.addEventListener("click", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [showMenu]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleOpenEditModal = (pet) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  const handleOpenDeleteModal = (pet) => {
    setSelectedPet(pet);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleOpenAssignModal = (pet) => {
    setSelectedPet(pet);
    setShowAssignModal(true);
  };
  const handleCloseAssignModal = () => setShowAssignModal(false);

  const handleUpdatePet = (updatedPet) => {
    setPets(pets.map((p) => (p.petId === updatedPet.petId ? updatedPet : p)));
    loadPets();
    setShowEditModal(false);
  };

  const handleDeleteSuccess = () => {
    setPets(pets.filter((p) => p.petId !== selectedPet.petId));
  };

  const handleRegisterSuccess = (newPet) => {
    loadPets();
    if (newPet?.petId && newPet?.name) {
      setPets((prev) => [newPet, ...prev]);
      setCurrentPage(1);
      resetPetSort();
    }
  };

  const handleAssignCareGiver = (careGiverId) => {
    setPets(
      pets.map((pet) =>
        pet.petId === selectedPet.petId ? { ...pet, careGiverId } : pet
      )
    );
    setAlertMessage("돌보미 등록 성공!");
    setShowAlert(true);
  };

  return (
    <main className="petpage-viewport">
      <div className="petpage">
        <div className="petpage-container">
          <div className="petpage-tab-bar">
            <div
              className="petpage-tab-background"
              style={{ transform: `translateX(${petTabIndex * 100}%)` }}
            />

            <button
              className={`petpage-tab ${activeTab === "mine" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("mine");
                resetPetSort();
                setCurrentPage(1);
              }}
            >
              내 반려동물{" "}
              <span className="petpage-tab-count">{pets.length}</span>
            </button>

            <button
              className={`petpage-tab ${
                activeTab === "caregiver" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("caregiver");
                resetPetSort();
                setCurrentPage(1);
              }}
            >
              돌보미 반려동물{" "}
              <span className="petpage-tab-count">{caregiverPets.length}</span>
            </button>
          </div>

          <div className="petpage-top-bar">
            <div className="petpage-sort-wrapper">
              <button className="petpage-sort-button" onClick={rotatePetSort}>
                {currentPetSort.label}
              </button>
            </div>
            <div className="petpage-register-wrapper">
              <button
                onClick={handleOpenModal}
                className="petpage-register-button"
              >
                펫 등록하기
              </button>
            </div>
          </div>

          {loading ? (
            <p>로딩 중...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <>
              {activeTab === "mine" ? (
                <section className="petpage-pets-section">
                  {pets.length > 0 ? (
                    <>
                      <div className="petpage-pets-list">
                        {paginatedPets.filter(Boolean).map((pet) => (
                          <div key={pet.petId} className="petpage-pet-card-new">
                            <div className="petpage-pet-card-body">
                              <img
                                src={
                                  pet.image.startsWith("http") ||
                                  pet.image.startsWith("data:")
                                    ? pet.image
                                    : `${API_BASE_URL}${pet.image}`
                                }
                                alt={pet.name}
                                className="petpage-pet-avatar"
                              />
                              <div className="petpage-pet-info">
                                <div className="info-row">
                                  <span className="label">이름</span>
                                  <span className="value">{pet.name}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">종</span>
                                  <span className="value">{pet.species}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">품종</span>
                                  <span className="value">{pet.breed}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">나이</span>
                                  <span className="value">{pet.age}세</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">성별</span>
                                  <span className="value">
                                    {pet.gender === "MALE" ? "남자" : "여자"}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="label">메모</span>
                                  <span className="value">{pet.memo}</span>
                                </div>
                              </div>
                              <div
                                className="petpage-dot-container"
                                ref={dropdownRef}
                              >
                                <button
                                  className="petpage-dot-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuPetId(pet.petId);
                                    setShowMenu((prev) =>
                                      prev && menuPetId === pet.petId
                                        ? false
                                        : true
                                    );

                                    const cards = document.querySelectorAll(
                                      ".petpage-pet-card-new"
                                    );
                                    cards.forEach((card) =>
                                      card.classList.remove("active")
                                    );
                                    e.currentTarget
                                      .closest(".petpage-pet-card-new")
                                      ?.classList.add("active");
                                  }}
                                >
                                  <MoreHorizRoundedIcon
                                    sx={{ fontSize: 22, color: "#333" }}
                                  />
                                </button>
                                {showMenu && menuPetId === pet.petId && (
                                  <div className="petpage-dropdown-menu">
                                    <div
                                      onMouseDown={() => {
                                        handleOpenEditModal(pet);
                                        setShowMenu(false);
                                        setMenuPetId(null);
                                      }}
                                    >
                                      반려동물 정보 수정
                                    </div>
                                    <div
                                      onMouseDown={() => {
                                        handleOpenDeleteModal(pet);
                                        setShowMenu(false);
                                        setMenuPetId(null);
                                      }}
                                    >
                                      반려동물 삭제
                                    </div>
                                    <div
                                      onMouseDown={() => {
                                        handleOpenAssignModal(pet);
                                        setShowMenu(false);
                                        setMenuPetId(null);
                                      }}
                                    >
                                      돌보미 등록
                                    </div>
                                    <div
                                      onMouseDown={() => {
                                        setSelectedPet(pet);
                                        setShowCareGiverList(true);
                                        setShowMenu(false);
                                        setMenuPetId(null);
                                      }}
                                    >
                                      돌보미 조회
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="petpage-footer">
                        {totalPages > 1 && (
                          <div className="petpage-pagination-buttons">
                            {Array.from({ length: totalPages }, (_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={
                                  currentPage === i + 1 ? "active" : ""
                                }
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="petpage-empty-state">
                        <p className="petpage-empty-icon">🐾</p>
                        <p className="petpage-empty-text-main">
                          등록된 반려동물이 없습니다
                        </p>
                        <p className="petpage-empty-text-sub">
                          반려동물을 등록하면 이곳에 표시됩니다!
                        </p>
                      </div>
                      <div className="petpage-footer" />
                    </>
                  )}
                </section>
              ) : (
                <section className="petpage-pets-section">
                  {caregiverLoading ? (
                    <p>로딩 중...</p>
                  ) : caregiverError ? (
                    <p className="error">{caregiverError}</p>
                  ) : caregiverPets.length > 0 ? (
                    <>
                      <div className="petpage-pets-list">
                        {caregiverPaginatedPets.map((pet) => (
                          <div key={pet.petId} className="petpage-pet-card-new">
                            <div className="petpage-pet-card-body">
                              <img
                                src={
                                  pet.image &&
                                  (pet.image.startsWith("http") ||
                                    pet.image.startsWith("data:"))
                                    ? pet.image
                                    : `${API_BASE_URL}${pet.image}`
                                }
                                alt={pet.name}
                                className="petpage-pet-avatar"
                              />
                              <div className="petpage-pet-info">
                                <div className="info-row">
                                  <span className="label">이름</span>
                                  <span className="value">{pet.name}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">종</span>
                                  <span className="value">{pet.species}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">품종</span>
                                  <span className="value">{pet.breed}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">나이</span>
                                  <span className="value">{pet.age}세</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">성별</span>
                                  <span className="value">
                                    {pet.gender === "MALE" ? "남자" : "여자"}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="label">메모</span>
                                  <span className="value">{pet.memo}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="petpage-footer">
                        {caregiverTotalPages > 1 && (
                          <div className="petpage-pagination-buttons">
                            {Array.from(
                              { length: caregiverTotalPages },
                              (_, i) => (
                                <button
                                  key={i + 1}
                                  onClick={() => setCaregiverCurrentPage(i + 1)}
                                  className={
                                    caregiverCurrentPage === i + 1
                                      ? "active"
                                      : ""
                                  }
                                >
                                  {i + 1}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="petpage-empty-state">
                        <p className="petpage-empty-icon">🐾</p>
                        <p className="petpage-empty-text-main">
                          등록된 돌보미 반려동물이 없습니다
                        </p>
                        <p className="petpage-empty-text-sub">
                          친구의 반려동물을 등록하면 이곳에 표시됩니다!
                        </p>
                      </div>
                      <div className="petpage-footer" />
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {showModal && (
          <PetRegister
            onClose={handleCloseModal}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
        {showEditModal && (
          <PetEdit
            pet={selectedPet}
            onClose={handleCloseEditModal}
            onUpdate={handleUpdatePet}
          />
        )}
        {showDeleteModal && (
          <DeletePet
            pet={selectedPet}
            onClose={handleCloseDeleteModal}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
        {showAssignModal && (
          <AssignCareGiver
            pet={selectedPet}
            onClose={handleCloseAssignModal}
            onAssignCareGiver={handleAssignCareGiver}
          />
        )}
        {showCareGiverList && selectedPet && (
          <CareGiverList
            pet={selectedPet}
            onClose={() => setShowCareGiverList(false)}
          />
        )}

        {showAlert && (
          <AlertModal
            message={alertMessage}
            onConfirm={() => setShowAlert(false)}
          />
        )}
      </div>
    </main>
  );
};

export default withAuth(PetPage);
