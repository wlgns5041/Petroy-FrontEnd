import React, { useEffect, useMemo, useState } from "react";
import "../../styles/Community/ProfileQuickModal.css";
import defaultPetPic from "../../assets/images/DefaultImage.png";

// 서비스
import { fetchMemberPets } from "../../services/PetService";
import { fetchMemberPosts, fetchCommunityPosts } from "../../services/CommunityService";
import { fetchCurrentMember } from "../../services/MemberService";

const ProfileQuickModal = ({ user, onClose, onJumpToPost }) => {
  const [me, setMe] = useState(null);          // 로그인한 나
  const [target, setTarget] = useState(null);   // 보여줄 대상(나 또는 다른 사람)
  const [pets, setPets] = useState([]);         // 대상의 펫
  const [posts, setPosts] = useState([]);       // 대상의 글(평탄화된 형태)
  const [loading, setLoading] = useState(true);

  // 커뮤니티 응답(p) → 평탄화
  const normalizeFromCommunity = (p) => ({
    postId: p?.post?.postId,
    title: p?.post?.title,
    content: p?.post?.content,
    postImageDtoList: p?.postImageDtoList || [],
  });

  // 내 글 응답(p) → 이미 평탄
  const normalizeFromMine = (p) => ({
    postId: p?.postId,
    title: p?.title,
    content: p?.content,
    postImageDtoList: p?.postImageDtoList || [],
  });

  // 상세종(품종)만
  const getBreedOnly = (pet) => pet?.breed || pet?.breedLabel || pet?.breedName || "";

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const meResp = await fetchCurrentMember();
        setMe(meResp || null);

        const viewingMe = !user || (meResp && String(user?.id) === String(meResp?.id));
        const targetUser = viewingMe ? meResp : user;
        setTarget(targetUser);

        if (viewingMe) {
          // ✅ 내 프로필: 내 펫 + 내 글(API가 삭제글 제외하도록 되어 있거나 아래에서 필터)
          const [petList, myPostsResp] = await Promise.all([
            fetchMemberPets(),
            fetchMemberPosts(token),
          ]);
          setPets(petList || []);

          const raw = myPostsResp?.content ?? myPostsResp ?? [];
          // 삭제글 방어 필터(응답 구조에 맞춰 필요시 조정)
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
          // ✅ 다른 사람 프로필: 글은 커뮤니티 전체에서 member.id로 필터(서버가 삭제글 제외로 내려줌)
          const allResp = await fetchCommunityPosts();
          const all = Array.isArray(allResp) ? allResp : (allResp?.content ?? []);
          const mine = all.filter((p) => String(p?.member?.id) === String(targetUser?.id));
          setPosts(mine.map(normalizeFromCommunity));

          // 상대 펫 목록: 공개 API가 없으면 비공개 처리
          setPets([]); // 필요 시 fetchPetsByMemberId(memberId) 같은 API가 있으면 여기서 호출
        }
      } catch (e) {
        console.error("프로필 모달 데이터 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ESC 닫기
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const myPosts = useMemo(() => posts || [], [posts]);

  if (loading) {
    return (
      <div className="communityprofile-overlay" onClick={onClose}>
        <div className="communityprofile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="communityprofile-loading">불러오는 중…</div>
        </div>
      </div>
    );
  }

  const isMe = me && target && String(me.id) === String(target.id);

  console.log("post sample:", myPosts[0]);

  return (
    <div className="communityprofile-overlay" onClick={onClose}>
      <div
        className="communityprofile-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 헤더 */}
        <div className="communityprofile-header">
          <img
            src={target?.image || target?.profileImage || defaultPetPic}
            alt="프로필"
            className="communityprofile-avatar"
          />
          <div className="communityprofile-meta">
            <div className="communityprofile-name">{target?.name || "이름 없음"}</div>
            {isMe && (
              <div className="communityprofile-phone">
                {me?.phone || me?.mobile || "휴대폰 번호 없음"}
              </div>
            )}
          </div>
          <button type="button" className="communityprofile-close-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* 펫 목록: 내 프로필만 표시 (상대방 펫 공개 API 없을 때) */}
        {isMe && (
          <section className="communityprofile-pet-section">
            <h3 className="communityprofile-pet-lable">반려동물 목록</h3>
            {pets.length === 0 ? (
              <div className="communityprofile-empty">등록된 반려동물이 없습니다</div>
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
                      <div className="communityprofile-pet-name">{pet.name}</div>
                      {(() => {
                        const breed = getBreedOnly(pet);
                        return breed ? <div className="communityprofile-pet-sub">{breed}</div> : null;
                      })()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* 작성한 글 */}
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
        onClose?.(); // 모달 닫기
        onJumpToPost?.(p.postId); // 메인 페이지에서 해당 글로 스크롤
      }}
    >
      <img
        src={p.postImageDtoList?.[0]?.imageUrl || defaultPetPic}
        alt="thumbnail"
        className="communityprofile-post-image"
      />
      <div className="communityprofile-post-info">
        <div className="communityprofile-post-title">{p.title}</div>
        <div className="communityprofile-post-content one-line">{p.content}</div>
      </div>
    </li>
  ))}
</ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfileQuickModal;