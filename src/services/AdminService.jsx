import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: token };
};

export const createCategory = async (categoryName) => {
  const name = (categoryName ?? "").toString().trim();
  if (!name) throw new Error("카테고리 이름이 비어있습니다.");

  try {
    const res = await axios.post(
      `${API_BASE_URL}/community/category`,
      { name },
      { headers: getAuthHeaders() }
    );

    return res?.data === true || res?.data?.data === true;
  } catch (e) {
    const msg =
      e?.response?.data?.errorMessage ||
      e?.response?.data?.message ||
      "카테고리 생성 중 오류가 발생했습니다.";
    throw new Error(msg);
  }
};

export const deleteCategory = async (categoryId) => {
  if (categoryId == null) throw new Error("categoryId가 없습니다.");

  try {
    const res = await axios.delete(
      `${API_BASE_URL}/community/category/${categoryId}`,
      { headers: getAuthHeaders() }
    );

    return res?.data === true || res?.data?.data === true;
  } catch (e) {
    const msg =
      e?.response?.data?.errorMessage ||
      e?.response?.data?.message ||
      "카테고리 삭제 중 오류가 발생했습니다.";
    throw new Error(msg);
  }
};

export const createSpecies = async (speciesName) => {
  const name = (speciesName ?? "").toString().trim();
  if (!name) throw new Error("종 이름이 비어있습니다.");

  try {
    await axios.post(
      `${API_BASE_URL}/pets/species`,
      { name },
      { headers: getAuthHeaders() }
    );
    return true;
  } catch (e) {
    const msg =
      e?.response?.data?.errorMessage ||
      e?.response?.data?.message ||
      "종 생성 중 오류가 발생했습니다.";
    throw new Error(msg);
  }
};

export const deleteSpecies = async (speciesId) => {
  if (speciesId == null) throw new Error("speciesId가 없습니다.");

  try {
    await axios.delete(`${API_BASE_URL}/pets/species/${speciesId}`, {
      headers: getAuthHeaders(),
    });
    return true;
  } catch (e) {
    const msg =
      e?.response?.data?.errorMessage ||
      e?.response?.data?.message ||
      "종 삭제 중 오류가 발생했습니다.";
    throw new Error(msg);
  }
};

export const createBreed = async (speciesId, breedName) => {
  if (speciesId == null) throw new Error("speciesId가 없습니다.");

  const name = (breedName ?? "").toString().trim();
  if (!name) throw new Error("세부 종(품종) 이름이 비어있습니다.");

  try {
    await axios.post(
      `${API_BASE_URL}/pets/breed`,
      { speciesId, name },
      { headers: getAuthHeaders() }
    );
    return true;
  } catch (e) {
    const msg =
      e?.response?.data?.errorMessage ||
      e?.response?.data?.message ||
      "세부 종(품종) 생성 중 오류가 발생했습니다.";
    throw new Error(msg);
  }
};

export const deleteBreed = async (breedId) => {
  if (breedId == null) throw new Error("breedId가 없습니다.");

  try {
    await axios.delete(`${API_BASE_URL}/pets/breed/${breedId}`, {
      headers: getAuthHeaders(),
    });
    return true;
  } catch (e) {
    const msg =
      e?.response?.data?.errorMessage ||
      e?.response?.data?.message ||
      "세부 종(품종) 삭제 중 오류가 발생했습니다.";
    throw new Error(msg);
  }
};
