import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

/* ---------------------- 회원 정보 ---------------------- */

// 내 정보 조회
export const fetchCurrentMember = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("토큰 없음: 로그인 필요");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: "GET",
      headers: { Authorization: `${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("회원 정보를 찾을 수 없습니다", errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("회원 정보를 불러오는 중 오류 발생:", error);
    return null;
  }
};

/* ---------------------- 인증 / 가입 ---------------------- */

// 로그인
export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/members/login`, {
    email,
    password,
  });
  return response.data;
};

// 회원가입
export const registerMember = async (payload) => {
  return await axios.post(`${API_BASE_URL}/members`, payload);
};

/* ---------------------- 중복 확인 ---------------------- */

// 이메일 중복확인
export const checkEmailDuplicate = async (email) => {
  const response = await axios.get(`${API_BASE_URL}/members/check-email`, {
    params: { email },
  });
  return response;
};

// 이름 중복확인
export const checkNameDuplicate = async (name) => {
  const response = await axios.get(`${API_BASE_URL}/members/check-name`, {
    params: { name },
  });
  return response;
};

/* ---------------------- 카카오 로그인 ---------------------- */

// ✅ case1: code → 토큰 발급
export const issueOauthToken = async (code) => {
  const res = await axios.post(`${API_BASE_URL}/oauth/token/issue`, { code });
  return res.data; 
};

// ✅ case2: registerId + extraInfo → 토큰 발급
export const submitKakaoExtraInfo = async ({ registerId, email, phone }) => {
  const res = await axios.post(`${API_BASE_URL}/oauth/kakao/extraInfo`, {
    registerId,
    email,
    phone,
  });
  return res.data; 
};

/* ---------------------- 회원 수정 ---------------------- */

// 이름 변경
export const updateMemberName = async (token, newName) => {
  const response = await fetch(`${API_BASE_URL}/members`, {
    method: "PATCH",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  });

  if (!response.ok) throw new Error("이름 수정 실패");
};

// 프로필 이미지 변경
export const uploadMemberImage = async (token, formData) => {
  const response = await fetch(`${API_BASE_URL}/members/image`, {
    method: "PATCH",
    headers: { Authorization: token },
    body: formData,
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg || "이미지 업로드 실패");
  }

  return await response.text();
};

/* ---------------------- 회원 탈퇴 ---------------------- */

// 회원 탈퇴
export const deleteMember = async (token) => {
  const response = await fetch(`${API_BASE_URL}/members`, {
    method: "DELETE",
    headers: { Authorization: token },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "회원 탈퇴 실패");
  }
};

/* ---------------------- 게스트 로그인 ---------------------- */

export const loginGuest = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/members/guest`);

    const { accessToken, refreshToken } = res.data;

    return { accessToken, refreshToken };
  } catch (error) {
    const server = error?.response?.data;
    const message =
      server?.errorMessage ||
      error?.message ||
      "게스트 로그인 중 오류가 발생했습니다.";

    throw new Error(message);
  }
};