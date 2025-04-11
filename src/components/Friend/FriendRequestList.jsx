import React from 'react';
import PropTypes from 'prop-types';
import FriendList from './FriendList.jsx'; 

const FriendRequestsList = ({ requests, onRequestAction }) => {
    const handleAccept = (id) => onRequestAction(id, 'ACCEPTED'); // 친구 요청을 수락하는 핸들러
    const handleReject = (id) => onRequestAction(id, 'REJECTED');  // 친구 요청을 거절하는 핸들러

    return (
        <FriendList 
            friends={requests} // FriendList에 요청 목록을 전달
            onAccept={handleAccept} // 수락 버튼 클릭 시 호출될 함수
            onReject={handleReject} // 거절 버튼 클릭 시 호출될 함수
        />
    );
};

// prop-types로 props의 타입을 정의
FriendRequestsList.propTypes = {
    requests: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired, // 요청의 ID는 문자열이며 필수
        name: PropTypes.string.isRequired, // 요청의 이름은 문자열이며 필수
        image: PropTypes.string, // 요청의 이미지 URL은 문자열
    })).isRequired, // requests는 배열이며 필수
    onRequestAction: PropTypes.func.isRequired, // onRequestAction은 함수이며 필수
};

export default FriendRequestsList; 
