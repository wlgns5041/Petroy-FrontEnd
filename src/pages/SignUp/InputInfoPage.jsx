import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/SignUp/InputInfoPage.css';

function InputInfo() {
  const [userData, setUserData] = useState({ email: '', phone: '' }); // 사용자 데이터 관리
  const [accessToken, setAccessToken] = useState(null); // 액세스 토큰 관리
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  useEffect(() => {
    // URL 쿼리 파라미터에서 토큰을 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      console.log('쿼리 파라미터에서 가져온 토큰:', token);
      
      // 토큰을 로컬 스토리지에 저장하고 상태 업데이트
      localStorage.setItem('accessToken', token);
      setAccessToken(token);
    } else {
      // 로컬 스토리지에서 액세스 토큰을 가져오기
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        console.log('로컬 스토리지에서 가져온 토큰:', storedToken);
        setAccessToken(storedToken);
      } else {
        console.error('로컬 스토리지에서 액세스 토큰을 찾을 수 없습니다.');
      }
    }
  }, []); // 컴포넌트가 처음 렌더링될 때만 실행

  // 폼 제출 처리 함수
  const handleSubmit = async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지
  
    if (!accessToken) {
      console.error('액세스 토큰이 없습니다.');
      return;
    }
  
    try {
      // 사용자 정보를 서버에 전송하는 POST 요청
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/oauth/kakao/extraInfo`, 
        {
          email: userData.email,
          phone: userData.phone,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${accessToken}`, 
          },
        }
      );
  
      const data = response.data;
  
      alert('카카오 회원가입 성공');
  
      // 서버로부터 받은 토큰을 로컬 스토리지에 저장
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
  
      // 성공적으로 회원가입 후 메인 페이지로 이동
      navigate('/mainPage');
    } catch (error) {
      console.error('서버 전송 실패:', error); // 에러 로그
    }
  };
  
  return (
    <div className="inputInfoPage" >
      <div className="inputInfoPageContainer" >
      <h2 className="inputInfoTitle">카카오 로그인을 위해 추가 정보를 입력해주세요</h2>
      <form onSubmit={handleSubmit} className="inputInfoForm">
  <div className="inputInfoGroup">
    <label className="inputInfoLabel">이메일 :</label>
    <input 
      type="email" 
      value={userData.email}
      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
      required
      className="inputInfoInput"
    />
  </div>

  <div className="inputInfoGroup">
    <label className="inputInfoLabel">전화번호 :</label>
    <input 
      type="tel" 
      value={userData.phone}
      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
      required
      className="inputInfoInput"
    />
  </div>

<div className="inputInfoButtonGroup">
    <button type="button" className="inputInfoCancelButton" onClick={() => navigate('/')}>홈으로 이동</button>
    <button type="submit" className="inputInfoSubmitButton">완료</button>
  </div>
</form>
      </div>
    </div>
  );
}

export default InputInfo;
