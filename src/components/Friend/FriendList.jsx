import React from 'react';
import PropTypes from 'prop-types';
import FriendCard from './FriendCard.jsx'; 
import '../../styles/Friend/FriendList.css'; 

const FriendList = ({ friends, onAccept, onReject, title }) => {
    return (
        <div className="friendsListContainer"> 
            <h2>{title}</h2> 
            
            {/* 친구 목록이 있을 경우 */} 
            {friends.length > 0 ? (
                <div className="friendsList"> 
                    {friends.map(friend => (
                        <FriendCard 
                            key={friend.id} // 각 FriendCard에 유니크한 키 제공
                            id={friend.id} // 친구의 ID 
                            name={friend.name} // 친구의 이름 
                            image={friend.image} // 친구의 프로필 이미지 
                            onAccept={onAccept} // 수락 버튼 클릭 시 호출될 함수 
                            onReject={onReject} // 거절 버튼 클릭 시 호출될 함수 
                        />
                    ))}
                </div>
            ) : (
                // 친구가 없거나 요청이 없는 경우 메시지 표시
                <p>{title === '친구 목록' ? '친구가 없습니다.' : '친구 요청이 없습니다.'}</p>
            )}
        </div>
    );
};

// PropTypes로 props의 타입을 정의
FriendList.propTypes = {
    friends: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired, // 친구의 ID는 문자열이며 필수
        name: PropTypes.string.isRequired, // 친구의 이름은 문자열이며 필수
        image: PropTypes.string, // 친구의 이미지 URL은 문자열
    })).isRequired, // friends는 배열이며 필수
    onAccept: PropTypes.func, // onAccept는 함수로 전달
    onReject: PropTypes.func, // onReject는 함수로 전달
    title: PropTypes.string.isRequired, // title은 문자열이며 필수
};

export default FriendList; 
