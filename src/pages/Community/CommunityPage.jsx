import React, { useEffect, useState } from "react";
import {
  fetchCommunityPosts,
  deletePost,
} from "../../services/CommunityService";
import PostCreateModal from "../../components/Community/PostCreateModal";
import PostEditModal from '../../components/Community/PostEditModal';
import CommentSection from "../../components/Community/CommentSection";
import "../../styles/Community/CommunityPage.css";

const CommunityPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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
    <div className="community-page">
      <div className="community-header">
        <h2>커뮤니티</h2>
        <button
          className="create-post-button"
          onClick={() => setIsModalOpen(true)}
        >
          게시글 작성
        </button>
      </div>

      <div className="community-posts">
        {posts.map((post, idx) => (
          <div key={idx} className="post-card">
            <div className="post-header">
              <span>{post.member.name}</span>
              <div className="post-actions">
                <button onClick={() => handleEdit(post)}>수정</button>
                <button onClick={() => handleDelete(post.post.postId)}>
                  삭제
                </button>
              </div>
            </div>

            <h3>{post.post.title}</h3>
            <p>{post.post.content}</p>

            {post.postImageDtoList.map((img, i) => (
              <img
                key={i}
                src={img.imageUrl}
                alt={`img-${i}`}
                className="post-image"
              />
            ))}

            <div className="post-footer">
              <button onClick={() => toggleComments(post.post.postId)}>
                댓글 {post.commentTotal}
              </button>
            </div>

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
