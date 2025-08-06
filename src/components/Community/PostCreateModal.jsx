import React, { useEffect, useState } from "react";
import { createPost, fetchCategories } from "../../services/CommunityService";
import "../../styles/Community/PostCreateModal.css";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const PostCreateModal = ({ onClose, onPostCreated }) => {
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    content: "",
    image: [],
  });

  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(1);

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
      [name]: name === "categoryId" ? Number(value) : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: [file] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    const body = new FormData();
    body.append("categoryId", formData.categoryId);
    body.append("title", formData.title);
    body.append("content", formData.content);
    formData.image.forEach((file) => body.append("image", file));

    const success = await createPost(body, token);
    if (success) {
      alert("게시글이 등록되었습니다!");
      onPostCreated();
    } else {
      alert("게시글 등록에 실패했습니다.");
    }
  };

  return (
    <div className="post-modal-overlay">
      <div className="post-modal-container">
          <button className="post-modal-close" onClick={onClose}>
            ×
          </button>

        <h2 className="post-modal-title">
          {step === 1
            ? "게시글을 작성해주세요"
            : "게시글의 이미지를 등록해주세요"}
        </h2>

        <form className="post-create-form" onSubmit={handleSubmit}>
          <SwitchTransition mode="out-in">
            <CSSTransition key={step} classNames="fade" timeout={300}>
              <>
                {step === 1 ? (
                  <>
                    <div className="post-create-field">
                      <label className="post-create-label">카테고리</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        className="post-create-select"
                      >
                        <option value="">카테고리를 선택하세요</option>
                        {categories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

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
                  </>
                ) : (
                  <div className="post-create-image-box">
                    <div className="post-create-image-placeholder">
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
                        onClick={() => setFormData({ ...formData, image: [] })}
                      >
                        선택 해제
                      </button>
                    )}
                  </div>
                )}
              </>
            </CSSTransition>
          </SwitchTransition>

          <div className="post-create-buttons">
            {step === 1 ? (
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
            ) : (
              <div className="post-create-button-row">
                <button
                  type="button"
                  className="post-create-button post-create-back"
                  onClick={() => setStep(1)}
                >
                  뒤로가기
                </button>
                <button
                  type="submit"
                  className="post-create-button post-create-submit"
                  disabled={formData.image.length === 0}
                >
                  등록
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreateModal;
