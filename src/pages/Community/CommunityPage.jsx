import React, { useEffect, useMemo, useState } from "react";
import {
  fetchCommunityPosts,
  deletePost,
  fetchCategories,
  searchCommunityPosts,
  registerSympathy,
  deleteSympathy,
} from "../../services/CommunityService";
import { fetchCurrentMember } from "../../services/MemberService";
import { fetchAcceptedFriends } from "../../services/FriendService";

import PostCreateModal from "../../components/Community/PostCreateModal";
import PostEditModal from "../../components/Community/PostEditModal";
import PostDeleteModal from "../../components/Community/PostDeleteModal";
import CommentSection from "../../components/Community/CommentSection";
import ProfileQuickModal from "../../components/Community/ProfileQuickModal";

import "../../styles/Community/CommunityPage.css";
import defaultPetPic from "../../assets/images/DefaultImage.png";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { InputBase, Paper, IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpRounded";
import SentimentVerySatisfiedRoundedIcon from "@mui/icons-material/SentimentVerySatisfiedRounded";
import SentimentSatisfiedRoundedIcon from "@mui/icons-material/SentimentSatisfiedRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { useMediaQuery } from "@mui/material";

/* -------------------- 유틸 -------------------- */

// 공백 정규화
const normalizeName = (v) => (v ?? "").toString().trim().replace(/\s+/g, " ");

// 게시글 ID 추출 (일관성 있게 사용)
const getPostId = (p) => p?.post?.postId ?? p?.postId ?? p?.id ?? null;

// 토큰에서 내 이름 추출
const getMyNameFromToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return "";
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return "";
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));

    const keys = [
      "name",
      "memberName",
      "username",
      "preferred_username",
      "displayName",
      "given_name",
    ];
    for (const k of keys) if (payload?.[k]) return normalizeName(payload[k]);

    if (payload?.given_name || payload?.family_name) {
      return normalizeName(
        `${payload?.family_name ?? ""} ${payload?.given_name ?? ""}`
      );
    }
    return "";
  } catch {
    return "";
  }
};

// 게시글 객체에서 작성자 이름 추출
const getAuthorNameFromPost = (p) =>
  normalizeName(
    p?.member?.name ??
      p?.post?.member?.name ??
      p?.post?.memberName ??
      p?.memberName ??
      p?.author?.name ??
      p?.writer?.name ??
      p?.post?.author?.name ??
      p?.post?.writer?.name ??
      ""
  );

// 친구 탭용: 작성자 ID 추출
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

const getMemberFromPost = (p) => {
  const m =
    p?.member ??
    p?.post?.member ??
    p?.author ??
    p?.writer ??
    p?.post?.author ??
    p?.post?.writer ??
    {};

  return {
    id:
      m?.id ??
      m?.memberId ??
      p?.memberId ??
      p?.authorId ??
      p?.writerId ??
      p?.post?.memberId ??
      p?.post?.authorId ??
      p?.post?.writerId ??
      null,
    name:
      m?.name ??
      p?.memberName ??
      p?.post?.memberName ??
      p?.author?.name ??
      p?.writer?.name ??
      "",
    image: m?.image ?? m?.profileImage ?? null,
  };
};

const mergeAdjacentHighlights = (html) => {
  if (!html || typeof html !== "string") return html;
  const mergedEm = html.replace(/<\/em>\s*<em>/g, "");
  const mergedMark = mergedEm.replace(/<\/mark>\s*<mark>/g, "");
  return mergedMark;
};

const normalizeHighlightedPost = (p) => {
  const post = p.post ?? p;

  const imageList =
    post.postImage ??
    post.postImageDtoList ??
    post.images ??
    post.imageList ??
    null;

  return {
    ...p,
    post: {
      ...post,
      title: mergeAdjacentHighlights(post.title),
      content: mergeAdjacentHighlights(post.content),
      postImageDtoList: imageList,
    },
  };
};

/* -------------------- 컴포넌트 -------------------- */

