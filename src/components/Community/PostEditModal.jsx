import React, { useEffect, useState, useRef } from "react";
import { updatePost, fetchCategories } from "../../services/CommunityService";
import "../../styles/Community/PostEditModal.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ReactDOM from "react-dom";
import AlertModal from "../../components/commons/AlertModal.jsx";

const PostEditModal = ({ post, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    categoryId:
      post.post.categoryId != null ? Number(post.post.categoryId) : "",
    title: post.post.title || "",
    content: post.post.content || "",
    image: [],
  });

  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1);
  const [existingImages, setExistingImages] = useState(
    post.postImageDtoList || []
  );
  const [deleteImageIds, setDeleteImageIds] = useState([]);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: [file],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    const body = new FormData();
    body.append("categoryId", Number(formData.categoryId));
    body.append("title", formData.title);
    body.append("content", formData.content);

    formData.image.forEach((file) => {
      body.append("newImages", file);
    });

    deleteImageIds.forEach((id) => {
      body.append("deleteImageIds", id);
    });

    const success = await updatePost(post.post.postId, body, token);
    if (success) {
      setAlertMessage("게시글이 수정되었습니다!");
      setShowAlert(true);
      setOnConfirmAction(() => () => {
        setShowAlert(false);
        onSuccess();
        onClose();
      });
    } else {
      setAlertMessage("게시글 수정에 실패했습니다.");
      setShowAlert(true);
      setOnConfirmAction(() => () => setShowAlert(false));
    }
  };

  return (
    <div className="post-edit-overlay">
      <div className="post-edit-container">
        <button className="post-edit-close" onClick={onClose}>
          ×
        </button>

        <SwitchTransition>
          <CSSTransition key={step} timeout={300} classNames="fade">
            <div className="post-edit-step-wrapper">
              <p className="post-edit-step-indicator">{step} / 2</p>

              <h2 className="post-edit-title">
                {step === 1 ? "게시글을 수정해주세요" : "이미지를 수정해주세요"}
              </h2>

              <form className="post-edit-form" onSubmit={handleSubmit}>
                {step === 1 ? (
                  <>
                    <div className="post-edit-field" ref={dropdownRef}>
                      <label className="post-edit-label">카테고리</label>
                      <div className="post-edit-inline-select-wrapper">
                        <div
                          className={`post-edit-inline-select ${
                            dropdownOpen ? "active" : ""
                          }`}
                          onClick={() => setDropdownOpen((prev) => !prev)}
                        >
                          {categories.find(
                            (c) => c.categoryId === formData.categoryId
                          )?.categoryName || "카테고리 선택"}
                          <span className="post-edit-inline-arrow">▼</span>
                        </div>
                      </div>

                      {dropdownOpen &&
                        ReactDOM.createPortal(
                          <ul
                            className="post-edit-inline-dropdown"
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
                                className="post-edit-inline-option"
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

                    {/* 제목 */}
                    <div className="post-edit-field">
                      <label className="post-edit-label">제목</label>
                      <input
                        type="text"
                        name="title"
                        placeholder="제목을 입력하세요"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="post-edit-input"
                      />
                    </div>

                    {/* 내용 */}
                    <div className="post-edit-field">
                      <label className="post-edit-label">내용</label>
                      <textarea
                        name="content"
                        placeholder="내용을 입력하세요"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        className="post-edit-textarea"
                      />
                    </div>
                  </>
                ) : (
                  <div className="post-edit-image-box">
                    <div
                      className={`post-edit-image-placeholder ${
                        formData.image.length > 0 || existingImages.length > 0
                          ? "has-image"
                          : ""
                      }`}
                    >
                      {formData.image.length > 0 ? (
                        <div className="post-edit-image-preview">
                          <img
                            src={URL.createObjectURL(formData.image[0])}
                            alt="미리보기"
                          />
                        </div>
                      ) : existingImages.length > 0 ? (
                        <div className="post-edit-image-preview">
                          <img
                            src={existingImages[0].imageUrl}
                            alt="기존 이미지"
                          />
                        </div>
                      ) : (
                        <label className="post-edit-upload-label">
                          이미지 선택
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>

                    {(formData.image.length > 0 ||
                      existingImages.length > 0) && (
                      <button
                        type="button"
                        className="post-edit-image-clear"
                        onClick={() => {
                          if (existingImages.length > 0) {
                            const imageIdToDelete = existingImages[0].imageId;
                            setDeleteImageIds((prev) => [
                              ...prev,
                              imageIdToDelete,
                            ]);
                            setExistingImages([]);
                          }
                          setFormData({
                            ...formData,
                            image: [],
                          });
                        }}
                      >
                        선택 해제
                      </button>
                    )}
                  </div>
                )}

                <div className="post-edit-button">
                  {step === 1 ? (
                    <button
                      type="button"
                      className="post-edit-button post-edit-next"
                      onClick={() => setStep(2)}
                      disabled={
                        !formData.categoryId ||
                        !formData.title.trim() ||
                        !formData.content.trim()
                      }
                    >
                      다음으로
                    </button>
                  ) : (
                    <div className="post-edit-button-row">
                      <button
                        type="button"
                        className="post-edit-button post-edit-back"
                        onClick={() => setStep(1)}
                      >
                        뒤로가기
                      </button>
                      <button
                        type="submit"
                        className="post-edit-button post-edit-submit"
                        disabled={
                          existingImages.length === 0 &&
                          formData.image.length === 0
                        }
                      >
                        수정하기
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => {
            setShowAlert(false);
            if (onConfirmAction) onConfirmAction();
          }}
        />
      )}
    </div>
  );
};

export default PostEditModal;
