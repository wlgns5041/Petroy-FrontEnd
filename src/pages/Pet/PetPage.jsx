import React, { useState, useEffect } from "react";
import axios from "axios";
import PetRegister from "../../components/Pet/PetRegister.jsx";
import PetEdit from "../../components/Pet/PetEdit.jsx";
import DeletePet from "../../components/Pet/DeletePet.jsx";
import AssignCareGiver from "../../components/Pet/AssignCareGiver.jsx";
import CareGiverList from "../../components/Pet/CareGiverList.jsx";
import { fetchMemberPets } from "../../services/TokenService.jsx";
import NavBar from "../../components/commons/NavBar.jsx";
import "../../styles/Pet/PetPage.css";

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

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenEditModal = (pet) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleOpenDeleteModal = (pet) => {
    setSelectedPet(pet);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

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

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
  };

  const handleAssignCareGiver = (careGiverId) => {
    setPets(
      pets.map((pet) =>
        pet.petId === selectedPet.petId ? { ...pet, careGiverId } : pet
      )
    );
    alert(`돌보미 등록 성공!`);
  };

  return (
    <div className="petPage">
      <NavBar title="펫 관리" />
      <button onClick={handleOpenModal}>펫 등록하기</button>

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

      <CareGiverList />

      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : pets.length > 0 ? (
        <div className="petsSection">
          <h2 className="petsListHeader">내 반려동물 목록</h2>
          <div className="petsList">
            {pets.map((pet) => (
              <div key={pet.petId} className="petCard">
                <img src={pet.image} alt={pet.name} className="petImage" />
                <h2>{pet.name}</h2>
                <p>종: {pet.species}</p>
                <p>품종: {pet.breed}</p>
                <p>나이: {pet.age}세</p>
                <p>성별: {pet.gender === "MALE" ? "남자" : "여자"}</p>
                <p>메모: {pet.memo}</p>
                <button onClick={() => handleOpenEditModal(pet)}>
                  펫 수정
                </button>
                <button
                  onClick={() => handleOpenDeleteModal(pet)}
                  className="deleteButton"
                >
                  펫 삭제
                </button>
                <button
                  onClick={() => handleOpenAssignModal(pet)}
                  className="assignButton"
                >
                  돌보미 등록
                </button>
                <button
                  className="viewCareGiverButton"
                  onClick={() => {
                    setSelectedPet(pet); 
                    handleShowCareGivers(pet.petId); 
                  }}
                >
                  돌보미 조회
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>등록된 반려동물이 없습니다.</p>
      )}
    </div>
  );
};

export default PetPage;
