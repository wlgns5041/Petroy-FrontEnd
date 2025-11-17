import React, { useState } from "react";
import "../../styles/Friend/FriendDeleteModal.css";
import { deleteFriend } from "../../services/FriendService";
import AlertModal from "../commons/AlertModal.jsx";

const FriendDeleteModal = ({ friend, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false); // ⭐ 추가

  const handleDelete = async () => {
    setLoading(true);
    try {
      const success = await deleteFriend(friend.id);

      if (success) {
        // 삭제 완료 알림 띄우기
        setAlertMessage("친구가 삭제되었습니다.");
        setPendingDelete(true); // ⭐ AlertModal 확인 시 실행할 작업을 표시
        setShowAlert(true);
      }
    } catch (err) {
      setAlertMessage("친구 삭제에 실패했습니다.");
      setPendingDelete(false);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  /** ⭐ AlertModal에서 "확인" 누르면 실행할 로직 */
  const handleAlertConfirm = () => {
    setShowAlert(false);

    if (pendingDelete) {
      onDeleted(friend.id); // 부모 리스트에서 제거
      onClose(); // 삭제 모달 닫기
    }
  };

  return (
    <>
      <div className="frienddelete-overlay">
        <div className="frienddelete-container">
          <div className="frienddelete-title">친구 삭제</div>
          <p className="frienddelete-text">
            <strong>{friend.name}</strong>님을 친구 목록에서 삭제하시겠습니까?
          </p>

          <div className="frienddelete-buttons">
            <button className="cancel" onClick={onClose}>
              취소
            </button>
            <button className="delete" onClick={handleDelete} disabled={loading}>
              {loading ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      </div>

      {showAlert && (
        <AlertModal
          message={alertMessage}
onConfirm={handleAlertConfirm} 
        />
      )}
    </>
  );
};

export default FriendDeleteModal;