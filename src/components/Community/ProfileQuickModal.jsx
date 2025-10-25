import React, { useEffect, useMemo, useState } from "react";
import "../../styles/Community/ProfileQuickModal.css";
import defaultPetPic from "../../assets/images/DefaultImage.png";
import AlertModal from "../../components/commons/AlertModal.jsx"; 
import { fetchMemberPets } from "../../services/PetService";
import {
  fetchMemberPosts,
  fetchCommunityPosts,
} from "../../services/CommunityService";
import { fetchCurrentMember } from "../../services/MemberService";

import {
  fetchAcceptedFriends,
  fetchPendingFriends,
  sendFriendRequest,
} from "../../services/FriendService";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CheckIcon from "@mui/icons-material/Check";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";

const ProfileQuickModal = ({ user, onClose, onJumpToPost }) => {
  const [me, setMe] = useState(null);
  const [target, setTarget] = useState(null);
  const [pets, setPets] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const normalizeFromCommunity = (p) => ({
    postId: p?.post?.postId,
    title: p?.post?.title,
    content: p?.post?.content,
    postImageDtoList: p?.postImageDtoList || [],
  });

  const normalizeFromMine = (p) => ({
    postId: p?.postId,
    title: p?.title,
    content: p?.content,
    postImageDtoList: p?.postImageDtoList || [],
  });

  const getBreedOnly = (pet) =>
    pet?.breed || pet?.breedLabel || pet?.breedName || "";

  const handleAddFriend = async () => {
    if (!target?.id || isFriend || isPending || sending) return;
    try {
      setSending(true);
      await sendFriendRequest(target.id);
      setIsPending(true);
      setAlertMessage("친구 요청을 보냈습니다."); 
      setShowAlert(true);
    } catch (e) {
      console.error(e);
      setAlertMessage("친구 요청에 실패했습니다."); 
      setShowAlert(true);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const meResp = await fetchCurrentMember();
        setMe(meResp || null);

        const viewingMe =
          !user || (meResp && String(user?.id) === String(meResp?.id));
        const targetUser = viewingMe ? meResp : user;
        setTarget(targetUser);

        if (!viewingMe && targetUser?.id) {
          try {
            const [accepted, pending] = await Promise.all([
              fetchAcceptedFriends().catch(() => []),
              fetchPendingFriends().catch(() => []),
            ]);
            const acceptedIds = new Set(
              (accepted || []).map((f) => String(f.id))
            );
            const pendingIds = new Set(
              (pending || []).map((r) => String(r.id))
            );
            setIsFriend(acceptedIds.has(String(targetUser.id)));
            setIsPending(pendingIds.has(String(targetUser.id)));
          } catch (_) {
            setIsFriend(false);
            setIsPending(false);
          }
        }

        if (viewingMe) {
          const myPets = await fetchMemberPets().catch(() => []);
          setPets(Array.isArray(myPets) ? myPets : []);
        } else {
          const dummyPets = [
            {
              petId: "dummy-1",
              name: "코코",
              breed: "포메라니안",
              image: "https://place-puppy.com/100x100",
            },
            {
              petId: "dummy-2",
              name: "루비",
              breed: "러시안블루",
              image: "https://placekitten.com/100/100",
            },
          ];
          setPets(dummyPets);
        }

        if (viewingMe) {
          const myPostsResp = await fetchMemberPosts(token);
          const raw = myPostsResp?.content ?? myPostsResp ?? [];
          const filtered = raw.filter((p) => {
            const status = p?.postStatus ?? p?.status;
            const deletedYn = p?.deletedYn ?? p?.isDeleted ?? p?.deleted;
            const deletedAt = p?.deletedAt;
            return !(
              status === "DELETED" ||
              status === "REMOVED" ||
              deletedYn === true ||
              deletedYn === "Y" ||
              !!deletedAt
            );
          });
          setPosts(filtered.map(normalizeFromMine));
        } else {
          const allResp = await fetchCommunityPosts();
          const all = Array.isArray(allResp) ? allResp : allResp?.content ?? [];
          const mine = all.filter(
            (p) => String(p?.member?.id) === String(targetUser?.id)
          );
          setPosts(mine.map(normalizeFromCommunity));
        }
      } catch (e) {
        console.error("프로필 모달 데이터 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const myPosts = useMemo(() => posts || [], [posts]);

  if (loading) {
    return (
      <div className="communityprofile-overlay" onClick={onClose}>
        <div
          className="communityprofile-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="communityprofile-loading">불러오는 중…</div>
        </div>
      </div>
    );
  }

  const isMe = me && target && String(me.id) === String(target.id);

  return (
    <div className="communityprofile-overlay" onClick={onClose}>
      <div
        className="communityprofile-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="communityprofile-header">
          <img
            src={target?.image || target?.profileImage || defaultPetPic}
            alt="프로필"
            className="communityprofile-avatar"
          />
          <div className="communityprofile-meta">
            <div className="communityprofile-name">
              {target?.name || "이름 없음"}
            </div>
          </div>

          <div className="communityprofile-header-actions">
            {!isMe && target?.id && (
              <button
                type="button"
                className={`communityprofile-friend-btn ${
                  isFriend ? "is-friend" : isPending ? "is-pending" : ""
                }`}
                onClick={handleAddFriend}
                disabled={isFriend || isPending || sending}
                title={
                  isFriend
                    ? "이미 친구입니다"
                    : isPending
                    ? "요청 대기중"
                    : "친구 추가"
                }
                aria-label={
                  isFriend
                    ? "이미 친구"
                    : isPending
                    ? "친구 요청 대기중"
                    : "친구 추가"
                }
              >
                {isFriend ? (
                  <CheckIcon />
                ) : isPending ? (
                  <HourglassTopIcon />
                ) : (
                  <PersonAddAlt1Icon />
                )}
              </button>
            )}

            <button
              type="button"
              className="communityprofile-close-btn"
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>

        <section className="communityprofile-pet-section">
          <h3 className="communityprofile-pet-lable">반려동물 목록</h3>

          {isMe || isFriend ? (
            pets.length === 0 ? (
              <div className="communityprofile-empty">
                {isMe
                  ? "등록된 반려동물이 없습니다"
                  : "공개된 반려동물이 없습니다"}
              </div>
            ) : (
              <ul className="communityprofile-pet-list">
                {pets.map((pet) => (
                  <li key={pet.petId} className="communityprofile-pet-item">
                    <img
                      src={pet.image || defaultPetPic}
                      alt={pet.name}
                      className="communityprofile-pet-image"
                    />
                    <div className="communityprofile-pet-info">
                      <div className="communityprofile-pet-name">
                        {pet.name}
                      </div>
                      {(() => {
                        const breed = getBreedOnly(pet);
                        return breed ? (
                          <div className="communityprofile-pet-sub">
                            {breed}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="communityprofile-empty">
              친구를 맺어 해당 사용자의 반려동물을 확인할 수 있어요!
            </div>
          )}
        </section>

        <section className="communityprofile-post-section">
          <h3 className="communityprofile-post-lable">작성한 글 목록</h3>
          {myPosts.length === 0 ? (
            <div className="communityprofile-empty">작성한 글이 없습니다</div>
          ) : (
            <ul className="communityprofile-post-list">
              {myPosts.slice(0, 10).map((p) => (
                <li
                  key={p.postId}
                  className="communityprofile-post-item"
                  onClick={() => {
                    onClose?.();
                    onJumpToPost?.(p.postId);
                  }}
                >
                  <img
                    src={p.postImageDtoList?.[0]?.imageUrl || defaultPetPic}
                    alt="thumbnail"
                    className="communityprofile-post-image"
                  />
                  <div className="communityprofile-post-info">
                    <div className="communityprofile-post-title">{p.title}</div>
                    <div className="communityprofile-post-content one-line">
                      {p.content}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default ProfileQuickModal;