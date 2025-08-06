const API_BASE_URL = process.env.REACT_APP_API_URL;

export const fetchMemberPosts = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/members/posts`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('게시물 정보를 찾을 수 없습니다', errorText);
        }

        return await response.json();
    } catch (error) {
        console.error('게시물 정보를 불러오는 중 오류 발생:', error);
    }
};

export const fetchCategories = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/community/category`, {
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!response.ok) throw new Error("카테고리 불러오기 실패");

    const data = await response.json();

    return Array.isArray(data) ? data : (data.postCategory || []);
  } catch (error) {
    console.error("카테고리 목록 조회 실패:", error);
    return [];
  }
};

export const fetchCommunityPosts = async () => {
  try {
    const token = localStorage.getItem("accessToken"); 
    const response = await fetch(`${API_BASE_URL}/community/posts`, {
      headers: {
        Authorization: `${token}`, 
      },
    });

    if (!response.ok) {
      console.error("응답 실패:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.postList || []);
  } catch (err) {
    console.error("게시글 조회 실패:", err);
    return [];
  }
};

export const createPost = async (formData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/community/posts`, {
      method: 'POST',
      headers: {
        Authorization: `${token}`,
      },
      body: formData,
    });

    return response.ok;
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    return false;
  }
};

export const updatePost = async (postId, formData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/community/posts/${postId}`, {
      method: 'PATCH',
      headers: { Authorization: token },
      body: formData,
    });
    return response.ok;
  } catch (err) {
    console.error('게시글 수정 실패:', err);
    return false;
  }
};

export const deletePost = async (postId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/community/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: token },
    });
    return response.ok;
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    return false;
  }
};

export const fetchComments = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`);
    return response.ok ? await response.json() : [];
  } catch (err) {
    console.error('댓글 조회 실패:', err);
    return [];
  }
};

export const createComment = async (postId, content, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return response.ok;
  } catch (err) {
    console.error('댓글 작성 실패:', err);
    return false;
  }
};