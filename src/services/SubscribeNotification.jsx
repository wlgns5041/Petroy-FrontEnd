const API_BASE_URL = process.env.REACT_APP_API_URL;

export const subscribeNotification = async () => {
  try {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/notification/subscribe`, {
      method: 'GET',
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SSE 연결 실패:', errorData.message);
      return;
    }

    const result = await response.json();
    console.log('SSE 구독 성공:', result.message);

  } catch (err) {
    console.error('SSE 연결 중 오류 발생:', err.message);
  }
};