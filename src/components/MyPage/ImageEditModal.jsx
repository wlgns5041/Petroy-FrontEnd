import React, { useRef, useState } from "react";
import "../../styles/MyPage/ImageEditModal.css";

const MAX_MB = 1;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ImageEditModal = ({ onClose, onSave }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    if (!selectedImage || saving) return;
    setSaving(true);

    // 부모로 파일, 미리보기, 캐시버스트용 버전키 전달
    onSave?.(selectedImage, imagePreview, { version: Date.now() });

    setSaving(false);
    onClose?.();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) 타입 체크
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("이미지 형식이 올바르지 않습니다. (jpg, png, webp, gif 허용)");
      resetInput();
      return;
    }

    // 2) 용량 체크
    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert(`파일이 너무 큽니다. (현재 ${sizeMB}MB, 최대 ${MAX_MB}MB)`);
      resetInput();
      return;
    }

    setSelectedImage(file);

    // 3) 미리보기
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetInput = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => resetInput();

  return (
    <div className="image-edit-modal" role="dialog" aria-modal="true">
      <div className="image-edit-modal-content">
        <h2 className="image-edit-title">변경할 이미지를 등록해주세요</h2>

        {imagePreview ? (
          <div className="image-edit-preview-section">
            <img
              src={imagePreview}
              alt="미리보기"
              className="image-edit-preview-image"
            />
            <button
              type="button"
              className="image-edit-reset-button"
              onClick={handleReset}
            >
              선택 해제
            </button>
          </div>
        ) : (
          <label className="image-edit-upload-box">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleImageChange}
              className="image-edit-input-hidden"
            />
            이미지 선택
          </label>
        )}

        <div className="image-edit-footer">
          <button
            type="button"
            className="image-edit-skip-button"
            onClick={onClose}
            disabled={saving}
          >
            취소
          </button>
          <button
            type="button"
            className="image-edit-next-button"
            onClick={handleSave}
            disabled={!selectedImage || saving}
          >
            {saving ? "저장 중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;