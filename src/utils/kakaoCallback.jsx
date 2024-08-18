import { useLocation } from 'react-router-dom'; 
import React, { useEffect } from 'react';

function KakaoCallback() {
    const location = useLocation(); 
    const code = new URLSearchParams(location.search).get('code');
  
    useEffect(() => {
      if (code) {
        fetch('http://43.202.195.199:8080/oauth/kakao/callback', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert("카카오 로그인 성공");
          } else {
            alert("카카오 로그인 실패 : " + data.message);
          }
        })
        .catch(error => {
          console.error('에러 :', error);
        });
      }
    }, [code]);
  
    return (
      <div>
        <h1>카카오 로그인 중입니다.</h1>
      </div>
    );
  }

  export default KakaoCallback;