import React, { useEffect, useRef, useState } from "react";
import "../../styles/MyPage/ImageEditModal.css";
import AlertModal from "../../components/commons/AlertModal.jsx";

const MAX_MB = 1;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ImageEditModal = ({ onClose, onSave, currentImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const fileInputRef = useRef(null);

  /** 🔹 1. 모달 열릴 때 기존 이미지 세팅 */
  useEffect(() => {
    setImagePreview(currentImage || null);
  }, [currentImage]);

  /** 🔹 2. ESC 닫기 */
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /** 🔹 3. 저장 */
  const handleSave = () => {
    if (saving) return;
    setSaving(true);

    const formData = new FormData();

    if (selectedImage) {
      // ✅ 새로 선택된 이미지가 있을 때
      formData.append("image", selectedImage);
    } else if (!imagePreview) {
      // ✅ 아무 이미지도 없는 경우(null) → 기본이미지로 변경 요청
      formData.append("image", new Blob([]), "null");
    } else {
      // ✅ 기존 이미지 그대로 유지 시 아무 것도 안함
    }

    onSave?.(formData, {
      file: selectedImage ?? null,
      preview: imagePreview ?? null,
      version: Date.now(),
    });

    setTimeout(() => {
      setSaving(false);
      onClose?.();
    }, 300);
  };

  /** 🔹 4. 이미지 선택 시 처리 */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setAlertMessage(
        "이미지 형식이 올바르지 않습니다. (jpg, png, webp, gif 허용)"
      );
      setShowAlert(true);
      resetInput();
      return;
    }

    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAlertMessage(
        `파일이 너무 큽니다. (현재 ${sizeMB}MB, 최대 ${MAX_MB}MB)`
      );
      setShowAlert(true);
      resetInput();
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  /** 🔹 5. 선택 해제 (기본 이미지로 돌리기) */
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

  /** 🔹 6. 확인 버튼 비활성화 조건 */
  const isSaveDisabled = (() => {
    if (saving) return true; // 저장 중일 때 비활성화

    // ✅ 기존 이미지도 없고, 새로 선택한 이미지도 없을 때 → 비활성화
    if (!currentImage && !selectedImage && !imagePreview) return true;

    // ✅ 기존 이미지를 그대로 둘 때 → 비활성화
    if (imagePreview && imagePreview === currentImage && !selectedImage)
      return true;

    // ✅ 나머지 (새 이미지 선택 or 선택 해제 등) → 활성화
    return false;
  })();

  return (
    <div className="image-edit-modal" role="dialog" aria-modal="true">
      <div className="image-edit-modal-content">
        <h2 className="image-edit-title">변경할 이미지를 등록해주세요</h2>

        {/* 🔸 기존 이미지 or 선택된 이미지 보여주기 */}
        {imagePreview ? (
          <div className="image-edit-preview-section">
            <img
              src={imagePreview}
              alt="미리보기"
              className="image-edit-preview-image"
              onError={(e) =>
                (e.target.src = "/assets/images/DefaultProfile.png")
              }
            />
            <button
              type="button"
              className="image-edit-reset-button"
              onClick={handleReset}
              disabled={saving}
            >
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
              disabled={saving}
            />
            이미지 선택
          </label>
        )}

        {/* 🔸 하단 버튼 */}
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
            disabled={isSaveDisabled}
          >
            {saving
              ? "저장 중..."
              : selectedImage
              ? "확인"
              : !imagePreview
              ? "기본 이미지로 변경"
              : "확인"}
          </button>
        </div>
      </div>

      {showAlert && (
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
};

export default ImageEditModal;
