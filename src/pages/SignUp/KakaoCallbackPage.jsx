import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { issueOauthToken } from "../../services/MemberService";
import AlertModal from "../../components/commons/AlertModal.jsx";

export default function KakaoCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const ranRef = useRef(false); // ✅ StrictMode 2번 실행 방지
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      const params = new URLSearchParams(location.search);

      const status = params.get("status");
      const registerId = params.get("registerId");
      const code = params.get("code");

      // ✅ 추가정보 필요 → inputInfo 이동
      if (status === "register" && registerId) {
        navigate(`/inputInfo?status=register&registerId=${registerId}`, {
          replace: true,
        });
        return;
      }

      // ✅ 로그인(기존회원) → code로 토큰 발급 → 저장 → mainPage
      if (status === "login" && code) {
        const data = await issueOauthToken(code);

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        navigate("/mainPage", { replace: true });
        return;
      }

      // 파라미터 이상
      navigate("/", { replace: true });
    })().catch((err) => {
      const msg =
        err?.response?.data?.errorMessage ||
        err?.message ||
        "카카오 로그인 처리 중 오류가 발생했습니다.";

      setAlertMessage(msg);
      setShowAlert(true);
    });
  }, [location.search, navigate]);

  if (!showAlert) return null;

  return (
    <AlertModal
      message={alertMessage}
      onConfirm={() => {
        setShowAlert(false);
        navigate("/login", { replace: true });
      }}
    />
  );
}