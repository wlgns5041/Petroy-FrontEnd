import React, { useEffect, useState } from "react";
import { updatePost, fetchCategories } from "../../services/CommunityService";
import "../../styles/Community/PostEditModal.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const PostEditModal = ({ post, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    categoryId:
      post.post.categoryId != null ? String(post.post.categoryId) : "",
    title: post.post.title || "",
    content: post.post.content || "",
    image: [],
  });

  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1);
  const [existingImages, setExistingImages] = useState(post.postImageDtoList || []);
  const [deleteImageIds, setDeleteImageIds] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

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
      alert("게시글이 수정되었습니다!");
      onSuccess();
      onClose();
    } else {
      alert("게시글 수정에 실패했습니다.");
    }
  };

  return (
    <div className="post-edit-overlay">
      <div className="post-edit-container">
        <button className="post-edit-close" onClick={onClose}>
          ×
        </button>

        <h2 className="post-edit-title">
          {step === 1 ? "게시글을 수정해주세요" : "이미지를 수정해주세요"}
        </h2>

        <form className="post-edit-form" onSubmit={handleSubmit}>
          <SwitchTransition mode="out-in">
            <CSSTransition key={step} classNames="fade" timeout={300}>
              <>
                {step === 1 ? (
                  <>
                    <div className="post-edit-field">
                      <label className="post-edit-label">카테고리</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        className="post-edit-select"
                      >
                        <option value="">카테고리를 선택하세요</option>
                        {categories.map((cat) => (
                          <option key={cat.categoryId} value={String(cat.categoryId)}>
                            {cat.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

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
  <div className="post-edit-image-placeholder">
{formData.image.length > 0 ? (
  <div className="post-edit-image-preview">
    <img src={URL.createObjectURL(formData.image[0])} alt="미리보기" />
  </div>
) : existingImages.length > 0 ? (
  <div className="post-edit-image-preview">
    <img src={existingImages[0].imageUrl} alt="기존 이미지" />
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

{(formData.image.length > 0 || existingImages.length > 0) && (
  <button
    type="button"
    className="post-edit-image-clear"
    onClick={() => {
      if (existingImages.length > 0) {
        const imageIdToDelete = existingImages[0].imageId;
        setDeleteImageIds((prev) => [...prev, imageIdToDelete]);
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
              </>
            </CSSTransition>
          </SwitchTransition>

          <div className="post-edit-buttons">
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
                    existingImages.length === 0 && formData.image.length === 0
                  }
                >
                  수정
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditModal;