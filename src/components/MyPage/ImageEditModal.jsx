import React, { useEffect, useRef, useState } from "react";
import "../../styles/MyPage/ImageEditModal.css";
import AlertModal from "../../components/commons/AlertModal.jsx";

const MAX_MB = 1;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ImageEditModal = ({ onClose, onSave }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    if (!selectedImage || saving) return;
    setSaving(true);
    onSave?.(selectedImage, imagePreview, { version: Date.now() });

    setTimeout(() => {
      setSaving(false);
      onClose?.();
    }, 300);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAlertMessage("이미지 형식이 올바르지 않습니다. (jpg, png, webp, gif 허용)");
      setShowAlert(true);
      resetInput();
      return;
    }

    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAlertMessage(`파일이 너무 큽니다. (현재 ${sizeMB}MB, 최대 ${MAX_MB}MB)`);
      setShowAlert(true);
      resetInput();
      return;
    }

    setSelectedImage(file);
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

  const handleAlertConfirm = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  return (
    <div className="image-edit-modal" role="dialog" aria-modal="true">
      <div className="image-edit-modal-content">
        <h2 className="image-edit-title">변경할 이미지를 등록해주세요</h2>

        {imagePreview ? (
          <div className="image-edit-preview-section">
            <img src={imagePreview} alt="미리보기" className="image-edit-preview-image" />
            <button type="button" className="image-edit-reset-button" onClick={handleReset}>
              선택 해제
            </button>
          </div>
        ) : (
          <label
            htmlFor="image-upload-input"
            className="image-edit-upload-box"
            role="button"
            aria-label="이미지 선택"
          >
            <input
              id="image-upload-input"
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
          <button type="button" className="image-edit-skip-button" onClick={onClose} disabled={saving}>
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

      {showAlert && <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />}
    </div>
  );
};

export default ImageEditModal;