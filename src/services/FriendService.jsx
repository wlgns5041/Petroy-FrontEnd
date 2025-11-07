import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// 친구 상세보기
export const fetchFriendDetail = async (memberId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/friends/${memberId}`, {
    headers: { Authorization: `${token}` },
  });
  return response.data;
};

// 친구 목록 ACCEPTED 조회
export const fetchAcceptedFriends = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/friends`, {
    headers: { Authorization: `${token}` },
    params: { status: "ACCEPTED" },
  });
  return response.data.content || [];
};

// 친구 요청 PENDING 조회
export const fetchPendingFriends = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/friends`, {
    headers: { Authorization: `${token}` },
    params: { status: "PENDING" },
  });
  return response.data.content || [];
};

// 친구 수락
export const handleFriendRequest = async (memberId, action) => {
  const token = localStorage.getItem("accessToken");
  await axios.patch(
    `${API_BASE_URL}/friends/${memberId}`,
    {},
    {
      headers: { Authorization: `${token}` },
      params: { status: action },
    }
  );
};

// 친구 검색
export const searchFriends = async (keyword) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/friends/search`, {
    headers: { Authorization: `${token}` },
    params: { keyword },
  });
  return response.data.content || [];
};

// 친구 요청
export const sendFriendRequest = async (memberId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(
    `${API_BASE_URL}/friends/${memberId}`,
    {},
    { headers: { Authorization: `${token}` } }
  );
  
  if (response.status >= 200 && response.status < 300) {
    return response.data || true;
  } else {
    throw new Error("친구 요청 실패");
  }
};

// 친구 수 조회
export const fetchFriendCount = async (token) => {
  const response = await fetch(`${API_BASE_URL}/friends/count`, {
    method: "GET",
    headers: { Authorization: `${token}` },
  });

  if (!response.ok) throw new Error("친구 수 조회 실패");

  const count = await response.text();
  return Number(count);
};