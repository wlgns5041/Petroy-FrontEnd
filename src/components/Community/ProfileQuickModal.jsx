import React, { useEffect, useMemo, useState } from "react";
import "../../styles/Community/ProfileQuickModal.css";
import AlertModal from "../../components/commons/AlertModal.jsx";
import {
  fetchMemberPets,
  fetchPetsByMemberId, 
} from "../../services/PetService";
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

import ProfileImage from "../../components/commons/ProfileImage.jsx";
import PetImage from "../../components/commons/PetImage.jsx";
import { useTheme } from "../../utils/ThemeContext.jsx";

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

  const { isDarkMode } = useTheme();

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

  const isMe = useMemo(
    () => me && target && String(me.id) === String(target.id),
    [me, target]
  );

  const myPosts = useMemo(() => posts || [], [posts]);

  /** 친구 요청 */
  const handleAddFriend = async () => {
    if (!target?.id || isFriend || isPending || sending) return;

    try {
      setSending(true);
      await sendFriendRequest(target.id);
      setIsPending(true);
      setAlertMessage("친구 요청을 보냈습니다.");
      setShowAlert(true);
    } catch {
      setAlertMessage("친구 요청에 실패했습니다.");
      setShowAlert(true);
    } finally {
      setSending(false);
    }
  };

  /** ✅ 기본 데이터 로딩 */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const meResp = await fetchCurrentMember();
        setMe(meResp ?? null);

        const viewingMe =
          !user || (meResp && String(user?.id) === String(meResp?.id));

        const targetUser = viewingMe ? meResp : user;
        setTarget(targetUser);

        /** 친구 관계 */
        if (!viewingMe && targetUser?.id) {
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
        }

        /** 게시글 */
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
          const all = Array.isArray(allResp)
            ? allResp
            : allResp?.content ?? [];

          const mine = all.filter(
            (p) => String(p?.member?.id) === String(targetUser?.id)
          );

          setPosts(mine.map(normalizeFromCommunity));
        }
      } catch (e) {
        console.error("프로필 모달 데이터 로딩 실패:", e);
        setAlertMessage("프로필 정보를 불러오는 중 오류가 발생했습니다.");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /** ✅ 펫 정보 로딩 (여기에 친구 로직 추가됨) */
  useEffect(() => {
    const loadPets = async () => {
      if (!me || !target) return;

      // ✅ 내 프로필
      if (isMe) {
        const myPets = await fetchMemberPets().catch(() => []);
        setPets(Array.isArray(myPets) ? myPets : []);
        return;
      }

      // ✅ 친구 프로필
      if (isFriend && target?.id) {
        const friendPets = await fetchPetsByMemberId(target.id).catch(
          () => []
        );

        const filtered = (friendPets || []).filter(
          (pet) =>
            pet.deleted !== true &&
            pet.deletedYn !== "Y" &&
            pet.status !== "DELETED"
        );

        setPets(filtered);
        return;
      }

      // ✅ 친구 아닌 경우
      setPets([]);
    };

    loadPets();
  }, [me, target, isFriend, isMe]);

  /** ESC 닫기 */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (loading) {
    return (
      <div className="communityprofile-overlay" onClick={onClose}>
        <div className="communityprofile-modal">
          <div className="communityprofile-loading">불러오는 중…</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="communityprofile-overlay" onClick={onClose}>
        <div
          className="communityprofile-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 프로필 */}
          <div className="communityprofile-header">
{(() => {
  const hasProfileImage = !!(target?.image || target?.profileImage);

  return (
    <ProfileImage
      src={target?.image || target?.profileImage}
      className={`communityprofile-avatar ${
        !hasProfileImage && isDarkMode ? "dark-mode" : ""
      }`}
      alt={target?.name || "프로필 이미지"}
      title={target?.name}
    />
  );
})()}

            <div className="communityprofile-meta">
              <div className="communityprofile-name">
                {target?.name || "이름 없음"}
              </div>
            </div>

            <div className="communityprofile-header-actions">
              {!isMe && target?.id && (
                <button
                  className={`communityprofile-friend-btn ${
                    isFriend ? "is-friend" : isPending ? "is-pending" : ""
                  }`}
                  onClick={handleAddFriend}
                  disabled={isFriend || isPending || sending}
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
                className="communityprofile-close-btn"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ✅ 반려동물 */}
          <section className="communityprofile-pet-section">
            <h3 className="communityprofile-pet-lable">반려동물 목록</h3>

            {isMe || isFriend ? (
              pets.length === 0 ? (
                <div className="communityprofile-empty">
                  등록된 반려동물이 없습니다
                </div>
              ) : (
                <ul className="communityprofile-pet-list">
                  {pets.map((pet) => (
                    <li key={pet.petId} className="communityprofile-pet-item">
                      <PetImage
                        src={pet.image}
                        alt={pet.name}
                        className="communityprofile-pet-image"
                      />

                      <div className="communityprofile-pet-info">
                        <div className="communityprofile-pet-name">
                          {pet.name}
                        </div>
                        {getBreedOnly(pet) && (
                          <div className="communityprofile-pet-sub">
                            {getBreedOnly(pet)}
                          </div>
                        )}
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

          {/* 🔸 게시글 목록 */}
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
                    <div className="communityprofile-post-info">
                      <div className="communityprofile-post-title">
                        {p.title}
                      </div>
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
      </div>

      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      )}
    </>
  );
};

export default ProfileQuickModal;