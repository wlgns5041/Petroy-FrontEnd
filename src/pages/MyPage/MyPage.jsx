import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentMember, fetchMemberPets, fetchMemberPosts } from '../../services/TokenService.jsx';
import '../../styles/MyPage/MyPage.css'; 
import NavBar from '../../components/commons/NavBar.jsx'; 
import defaultProfilePic from '../../assets/images/DefaultImage.png';
import NameEditModal from '../../components/MyPage/NameEditModal.jsx';
import ImageEditModal from '../../components/MyPage/ImageEditModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faPen} from '@fortawesome/free-solid-svg-icons';


const API_BASE_URL = process.env.REACT_APP_API_URL; 

const MyPage = () => {
    const navigate = useNavigate(); // 리다이렉트 핸들러 함수
    const [userInfo, setUserInfo] = useState({}); // 사용자 정보
    const [pets, setPets] = useState([]); // 펫 목록
    const [posts, setPosts] = useState([]); // 작성 글 목록
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [showNameModal, setShowNameModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    // 컴포넌트가 마운트될 때 실행
    useEffect(() => {
        const token = localStorage.getItem('accessToken'); // 로컬 저장소에서 토큰 가져오기

        if (token) {
            // 비동기 함수로 데이터를 가져오는 작업
            const fetchData = async () => {
                try {
                    // 사용자 정보, 펫 목록, 포스트 목록을 동시에 가져오기 (토큰 서비스에 있음)
                    const [userResponse, petsResponse, postsResponse] = await Promise.all([
                        fetchCurrentMember(token),
                        fetchMemberPets(token),
                        fetchMemberPosts(token)
                    ]);
                    
                    // 가져온 데이터를 상태에 저장
                    setUserInfo(userResponse);
                    setPets(petsResponse?.content || []); // 펫 목록이 없을 경우 빈 배열로 초기화
                    setPosts(postsResponse?.content || []); // 포스트 목록이 없을 경우 빈 배열로 초기화
                } catch (error) {
                    console.error('데이터를 불러오는데 실패했습니다:', error); // 에러 처리
                } finally {
                    setLoading(false); // 데이터 로딩이 끝나면 로딩 상태 종료
                }
            };

            fetchData(); // 데이터 가져오기 호출
        } else {
            console.error('토큰이 없습니다'); // 토큰이 없는 경우 에러 처리
        }
    }, []); // 빈 배열을 의존성으로 설정하여 컴포넌트 마운트 시 처음에 한 번만 실행

    // 이름 변경 처리 함수
    const handleNameChange = (newName) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          fetch(`${API_BASE_URL}/members`, {
            method: 'PATCH',
            headers: {
              'Authorization': `${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newName }),
          })
            .then((response) => {
              if (response.ok) {
                setUserInfo((prev) => ({ ...prev, name: newName }));
              } else {
                console.error('이름 수정 실패');
              }
            })
            .catch((error) => console.error('이름 수정 중 오류 발생:', error));
      }
      };

      const handleImageUpload = (newImage) => {
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('image', newImage);
    
        if (token) {
          fetch(`${API_BASE_URL}/members/image`, {
            method: 'PATCH',
            headers: {
              'Authorization': `${token}`,
            },
            body: formData,
          })
            .then((response) => response.text())
            .then((imageUrl) => {
              setUserInfo((prev) => ({ ...prev, image: imageUrl }));
            })
            .catch((error) => console.error('이미지 업로드 실패:', error));
        }
      };
    
      if (loading) return <p>잠시만 기다려주세요...</p>;

    // 계정 삭제 처리 함수
    const handleAccountDelete = async () => {
        const token = localStorage.getItem('accessToken'); // 로컬 저장소에서 토큰 가져오기
        if (token) {
            try {
                // 계정을 삭제하는 DELETE 요청
                const response = await fetch(`${API_BASE_URL}/members`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `${token}`, // 인증 헤더 설정
                    }
                });

                if (!response.ok) {
                    // 응답이 성공적이지 않을 경우 에러 처리
                    const errorText = await response.text();
                    console.error('회원 탈퇴 중 오류 발생:', errorText); // 에러 로그
                } else {
                    // 로컬 저장소에서 토큰 제거 및 페이지 리디렉션
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    alert('회원 탈퇴에 성공했습니다.');
                    window.location.href = '/'; // 홈 페이지로 이동
                }
            } catch (error) {
                console.error('회원 탈퇴 중 오류 발생:', error); // 에러 로그
            }
        }
    };

    // 로그아웃 처리 함수
    const handleLogout = () => {
        // 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      
        // SSE 연결 해제
        if (window.__eventSourceInstance) {
          window.__eventSourceInstance.close();
          window.__eventSourceInstance = null;
          console.log('👋 SSE 연결 종료됨');
        }
      
        alert('로그아웃되었습니다.');
      
        // 로그인 페이지로 리디렉션
        window.location.href = '/login';
      };

    // 로딩 중일 때 메시지 표시
    if (loading) return <p>잠시만 기다려주세요...</p>;

    const handleNavigation = (path) => {
        navigate(path);
      };

    return (
        <div className="myPage">
          <NavBar title="마이페이지" />
          
          <div className="profile-card">
  <div className="profile-card-content">
    <img src={userInfo.image || defaultProfilePic} alt="profile" className="profile-image" />
    <div className="profile-info">
      <div className="name">{userInfo.name}</div>
      <div className="phone">{userInfo.phone}</div>
      <div className="counts">
        <div>
          <span className="text" onClick={() => handleNavigation('/friendPage')}>친구</span>
          <span>{userInfo.friendsCount || 0}</span>
        </div>
        <div>
          <span className="text" onClick={() => handleNavigation('/petPage')}>등록된 돌보미</span>
          <span>{userInfo.caregiverCount || 0}</span>
        </div>
      </div>
    </div>
  </div>

  <div className="myPage-button-group">
    <button className="myPage-button" onClick={() => setShowNameModal(true)}>이름 수정</button>
    <button className="myPage-button" onClick={() => setShowImageModal(true)}>이미지 수정</button>
    <button className="myPage-button gray" onClick={handleLogout}>로그아웃</button>
    <button className="myPage-button gray" onClick={handleAccountDelete}>회원 탈퇴</button>
  </div>
</div>
    
          <div className="section-card-pets">
          <h3 className="pet-section-title">
            <div className="left-group">
              <FontAwesomeIcon icon={faPaw}/>
              내 펫
            </div>
            <span className="link" onClick={() => handleNavigation('/petPage')}>펫 바로가기</span>
          </h3>
            <ul>
                {pets.length === 0 ? (
                    <li>등록된 펫이 없습니다.</li>
                ) : (
                    pets.map((pet) => (
                        <li key={pet.petId}>
                            <img src={pet.image || defaultProfilePic} alt={pet.name} />
                            <div className="info">
                                <div className="name">{pet.name}</div>
                                <div className="species">{pet.breed || '종 미등록'}</div>
                     </div>
                    </li>
                    ))
                )}
            </ul>
        </div>
          <div className="section-card-posts">
          <h3 className="pet-section-title">
            <div className="left-group">
              <FontAwesomeIcon icon={faPen}/>
              내 글
            </div>
            <span className="link" onClick={() => handleNavigation('/communityPage')}>커뮤니티 바로가기</span>
          </h3>
            <ul>
              {posts.length === 0 ? (
                <li>작성한 글이 없습니다.</li>
              ) : (
                posts.map((post) => (
                  <li key={post.postId}>
                    <strong>{post.title}</strong><br />
                    {post.content}
                  </li>
                ))
              )}
            </ul>
          </div>
    
          {showNameModal && (
            <NameEditModal 
              currentName={userInfo.name} 
              onSave={handleNameChange} 
              onClose={() => setShowNameModal(false)} 
            />
          )}
          {showImageModal && (
            <ImageEditModal 
              onSave={handleImageUpload} 
              onClose={() => setShowImageModal(false)} 
            />
          )}
        </div>
      );
    };
    
    export default MyPage;