import React, { useState } from "react";
import PropTypes from "prop-types";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Friend/FriendList.css";
import InfoIcon from "@mui/icons-material/Info";
import FriendDetail from "./FriendDetail";


const FriendList = ({ friends, onAccept, onReject }) => {
  const [openDetailId, setOpenDetailId] = useState(null);

  const isRequest = onAccept && onReject;

  return (
    <div className="friendsListContainer">
      {friends.length > 0 ? (
        <div className="friendsList">
          {friends.map((friend) => (
            <div key={friend.id} className="friendCard">
              <div className="friendImageWrapper">
                <img
                  src={friend.image || defaultProfilePic}
                  alt={friend.name}
                  className="friendImage"
                />
              </div>

              <div className="friendInfoSection">
                <div className="friendName">{friend.name}</div>
                <div className="friendPets">
                  {friend.pets?.length > 0
                    ? friend.pets.join(", ")
                    : "등록된 펫 없음"}
                </div>
              </div>

              {isRequest ? (
                <div className="friendActions">
                  <button
                    onClick={() => onAccept(friend.id)}
                    className="accept-button"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => onReject(friend.id)}
                    className="reject-button"
                  >
                    거절
                  </button>
                </div>
              ) : (
                <button
                  className="friendDetailButton"
                  onClick={() => setOpenDetailId(friend.id)}
                  aria-label="친구 정보 보기"
                >
                  <InfoIcon />
                </button>
              )}

              {openDetailId === friend.id && (
                <FriendDetail
                  memberId={Number(friend.id)}
                  onClose={() => setOpenDetailId(null)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="friendEmptyState">
          <p className="friendEmptyicon">🫥</p>
          <p className="friendEmptyMessage-main">
            {isRequest ? "친구 요청이 없습니다." : "친구가 없습니다."}
          </p>
          <p className="friendEmptyMessage-sub">
            {isRequest
              ? "받은 친구 요청이 이곳에 표시됩니다!"
              : "친구를 추가하면 이곳에 표시됩니다!"}
          </p>
        </div>
      )}
    </div>
  );
};

FriendList.propTypes = {
  friends: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string,
    })
  ).isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  title: PropTypes.string.isRequired,
};

export default FriendList;
