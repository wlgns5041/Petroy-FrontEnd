import React, { useState } from "react";
// import React, { useEffect } from "react";
import PropTypes from "prop-types";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Friend/FriendList.css";
import InfoIcon from "@mui/icons-material/Info";
import FriendDetail from "./FriendDetail";
// import axios from "axios";

// const API_BASE_URL = process.env.REACT_APP_API_URL;

const FriendList = ({ friends, onAccept, onReject }) => {
  const [openDetailId, setOpenDetailId] = useState(null);
  //   const [petInfoMap, setPetInfoMap] = useState({});

  const isRequest = onAccept && onReject;

  //   const fetchFriendPets = async (memberId) => {
  //     try {
  //       const token = localStorage.getItem("accessToken");
  //       const response = await axios.get(
  //         `${API_BASE_URL}/pets/friend/${memberId}`,
  //         {
  //           headers: {
  //             Authorization: `${token}`,
  //           },
  //         }
  //       );
  //       return response.data;
  //     } catch (error) {
  //       console.error("펫 정보 불러오기 실패:", error);
  //       return [];
  //     }
  //   };

  //   useEffect(() => {
  //     const loadPets = async () => {
  //       const newMap = {};
  //       for (const friend of friends) {
  //         const pets = await fetchFriendPets(friend.id);
  //         newMap[friend.id] = pets.map((p) => p.name);
  //       }
  //       setPetInfoMap(newMap);
  //     };

  //     if (!isRequest) {
  //       loadPets();
  //     }
  //   }, [friends, isRequest]);

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
      <div className="friendEmptyMessage">
        {isRequest ? "친구 요청이 없습니다." : "친구가 없습니다."}
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
