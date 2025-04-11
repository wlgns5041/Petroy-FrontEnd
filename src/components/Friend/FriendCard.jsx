import React, { useState } from 'react';
import PropTypes from 'prop-types';
import defaultProfilePic from '../../assets/images/DefaultImage.png';
import '../../styles/Friend/FriendCard.css';
import PersonIcon from '@mui/icons-material/Person'; // MUI 아이콘
import FriendDetail from './FriendDetail'; // 모달 컴포넌트 import

const FriendCard = ({ id, name, image, onAccept, onReject }) => {
    const isRequest = onAccept && onReject;
    const [showDetail, setShowDetail] = useState(false); // 모달 상태


    return (
        <>
            <div className="friendCard">
                <img
                    src={image || defaultProfilePic}
                    alt={name}
                    className="friendImage"
                />

                <div className="friendTextBox">
                    <h2 className="friendName">{name}</h2>
                </div>

                {isRequest ? (
                    <div className="friendActions">
                        <button onClick={() => onAccept(id)} className="accept-button">수락</button>
                        <button onClick={() => onReject(id)} className="reject-button">거절</button>
                    </div>
                ) : (
                    <button
                        className="icon-button"
                        onClick={() => setShowDetail(true)}
                        aria-label="친구 정보 보기"
                    >
                        <PersonIcon />
                    </button>
                )}
            </div>

            {showDetail && (
                <FriendDetail memberId={Number(id)} onClose={() => setShowDetail(false)} />
            )}
        </>
    );
};

FriendCard.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    onAccept: PropTypes.func,
    onReject: PropTypes.func,
};

export default FriendCard;