import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// 내 펫 정보 조회
export const fetchMemberPets = async () => {
  const token = localStorage.getItem("accessToken");
  console.log("🔑 accessToken:", token);
  try {
    const response = await fetch(`${API_BASE_URL}/members/pets`, {
      method: 'GET',
      headers: {
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('반려동물 정보를 찾을 수 없습니다', errorText);
      return [];
    }

    const data = await response.json();
    return data.content || [];
  } catch (error) {
    console.error("🔥 fetchMemberPets 예외:", error);
    return [];
  }
};

// 종 목록 조회
export const fetchSpeciesList = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/pets/species`, {
    headers: { Authorization: `${token}` },
  });
  return response.data.content || [];
};

// 품종 목록 조회
export const fetchBreedList = async (speciesId) => {
  const response = await axios.get(`${API_BASE_URL}/pets/breed/${speciesId}`);
  return response.data.content || [];
};

// 반려동물 등록
export const registerPet = async (formData) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(`${API_BASE_URL}/pets`, formData, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 반려동물 수정
export const updatePet = async (petId, formData) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.patch(`${API_BASE_URL}/pets/${petId}`, formData, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.content || [];
};

// 반려동물 삭제
export const deletePet = async (petId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.delete(`${API_BASE_URL}/pets/${petId}`, {
    headers: { Authorization: `${token}` },
  });
  return response.status === 200;
};

// 돌보미 목록 조회
export const fetchCaregiversByPet = async (petId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/caregivers`, {
    headers: { Authorization: `${token}` },
    params: { petId },
  });
  return response.data.content || [];
};

// 돌보미 반려동물 목록 조회
export const fetchCaregiverPets = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/pets/caregiver`, {
    headers: { Authorization: `${token}` },
  });
  return response.data.content || [];
};

// 돌보미 등록
export const assignCaregiver = async (petId, memberId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(
    `${API_BASE_URL}/caregivers`,
    null,
    {
      headers: { Authorization: `${token}` },
      params: { petId, memberId },
    }
  );
  return response.data === true;
};

// 돌보미 삭제
export const deleteCaregiver = async (petId, memberId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.delete(`${API_BASE_URL}/caregivers`, {
    headers: { Authorization: `${token}` },
    params: { petId, memberId },
  });
  return response.data === true;
};