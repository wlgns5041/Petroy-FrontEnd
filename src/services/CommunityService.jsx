import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

/* ---------------------- 멤버 관련 ---------------------- */

// 특정 회원의 게시글 조회
export const fetchMemberPosts = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/members/posts`, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    console.error("게시물 정보를 불러오는 중 오류:", error);
    return [];
  }
};

/* ---------------------- 카테고리 ---------------------- */

// 게시글 카테고리 목록 조회
export const fetchCategories = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/community/category`, {
      headers: { Authorization: token },
    });

    const data = response.data;
    return Array.isArray(data) ? data : data.postCategory || [];
  } catch (error) {
    console.error("카테고리 목록 조회 실패:", error);
    return [];
  }
};

/* ---------------------- 게시글 ---------------------- */

// 전체 게시글 조회
export const fetchCommunityPosts = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/community/posts`, {
      headers: { Authorization: token },
    });

    const data = response.data;
    return Array.isArray(data) ? data : data.postList || [];
  } catch (error) {
    console.error("게시글 조회 실패:", error);
    return [];
  }
};

// 게시글 생성
export const createPost = async (formData, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/community/posts`, formData, {
      headers: { Authorization: token },
    });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("게시글 생성 실패:", error);
    return false;
  }
};

// 게시글 수정
export const updatePost = async (postId, formData, token) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/community/posts/${postId}`, formData, {
      headers: { Authorization: token },
    });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("게시글 수정 실패:", error);
    return false;
  }
};

// 게시글 삭제
export const deletePost = async (postId, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/community/posts/${postId}`, {
      headers: { Authorization: token },
    });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    return false;
  }
};

/* ---------------------- 게시글 검색 / 정렬 ---------------------- */

// 게시글 검색
export const searchCommunityPosts = async (keyword) => {
  if (!keyword || !keyword.trim()) return [];
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/community/posts`, {
      headers: { Authorization: token },
      params: { keyword: keyword.trim() },
    });

    const data = response.data;
    return Array.isArray(data?.posts) ? data.posts : [];
  } catch (error) {
    console.error("게시글 검색 실패:", error);
    return [];
  }
};

// 정렬 키 매핑
const SORT_KEYS = {
  latest: "createdAt",
  comments: "commentCount",
  sympathy: "sympathyCount",
};

// 정렬된 게시글 조회
export const fetchCommunityPostsSorted = async ({
  sort = "latest",
  order = "desc",
} = {}) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/community/posts`, {
      headers: { Authorization: token },
      params: {
        sort: SORT_KEYS[sort] || SORT_KEYS.latest,
        order: order === "asc" ? "asc" : "desc",
      },
    });

    const data = response.data;
    return Array.isArray(data) ? data : data.postList || [];
  } catch (error) {
    console.error("정렬 조회 실패:", error);
    return [];
  }
};

/* ---------------------- 댓글 ---------------------- */

// 댓글 작성
export const createComment = async (postId, content, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/community/comments`,
      { postId, content },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("댓글 작성 실패:", error);
    return null;
  }
};

// 댓글 수정
export const updateComment = async (commentId, content, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/community/comments/${commentId}`,
      { content },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("댓글 수정 실패:", error);
    return false;
  }
};

// 댓글 삭제
export const deleteComment = async (commentId, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/community/comments/${commentId}`,
      { headers: { Authorization: token } }
    );
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    return false;
  }
};

/* ---------------------- 공감 ---------------------- */

// 공감 등록 / 변경
export const registerSympathy = async (postId, type, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/community/sympathy/${postId}`,
      { type },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("공감 등록/변경 실패:", error);
    return false;
  }
};

// 공감 취소
export const deleteSympathy = async (postId, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/community/sympathy/${postId}`,
      { headers: { Authorization: token } }
    );
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("공감 취소 실패:", error);
    return false;
  }
};