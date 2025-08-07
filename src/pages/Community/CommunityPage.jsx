import React, { useEffect, useState } from "react";
import {
  fetchCommunityPosts,
  deletePost,
} from "../../services/CommunityService";
import PostCreateModal from "../../components/Community/PostCreateModal";
import PostEditModal from "../../components/Community/PostEditModal";
import CommentSection from "../../components/Community/CommentSection";
import "../../styles/Community/CommunityPage.css";
import defaultPetPic from "../../assets/images/DefaultImage.png";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { InputBase, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

const CommunityPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState("전체");
  const [tabIndex, setTabIndex] = useState(0);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const toggleMenu = (idx) => {
    setMenuOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedPost(null);
    loadPosts();
  };

  const loadPosts = async () => {
    const data = await fetchCommunityPosts();
    setPosts(data);
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
    loadPosts();
  };

  const handleDelete = async (postId) => {
    const token = localStorage.getItem("accessToken");
    if (window.confirm("게시글을 삭제할까요?")) {
      const success = await deletePost(postId, token);
      if (success) {
        loadPosts();
      }
    }
  };

  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    loadPosts();
  }, []);

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
            src={defaultPetPic}
            alt="내 프로필"
            className="communitypage-header-profile-img"
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
              "&:hover": {
                backgroundColor: "#6d6d6d",
              },
            }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </div>

      <div className="communitypage-posts">
        {posts.map((post, idx) => (
          <div key={idx} className="communitypage-post-card">
            <div className="communitypage-post-header">
              {/* 왼쪽 영역 전체 */}
              <div className="communitypage-post-header-left">
                {/* 프로필/작성자/시간 */}
                <div className="communitypage-post-profile">
                  <img
                    src={post.member.profileImage || defaultPetPic}
                    alt="프로필"
                    className="communitypage-post-profile-img"
                  />
                  <div className="communitypage-post-profile-info">
                    <div className="communitypage-post-author">
                      {post.member.name}
                    </div>
                    <div className="communitypage-post-time">
                      {formatDistanceToNow(new Date(post.post.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </div>
                  </div>
                </div>
                {/* 카테고리/타이틀 (아래쪽에 위치) */}
                <div className="communitypage-post-category-title">
                  <div className="communitypage-post-category">
                    {post.post.categoryName || "카테고리"}
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
            {post.postImageDtoList.length > 0 && (
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
    </div>
  );
};

export default CommunityPage;
