import React, { useState } from 'react';
import '../../styles/MyPage/ImageEditModal.css'

const ImageEditModal = ({ onClose, onSave }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSave = () => {
    onSave(selectedImage); 
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

  return (
    <div className="imageEdit-modal show">
      <div className="imageEdit-modal-content">
        <div className="imageEdit-modal-header">이미지 선택</div>
        <div className="imageEdit-modal-body">
        <label className="custom-file-upload">
            파일 선택
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="imageEdit-myPage-input"
            />
          </label>
           {imagePreview && <img src={imagePreview} alt="미리보기" className="imagePreview" />}
        </div>
        <div className="imageEdit-modal-footer">
          <button onClick={onClose}>닫기</button>
          <button onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;