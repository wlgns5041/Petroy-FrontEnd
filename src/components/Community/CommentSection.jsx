import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import "../../styles/Community/CommentSection.css";
import defaultProfile from "../../assets/images/DefaultImage.png";

import {
  createComment,
  updateComment,
  deleteComment,
} from "../../services/CommunityService";

const CommentSection = ({ postId, open, onClose }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => inputRef.current?.focus(), 120);
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, postId, onClose]);

  useEffect(() => {
    if (menuOpenId == null) return;

    const onDocClick = (e) => {
      const target = e.target;
      if (!target.closest(".comment-menu")) {
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
      // 수정
      const ok = await updateComment(editingId, val, token);
      if (ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === editingId ? { ...c, content: val } : c
          )
        );
        setEditingId(null);
        setContent("");
      }
    } else {
      // 등록
      const ok = await createComment(postId, val, token);
      if (ok) {
        const newComment = {
          commentId: Date.now(),
          memberName: "나",
          profileImage: defaultProfile,
          content: val,
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [...prev, newComment]);
        setContent("");
      }
    }
    inputRef.current?.focus();
  };

  const handleDelete = async (commentId) => {
    const ok = await deleteComment(commentId, token);
    if (ok) {
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
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
        className={`comment-sheet ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <header className="comment-sheet-header">
          <h3>댓글</h3>
          <button
            className="comment-sheet-close"
            aria-label="닫기"
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
              {comments.map((c) => (
                <li
                  key={c.commentId}
                  className={`comment-sheet-item ${
                    editingId === c.commentId ? "editing" : ""
                  }`}
                >
                  <img
                    src={c.profileImage || defaultProfile}
                    alt=""
                    className="comment-sheet-avatar"
                  />
                  <div className="comment-sheet-main">
                    <div className="comment-sheet-header-row">
                      <div className="comment-sheet-meta">
                        <span className="comment-sheet-name">
                          {c.memberName}
                        </span>
                        {getCreatedAt(c) && (
                          <span className="comment-sheet-time">
                            {timeAgo(getCreatedAt(c))}
                          </span>
                        )}
                      </div>

                      {/* ... 버튼 */}
                      <div className="comment-menu">
                        <button
                          className="comment-menu-button"
                          onClick={() =>
                            setMenuOpenId((prev) =>
                              prev === c.commentId ? null : c.commentId
                            )
                          }
                          aria-label="댓글 메뉴"
                        >
                          <MoreHorizIcon fontSize="small" />
                        </button>
                        {menuOpenId === c.commentId && (
                          <div className="comment-menu-dropdown">
                            {editingId === c.commentId ? (
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setContent("");
                                  setMenuOpenId(null);
                                }}
                              >
                                수정취소
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleEditStart(c);
                                  setMenuOpenId(null);
                                }}
                              >
                                수정
                              </button>
                            )}
                            <button onClick={() => handleDelete(c.commentId)}>
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="comment-sheet-text">{c.content}</div>
                  </div>
                </li>
              ))}
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
