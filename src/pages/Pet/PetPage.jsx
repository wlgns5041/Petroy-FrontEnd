import React, { useState, useEffect } from "react";
import axios from "axios";
import PetRegister from "../../components/Pet/PetRegister.jsx";
import PetEdit from "../../components/Pet/PetEdit.jsx";
import DeletePet from "../../components/Pet/DeletePet.jsx";
import AssignCareGiver from "../../components/Pet/AssignCareGiver.jsx";
import { fetchMemberPets } from "../../services/TokenService.jsx";
import NavBar from "../../components/commons/NavBar.jsx";
import "../../styles/Pet/PetPage.css";
import dogChihuahua from "../../assets/icons/dog-chihuahua.png";
import dogJindo from "../../assets/icons/dog-jindo.png";
import dogPomeranian from "../../assets/icons/dog-pomeranian.png";
import catCheese from "../../assets/icons/cat-cheese.png";
import catMunchkin from "../../assets/icons/cat-munchkin.png";
import catRussianBlue from "../../assets/icons/cat-russianblue.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PetPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [caregiversList, setCaregiversList] = useState([]);
  const [showCareGiverList, setShowCareGiverList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("mine");
  const [caregiverPets, setCaregiverPets] = useState([]);
  const [caregiverLoading, setCaregiverLoading] = useState(false);
  const [caregiverError, setCaregiverError] = useState(null);

  const speciesKorToEng = {
    강아지: "dog",
    고양이: "cat",
  };

  const breedKorToEng = {
    치와와: "chihuahua",
    진돗개: "jindo",
    포메라니안: "pomeranian",
    치즈: "cheese",
    먼치킨: "munchkin",
    러시안블루: "russianblue",
  };

  const fallbackIcons = {
    "dog-chihuahua": dogChihuahua,
    "dog-jindo": dogJindo,
    "dog-pomeranian": dogPomeranian,
    "cat-cheese": catCheese,
    "cat-munchkin": catMunchkin,
    "cat-russianblue": catRussianBlue,
  };

  const getDefaultPetIcon = (speciesKor, breedKor) => {
    const speciesEng = speciesKorToEng[speciesKor];
    const breedEng = breedKorToEng[breedKor];
    const key = `${speciesEng}-${breedEng}`;

    return fallbackIcons[key] || "/defaultPet.png";
  };

  useEffect(() => {
    const loadPets = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          const response = await fetchMemberPets(token);

          if (response && response.content) {
            setPets(response.content);
          } else {
            setError("펫 정보를 불러오는 중 오류 발생");
          }
        } catch (error) {
          setError("반려동물 정보를 불러오는 중 오류 발생");
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setError("로그인이 필요합니다");
        setLoading(false);
      }
    };

    loadPets();
  }, []);
  useEffect(() => {
    const loadCaregiverPets = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          setCaregiverLoading(true);
          const response = await axios.get(`${API_BASE_URL}/pets/caregiver`, {
            headers: { Authorization: `${token}` },
          });

          if (response && response.data && response.data.content) {
            setCaregiverPets(response.data.content);
          } else {
            setCaregiverError("돌보미 반려동물 정보를 불러오는 중 오류 발생");
          }
        } catch (err) {
          setCaregiverError("돌보미 반려동물 정보를 불러오는 중 오류 발생");
          console.error(err);
        } finally {
          setCaregiverLoading(false);
        }
      } else {
        setCaregiverError("로그인이 필요합니다");
        setCaregiverLoading(false);
      }
    };

    loadCaregiverPets();
  }, []);

  const handleShowCareGivers = async (petId) => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.get(`${API_BASE_URL}/caregivers`, {
        headers: {
          Authorization: `${token}`,
        },
        params: {
          petId,
        },
      });

      if (response.status === 200) {
        setCaregiversList(response.data.content || []);
        setShowCareGiverList(true);
      }
    } catch (err) {
      const msg =
        err.response?.data?.errorMessage ||
        "돌보미 정보를 불러오지 못했습니다.";
      alert(msg);
      console.error(err);
    }
  };

  const handleDeleteCareGiver = async (petId, memberId) => {
    const token = localStorage.getItem("accessToken");

    if (!window.confirm("해당 돌보미를 삭제하시겠습니까?")) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/caregivers`, {
        headers: {
          Authorization: `${token}`,
        },
        params: {
          petId,
          memberId,
        },
      });

      if (response.data === true) {
        alert("돌보미가 삭제되었습니다.");
        setCaregiversList((prev) =>
          prev.filter((cg) => cg.memberId !== memberId)
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.errorMessage || "삭제 중 오류가 발생했습니다.";
      alert(msg);
      console.error(err);
    }
  };

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

  const handleUpdatePet = (updatedPet) => {
    setPets(pets.map((p) => (p.petId === updatedPet.petId ? updatedPet : p)));
  };

  const handleDeleteSuccess = () => {
    setPets(pets.filter((p) => p.petId !== selectedPet.petId));
  };

  const handleRegisterSuccess = (newPet) => {
    setPets([...pets, newPet]);
  };

  const handleOpenAssignModal = (pet) => {
    setSelectedPet(pet);
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => setShowAssignModal(false);

  const handleAssignCareGiver = (careGiverId) => {
    setPets(
      pets.map((pet) =>
        pet.petId === selectedPet.petId ? { ...pet, careGiverId } : pet
      )
    );
    alert("돌보미 등록 성공!");
  };

  return (
    <div className="petPage">
      <div className="petPage-body">
        <NavBar title="펫 관리" />

        <div className="petPage-tab-container">
          <button
            className={`petPage-tab-button ${
              activeTab === "mine" ? "active" : ""
            }`}
            onClick={() => setActiveTab("mine")}
          >
            내 반려동물
            <span className="petPage-tab-count">{pets.length}</span>
          </button>
          <button
            className={`petPage-tab-button ${
              activeTab === "caregiver" ? "active" : ""
            }`}
            onClick={() => setActiveTab("caregiver")}
          >
            돌보미 반려동물
            <span className="petPage-tab-count">{caregiverPets.length}</span>
          </button>
        </div>

        <div className="petPage-top-bar">
          <button onClick={handleOpenModal} className="petPage-register-button">
            펫 등록하기
          </button>
        </div>

        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            {activeTab === "mine" ? (
              pets.length > 0 ? (
                <div className="petPage-petsSection">
                  <div className="petPage-petsList">
                    {pets.map((pet) => (
                      <div key={pet.petId} className="petPage-pet-card-new">
                        <div className="petPage-pet-card-header">
                          <span className="petPage-pet-card-name">
                            {pet.name}
                          </span>

                          <button
                            onClick={() => setSelectedPet(pet)}
                            className="petPage-dot-button"
                            onFocus={(e) => e.target.classList.add("open")}
                            onBlur={(e) => e.target.classList.remove("open")}
                          >
                            ⋮
                            <div className="petPage-dropdown-menu">
                              <button
                                onMouseDown={() => handleOpenEditModal(pet)}
                              >
                                반려동물 정보 수정
                              </button>
                              <button
                                onMouseDown={() => handleOpenDeleteModal(pet)}
                              >
                                반려동물 삭제
                              </button>
                              <button
                                onMouseDown={() => handleOpenAssignModal(pet)}
                              >
                                돌보미 등록
                              </button>
                              <button
                                onMouseDown={() => {
                                  setSelectedPet(pet);
                                  handleShowCareGivers(pet.petId);
                                }}
                              >
                                돌보미 조회
                              </button>
                            </div>
                          </button>
                        </div>

                        <div className="petPage-pet-card-body">
                          <img
                            src={
                              pet.image
                                ? pet.image.startsWith("http") ||
                                  pet.image.startsWith("data:")
                                  ? pet.image
                                  : `${API_BASE_URL}${pet.image}`
                                : getDefaultPetIcon(pet.species, pet.breed)
                            }
                            alt={pet.name}
                            className="petPage-pet-avatar"
                          />
                          <div className="petPage-pet-info">
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
                </div>
              ) : (
                <p>등록된 반려동물이 없습니다.</p>
              )
            ) : (
              <div className="petPage-petsSection">
                {caregiverLoading ? (
                  <p>로딩 중...</p>
                ) : caregiverError ? (
                  <p className="error">{caregiverError}</p>
                ) : caregiverPets.length > 0 ? (
                  <div className="petPage-petsList">
                    {caregiverPets.map((pet) => (
                      <div key={pet.petId} className="petPage-pet-card-new">
                        <div className="petPage-pet-card-header">
                          <span className="petPage-pet-card-name">
                            {pet.name}
                          </span>
                        </div>
                        <div className="petPage-pet-card-body">
                          <img
                            src={
                              pet.image
                                ? pet.image.startsWith("http") ||
                                  pet.image.startsWith("data:")
                                  ? pet.image
                                  : `${API_BASE_URL}${pet.image}`
                                : getDefaultPetIcon(pet.species, pet.breed)
                            }
                            alt={pet.name}
                            className="petPage-pet-avatar"
                          />
                          <div className="petPage-pet-info">
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
                ) : (
                  <p>돌보미로 등록된 반려동물이 없습니다.</p>
                )}
              </div>
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

      {showCareGiverList && (
        <div className="caregiverModalOverlay">
          <div className="caregiverModalContent">
            <h3>돌보미 목록</h3>
            {caregiversList.length > 0 ? (
              <ul className="caregiverList">
                {caregiversList.map((cg) => (
                  <li key={cg.memberId} className="caregiverItem">
                    <span>{cg.memberName}</span>
                    <button
                      className="caregiverDeleteButton"
                      onClick={() =>
                        handleDeleteCareGiver(selectedPet.petId, cg.memberId)
                      }
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>등록된 돌보미가 없습니다.</p>
            )}
            <button
              onClick={() => setShowCareGiverList(false)}
              className="caregiverCloseButton"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetPage;
