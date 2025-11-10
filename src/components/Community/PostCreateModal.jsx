import React, { useEffect, useState, useRef } from "react";
import { createPost, fetchCategories } from "../../services/CommunityService";
import "../../styles/Community/PostCreateModal.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ReactDOM from "react-dom";
import AlertModal from "../../components/commons/AlertModal";

const PostCreateModal = ({ onClose, onPostCreated }) => {
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    content: "",
    image: [],
  });

  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  /** 🔹 카테고리 불러오기 */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("카테고리 로딩 실패:", error);
      }
    };
    loadCategories();
  }, []);

  /** 🔹 드롭다운 위치 계산 */
  useEffect(() => {
    if (dropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        width: rect.width,
      });
    }
  }, [dropdownOpen]);

  /** 🔹 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [dropdownOpen]);

  /** 🔹 입력 변경 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
  };

  /** 🔹 이미지 선택 */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: [file] }));
    }
  };

  /** 🔹 게시글 등록 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    // multipart form 생성
    const body = new FormData();
    body.append("categoryId", formData.categoryId);
    body.append("title", formData.title);
    body.append("content", formData.content);

    // ✅ 이미지가 있을 때만 append
    if (formData.image.length > 0) {
      formData.image.forEach((file) => body.append("image", file));
    }

    try {
      const success = await createPost(body, token);

      if (success) {
        setAlertMessage("게시글이 등록되었습니다!");
        setShowAlert(true);
        setOnConfirmAction(() => () => {
          setShowAlert(false);
          onPostCreated?.();
          onClose?.();
        });
      } else {
        throw new Error("게시글 등록 실패");
      }
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      setAlertMessage("게시글 등록에 실패했습니다.");
      setShowAlert(true);
      setOnConfirmAction(() => () => setShowAlert(false));
    }
  };

  return (
    <>
      <div className="post-modal-overlay">
        <div className="post-modal-container">
          <button className="post-modal-close" onClick={onClose}>
            ×
          </button>

          <SwitchTransition>
            <CSSTransition key={step} timeout={300} classNames="fade">
              <div className="post-create-step-wrapper">
                <p className="post-create-step-indicator">{step} / 2</p>

                {step === 1 && (
                  <>
                    <h2 className="post-modal-title">게시글을 작성해주세요</h2>
                    <form className="post-create-form" onSubmit={handleSubmit}>
                      {/* 🔸 카테고리 선택 */}
                      <div className="post-create-field" ref={dropdownRef}>
                        <label className="post-create-label">카테고리</label>
                        <div className="post-create-inline-select-wrapper">
                          <div
                            className={`post-create-inline-select ${
                              dropdownOpen ? "active" : ""
                            }`}
                            onClick={() => setDropdownOpen((prev) => !prev)}
                          >
                            {categories.find(
                              (c) => c.categoryId === formData.categoryId
                            )?.categoryName || "카테고리 선택"}
                            <span className="post-create-inline-arrow">▼</span>
                          </div>
                        </div>

                        {dropdownOpen &&
                          ReactDOM.createPortal(
                            <ul
                              className="post-create-inline-dropdown"
                              style={{
                                position: "fixed",
                                top: `${dropdownPos.top || 0}px`,
                                right: `${dropdownPos.right || 0}px`,
                                width: dropdownPos.width,
                                zIndex: 9999,
                              }}
                            >
                              {categories.map((cat) => (
                                <li
                                  key={cat.categoryId}
                                  className="post-create-inline-option"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      categoryId: cat.categoryId,
                                    }));
                                    setDropdownOpen(false);
                                  }}
                                >
                                  {cat.categoryName}
                                </li>
                              ))}
                            </ul>,
                            document.body
                          )}
                      </div>

                      {/* 🔸 제목 */}
                      <div className="post-create-field">
                        <label className="post-create-label">제목</label>
                        <input
                          type="text"
                          name="title"
                          placeholder="제목을 입력하세요"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className="post-create-input"
                        />
                      </div>

                      {/* 🔸 내용 */}
                      <div className="post-create-field">
                        <label className="post-create-label">내용</label>
                        <textarea
                          name="content"
                          placeholder="내용을 입력하세요"
                          value={formData.content}
                          onChange={handleChange}
                          required
                          className="post-create-textarea"
                        />
                      </div>

                      {/* 🔸 다음 버튼 */}
                      <div className="post-create-button">
                        <button
                          type="button"
                          className="post-create-button post-create-next"
                          onClick={() => setStep(2)}
                          disabled={
                            !formData.categoryId ||
                            !formData.title.trim() ||
                            !formData.content.trim()
                          }
                        >
                          다음으로
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="post-modal-title">
                      게시글의 이미지를 등록해주세요
                    </h2>
                    <div className="post-create-image-box">
                      <div
                        className={`post-create-image-placeholder ${
                          formData.image.length > 0 ? "has-image" : ""
                        }`}
                      >
                        {formData.image.length > 0 ? (
                          <div className="post-create-image-preview">
                            <img
                              src={URL.createObjectURL(formData.image[0])}
                              alt="미리보기"
                            />
                          </div>
                        ) : (
                          <label className="post-create-upload-label">
                            이미지 선택
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        )}
                      </div>

                      {formData.image.length > 0 && (
                        <button
                          type="button"
                          className="post-create-image-clear"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, image: [] }))
                          }
                        >
                          선택 해제
                        </button>
                      )}
                    </div>

                    {/* 🔸 뒤로가기 / 등록하기 */}
                    <div className="post-create-button-row">
                      <button
                        type="button"
                        className="post-create-button post-create-back"
                        onClick={() => setStep(1)}
                      >
                        뒤로가기
                      </button>
                      <button
                        type="button"
                        className="post-create-button post-create-submit"
                        onClick={handleSubmit}
                        disabled={false}
                      >
                        등록하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      </div>

      {/* AlertModal은 overlay 외부에 렌더링 */}
      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => {
            setShowAlert(false);
            if (onConfirmAction) onConfirmAction();
          }}
        />
      )}
    </>
  );
};

export default PostCreateModal;
