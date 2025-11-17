import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import "../../styles/Friend/FriendList.css";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import FriendDetail from "./FriendDetail";
import FriendDeleteModal from "./FriendDeleteModal";
import { useTheme } from "../../utils/ThemeContext.jsx";
import ProfileImage from "../../components/commons/ProfileImage.jsx";

const FriendList = ({ friends, onAccept, onReject, onDeleted }) => {
  const [openDetailId, setOpenDetailId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(null);
  const [localFriends, setLocalFriends] = useState(friends);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const openMenuRef = useRef(null);
  const isRequest = onAccept && onReject;
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleOutside = (e) => {
      if (!openMenuId) return;

      const dropdown = document.querySelector(".friendlist-dropdown");
      if (dropdown && dropdown.contains(e.target)) return;

      if (openMenuRef.current && !openMenuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openMenuId]);

  useEffect(() => {
    setLocalFriends(friends);
  }, [friends]);

  const handleDeletedFriend = (friendId) => {
    setLocalFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  const handleMenuClick = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX - 30,
    });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="friendlist-container">
      {localFriends.length > 0 ? (
        <div className="friendlist-list">
          {localFriends.map((friend) => (
            <div key={friend.id} className="friendlist-card">
              <div className="friendlist-top">
                <div className="friendlist-image-wrapper">
                  <ProfileImage
                    src={friend.image}
                    alt={friend.name}
                    title={friend.name}
                    className={`friendlist-image ${
                      isDarkMode ? "dark-mode" : ""
                    }`}
                  />
                </div>

                <div className="friendlist-info-section">
                  <div className="friendlist-name">{friend.name}</div>
                  <div className="friendlist-pets">
                    {friend.pets?.length > 0
                      ? friend.pets.join(", ")
                      : "등록된 펫 없음"}
                  </div>
                </div>

                {!isRequest && (
                  <div className="friendlist-menu">
                    <button
                      className="friendlist-more-button"
                      onClick={(e) => handleMenuClick(e, friend.id)}
                      ref={openMenuId === friend.id ? openMenuRef : null}
                    >
                      <MoreHorizRoundedIcon
                        sx={{
                          fontSize: 20,
                          color: isDarkMode ? "#fff" : "#000",
                          transition: "color 0.3s ease",
                        }}
                      />
                    </button>
                  </div>
                )}
              </div>

              {isRequest && (
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
              )}

              {openMenuId === friend.id &&
                ReactDOM.createPortal(
                  <div
                    className="friendlist-dropdown"
                    style={{
                      position: "absolute",
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                    }}
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
                        setOpenDeleteModal(friend);
                        setOpenMenuId(null);
                      }}
                    >
                      친구 삭제
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          ))}

          {openDetailId && (
            <FriendDetail
              memberId={Number(openDetailId)}
              onClose={() => setOpenDetailId(null)}
            />
          )}

          {openDeleteModal && (
            <FriendDeleteModal
              friend={openDeleteModal}
              onClose={() => setOpenDeleteModal(null)}
              onDeleted={(id) => {
                handleDeletedFriend(id);
                onDeleted();
              }}
            />
          )}
        </div>
      ) : (
        <div className="friendlist-empty-state">
          <p className="friendlist-empty-message-main">
            {isRequest ? "친구 요청이 없습니다." : "친구가 없습니다."}
          </p>
          <p className="friendlist-empty-message-sub">
            {isRequest
              ? "받은 친구 요청을 처리할 수 있어요!"
              : "친구를 맺어 관리해보세요!"}
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
  onDeleted: PropTypes.func,
  title: PropTypes.string,
};

export default FriendList;
