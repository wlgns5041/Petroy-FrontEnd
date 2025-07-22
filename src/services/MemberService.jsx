import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// 정보 조회
export const fetchCurrentMember = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/members`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('회원 정보를 찾을 수 없습니다', errorText);
        }

        return await response.json();
    } catch (error) {
        console.error('회원 정보를 불러오는 중 오류 발생:', error);
    }
};

// 로그인 요청
export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/members/login`, {
    email,
    password,
  });
  return response.data; 
};

// 회원가입 요청
export const registerMember = async (payload) => {
  return await axios.post(`${API_BASE_URL}/members`, payload); 
};

// 이메일 중복확인
export const checkEmailDuplicate = async (email) => {
  const response = await axios.get(`${API_BASE_URL}/members/check-email`, {
    params: { email },
  });
  return response; // ✅ response 전체 반환
};

// 이름 중복확인
export const checkNameDuplicate = async (name) => {
  const response = await axios.get(`${API_BASE_URL}/members/check-name`, {
    params: { name },
  });
  return response; // ✅ response 전체 반환
};

// 카카오 추가정보
export const submitKakaoExtraInfo = async (accessToken, email, phone) => {
  const response = await axios.post(
    `${API_BASE_URL}/oauth/kakao/extraInfo`,
    { email, phone },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${accessToken}`,
      },
    }
  );
  return response.data;
};

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

// 이미지 변경
export const uploadMemberImage = async (token, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/members/image`, {
    method: "PATCH",
    headers: {
      Authorization: token,
    },
    body: formData,
  });

  if (!response.ok) throw new Error("이미지 업로드 실패");

  return await response.text(); // image URL
};

// 회원 탈퇴
export const deleteMember = async (token) => {
  const response = await fetch(`${API_BASE_URL}/members`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "회원 탈퇴 실패");
  }
};