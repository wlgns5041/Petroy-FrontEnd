import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL;


export const subscribeNotification = () => {
  const token = localStorage.getItem('accessToken');

  const eventSource = new EventSource(`${API_BASE_URL}/notification/subscribe?token=${token}`);

  eventSource.onopen = () => {
    console.log('SSE 연결 성공');
  };

  eventSource.onmessage = (event) => {
    console.log('수신된 메시지:', event.data);
  };

  eventSource.addEventListener("FRIEND_REQUEST", (e) => {
    const data = JSON.parse(e.data);
    toast.info(`${data.sendMemberName}님이 친구 요청을 보냈습니다!`, {
      position: "top-right",
      autoClose: 20000,
      hideProgressBar: false,
      closeOnClick: true,
      style: {
        backgroundColor: '#ffcc00',
        color: 'black',
      }
    });
  });
  
  eventSource.addEventListener("FRIEND_ACCEPTED", (e) => {
    const data = JSON.parse(e.data);
    toast.success(`${data.sendMemberName}님이 친구 요청을 수락했습니다!`, {
      position: "top-right",
      autoClose: 20000,
      hideProgressBar: false,
      closeOnClick: true,
      style: {
        backgroundColor: '#28a745',  
        color: 'white',
      }
    });
  });
  
  eventSource.addEventListener("FRIEND_REJECTED", (e) => {
    const data = JSON.parse(e.data);
    toast.error(`${data.sendMemberName}님이 친구 요청을 거절했습니다.`, {
      position: "top-right",
      autoClose: 20000,
      hideProgressBar: false,
      closeOnClick: true,
      style: {
        backgroundColor: '#dc3545',  
        color: 'white',
      }
    });
  });
  
  eventSource.addEventListener("SCHEDULE", (e) => {
    const data = JSON.parse(e.data);
    toast.info(`새로운 일정이 추가되었습니다: ${data.scheduleTitle}`, {
      position: "top-right",
      autoClose: 20000,
      hideProgressBar: false,
      closeOnClick: true,
      style: {
        backgroundColor: '#007bff',  
        color: 'white',
      }
    });
  });
  
  eventSource.addEventListener("POST", (e) => {
    const data = JSON.parse(e.data);
    toast.info(`새로운 커뮤니티 알림: ${data.postTitle}`, {
      position: "top-right",
      autoClose: 20000,
      hideProgressBar: false,
      closeOnClick: true,
      style: {
        backgroundColor: '#17a2b8',  
        color: 'white',
      }
    });
  });

  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error);
    eventSource.close();
  };

  return eventSource;
};

