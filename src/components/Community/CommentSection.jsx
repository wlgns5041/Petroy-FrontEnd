import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import "../../styles/Community/CommentSection.css";
import defaultProfile from "../../assets/images/DefaultImage.png";

const CommentSection = ({ postId, open, onClose }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const inputRef = useRef(null);

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
    // 더미 데이터
    setComments([
      {
        memberName: "김지훈",
        profileImage: defaultProfile,
        content: "첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 첫 번째 댓글 ",
        createdAt: Date.now() - 42 * 60 * 1000, // 42분 전
      },
      {
        memberName: "조기환",
        profileImage: defaultProfile,
        content: "반갑습니다 😀",
        createdAt: Date.now() - 5 * 60 * 1000, // 5분 전
      },
      {
        memberName: "손지민",
        profileImage: defaultProfile,
        content: "테스트",
        createdAt: Date.now() - 70 * 1000, // 1분 전
      },
    ]);

    // 포커스 & ESC 닫기
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, postId, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = content.trim();
    if (!val) return;

    setComments((prev) => [
      ...prev,
      {
        memberName: "나",
        profileImage: defaultProfile,
        content: val,
        createdAt: Date.now(),
      },
    ]);
    setContent("");
    inputRef.current?.focus();
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
              {comments.map((c, i) => (
                <li key={i} className="comment-sheet-item">
                  <img
                    src={c.profileImage || defaultProfile}
                    alt=""
                    className="comment-sheet-avatar"
                  />
                  <div className="comment-sheet-main">
                    <div className="comment-sheet-meta">
                      <span className="comment-sheet-name">{c.memberName}</span>
                      {getCreatedAt(c) && (
                        <>
                          <span className="comment-sheet-time">
                            {timeAgo(getCreatedAt(c))}
                          </span>
                        </>
                      )}
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
              등록
            </button>
          </form>
        </footer>
      </aside>
    </>
  );
};

export default CommentSection;