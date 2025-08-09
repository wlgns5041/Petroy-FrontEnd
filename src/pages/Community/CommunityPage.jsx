// src/pages/Community/CommunityPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchCommunityPosts,
  deletePost,
  fetchCategories,
} from "../../services/CommunityService";
import { fetchCurrentMember } from "../../services/MemberService";
import { fetchAcceptedFriends } from "../../services/FriendService";

import PostCreateModal from "../../components/Community/PostCreateModal";
import PostEditModal from "../../components/Community/PostEditModal";
import CommentSection from "../../components/Community/CommentSection";
import ProfileQuickModal from "../../components/Community/ProfileQuickModal";

import "../../styles/Community/CommunityPage.css";
import defaultPetPic from "../../assets/images/DefaultImage.png";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { InputBase, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

const CommunityPage = () => {
  const [me, setMe] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  const [allPosts, setAllPosts] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [friendIds, setFriendIds] = useState([]);

  const [openComments, setOpenComments] = useState({});
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [activeTab, setActiveTab] = useState("전체");
  const [tabIndex, setTabIndex] = useState(0);

  // 게시글에서 작성자 ID 추출
  const getAuthorIdFromPost = (p) =>
    String(
      p?.memberId ??
        p?.authorId ??
        p?.writerId ??
        p?.createdBy ??
        p?.member?.id ??
        p?.member?.memberId ??
        p?.author?.id ??
        p?.author?.memberId ??
        p?.writer?.id ??
        p?.writer?.memberId ??
        p?.post?.memberId ??
        p?.post?.authorId ??
        p?.post?.writerId ??
        p?.post?.createdBy ??
        p?.post?.member?.id ??
        p?.post?.member?.memberId ??
        p?.post?.author?.id ??
        p?.post?.author?.memberId ??
        p?.post?.writer?.id ??
        p?.post?.writer?.memberId ??
        ""
    );

  // 카테고리명
  const getCategoryName = (p) => {
    const id = p?.post?.categoryId;
    if (id == null) return "카테고리";
    return categoryMap[String(id)] || "카테고리";
  };

  // 메뉴/댓글 토글
  const toggleMenu = (idx) =>
    setMenuOpenIndex((prev) => (prev === idx ? null : idx));
  const toggleComments = (postId) =>
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  const handleProfileClick = (member) => setProfileUser(member);

  // 글 새로고침
  const reloadPosts = async () => {
    const data = await fetchCommunityPosts();
    const list = Array.isArray(data) ? data : data?.content ?? [];
    setAllPosts(list);

    // me가 존재하지만 id가 비어있다면, 새 글 기준으로 다시 유추
    setMe((prev) => {
      if (!prev) return prev;
      if (prev.id) return prev;
      const myPost = list.find((p) => {
        const m = p?.member ?? p?.post?.member ?? null;
        const nameMatch = (m?.name ?? "") === (prev?.name ?? "");
        const phoneMatch =
          (m?.phone ?? m?.mobile ?? "") === (prev?.phone ?? "");
        return (phoneMatch && prev?.phone) || (nameMatch && !prev?.phone);
      });
      if (!myPost) return prev;
      const authorId = getAuthorIdFromPost(myPost);
      return { ...prev, id: authorId || prev.id || "" };
    });
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
    reloadPosts();
  };

  const handleDelete = async (postId) => {
    const token = localStorage.getItem("accessToken");
    if (window.confirm("게시글을 삭제할까요?")) {
      const success = await deletePost(postId, token);
      if (success) reloadPosts();
    }
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedPost(null);
    reloadPosts();
  };

  // 초기 로드: 글/카테고리/내정보/친구를 한 번에 가져오고, me.id 유추 주입
  useEffect(() => {
    (async () => {
      const [postData, categories, rawMe, friends] = await Promise.all([
        fetchCommunityPosts(),
        fetchCategories(),
        fetchCurrentMember(),
        fetchAcceptedFriends().catch(() => []),
      ]);

      // 게시글
      const list = Array.isArray(postData) ? postData : postData?.content ?? [];
      setAllPosts(list);

      // 카테고리 맵
      const map = Object.fromEntries(
        (categories || []).map((c) => [
          String(c.categoryId ?? c.id),
          c.name ?? c.categoryName ?? "",
        ])
      );
      setCategoryMap(map);

      // 친구 ID 배열
      const ids = (friends || [])
        .map((f) =>
          String(
            f?.id ??
              f?.memberId ??
              f?.friendId ??
              f?.friend?.id ??
              f?.member?.id ??
              ""
          )
        )
        .filter(Boolean);
      setFriendIds(ids);

      // 내 정보 + id 유추
      if (rawMe) {
        let meWithId = { ...rawMe };
        if (!meWithId.id) {
          const myPost = list.find((p) => {
            const m = p?.member ?? p?.post?.member ?? null;
            const nameMatch = (m?.name ?? "") === (rawMe?.name ?? "");
            const phoneMatch =
              (m?.phone ?? m?.mobile ?? "") === (rawMe?.phone ?? "");
            return (phoneMatch && rawMe?.phone) || (nameMatch && !rawMe?.phone);
          });
          if (myPost) {
            const authorId = getAuthorIdFromPost(myPost);
            meWithId = { ...meWithId, id: authorId || "" };
          }
        }
        setMe(meWithId);
      } else {
        setMe(null);
      }
    })();
  }, []);

  // 탭 필터링
  const filteredPosts = useMemo(() => {
    if (!allPosts?.length) return [];
    if (activeTab === "전체") return allPosts;

    if (activeTab === "나") {
      const myId = me?.id ? String(me.id) : "";
      if (!myId) return [];
      return allPosts.filter((p) => getAuthorIdFromPost(p) === myId);
    }

    if (activeTab === "친구") {
      if (!friendIds.length) return [];
      const set = new Set(friendIds.map(String));
      return allPosts.filter((p) => set.has(getAuthorIdFromPost(p)));
    }

    return allPosts;
  }, [activeTab, allPosts, me, friendIds]);

  return (
    <div className="communitypage-container">
      <div className="communitypage-header">
        <div className="communitypage-header-left">
          <h2 className="communitypage-header-title">펫스타그램</h2>

          <div className="communitypage-tab-bar">
            <div
              className="communitypage-tab-background"
              style={{ transform: `translateX(${tabIndex * 100}%)` }}
            />
            {["전체", "친구", "나"].map((tab, index) => (
              <button
                key={tab}
                className={`communitypage-tab-button ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setTabIndex(index);
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="communitypage-header-right">
          <Paper
            component="form"
            sx={{
              display: "flex",
              alignItems: "center",
              width: 200,
              borderRadius: "8px",
              backgroundColor: "#f0f2f5",
              padding: "6px",
              boxShadow: "none",
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
                fontFamily: "Pretendard, sans-serif",
                fontSize: "12px",
              }}
              placeholder="게시물 검색"
              inputProps={{ "aria-label": "search" }}
            />
            <IconButton type="submit" sx={{ p: "1px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>

          <img
            src={(me?.image || me?.profileImage) ?? defaultPetPic}
            alt="내 프로필"
            className="communitypage-header-profile-img"
            onClick={() => handleProfileClick(me)}
            style={{ cursor: "pointer" }}
          />

          <IconButton
            aria-label="create-post"
            onClick={() => setIsModalOpen(true)}
            sx={{
              backgroundColor: "#333333",
              color: "white",
              ml: 0,
              width: 32,
              height: 32,
              borderRadius: "4px",
              padding: 1,
              "&:hover": { backgroundColor: "#6d6d6d" },
            }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </div>

      <div className="communitypage-posts">
        {filteredPosts.map((post, idx) => (
          <div key={post.post?.postId ?? idx} className="communitypage-post-card">
            <div className="communitypage-post-header">
              {/* 왼쪽 영역 */}
              <div className="communitypage-post-header-left">
                {/* 프로필/작성자/시간 */}
                <div className="communitypage-post-profile">
                  <img
                    src={
                      post.member?.image ||
                      post.member?.profileImage ||
                      defaultPetPic
                    }
                    alt="프로필"
                    className="communitypage-post-profile-img"
                    onClick={() => handleProfileClick(post.member)}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="communitypage-post-profile-info">
                    <div className="communitypage-post-author">
                      {post.member?.name}
                    </div>
                    <div className="communitypage-post-time">
                      {formatDistanceToNow(new Date(post.post.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </div>
                  </div>
                </div>

                {/* 카테고리/타이틀 */}
                <div className="communitypage-post-category-title">
                  <div className="communitypage-post-category">
                    {getCategoryName(post)}
                  </div>
                  <div className="communitypage-post-title">
                    {post.post.title}
                  </div>
                </div>
              </div>

              {/* 우측 메뉴 */}
              <div className="communitypage-post-menu">
                <button
                  className="communitypage-menu-button"
                  onClick={() => toggleMenu(idx)}
                >
                  ⋯
                </button>
                {menuOpenIndex === idx && (
                  <div className="communitypage-post-dropdown">
                    <button onClick={() => handleEdit(post)}>수정</button>
                    <button onClick={() => handleDelete(post.post.postId)}>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 이미지 */}
            {post.postImageDtoList?.length > 0 && (
              <img
                src={post.postImageDtoList[0].imageUrl}
                alt="게시글 이미지"
                className="communitypage-post-main-image"
              />
            )}

            {/* 본문 */}
            <p className="communitypage-post-content">{post.post.content}</p>

            {/* 하단 버튼 */}
            <div className="communitypage-post-footer-buttons">
              <button>감정 달기</button>
              <button onClick={() => toggleComments(post.post.postId)}>
                댓글 {post.commentTotal}
              </button>
            </div>

            {/* 댓글 섹션 */}
            {openComments[post.post.postId] && (
              <CommentSection postId={post.post.postId} />
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <PostCreateModal
          onClose={() => setIsModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {editModalOpen && selectedPost && (
        <PostEditModal
          post={selectedPost}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {profileUser && (
        <ProfileQuickModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
        />
      )}
    </div>
  );
};

export default CommunityPage;