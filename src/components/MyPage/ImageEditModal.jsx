import React, { useState } from 'react';
import '../../styles/MyPage/ImageEditModal.css';

const ImageEditModal = ({ onClose, onSave }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSave = () => {
    if (selectedImage) {
      onSave(selectedImage);
    }
    onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="imageEdit-modal show">
      <div className="imageEdit-modal-content">
        <h2 className="imageEdit-title">변경할 이미지를 등록해주세요</h2>

        {imagePreview ? (
          <div className="imageEdit-preview-section">
            <img src={imagePreview} alt="미리보기" className="imageEdit-preview-image" />
            <button className="imageEdit-reset-button" onClick={handleReset}>
              선택 해제
            </button>
          </div>
        ) : (
          <label className="imageEdit-upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="imageEdit-input-hidden"
            />
            이미지 선택
          </label>
        )}

        <div className="imageEdit-footer">
          <button className="imageEdit-skip-button" onClick={onClose}>
            취소
          </button>
          <button
            className="imageEdit-next-button"
            onClick={handleSave}
            disabled={!selectedImage}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;