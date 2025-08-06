import React, { useEffect, useState } from 'react';
import { fetchComments, createComment } from '../../services/CommunityService';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await fetchComments(postId);
      setComments(data);
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const success = await createComment(postId, content, token);
    if (success) {
      setContent('');
      const updated = await fetchComments(postId);
      setComments(updated);
    }
  };

  return (
    <div className="comment-section">
      <form onSubmit={handleSubmit}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <button type="submit">등록</button>
      </form>
      <ul>
        {comments.map((c, idx) => (
          <li key={idx}>{c.memberName}: {c.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;