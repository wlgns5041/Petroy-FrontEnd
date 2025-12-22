import React, { useEffect, useRef, useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import "../../styles/Community/CommentSection.css";
import { useTheme } from "../../utils/ThemeContext.jsx";
import ProfileImage from "../../components/commons/ProfileImage.jsx";

import {
  createComment,
  updateComment,
  deleteComment,
  fetchCommentsByPost,
} from "../../services/CommunityService";

const CommentSection = ({
  postId,
  open,
  onClose,
  onCommentAdded,
  onCommentDeleted,
  myMemberName,
}) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const inputRef = useRef(null);
  const { isDarkMode } = useTheme();

  const token = localStorage.getItem("accessToken");

  const getCreatedAt = (c) =>
    c?.createdAt ?? c?.created_at ?? c?.createdDate ?? c?.created ?? null;

  const timeAgo = (ts) => {
    if (!ts) return "";
    try {
      return formatDistanceToNow(new Date(ts), {
        addSuffix: true,
        locale: ko,
      });
    } catch {
      return "";
    }
  };

  const loadComments = useCallback(async () => {
    if (!postId) return;

    const list = await fetchCommentsByPost(postId, token);

    const normalized = (list || []).map((c, idx) => ({
      commentId: c.commentId ?? `${c.memberId}-${c.createdAt}-${idx}`,
      memberId: c.memberId ?? null,
      memberName: c.memberName ?? "",
      profileImage: c.memberImage ?? null,
      content: c.content ?? "",
      createdAt: c.createdAt ?? null,
    }));

    setComments(normalized);
  }, [postId, token]);

  useEffect(() => {
    if (!open) return;
    loadComments();
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [open, postId, loadComments]);

  useEffect(() => {
    if (menuOpenId == null) return;
    const onDocClick = (e) => {
      if (!e.target.closest(".comment-menu")) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpenId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = content.trim();
    if (!val) return;

    if (editingId) {
      const ok = await updateComment(editingId, val, token);
      if (ok) {
        await loadComments();
        setEditingId(null);
        setContent("");
      }
    } else {
      const created = await createComment(postId, val, token);
      if (created) {
        await loadComments();
        setContent("");
        onCommentAdded?.();
      }
    }
    inputRef.current?.focus();
  };

  const handleDelete = async (commentId) => {
    const ok = await deleteComment(commentId, token);
    if (ok) {
      await loadComments();
      onCommentDeleted?.();
    }
    setMenuOpenId(null);
  };

  const handleEditStart = (comment) => {
    setEditingId(comment.commentId);
    setContent(comment.content);
    inputRef.current?.focus();
    setMenuOpenId(null);
  };

  return (
    <>
      <div
        className={`comment-sheet-mask ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`comment-sheet ${open ? "open" : ""} ${
          isDarkMode ? "dark" : ""
        }`}
        role="dialog"
        aria-modal="true"
      >
        <header className="comment-sheet-header">
          <h3>댓글</h3>
          <button
            className="comment-sheet-close"
            onClick={onClose}
            type="button"
          >
            <CloseIcon fontSize="small" />
          </button>
        </header>

        <section className="comment-sheet-body">
          {comments.length === 0 ? (
            <div className="comment-sheet-empty">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </div>
          ) : (
            <ul className="comment-sheet-list">
              {comments.map((c) => {
                const isMyComment =
                  myMemberName && c.memberName === myMemberName;

                return (
                  <li key={c.commentId} className="comment-sheet-item">
                    <ProfileImage
                      src={c.profileImage}
                      alt={c.memberName}
                      className="comment-sheet-avatar"
                    />

                    <div className="comment-sheet-content">
                      <div className="comment-sheet-meta">
                        <span className="comment-sheet-name">
                          {c.memberName}
                        </span>
                        <span className="comment-sheet-time">
                          {timeAgo(getCreatedAt(c))}
                        </span>
                      </div>
                      <div className="comment-sheet-text">{c.content}</div>
                    </div>

                    {isMyComment && (
                      <div className="comment-menu">
                        <button
                          className="comment-menu-button"
                          onClick={() =>
                            setMenuOpenId((prev) =>
                              prev === c.commentId ? null : c.commentId
                            )
                          }
                          type="button"
                        >
                          <MoreHorizIcon fontSize="small" />
                        </button>

                        {menuOpenId === c.commentId && (
                          <div className="comment-menu-dropdown">
                            {editingId === c.commentId ? (
                              <button onClick={() => setEditingId(null)}>
                                수정취소
                              </button>
                            ) : (
                              <button onClick={() => handleEditStart(c)}>
                                수정
                              </button>
                            )}
                            <button onClick={() => handleDelete(c.commentId)}>
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="comment-sheet-footer">
          <form onSubmit={handleSubmit} className="comment-sheet-form">
            <input
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="comment-sheet-input"
            />
            <button type="submit" className="comment-sheet-submit">
              {editingId ? "수정" : "등록"}
            </button>
          </form>
        </footer>
      </aside>
    </>
  );
};

export default CommentSection;