const CommunityPage = () => {
  // 반응형
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 내 프로필/친구/카테고리/게시글
  const [me, setMe] = useState(null);
  const [myName, setMyName] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [friendIds, setFriendIds] = useState([]);

  // 게시글 삭제
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // UI 상태
  const [openComments, setOpenComments] = useState({});
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // 탭
  const [activeTab, setActiveTab] = useState("전체");
  const [tabIndex, setTabIndex] = useState(0);

  // 좋아요, 북마크
  const [likedMap, setLikedMap] = useState({});
  const [likeCountMap, setLikeCountMap] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [reactionMap, setReactionMap] = useState({});
  const [reactionPickerId, setReactionPickerId] = useState(null);

  // 검색
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  // 정렬
  const SORT_CHAIN = ["latest", "sympathy", "comments"];
  const SORT_LABEL = {
    latest: "최신순",
    sympathy: "공감순",
    comments: "댓글순",
  };
  const [sortKey, setSortKey] = useState("latest");

  // 북마크 토글
  const [isHeaderBookmarked, setIsHeaderBookmarked] = useState(false);
  const toggleHeaderBookmark = () => {
    setIsHeaderBookmarked((prev) => !prev);
  };

  /* ---------- 함수 ---------- */

  const getCategoryName = (p) => {
    const id = p?.post?.categoryId;
    if (id == null) return "카테고리";
    return categoryMap[String(id)] || "카테고리";
  };

  const toggleMenu = (idx) =>
    setMenuOpenIndex((prev) => (prev === idx ? null : idx));

  const toggleComments = (postId) =>
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const handleProfileClick = (member) => setProfileUser(member);

  const jumpToPost = async (postId) => {
    if (searchMode) {
      setActiveTab("전체");
      setTabIndex(0);
      setSearchKeyword("");
      await reloadPosts();
      await new Promise((r) => requestAnimationFrame(r));
    }

    const el = document.getElementById(`post-${postId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("communitypage-post-card--highlight");
    setTimeout(
      () => el.classList.remove("communitypage-post-card--highlight"),
      1600
    );
  };

  const openDeleteModal = (post) => {
    setDeleteTarget(post);
    setDeleteModalOpen(true);
    setMenuOpenIndex(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const pid = deleteTarget.post?.postId ?? deleteTarget.postId;
      const ok = await deletePost(pid, token);
      if (ok) {
        await reloadPosts();
        alert("삭제가 완료되었습니다.");
        setDeleteModalOpen(false);
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const REACTION_OPTIONS = [
    { key: "LIKE", label: "좋아요", icon: <ThumbUpOutlined /> },
    {
      key: "AWESOME",
      label: "멋져요",
      icon: <SentimentVerySatisfiedRoundedIcon />,
    },
    { key: "FUNNY", label: "웃겨요", icon: <SentimentSatisfiedRoundedIcon /> },
    { key: "SAD", label: "슬퍼요", icon: <SentimentDissatisfiedRoundedIcon /> },
    { key: "USEFUL", label: "유용해요", icon: <LightbulbOutlinedIcon /> },
  ];

  const onHeartClick = (pid) => {
    // 하트 누르면 그냥 말풍선만 열기/닫기
    setReactionPickerId((prev) => (prev === pid ? null : pid));
  };

  const onSelectReaction = async (pid, key) => {
    const token = localStorage.getItem("accessToken");
    const current = reactionMap[pid];

    if (current === key) {
      // 같은 공감을 다시 누르면 → 해제
      const ok = await deleteSympathy(pid, token);
      if (ok) {
        setReactionMap((prev) => {
          const next = { ...prev };
          delete next[pid];
          return next;
        });
        setLikedMap((prev) => ({ ...prev, [pid]: false }));
        setLikeCountMap((prev) => ({
          ...prev,
          [pid]: Math.max((prev[pid] ?? 1) - 1, 0),
        }));
      }
    } else {
      // 새로운 공감 선택 → 등록/변경
      const ok = await registerSympathy(pid, key, token);
      if (ok) {
        setReactionMap((prev) => ({ ...prev, [pid]: key }));
        setLikedMap((prev) => ({ ...prev, [pid]: true }));
        if (!current) {
          setLikeCountMap((prev) => ({
            ...prev,
            [pid]: (prev[pid] ?? 0) + 1,
          }));
        }
      }
    }

    setReactionPickerId(null); // 선택 후 말풍선 닫기
  };

  // 북마크 토글 함수
  const toggleBookmark = (postId) => {
    setBookmarkedMap((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const reloadPosts = async () => {
    const data = await fetchCommunityPosts();
    const list = Array.isArray(data) ? data : data?.content ?? [];
    setAllPosts(list);

    const likeInit = {};
    const likeCntInit = {};
    list.forEach((p) => {
      const id = getPostId(p);
      if (id == null) return;
      likeInit[id] = Boolean(p?.liked);
      likeCntInit[id] = Number(p?.likeTotal) || 0;
    });
    setLikedMap(likeInit);
    setLikeCountMap(likeCntInit);

    setSearchMode(false);
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
    reloadPosts();
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
    setMenuOpenIndex(null);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedPost(null);
    reloadPosts();
  };

  const isMyPost = (p) => {
    const myId = String(me?.id ?? me?.memberId ?? "");
    const authorId = String(getAuthorIdFromPost(p) ?? "");
    if (myId && authorId) return myId === authorId;

    const mine = normalizeName(myName);
    const authorName = normalizeName(getAuthorNameFromPost(p));
    if (mine && authorName) return mine === authorName;

    return false;
  };

  const handleSearchSubmit = async (e) => {
    e?.preventDefault?.();
    const keyword = searchKeyword.trim();

    if (!keyword) {
      await reloadPosts();
      return;
    }

    try {
      const list = await searchCommunityPosts(keyword);
      const normalized = (Array.isArray(list) ? list : []).map(
        normalizeHighlightedPost
      );
      setAllPosts(normalized);
      setSearchMode(true);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

  const handleReset = async () => {
    setActiveTab("전체");
    setTabIndex(0);

    if (searchKeyword) setSearchKeyword("");
    if (searchMode) setSearchMode(false);

    await reloadPosts();

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cycleSort = () => {
    const idx = SORT_CHAIN.indexOf(sortKey);
    const next = SORT_CHAIN[(idx + 1) % SORT_CHAIN.length];
    setSortKey(next);
  };

  // 정렬용 안전 getter
  const getCreatedAt = (p) => p?.post?.createdAt ?? p?.createdAt ?? null;
  const getCommentCount = (p) =>
    Number(p?.commentTotal ?? p?.commentCount ?? 0);
  const getSympathyCount = (p) =>
    Number(p?.sympathyTotal ?? p?.sympathyCount ?? p?.likeTotal ?? 0);

  /* ---------- 초기 로딩 ---------- */
  useEffect(() => {
    (async () => {
      const [postData, categories, rawMe, friends] = await Promise.all([
        fetchCommunityPosts(),
        fetchCategories(),
        fetchCurrentMember(),
        fetchAcceptedFriends().catch(() => []),
      ]);

      // 게시글/좋아요 초기화
      const list = Array.isArray(postData) ? postData : postData?.content ?? [];
      setAllPosts(list);

      const likeInit = {};
      const likeCntInit = {};
      list.forEach((p) => {
        const id = getPostId(p);
        if (id == null) return;
        likeInit[id] = Boolean(p?.liked);
        likeCntInit[id] = Number(p?.likeTotal) || 0;
      });
      setLikedMap(likeInit);
      setLikeCountMap(likeCntInit);

      // 카테고리 맵
      const map = Object.fromEntries(
        (categories || []).map((c) => [
          String(c.categoryId ?? c.id),
          c.name ?? c.categoryName ?? "",
        ])
      );
      setCategoryMap(map);

      // 친구 ID 리스트
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

      // 내 정보/이름
      setMe(rawMe ?? null);
      const tokenName = getMyNameFromToken();
      if (tokenName) setMyName(tokenName);
      else if (rawMe?.name) setMyName(normalizeName(rawMe.name));
      else setMyName("");
    })();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      const target = e.target;

      if (reactionPickerId != null) {
        if (
          !target.closest?.(
            `#post-${reactionPickerId} .communitypage-like-area`
          )
        ) {
          setReactionPickerId(null);
        }
      }

      if (menuOpenIndex != null) {
        if (!target.closest?.(".communitypage-post-menu")) {
          setMenuOpenIndex(null);
        }
      }
    };

    if (reactionPickerId != null || menuOpenIndex != null) {
      document.addEventListener("click", onDocClick);
    }

    return () => document.removeEventListener("click", onDocClick);
  }, [reactionPickerId, menuOpenIndex]);

  /* ---------- 탭 필터링 ---------- */
  const filteredPosts = useMemo(() => {
    if (!allPosts?.length) return [];

    let base = allPosts;
    if (activeTab === "나") {
      const mine = normalizeName(myName);
      base = mine
        ? allPosts.filter(
            (p) => normalizeName(getAuthorNameFromPost(p)) === mine
          )
        : [];
    } else if (activeTab === "친구") {
      if (!friendIds.length) base = [];
      else {
        const idSet = new Set(friendIds.map(String));
        base = allPosts.filter((p) => idSet.has(getAuthorIdFromPost(p)));
      }
    }

    const sorted = base.slice();
    if (sortKey === "latest") {
      sorted.sort((a, b) => {
        const ta = getCreatedAt(a) ? new Date(getCreatedAt(a)).getTime() : 0;
        const tb = getCreatedAt(b) ? new Date(getCreatedAt(b)).getTime() : 0;
        return tb - ta;
      });
    } else if (sortKey === "sympathy") {
      sorted.sort((a, b) => getSympathyCount(b) - getSympathyCount(a));
    } else if (sortKey === "comments") {
      sorted.sort((a, b) => getCommentCount(b) - getCommentCount(a));
    }
    return sorted;
  }, [activeTab, allPosts, myName, friendIds, sortKey]);

  return (
    <div className="communitypage-container">
      <div className={`communitypage-header ${isMobile ? "mobile" : ""}`}>
        {isMobile ? (
          <>
            {/* 상단줄: 검색 + 새로고침 + 프로필 + 글쓰기 */}
            <div className="communitypage-header-top">
              <div className="communitypage-search-wrapper">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="게시글 검색"
                  className="communitypage-search-input"
                />
                <button
                  type="submit"
                  className="communitypage-search-button"
                  onClick={handleSearchSubmit}
                >
                  <SearchIcon />
                </button>
              </div>

              <IconButton
                onClick={handleReset}
                className="communitypage-mobile-icon"
                aria-label="새로고침"
              >
                <RestartAltIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <img
                src={(me?.image || me?.profileImage) ?? defaultPetPic}
                alt="내 프로필"
                className="communitypage-header-profile-img"
                onClick={() => handleProfileClick(me)}
              />

              <IconButton
                className="communitypage-mobile-icon add"
                onClick={() => setIsModalOpen(true)}
                aria-label="게시글 작성"
              >
                <AddIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </div>

            <div className="communitypage-header-bottom">
              <div className="communitypage-header-bottom-left">
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

                <button
                  className={`communitypage-bookmark-toggle ${
                    isHeaderBookmarked ? "active" : ""
                  }`}
                  onClick={toggleHeaderBookmark}
                  title={
                    isHeaderBookmarked
                      ? "북마크 모드 활성화"
                      : "북마크 모드 비활성화"
                  }
                >
                  <BookmarkIcon
                    sx={{
                      fontSize: 20,
                      color:"#3a3a3a",
                    }}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={cycleSort}
                className="communitypage-sort-button"
                aria-label={`정렬: ${SORT_LABEL[sortKey]}`}
                title={`정렬: ${SORT_LABEL[sortKey]}`}
              >
                {SORT_LABEL[sortKey]}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="communitypage-header-left">
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
              <button
                className={`communitypage-bookmark-toggle ${
                  isHeaderBookmarked ? "active" : ""
                }`}
                onClick={toggleHeaderBookmark}
              >
                <BookmarkIcon sx={{ fontSize: 24, color: "#111827" }} />
              </button>
            </div>

            <div className="communitypage-header-right">
              <Paper
                component="form"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: 150,
                  borderRadius: "8px",
                  backgroundColor: "#f0f2f5",
                  padding: "6px",
                  boxShadow: "none",
                }}
                onSubmit={handleSearchSubmit}
              >
                <InputBase
                  sx={{
                    ml: 1,
                    flex: 1,
                    fontFamily: "Pretendard, sans-serif",
                    fontSize: "12px",
                  }}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="게시물 검색"
                  inputProps={{ "aria-label": "search" }}
                />
                <IconButton type="submit" sx={{ p: "1px" }} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>

              <IconButton
                type="button"
                onClick={handleReset}
                sx={{
                  ml: -1,
                  backgroundColor: "#f0f2f5",
                  borderRadius: "8px",
                  width: 40,
                  height: 40,
                  "&:hover": { backgroundColor: "#e4e6eb" },
                }}
                aria-label="새로고침"
                title="새로고침"
              >
                <RestartAltIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <button
                type="button"
                onClick={cycleSort}
                style={{
                  marginLeft: -8,
                  backgroundColor: "#f0f2f5",
                  border: "none",
                  borderRadius: 8,
                  height: 40,
                  padding: "0 10px",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label={`정렬: ${SORT_LABEL[sortKey]}`}
              >
                {SORT_LABEL[sortKey]}
              </button>

              <img
                src={(me?.image || me?.profileImage) ?? defaultPetPic}
                alt="내 프로필"
                className="communitypage-header-profile-img"
                onClick={() => handleProfileClick(me)}
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
          </>
        )}
      </div>

      <div className="communitypage-posts">
        {filteredPosts.map((post, idx) => {
          const pid = getPostId(post) ?? idx;
          const author = getMemberFromPost(post);

          return (
            <div
              key={pid}
              id={`post-${pid}`}
              className="communitypage-post-card"
            >
              <div className="communitypage-post-header">
                {/* 왼쪽 영역 */}
                <div className="communitypage-post-header-left">
                  {/* 프로필/작성자/시간 */}
                  <div className="communitypage-post-profile">
                    <img
                      src={author.image || defaultPetPic}
                      alt="프로필"
                      className="communitypage-post-profile-img"
                      onClick={() =>
                        handleProfileClick(
                          isMyPost(post) ? me ?? author : author
                        )
                      }
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        handleProfileClick(
                          isMyPost(post) ? me ?? author : author
                        )
                      }
                      aria-label={
                        isMyPost(post)
                          ? "내 프로필 빠른 보기"
                          : "사용자 프로필 빠른 보기"
                      }
                    />
                    <div className="communitypage-post-profile-info">
                      <div className="communitypage-post-author">
                        {post.member?.name}
                      </div>
                      <div className="communitypage-post-time">
                        {post.post.createdAt
                          ? formatDistanceToNow(new Date(post.post.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })
                          : "방금"}
                      </div>
                    </div>
                  </div>

                  {/* 카테고리/타이틀 */}
                  <div className="communitypage-post-category-title">
                    <div className="communitypage-post-category">
                      {getCategoryName(post)}
                    </div>
                    <div
                      className="communitypage-post-title"
                      dangerouslySetInnerHTML={{ __html: post.post.title }}
                    />
                  </div>
                </div>

                {/* 우측 메뉴 */}
                {isMyPost(post) && (
                  <div className="communitypage-post-menu">
                    <button
                      className="communitypage-menu-button"
                      onClick={() => toggleMenu(idx)}
                      aria-label="게시글 메뉴"
                    >
                      ⋯
                    </button>
                    {menuOpenIndex === idx && (
                      <div className="communitypage-post-dropdown">
                        <button onClick={() => handleEdit(post)}>수정</button>
                        <button onClick={() => openDeleteModal(post)}>
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 이미지 */}
              {(post?.postImageDtoList?.[0]?.imageUrl ??
                post?.post?.postImage?.[0]?.imageUrl) && (
                <img
                  src={
                    post?.postImageDtoList?.[0]?.imageUrl ??
                    post?.post?.postImage?.[0]?.imageUrl
                  }
                  alt="게시글 이미지"
                  className="communitypage-post-main-image"
                />
              )}

              {/* 본문 */}
              <p
                className="communitypage-post-content"
                dangerouslySetInnerHTML={{ __html: post.post.content }}
              />

              {/* 하단 액션바 */}
              <div className="communitypage-post-actions">
                <div className="communitypage-post-actions-left">
                  {/* 하트 + 말풍선 래퍼 */}
                  <div
                    className="communitypage-like-area"
                    style={{ position: "relative", display: "inline-flex" }}
                  >
                    <button
                      type="button"
                      className={`communitypage-action-btn ${
                        likedMap[pid] ? "is-liked" : ""
                      }`}
                      aria-label="공감"
                      onClick={() => onHeartClick(pid)}
                      title={
                        reactionMap[pid]
                          ? REACTION_OPTIONS.find(
                              (o) => o.key === reactionMap[pid]
                            )?.label
                          : "공감"
                      }
                    >
                      {likedMap[pid] ? (
                        <FavoriteIcon className="communitypage-action-icon" />
                      ) : (
                        <FavoriteBorderIcon className="communitypage-action-icon" />
                      )}
                      <span className="communitypage-action-count">
                        {likeCountMap[pid] ?? 0}
                      </span>
                    </button>

                    {/* 감정 선택 말풍선 */}
                    {reactionPickerId === pid && (
                      <div
                        className="communitypage-reaction-picker"
                        role="menu"
                        aria-label="감정 선택"
                      >
                        {REACTION_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            className={`communitypage-reaction-item ${
                              reactionMap[pid] === opt.key ? "active" : ""
                            }`}
                            onClick={() => onSelectReaction(pid, opt.key)}
                            title={opt.label}
                          >
                            <span className="communitypage-reaction-emoji">
                              {opt.icon}
                            </span>
                            <span className="communitypage-reaction-label">
                              {opt.label}
                            </span>
                          </button>
                        ))}
                        <div className="communitypage-reaction-arrow" />
                      </div>
                    )}
                  </div>

                  {/* 댓글 버튼은 그대로 */}
                  <button
                    type="button"
                    className="communitypage-action-btn"
                    aria-label="댓글"
                    onClick={() => toggleComments(post.post.postId)}
                  >
                    <ChatBubbleOutlineIcon className="communitypage-action-icon" />
                    <span className="communitypage-action-count">
                      {post.commentTotal ?? 0}
                    </span>
                  </button>
                </div>
                <div className="communitypage-post-actions-right">
                  <button
                    type="button"
                    className="communitypage-action-btn"
                    aria-label="저장"
                    onClick={() => toggleBookmark(pid)}
                  >
                    {bookmarkedMap[pid] ? (
                      <BookmarkIcon className="communitypage-action-icon bookmarked" />
                    ) : (
                      <BookmarkBorderIcon className="communitypage-action-icon" />
                    )}
                  </button>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <CommentSection
                postId={post.post.postId}
                open={Boolean(openComments[post.post.postId])}
                onClose={() => toggleComments(post.post.postId)}
              />
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <PostCreateModal
          onClose={() => setIsModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {deleteModalOpen && deleteTarget && (
        <PostDeleteModal
          postTitle={deleteTarget?.post?.title ?? ""}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
          onConfirm={confirmDelete}
          loading={deleting}
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
          onJumpToPost={jumpToPost}
        />
      )}
    </div>
  );
};

export default CommunityPage;
