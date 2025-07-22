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