import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const subscribeNotification = () => {
  const token = localStorage.getItem('accessToken');

  if (window.__eventSourceInstance && window.__eventSourceInstance.readyState !== 2) {
    console.log('이미 SSE 연결 중이므로 새로 연결하지 않음');
    return window.__eventSourceInstance;
  }

  const eventSource = new EventSource(`${API_BASE_URL}/notification/subscribe?token=${token}`);
  window.__eventSourceInstance = eventSource;

  eventSource.onopen = () => {
    console.log('✅ SSE 연결 성공');
  };

  eventSource.onmessage = (event) => {
    console.log('📩 수신된 메시지:', event.data);
  };

  eventSource.addEventListener("FRIEND_REQUEST", (e) => {
    const data = JSON.parse(e.data);
    toast.info(`${data.sendMemberName}님이 친구 요청을 보냈습니다!`, {
      autoClose: 200000,
      style: {
        backgroundColor: '#fafafa',
        color: 'black',
        fontWeight: 600,
      }
    });
  });

  eventSource.addEventListener("FRIEND_ACCEPTED", (e) => {
    const data = JSON.parse(e.data);
    toast.success(`${data.sendMemberName}님이 친구 요청을 수락했습니다!`, {
      autoClose: 200000,
      style: {
        backgroundColor: '#fafafa',
        color: 'black',
        fontWeight: 600,
      }
    });
  });

  eventSource.addEventListener("FRIEND_REJECTED", (e) => {
    const data = JSON.parse(e.data);
    toast.error(`${data.sendMemberName}님이 친구 요청을 거절했습니다.`, {
      autoClose: 200000,
      style: {
        backgroundColor: '#fafafa',
        color: 'black',
        fontWeight: 600,
      }
    });
  });

  eventSource.addEventListener("SCHEDULE", (e) => {
    const data = JSON.parse(e.data);
    toast.info(`${data.entityId}에 대한 알림이 도착했습니다.`, {
      autoClose: 200000,
      style: {
        backgroundColor: '#fafafa',
        color: 'black',
        fontWeight: 600,
      }
    });
  });

  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error);
    eventSource.close();
    window.__eventSourceInstance = null;
  };

  return eventSource;
};