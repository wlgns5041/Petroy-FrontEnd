import React, { useEffect, useState } from "react";
import "../../styles/Pet/CareGiverList.css";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import noCaregiverImg from "../../assets/images/dogpaw.png";
import { fetchAcceptedFriends } from "../../services/FriendService";
import { fetchCaregiversByPet, deleteCaregiver } from "../../services/PetService";
import AlertModal from "../../components/commons/AlertModal.jsx";
import MyPageConfirmModal from "../../components/MyPage/MyPageConfirmModal.jsx";

const CareGiverList = ({ pet, onClose }) => {
  const [caregiversList, setCaregiversList] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [confirmMessage, setConfirmMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [friendsData, caregiversData] = await Promise.all([
          fetchAcceptedFriends(),
          fetchCaregiversByPet(pet.petId),
        ]);
        setFriends(friendsData);
        setCaregiversList(caregiversData);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setAlertMessage("돌보미 정보를 불러오는 중 오류가 발생했습니다.");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [pet.petId]);

  const handleDeleteCareGiver = (memberName) => {
    const realFriend = friends.find((f) => f.name === memberName);
    if (!realFriend) {
      setAlertMessage("해당 친구의 ID를 찾을 수 없습니다.");
      setShowAlert(true);
      return;
    }

    const realMemberId = realFriend.id;

    setConfirmMessage(`${memberName}님을 돌보미 목록에서 제거하시겠습니까?`);
    setConfirmAction(() => async () => {
      try {
        const success = await deleteCaregiver(pet.petId, realMemberId);
        if (success) {
          setCaregiversList((prev) =>
            prev.filter((cg) => cg.memberName !== memberName)
          );
          setAlertMessage("돌보미가 삭제되었습니다.");
          setShowAlert(true);
        } else {
          setAlertMessage("삭제에 실패했습니다. 다시 시도해주세요.");
          setShowAlert(true);
        }
      } catch (err) {
        console.error("삭제 실패:", err);
        setAlertMessage(
          err.response?.data?.errorMessage || "삭제 중 오류가 발생했습니다."
        );
        setShowAlert(true);
      } finally {
        setShowConfirm(false);
        setConfirmAction(null);
      }
    });
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction) confirmAction();
  };

  return (
    <div className="care-giver-list-overlay">
      <div className="care-giver-list-modal">
        <button className="care-giver-list-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="care-giver-list-title">{pet.name}의 돌보미 친구목록</h2>

        {loading ? (
          <p className="care-giver-list-loading">로딩 중...</p>
        ) : caregiversList.length > 0 ? (
          <ul className="care-giver-list-list">
            {caregiversList.map((cg) => (
              <li key={cg.memberId} className="care-giver-list-card">
                <div className="care-giver-list-left">
                  <img
                    src={cg.image || defaultProfilePic}
                    alt={cg.memberName}
                    className="care-giver-list-friend-image"
                  />
                  <span className="care-giver-list-name">{cg.memberName}</span>
                </div>
                <button
                  className="care-giver-list-button"
                  onClick={() => handleDeleteCareGiver(cg.memberName)}
                >
                  목록에서 제거
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="care-giver-list-empty">
            <img
              src={noCaregiverImg}
              alt="no caregiver"
              className="care-giver-list-empty-img"
            />
            <p className="care-giver-list-empty-text">
              아직 등록된 돌보미가 없어요.
              <br />
              친구를 돌보미로 등록해보세요!
            </p>
          </div>
        )}
      </div>

      {/* ✅ 삭제 확인용 모달 */}
      {showConfirm && (
        <MyPageConfirmModal
          message={confirmMessage}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ✅ 일반 알림용 모달 */}
      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default CareGiverList;