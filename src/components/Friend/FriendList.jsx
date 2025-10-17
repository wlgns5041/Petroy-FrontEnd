import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import "../../styles/Friend/FriendList.css";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import FriendDetail from "./FriendDetail";

const FriendList = ({ friends, onAccept, onReject }) => {
  const [openDetailId, setOpenDetailId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ✅ 현재 "열려 있는" 메뉴 하나만 추적
  const openMenuRef = useRef(null);

  const isRequest = onAccept && onReject;

  // ✅ 외부 클릭은 "열린 메뉴 ref"만 검사
  useEffect(() => {
    const handleOutside = (e) => {
      if (!openMenuId) return;
      if (openMenuRef.current && !openMenuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openMenuId]);

  return (
    <div className="friendlist-container">
      {friends.length > 0 ? (
        <div className="friendlist-list">
          {friends.map((friend) => (
            <div key={friend.id} className="friendlist-card">
              <div className="friendlist-image-wrapper">
                <img
                  src={friend.image || defaultProfilePic}
                  alt={friend.name}
                  className="friendlist-image"
                />
              </div>

              <div className="friendlist-info-section">
                <div className="friendlist-name">{friend.name}</div>
                <div className="friendlist-pets">
                  {friend.pets?.length > 0 ? friend.pets.join(", ") : "등록된 펫 없음"}
                </div>
              </div>

              {isRequest ? (
                <div className="friendlist-actions">
                  <button
                    onClick={() => onAccept(friend.id)}
                    className="friendlist-accept-button"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => onReject(friend.id)}
                    className="friendlist-reject-button"
                  >
                    거절
                  </button>
                </div>
              ) : (
                <div
                  className="friendlist-menu"
                  // ✅ 열린 카드에만 ref 연결
                  ref={openMenuId === friend.id ? openMenuRef : null}
                >
                  <button
                    className="friendlist-more-button"
                    onClick={() =>
                      setOpenMenuId((prev) => (prev === friend.id ? null : friend.id))
                    }
                  >
                    <MoreHorizRoundedIcon sx={{ fontSize: 20, color: "#000" }} />
                  </button>

                  {openMenuId === friend.id && (
                    <div
                      className="friendlist-dropdown"
                      onClick={(e) => e.stopPropagation()} // 내부 클릭은 전파 차단
                    >
                      <div
                        onClick={() => {
                          setOpenDetailId(friend.id);
                          setOpenMenuId(null);
                        }}
                      >
                        상세보기
                      </div>
                      <div
                        onClick={() => {
                          alert("친구 삭제 기능은 추후 구현 예정입니다.");
                          setOpenMenuId(null);
                        }}
                      >
                        친구 삭제
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {openDetailId && (
            <FriendDetail
              memberId={Number(openDetailId)}
              onClose={() => setOpenDetailId(null)}
            />
          )}
        </div>
      ) : (
        <div className="friendlist-empty-state">
          <p className="friendlist-empty-icon">🫥</p>
          <p className="friendlist-empty-message-main">
            {isRequest ? "친구 요청이 없습니다." : "친구가 없습니다."}
          </p>
          <p className="friendlist-empty-message-sub">
            {isRequest ? "받은 친구 요청이 이곳에 표시됩니다!" : "친구를 추가하면 이곳에 표시됩니다!"}
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
  title: PropTypes.string,
};

export default FriendList;