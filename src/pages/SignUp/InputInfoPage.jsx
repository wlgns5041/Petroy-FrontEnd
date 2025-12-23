import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitKakaoExtraInfo } from "../../services/MemberService";
import "../../styles/SignUp/InputInfoPage.css";
import AlertModal from "../../components/commons/AlertModal.jsx";

function InputInfo() {
  const [userData, setUserData] = useState({ email: "", phone: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const isFormValid =
    userData.email.trim() !== "" && userData.phone.trim() !== "";

  const params = new URLSearchParams(location.search);
  const status = params.get("status");
  const registerId = params.get("registerId");

  const onlyNumber = (value) => value.replace(/\D/g, "");

  const formatPhone = (value) => {
    const numbers = onlyNumber(value);

    if (numbers.length < 4) return numbers;
    if (numbers.length < 8) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  useEffect(() => {
    if (status !== "register" || !registerId) {
      navigate("/", { replace: true });
    }
  }, [status, registerId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await submitKakaoExtraInfo({
        registerId,
        email: userData.email,
        phone: userData.phone,
      });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setAlertMessage("카카오 회원가입 성공");
      setShowAlert(true);
    } catch (error) {
      const msg =
        error?.response?.data?.errorMessage ||
        error?.message ||
        "추가 정보 등록 중 오류가 발생했습니다.";
      setAlertMessage(msg);
      setShowAlert(true);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    navigate("/mainPage", { replace: true });
  };

  return (
    <div className="inputinfopage">
      <div className="inputinfopage-container">
        <div className="inputinfopage-section">
          <div className="inputinfopage-title">
            카카오 로그인을 위한 추가 정보를 입력해주세요
          </div>
          <div className="inputinfopage-subtext">
            기존에 입력 정보에 해당하는 ID가 존재하면,
            <br />
            최초 1회 기존의 이메일 아이디와 연동됩니다
          </div>

          <form onSubmit={handleSubmit} className="inputinfopage-form">
            <div className="inputinfopage-group">
              <label className="inputinfopage-label" htmlFor="email">
                이메일
              </label>
              <input
                id="email"
                type="email"
                className="inputinfopage-input"
                placeholder="이메일"
                value={userData.email}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, email: e.target.value }))
                }
                autoComplete="email"
                required
              />
            </div>

            <div className="inputinfopage-group">
              <label className="inputinfopage-label" htmlFor="phone">
                휴대폰 번호
              </label>
              <input
                id="phone"
                type="tel"
                className="inputinfopage-input"
                placeholder="휴대폰 번호"
                value={formatPhone(userData.phone)}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    phone: onlyNumber(e.target.value),
                  }))
                }
                inputMode="numeric"
                autoComplete="tel"
                required
              />
            </div>

            <div className="inputinfopage-buttongroup">
              <button
                type="button"
                className="inputinfopage-cancelbutton"
                onClick={() => navigate("/")}
              >
                홈으로
              </button>
              <button
                type="submit"
                className="inputinfopage-submitbutton"
                disabled={!isFormValid}
              >
                완료
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAlert && (
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
}

export default InputInfo;
